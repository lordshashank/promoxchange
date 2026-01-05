"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

interface PurchasedCoupon {
  id: string;
  title: string;
  brand: string;
  category: string;
  price_usd: number;
  expiry_date: string | null;
  description: string | null;
  terms: string | null;
  code: string;
  purchased_at: string;
}

import { useAuth } from "@/components/AuthProvider";

export default function PurchasedCouponsPage() {
  const { address, isConnected } = useAccount();
  const { isAuthenticated, isSigning, login } = useAuth();
  const [coupons, setCoupons] = useState<PurchasedCoupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (!address) return;

    // Wait for auth before fetching
    if (!isAuthenticated) {
      // If connected but not authenticated, the AuthProvider handles the prompt
      // We just wait here. 
      return;
    }

    async function fetchCoupons() {
      try {
        const res = await fetch(
          `/api/user/coupons?address=${address}&type=purchased`,
          {
            credentials: "include",
          }
        );

        if (res.status === 401 || res.status === 403) {
          // Should not happen if isAuthenticated is true, but good safety
          console.error("Auth failed on backend");
          return;
        }

        const data = await res.json();
        setCoupons(data.coupons || []);
      } catch (err) {
        console.error("Failed to fetch coupons:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCoupons();
  }, [address, isAuthenticated]);

  const copyCode = async (code: string, id: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Category colors
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

  if (!isConnected) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-black transition-colors">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Connect Your Wallet</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Please connect your wallet to view your purchased coupons.
          </p>
        </main>
        <div className="mt-auto">
          <Footer />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-black transition-colors">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Verify Ownership</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-4 mb-6">
            Please sign the message in your wallet to verify you own this address.
            <br />
            This extra step protects your purchased coupon codes.
          </p>
          <button
            onClick={() => login()}
            disabled={isSigning}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isSigning ? "Check Wallet..." : "Sign Message"}
          </button>
        </main>
        <div className="mt-auto">
          <Footer />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-black transition-colors">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Coupons</h1>
          <div className="flex gap-4 mt-4">
            <Link
              href="/my-coupons"
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100 transition-colors"
            >
              Listed
            </Link>
            <Link
              href="/my-coupons/purchased"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              Purchased
            </Link>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-900 rounded-lg p-4 animate-pulse flex gap-4"
              >
                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : coupons.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-xl">
            <p className="text-gray-500 dark:text-gray-400 text-lg">No purchased coupons yet</p>
            <Link
              href="/"
              className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg"
            >
              Browse Coupons
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {coupons.map((coupon) => {
              const colorClass = categoryColors[coupon.category] || categoryColors.Other;
              return (
                <div
                  key={coupon.id}
                  className="bg-white dark:bg-gray-900 rounded-lg p-4 md:p-6"
                >

                  <Link href={`/coupons/${coupon.id}`} className="block">
                    <div className="flex gap-4">
                      <div className="w-16 h-16 rounded bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-blue-900/50 dark:to-indigo-900/50 flex items-center justify-center flex-shrink-0">
                        <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                          {coupon.brand.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${colorClass}`}>
                              {coupon.category}
                            </span>
                            <h3 className="font-semibold text-gray-900 dark:text-white mt-1">
                              {coupon.title}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{coupon.brand}</p>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-gray-600 dark:text-gray-300">
                              ${coupon.price_usd}
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                          Purchased{" "}
                          {new Date(coupon.purchased_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </Link>

                  <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Coupon Code:</p>
                        <code className="text-xl font-mono font-bold text-gray-900 dark:text-white">
                          {coupon.code}
                        </code>
                      </div>
                      <button
                        onClick={() => copyCode(coupon.code, coupon.id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                      >
                        {copiedId === coupon.id ? "Copied!" : "Copy"}
                      </button>
                    </div>
                  </div>

                  {coupon.expiry_date && (
                    <p
                      className={`text-sm mt-3 ${new Date(coupon.expiry_date) < new Date()
                        ? "text-red-500"
                        : "text-orange-500 dark:text-orange-400"
                        }`}
                    >
                      Expires: {new Date(coupon.expiry_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}
