import { NextRequest, NextResponse } from "next/server";
import { withX402, type RouteConfig } from "@x402/next";
import { x402Server, chainId } from "@/lib/x402/config";
import { createServerClient } from "@/lib/supabase/server";
import { decryptCouponCode } from "@/lib/utils/encryption";
import type { HTTPRequestContext } from "@x402/core/server";

// Helper to extract coupon ID from path
function extractCouponId(path: string): string {
  // Path format: /api/coupons/{id}/code
  const parts = path.split("/");
  const couponsIndex = parts.indexOf("coupons");
  if (couponsIndex !== -1 && parts[couponsIndex + 1]) {
    return parts[couponsIndex + 1];
  }
  throw new Error("Could not extract coupon ID from path");
}

// Helper to get coupon from database
async function getCoupon(couponId: string) {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("coupons")
    .select("*")
    .eq("id", couponId)
    .single();

  if (error || !data) {
    throw new Error("Coupon not found");
  }

  return data;
}

// The actual handler that returns the coupon code after payment
// NOTE: DB update happens in onAfterSettle hook (lib/x402/config.ts) AFTER settlement
async function handler(request: NextRequest): Promise<NextResponse> {
  try {
    const url = new URL(request.url);
    const couponId = extractCouponId(url.pathname);

    const supabase = createServerClient();

    // Fetch coupon
    const { data: coupon, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("id", couponId)
      .single();

    if (error || !coupon) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    if (coupon.is_sold) {
      return NextResponse.json(
        { error: "Coupon already sold" },
        { status: 410 }
      );
    }

    // Decrypt and return coupon code
    // The DB will be updated in the onAfterSettle hook after payment settles
    const decryptedCode = decryptCouponCode(coupon.code_encrypted);

    console.log(`[Handler] Returning code for coupon ${couponId} - DB update will happen after settlement`);

    return NextResponse.json({
      success: true,
      coupon: {
        id: coupon.id,
        title: coupon.title,
        brand: coupon.brand,
        code: decryptedCode,
        description: coupon.description,
        terms: coupon.terms,
        expiryDate: coupon.expiry_date,
      },
    });
  } catch (error) {
    console.error("Handler error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Dynamic route config with dynamic payTo and price
const routeConfig: RouteConfig = {
  accepts: {
    scheme: "exact",
    network: chainId,
    price: async (context: HTTPRequestContext) => {
      const path = context.adapter.getPath();
      const couponId = extractCouponId(path);
      const coupon = await getCoupon(couponId);
      console.log(`[x402] Price for ${couponId}: $${coupon.price_usd}`);
      // Format as dollar amount for x402
      return `$${coupon.price_usd}`;
    },
    payTo: async (context: HTTPRequestContext) => {
      // DYNAMIC: Fetch seller address from database
      const path = context.adapter.getPath();
      const couponId = extractCouponId(path);
      const coupon = await getCoupon(couponId);

      if (!coupon.seller_address) {
        console.error(`[x402] Seller address missing for coupon ${couponId}`);
        throw new Error("Seller address missing");
      }

      console.log(`[x402] PayTo for ${couponId}: ${coupon.seller_address}`);
      // Return seller's wallet address - payment goes directly to them!
      return coupon.seller_address as `0x${string}`;
    },
  },
  description: "Purchase coupon code",
  mimeType: "application/json",
};

// Export protected GET handler with x402 payment protection
export const GET = withX402(handler, routeConfig, x402Server);
