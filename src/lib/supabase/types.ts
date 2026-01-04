export interface User {
  wallet_address: string;
  created_at: string;
}

export interface Coupon {
  id: string;
  seller_address: string;
  title: string;
  description: string | null;
  brand: string;
  category: string;
  code_encrypted: string;
  price_usd: number;
  expiry_date: string | null;
  terms: string | null;
  country: string | null;
  status: "unverified" | "verified" | "invalid";
  is_sold: boolean;
  buyer_address: string | null;
  purchased_at: string | null;
  created_at: string;
}

export interface PaymentTransaction {
  id: string;
  coupon_id: string;
  payer_address: string;
  amount_usd: number;
  transaction_hash: string | null;
  network: string;
  status: "pending" | "verified" | "settled" | "failed";
  created_at: string;
}

export type CouponPublic = Omit<Coupon, "code_encrypted">;
