"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { ScreenshotUpload } from "./ScreenshotUpload";
import { useAuth } from "@/components/AuthProvider";
import { CURRENCIES, CATEGORIES } from "@/lib/constants";

interface ExtractedData {
  title?: string;
  brand?: string;
  code?: string;
  description?: string;
  expiryDate?: string;
  terms?: string;
  category?: string;
  currency?: string;
}

export function ListCouponForm() {
  const { address, isConnected } = useAccount();
  const { isAuthenticated, login, getAuthHeaders } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    brand: "",
    code: "",
    description: "",
    category: "Other",
    currency: "Global",
    price: "",
    expiryDate: "",
    terms: "",
  });

  const handleExtract = (data: ExtractedData) => {
    setFormData((prev) => ({
      ...prev,
      title: data.title || prev.title,
      brand: data.brand || prev.brand,
      code: data.code || prev.code,
      description: data.description || prev.description,
      category: data.category || prev.category,
      terms: data.terms || prev.terms,
      expiryDate: data.expiryDate || prev.expiryDate,
      currency: data.currency
        ? (CURRENCIES.some(c => c.code === data.currency) ? data.currency : "Other")
        : prev.currency,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected || !address) {
      setError("Please connect your wallet first");
      return;
    }

    if (!isAuthenticated) {
      await login();
      return;
    }

    if (!formData.title || !formData.brand || !formData.code || !formData.price) {
      setError("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const headers = {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      };

      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
          sellerAddress: address,
          title: formData.title,
          brand: formData.brand,
          code: formData.code,
          description: formData.description || null,
          category: formData.category,
          price: parseFloat(formData.price),
          currency: formData.currency,
          expiryDate: formData.expiryDate || null,
          terms: formData.terms || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create listing");
      }

      setSuccess(true);
      setFormData({
        title: "",
        brand: "",
        code: "",
        description: "",
        category: "Other",
        currency: "Global",
        price: "",
        expiryDate: "",
        terms: "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Connect Your Wallet
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Please connect your wallet to list a coupon for sale.
        </p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-4">
          Coupon Listed Successfully!
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Your coupon is now available for purchase.
        </p>
        <div className="flex gap-4 justify-center">
          <a
            href="/"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Browse Coupons
          </a>
          <button
            onClick={() => setSuccess(false)}
            className="px-6 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100 transition-colors"
          >
            List Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
          Coupon Screenshot (Optional)
        </label>
        <ScreenshotUpload onExtractComplete={handleExtract} />
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Upload a screenshot to auto-fill details, or enter manually below
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
            Title *
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            placeholder="e.g., 20% Off Electronics"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800 placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
            Brand *
          </label>
          <input
            type="text"
            required
            value={formData.brand}
            onChange={(e) =>
              setFormData({ ...formData, brand: e.target.value })
            }
            placeholder="e.g., Amazon"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800 placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
            Coupon Code *
          </label>
          <input
            type="text"
            required
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            placeholder="e.g., SAVE20"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-gray-900 dark:text-white bg-white dark:bg-gray-800 placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
            Price (USD) *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-500 dark:text-gray-400">$</span>
            <input
              type="number"
              required
              min="0"
              step="0.00001"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              placeholder="5.00"
              className="w-full pl-7 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800 placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
            Category
          </label>
          <select
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1 flex items-center gap-1">
            Coupon Value Currency
            <div className="group relative">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-500 dark:text-gray-400 cursor-help">
                <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
              </svg>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-gray-900 text-white text-xs rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all text-center z-10">
                The currency in which the code would provide discount, etc if region specific.
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
              </div>
            </div>
          </label>
          <select
            value={formData.currency}
            onChange={(e) =>
              setFormData({ ...formData, currency: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
          Expiry Date
        </label>
        <input
          type="date"
          value={formData.expiryDate}
          onChange={(e) =>
            setFormData({ ...formData, expiryDate: e.target.value })
          }
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
          Description (Markdown supported)
        </label>
        <textarea
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          rows={3}
          placeholder="Describe what this coupon is for..."
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800 placeholder:text-gray-400 dark:placeholder:text-gray-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
          Terms & Conditions (Markdown supported)
        </label>
        <textarea
          value={formData.terms}
          onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
          rows={2}
          placeholder="Any restrictions or terms..."
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800 placeholder:text-gray-400 dark:placeholder:text-gray-500"
        />
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {submitting ? "Listing..." : "List Coupon for Sale"}
        </button>
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
        Payments will be sent directly to your connected wallet ({address?.slice(0, 6)}...{address?.slice(-4)})
      </p>
    </form>
  );
}
