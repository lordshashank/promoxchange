import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

// GET - Get single coupon details (without code)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createServerClient();

    const { data, error } = await supabase
      .from("coupons")
      .select(
        "id, seller_address, title, brand, category, price_usd, description, expiry_date, terms, status, is_sold, buyer_address, created_at"
      )
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    let transaction = null;
    if (data.is_sold) {
      const { data: txData } = await supabase
        .from("payment_transactions")
        .select("transaction_hash, network")
        .eq("coupon_id", id)
        .eq("status", "settled")
        .maybeSingle();

      if (txData) {
        transaction = txData;
      }
      console.log("Transaction:", transaction);
    }

    return NextResponse.json({
      coupon: {
        ...data,
        transaction
      }
    });
  } catch (error) {
    console.error("GET /api/coupons/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
// DELETE - Delete a coupon
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. Verify Authentication
    const { verifyAuth } = await import("@/lib/auth-server");
    const auth = await verifyAuth(request);

    if (!auth.isAuthenticated || !auth.address) {
      return NextResponse.json(
        { error: `Unauthorized: ${auth.error || "Please sign in"}` },
        { status: 401 }
      );
    }

    const supabase = createServerClient();

    // 2. Fetch Coupon to check ownership
    const { data: coupon, error: fetchError } = await supabase
      .from("coupons")
      .select("seller_address, is_sold")
      .eq("id", id)
      .single();

    if (fetchError || !coupon) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    // 3. Ownership Check
    if (coupon.seller_address.toLowerCase() !== auth.address.toLowerCase()) {
      return NextResponse.json(
        { error: "Unauthorized: You can only delete your own coupons" },
        { status: 403 }
      );
    }

    // 4. Sold Check
    if (coupon.is_sold) {
      return NextResponse.json(
        { error: "Cannot delete a coupon that has already been sold" },
        { status: 400 }
      );
    }

    // 5. Delete
    const { error: deleteError } = await supabase
      .from("coupons")
      .delete()
      .eq("id", id);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/coupons/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update a coupon
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. Verify Authentication
    const { verifyAuth } = await import("@/lib/auth-server");
    const auth = await verifyAuth(request);

    if (!auth.isAuthenticated || !auth.address) {
      return NextResponse.json(
        { error: `Unauthorized: ${auth.error || "Please sign in"}` },
        { status: 401 }
      );
    }

    const supabase = createServerClient();
    const body = await request.json();

    // 2. Fetch Coupon to check ownership and status
    const { data: coupon, error: fetchError } = await supabase
      .from("coupons")
      .select("seller_address, is_sold")
      .eq("id", id)
      .single();

    if (fetchError || !coupon) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    // 3. Ownership Check
    if (coupon.seller_address.toLowerCase() !== auth.address.toLowerCase()) {
      return NextResponse.json(
        { error: "Unauthorized: You can only edit your own coupons" },
        { status: 403 }
      );
    }

    // 4. Sold Check
    if (coupon.is_sold) {
      return NextResponse.json(
        { error: "Cannot edit a coupon that has already been sold" },
        { status: 400 }
      );
    }

    // 5. Update
    // Whitelist allowed fields to update
    const updates = {
      title: body.title,
      price_usd: body.price_usd,
      description: body.description,
      category: body.category,
      expiry_date: body.expiry_date,
      terms: body.terms,
    };

    const { error: updateError } = await supabase
      .from("coupons")
      .update(updates)
      .eq("id", id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT /api/coupons/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
