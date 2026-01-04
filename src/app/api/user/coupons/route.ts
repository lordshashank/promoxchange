import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { decryptCouponCode } from "@/lib/utils/encryption";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get("address");
    const type = searchParams.get("type"); // 'listed' or 'purchased'

    if (!walletAddress) {
      return NextResponse.json(
        { error: "Wallet address required" },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Security Check: Verify signature for ALL user data access
    // This endpoint represents "My Coupons" dashboard, so it should be private.
    const { verifyAuth } = await import("@/lib/auth-server");
    const auth = await verifyAuth(request);

    if (!auth.isAuthenticated) {
      return NextResponse.json(
        { error: `Unauthorized: ${auth.error || "Please sign in"}` },
        { status: 401 }
      );
    }

    if (auth.address?.toLowerCase() !== walletAddress?.toLowerCase()) {
      return NextResponse.json(
        { error: "Unauthorized: You can only view your own coupons" },
        { status: 403 }
      );
    }

    if (type === "listed") {
      // Get coupons listed by this user
      const { data, error } = await supabase
        .from("coupons")
        .select(
          "id, title, brand, category, price_usd, expiry_date, status, is_sold, buyer_address, created_at"
        )
        .eq("seller_address", walletAddress)
        .order("created_at", { ascending: false });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ coupons: data || [] });
    } else if (type === "purchased") {
      // Get coupons purchased by this user (include decrypted codes)
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .eq("buyer_address", walletAddress)
        .order("purchased_at", { ascending: false });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Decrypt codes for purchased coupons
      const couponsWithCodes = (data || []).map((coupon) => ({
        id: coupon.id,
        title: coupon.title,
        brand: coupon.brand,
        category: coupon.category,
        price_usd: coupon.price_usd,
        expiry_date: coupon.expiry_date,
        description: coupon.description,
        terms: coupon.terms,
        code: decryptCouponCode(coupon.code_encrypted),
        purchased_at: coupon.purchased_at,
      }));

      return NextResponse.json({ coupons: couponsWithCodes });
    }

    return NextResponse.json(
      { error: "Invalid type. Use 'listed' or 'purchased'" },
      { status: 400 }
    );
  } catch (error) {
    console.error("GET /api/user/coupons error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
