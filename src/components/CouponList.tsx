"use client";

import { CouponCard } from "./CouponCard";

interface Coupon {
  id: string;
  title: string;
  brand: string;
  price_usd: number;
  category: string;
  expiry_date?: string | null;
  status: string;
  currency: string | null;
}

interface CouponListProps {
  coupons: Coupon[];
  isLoading?: boolean;
}

export function CouponList({ coupons, isLoading }: CouponListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-48 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse flex"
          >
            <div className="w-1/3 bg-gray-200 dark:bg-gray-700 h-full rounded-l-2xl" />
            <div className="flex-1 p-5 space-y-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              <div className="mt-auto pt-4 flex justify-between">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (coupons.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 dark:text-gray-400 text-lg">No coupons available</p>
        <p className="text-gray-400 dark:text-gray-500 mt-2">
          Be the first to list a coupon!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {coupons.map((coupon) => (
        <CouponCard key={coupon.id} coupon={coupon} />
      ))}
    </div>
  );
}
