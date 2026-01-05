"use client";

import { useEffect, useState, use } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { Header } from "@/components/Header";
import { x402Client, x402HTTPClient } from "@x402/core/client";
import { ExactEvmScheme } from "@x402/evm";
import { networkId } from "@/lib/chain";
import ReactMarkdown from "react-markdown";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { EditCouponModal } from "@/components/EditCouponModal";

interface Coupon {
  id: string;
  seller_address: string;
  title: string;
  brand: string;
  category: string;
  price_usd: number;
  description: string | null;
  expiry_date: string | null;
  terms: string | null;
  status: string;
  is_sold: boolean;
  buyer_address: string | null;
  created_at: string;
  country: string | null;
  transaction?: {
    transaction_hash: string;
    network: string;
  } | null;
}

export default function CouponDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { address, isConnected } = useAccount();

  const { data: walletClient } = useWalletClient();
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [purchasedCode, setPurchasedCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();

  const fetchCoupon = async () => {
    try {
      const res = await fetch(`/api/coupons/${id}`);
      const data = await res.json();
      if (data.coupon) {
        setCoupon(data.coupon);
      }
    } catch (err) {
      console.error("Failed to fetch coupon:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupon();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this coupon? This action cannot be undone.")) {
      return;
    }

    if (!isAuthenticated) {
      await login();
      return;
    }

    setDeleting(true);
    setError(null);

    try {
      const res = await fetch(`/api/coupons/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete coupon");
      }

      router.push("/my-coupons");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete coupon");
      setDeleting(false);
    }
  };

  const handlePurchase = async () => {
    if (!isConnected) {
      setError("Please connect your wallet first");
      return;
    }

    if (coupon?.seller_address.toLowerCase() === address?.toLowerCase()) {
      setError("You cannot buy your own coupon");
      return;
    }

    setPurchasing(true);
    setError(null);

    try {
      // This will trigger the x402 payment flow
      let res = await fetch(`/api/coupons/${id}/code`);

      if (res.status === 402) {
        // Handle x402 payment flow
        if (!walletClient) {
          throw new Error("Wallet client not available. Please reconnect.");
        }

        // 1. Initialize x402 client
        const client = new x402Client();

        // ExactEvmScheme expects an object with { address, signTypedData }.
        // viem's walletClient has address inside .account, so we wrap it:
        const signer = {
          address: address as `0x${string}`,
          signTypedData: (args: any) => walletClient.signTypedData(args),
        };

        if (!signer.address) {
          throw new Error("Wallet address not detected. Please reconnect.");
        }

        client.register(networkId, new ExactEvmScheme(signer as any));

        const httpClient = new x402HTTPClient(client);

        // 2. Parse payment requirements from response
        const paymentRequired = httpClient.getPaymentRequiredResponse(
          (name) => res.headers.get(name)
        );

        // 3. Create payment payload (this will trigger wallet signature)
        const paymentPayload = await client.createPaymentPayload(paymentRequired);

        // 4. Encode signature into headers for retry
        const paymentHeaders = httpClient.encodePaymentSignatureHeader(paymentPayload);

        // 5. Retry the request with payment headers
        res = await fetch(`/api/coupons/${id}/code`, {
          headers: {
            ...paymentHeaders,
          },
        });
      }

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Purchase failed");
      }

      const data = await res.json();
      setPurchasedCode(data.coupon.code);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Purchase failed");
    } finally {
      setPurchasing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black transition-colors">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-xl" />
            <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/4" />
          </div>
        </main>
      </div>
    );
  }

  if (!coupon) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black transition-colors">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Coupon Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            This coupon may have been removed or doesn&apos;t exist.
          </p>
          <a
            href="/"
            className="inline-block mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg"
          >
            Browse Coupons
          </a>
        </main>
      </div>
    );
  }

  const isExpired =
    coupon.expiry_date && new Date(coupon.expiry_date) < new Date();
  const isOwner =
    address?.toLowerCase() === coupon.seller_address.toLowerCase();
  const isBuyer =
    address?.toLowerCase() === coupon.buyer_address?.toLowerCase();

  // Category colors for header
  const categoryColors: Record<string, string> = {
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

  const gradientClass = categoryColors[coupon.category] || categoryColors.Other;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black transition-colors">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm overflow-hidden relative">

          <div className={`relative h-48 bg-gradient-to-br ${gradientClass} flex items-center justify-center`}>
            <div className="text-center text-white">
              <div className="text-6xl font-bold mb-2">
                {coupon.brand.substring(0, 2).toUpperCase()}
              </div>
              <div className="text-xl font-medium opacity-90">{coupon.brand}</div>
            </div>
            {coupon.is_sold && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="text-white text-3xl font-bold">SOLD</span>
              </div>
            )}
            {isExpired && !coupon.is_sold && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="text-white text-3xl font-bold">EXPIRED</span>
              </div>
            )}

            {isOwner && !coupon.is_sold && (
              <div className="absolute top-4 right-4 flex gap-2 z-10">
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="p-2 bg-white/20 hover:bg-white/40 text-white backdrop-blur-sm rounded-full transition"
                  title="Edit Coupon"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                  </svg>
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="p-2 bg-white/20 hover:bg-red-500/80 text-white backdrop-blur-sm rounded-full transition"
                  title="Delete Coupon"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          <div className="p-6 md:p-8">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-600 dark:text-gray-300 font-medium">
                    {coupon.category}
                  </span>
                  {isExpired ? (
                    <span className="text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 text-sm font-black uppercase px-3 py-1 rounded-full border border-red-100 dark:border-red-900/30">
                      Expired
                    </span>
                  ) : coupon.status === 'invalid' ? (
                    <span className="text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 text-sm font-black uppercase px-3 py-1 rounded-full border border-red-100 dark:border-red-900/30">
                      Invalid
                    </span>
                  ) : coupon.status === 'verified' ? (
                    <span className="text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400 text-sm font-black uppercase px-3 py-1 rounded-full border border-green-100 dark:border-green-900/30 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      Verified
                    </span>
                  ) : (
                    <span className="text-yellow-700 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400 text-sm font-bold uppercase px-3 py-1 rounded-full border border-yellow-100 dark:border-yellow-900/30">
                      Unverified
                    </span>
                  )}
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mt-3">
                  {coupon.title}
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">{coupon.brand}</p>
              </div>

              <div className="flex flex-col items-end gap-3">
                <div className="flex items-baseline gap-1 text-right">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    ${coupon.price_usd}
                  </div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">USDC</div>
                </div>


              </div>
            </div>

            {coupon.description && (
              <div className="mt-6">
                <h2 className="font-semibold text-gray-900 dark:text-white mb-2">Description</h2>
                <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-400">
                  <ReactMarkdown>{coupon.description}</ReactMarkdown>
                </div>
              </div>
            )}

            {coupon.terms && (
              <div className="mt-4">
                <h2 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Terms & Conditions
                </h2>
                <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-400 text-sm">
                  <ReactMarkdown>{coupon.terms}</ReactMarkdown>
                </div>
              </div>
            )}

            {coupon.expiry_date && (
              <div className="mt-4">
                <span
                  className={`text-sm ${isExpired ? "text-red-500" : "text-orange-500 dark:text-orange-400"
                    }`}
                >
                  {isExpired ? "Expired" : "Expires"}:{" "}
                  {new Date(coupon.expiry_date).toLocaleDateString()}
                </span>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              {purchasedCode ? (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/30 rounded-lg p-6">
                  <h3 className="font-bold text-green-800 dark:text-green-400 mb-2">
                    Purchase Successful!
                  </h3>
                  <p className="text-sm text-green-700 dark:text-green-500 mb-4">
                    Your coupon code is:
                  </p>
                  <div className="bg-white dark:bg-gray-800 border-2 border-green-300 dark:border-green-700 rounded-lg p-4 text-center">
                    <code className="text-2xl font-mono font-bold text-gray-900 dark:text-white">
                      {purchasedCode}
                    </code>
                  </div>
                  <p className="text-sm text-green-600 dark:text-green-500 mt-4">
                    This code has been saved to your purchased coupons.
                  </p>
                </div>
              ) : coupon.is_sold ? (
                <div className="text-center py-4">
                  {isBuyer ? (
                    <a
                      href="/my-coupons/purchased"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      View your purchased coupons to see the code
                    </a>
                  ) : isOwner ? (
                    <div className="text-gray-500 dark:text-gray-400">
                      <p className="mb-4">This coupon has been sold!</p>
                      {coupon.transaction && (
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                          <p className="text-sm font-semibold mb-2 text-gray-900 dark:text-white">Payment Received</p>
                          <a
                            href={`https://basescan.org/tx/${coupon.transaction.transaction_hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 dark:text-blue-400 hover:underline break-all font-mono flex items-center justify-center gap-1"
                          >
                            {coupon.transaction.transaction_hash}
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">
                      This coupon has already been sold
                    </p>
                  )}
                </div>
              ) : isOwner ? (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                  <p>You can edit or delete your listing using the icons above.</p>
                </div>
              ) : (
                <>
                  <button
                    onClick={handlePurchase}
                    disabled={purchasing || !isConnected || !!isExpired}
                    className="w-full py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition text-lg"
                  >
                    {!isConnected
                      ? "Connect Wallet to Purchase"
                      : purchasing
                        ? "Processing Payment..."
                        : isExpired
                          ? "Coupon Expired"
                          : `Buy for $${coupon.price_usd} USDC`}
                  </button>
                  {error && (
                    <p className="text-red-500 text-center mt-4">{error}</p>
                  )}
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-4">
                    Payment is made directly to the seller via x402 protocol
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      {coupon && (
        <EditCouponModal
          coupon={coupon}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={fetchCoupon}
        />
      )}
    </div>
  );
}
