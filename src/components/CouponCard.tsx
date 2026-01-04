"use client";

import Link from "next/link";

interface Coupon {
  id: string;
  title: string;
  brand: string;
  price_usd: number;
  category: string;
  expiry_date?: string | null;
  status: string;
  currency: string | null;
  is_sold?: boolean;
}

export function CouponCard({ coupon }: { coupon: Coupon }) {
  const isExpired =
    coupon.expiry_date && new Date(coupon.expiry_date) < new Date();

  // Generate a color based on category
  const categoryColors: Record<string, string> = {
    "Food & Dining": "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200",
    Electronics: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200",
    Fashion: "bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-200",
    Travel: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200",
    Entertainment: "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200",
    "Health & Beauty": "bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-200",
    "Home & Garden": "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200",
    Services: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-800 dark:text-cyan-200",
    Other: "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200",
  };

  const colorClass = categoryColors[coupon.category] || categoryColors.Other;
  const brandInitials = coupon.brand.substring(0, 2).toUpperCase();

  // Gradient based on category for the "stub" part
  const categoryGradients: Record<string, string> = {
    "Food & Dining": "from-orange-400 to-orange-600",
    Electronics: "from-blue-400 to-blue-600",
    Fashion: "from-pink-400 to-pink-600",
    Travel: "from-green-400 to-green-600",
    Entertainment: "from-purple-400 to-purple-600",
    "Health & Beauty": "from-rose-400 to-rose-600",
    "Home & Garden": "from-emerald-400 to-emerald-600",
    Services: "from-cyan-400 to-cyan-600",
    Other: "from-gray-400 to-gray-600",
  };

  const gradientClass = categoryGradients[coupon.category] || categoryGradients.Other;

  const isInvalid = coupon.status === "invalid";
  return (
    <Link href={`/coupons/${coupon.id}`} className="block h-full">
      <div className="ticket-container flex h-48 group">
        {/* Left Side: Brand Stub */}
        <div className={`w-1/3 relative flex flex-col items-center justify-center p-4 bg-gradient-to-br ${coupon.is_sold ? "from-gray-600 to-gray-700" : isExpired || isInvalid ? "from-gray-400 to-gray-500" : gradientClass}`}>
          <div className="text-white font-black text-3xl mb-1 tracking-tight drop-shadow-sm transition-transform group-hover:scale-110">
            {brandInitials}
          </div>
          <p className="text-white/90 text-[10px] font-bold uppercase tracking-widest text-center truncate w-full">
            {coupon.brand}
          </p>

          {/* Vertical Text Label */}
          <div className="absolute left-1 bottom-8 -rotate-90 origin-left text-[8px] font-black text-white/40 uppercase tracking-[0.2em] whitespace-nowrap pointer-events-none">
            {coupon.is_sold ? 'SOLD' : isExpired ? 'EXPIRED' : isInvalid ? 'INVALID' : coupon.status === 'verified' ? 'CS • VERIFIED' : 'CS • MARKETPLACE'}
          </div>
        </div>

        {/* The Divider & Cutouts */}
        <div className="relative flex items-center bg-white dark:bg-gray-900 px-1">
          <div className="ticket-cutout-left" />
          <div className="ticket-cutout-right" />
          <div className="ticket-divider" />
        </div>

        {/* Right Side: Details */}
        <div className="flex-1 bg-white dark:bg-gray-900 p-5 flex flex-col justify-between relative overflow-hidden">
          {/* Top Row: Category & Status */}
          <div className="flex justify-between items-start gap-2">
            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${colorClass}`}>
              {coupon.category}
            </span>



            {/* Status Indicator */}
            {/* Status Indicator - Expanding Icon */}
            {coupon.is_sold ? (
              <div className="flex items-center bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-full px-1.5 py-1.5 transition-all duration-300 hover:pr-3 group/status shadow-sm">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                <div className="max-w-0 overflow-hidden group-hover/status:max-w-[100px] transition-all duration-500 ease-out">
                  <span className="text-[10px] font-black uppercase whitespace-nowrap pl-1.5 block">
                    Sold
                  </span>
                </div>
              </div>
            ) : isExpired ? (
              <div className="flex items-center bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30 rounded-full px-1.5 py-1.5 transition-all duration-300 hover:pr-3 group/status shadow-sm">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <div className="max-w-0 overflow-hidden group-hover/status:max-w-[100px] transition-all duration-500 ease-out">
                  <span className="text-[10px] font-black uppercase whitespace-nowrap pl-1.5 block">
                    Expired
                  </span>
                </div>
              </div>
            ) : isInvalid ? (
              <div className="flex items-center bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30 rounded-full px-1.5 py-1.5 transition-all duration-300 hover:pr-3 group/status shadow-sm">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
                <div className="max-w-0 overflow-hidden group-hover/status:max-w-[100px] transition-all duration-500 ease-out">
                  <span className="text-[10px] font-black uppercase whitespace-nowrap pl-1.5 block">
                    Invalid
                  </span>
                </div>
              </div>
            ) : coupon.status === 'verified' ? (
              <div className="flex items-center bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 rounded-full px-1.5 py-1.5 transition-all duration-300 hover:pr-3 group/status shadow-sm shadow-emerald-500/10">
                <div className="relative flex items-center justify-center">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="max-w-0 overflow-hidden group-hover/status:max-w-[100px] transition-all duration-500 ease-out">
                  <span className="text-[10px] font-black uppercase whitespace-nowrap pl-1.5 block">
                    Verified
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border border-yellow-100 dark:border-yellow-900/30 rounded-full px-1.5 py-1.5 transition-all duration-300 hover:pr-3 group/status shadow-sm">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="max-w-0 overflow-hidden group-hover/status:max-w-[100px] transition-all duration-500 ease-out">
                  <span className="text-[10px] font-bold uppercase whitespace-nowrap pl-1.5 block">
                    Not verified
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Title */}
          <div className="mt-2">
            <h3 className="font-bold text-gray-900 dark:text-white leading-tight line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              {coupon.title}
            </h3>
          </div>

          {/* Bottom Row: Price & Expiry */}
          <div className="mt-auto pt-4 flex items-end justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider leading-none mb-1">
                Price
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-gray-900 dark:text-white leading-none">
                  ${coupon.price_usd}
                </span>
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">USDC</span>
              </div>
            </div>

            {coupon.expiry_date && !isExpired && (
              <div className="text-right flex flex-col items-end">
                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-1">
                  Valid Until
                </span>
                <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                  {new Date(coupon.expiry_date).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "2-digit"
                  })}
                </span>
              </div>
            )}
          </div>

          {/* Glassy Overlay for Expired */}
          {isExpired && (
            <div className="absolute inset-0 bg-white/50 dark:bg-black/50 backdrop-blur-[1px] flex items-center justify-center pointer-events-none" />
          )}
        </div>
      </div>
    </Link>
  );
}
