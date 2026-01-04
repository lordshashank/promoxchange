import { x402ResourceServer, HTTPFacilitatorClient } from "@x402/core/server";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import { createServerClient } from "@/lib/supabase/server";
import { networkId, networkName } from "@/lib/chain";
import { facilitator } from "@coinbase/x402";

// Re-export for backward compatibility
export const chainId = networkId;
export const network = networkName;

// Create facilitator client
const facilitatorClient = new HTTPFacilitatorClient(facilitator);

// Create and configure x402 server
export const x402Server = new x402ResourceServer(facilitatorClient);
x402Server.register(chainId, new ExactEvmScheme());

// Helper to extract coupon ID from resource URL
function extractCouponIdFromResource(resource: string): string | null {
  // Resource format: /api/coupons/{id}/code or full URL
  const match = resource.match(/\/coupons\/([^/]+)\/code/);
  return match ? match[1] : null;
}

// Register hook to update DB after successful payment settlement
x402Server.onAfterSettle(async (context) => {
  const { paymentPayload, result } = context;

  if (result.success) {
    const couponId = extractCouponIdFromResource(paymentPayload.resource.url);
    const buyerAddress = result.payer;

    if (!couponId) {
      console.error("[x402 onAfterSettle] Could not extract coupon ID from:", paymentPayload.resource.url);
      return;
    }

    console.log(`[x402 onAfterSettle] Payment settled for coupon ${couponId} by ${buyerAddress}`);

    const supabase = createServerClient();

    // Ensure buyer exists in users table (foreign key constraint)
    if (buyerAddress) {
      await supabase.from("users").upsert(
        { wallet_address: buyerAddress },
        { onConflict: "wallet_address" }
      );
    }

    // Mark coupon as sold
    const { data: updateData, error: updateError } = await supabase
      .from("coupons")
      .update({
        is_sold: true,
        buyer_address: buyerAddress || null,
        purchased_at: new Date().toISOString(),
      })
      .eq("id", couponId)
      .eq("is_sold", false) // Only update if not already sold (optimistic locking)
      .select();

    if (updateError) {
      console.error("[x402 onAfterSettle] Failed to update coupon:", updateError);
      return;
    }

    if (!updateData || updateData.length === 0) {
      console.error("[x402 onAfterSettle] Coupon may have already been sold:", couponId);
      return;
    }

    console.log(`[x402 onAfterSettle] Coupon ${couponId} marked as sold to ${buyerAddress}`);

    // Log payment transaction
    await supabase.from("payment_transactions").insert({
      coupon_id: couponId,
      payer_address: buyerAddress || "unknown",
      amount_usd: updateData[0].price_usd,
      transaction_hash: result.transaction,
      network: chainId,
      status: "settled",
    });
  }
});

export { facilitatorClient };
