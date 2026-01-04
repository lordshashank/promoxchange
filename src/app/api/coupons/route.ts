import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { encryptCouponCode } from "@/lib/utils/encryption";

// GET - List all available coupons
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { searchParams } = new URL(request.url);

    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const currency = searchParams.get("currency");
    const status = searchParams.get("status");
    const active = searchParams.get("active");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const showSold = searchParams.get("show_sold");
    const showExpired = searchParams.get("show_expired");

    let query = supabase
      .from("coupons")
      .select(
        "id, seller_address, title, brand, category, price_usd, currency, expiry_date, description, terms, status, is_sold, created_at"
      );

    // Default: Hide sold items unless requested
    if (showSold !== "true") {
      query = query.eq("is_sold", false);
    }

    // Default: Hide expired items unless requested
    if (showExpired !== "true") {
      const now = new Date().toISOString();
      query = query.or(`expiry_date.is.null,expiry_date.gt.${now}`);
    }

    query = query.order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (category) {
      const categoryList = category.split(",");
      query = query.in("category", categoryList);
    }

    if (status) {
      query = query.in("status", status.split(","));
    }

    if (currency && currency !== "All") {
      query = query.eq("currency", currency);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,brand.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ coupons: data || [] });
  } catch (error) {
    console.error("GET /api/coupons error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create new coupon listing
export async function POST(request: NextRequest) {
  try {
    const { verifyAuth } = await import("@/lib/auth-server");
    const auth = await verifyAuth(request);

    if (!auth.isAuthenticated) {
      return NextResponse.json(
        { error: `Unauthorized: ${auth.error || "Please sign in"}` },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      sellerAddress,
      title,
      brand,
      category,
      currency,
      code,
      price,
      description,
      expiryDate,
      terms,
    } = body;

    // Security Check: Ensure submitter matches authenticated user
    if (auth.address?.toLowerCase() !== sellerAddress?.toLowerCase()) {
      return NextResponse.json(
        { error: "Unauthorized: You can only list coupons for your own address" },
        { status: 403 }
      );
    }

    // Validation
    const missingFields = [];
    if (!sellerAddress) missingFields.push("sellerAddress");
    if (!title) missingFields.push("title");
    if (!brand) missingFields.push("brand");
    if (!code) missingFields.push("code");
    if (price === undefined || price === null || isNaN(price)) missingFields.push("price");
    if (!currency) missingFields.push("currency");

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(", ")}` },
        { status: 400 }
      );
    }

    if (price < 0) {
      return NextResponse.json(
        { error: "Price cannot be negative" },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Ensure user exists (upsert)
    const { error: userError } = await supabase
      .from("users")
      .upsert({ wallet_address: sellerAddress }, { onConflict: "wallet_address" });

    if (userError) {
      console.error("User upsert error:", userError);
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
    }

    // Encrypt coupon code
    const encryptedCode = encryptCouponCode(code);

    // Insert coupon
    const { data, error } = await supabase
      .from("coupons")
      .insert({
        seller_address: sellerAddress,
        title,
        brand,
        category: category || "Other",
        currency: currency,
        code_encrypted: encryptedCode,
        price_usd: price, // Mapping to legacy column to ensure it works, while adding currency field
        description: description || null,
        expiry_date: expiryDate || null,
        terms: terms || null,
      })
      .select("id, title, brand, category, price_usd, currency, created_at")
      .single();

    if (error) {
      console.error("Insert error:", error);
      return NextResponse.json({ error: "Failed to create coupon" }, { status: 500 });
    }

    return NextResponse.json({ success: true, coupon: data }, { status: 201 });
  } catch (error) {
    console.error("POST /api/coupons error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
