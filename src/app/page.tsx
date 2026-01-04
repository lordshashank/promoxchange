"use client";

import { useEffect, useState, useRef } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CouponList } from "@/components/CouponList";
import { CURRENCIES } from "@/lib/constants";

interface Coupon {
  id: string;
  title: string;
  brand: string;
  price_usd: number;
  category: string;
  expiry_date?: string | null;
  status: string;
  currency: string | null;
  is_sold: boolean;
}

export default function HomePage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState("All");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(["verified", "unverified", "invalid", "sold", "expired"]);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [onlyActive, setOnlyActive] = useState(true);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);

  const toggleCategory = (cat: string) => {
    if (cat === "All") {
      setSelectedCategories([]);
    } else {
      setSelectedCategories(prev =>
        prev.includes(cat)
          ? prev.filter(c => c !== cat)
          : [...prev, cat]
      );
    }
  };

  const scrollCategories = () => {
    if (categoriesRef.current) {
      categoriesRef.current.scrollBy({ left: 200, behavior: "smooth" });
    }
  };

  const categories = [
    "All",
    "Food & Dining",
    "Electronics",
    "Fashion",
    "Travel",
    "Entertainment",
    "Health & Beauty",
    "Home & Garden",
    "Services",
    "Other",
  ];

  // Handle CMD+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      async function fetchCoupons() {
        setIsLoading(true);
        try {
          const params = new URLSearchParams();
          if (selectedCategories.length > 0) {
            params.append("category", selectedCategories.join(","));
          }
          if (searchTerm) {
            params.append("search", searchTerm);
          }
          if (selectedCurrency && selectedCurrency !== "All") {
            params.append("currency", selectedCurrency);
          }
          if (selectedStatuses.includes("sold")) {
            params.append("show_sold", "true");
          }
          if (selectedStatuses.includes("expired")) {
            params.append("show_expired", "true");
          }

          // Filter out special statuses (sold, expired) for the status param
          const dbStatuses = selectedStatuses.filter(s => ["verified", "unverified", "invalid"].includes(s));
          if (dbStatuses.length > 0) {
            params.append("status", dbStatuses.join(","));
          }
          if (onlyActive) {
            params.append("active", "true");
          }

          const res = await fetch(`/api/coupons?${params.toString()}`);
          const data = await res.json();
          setCoupons(data.coupons || []);
        } catch (error) {
          console.error("Failed to fetch coupons:", error);
        } finally {
          setIsLoading(false);
        }
      }

      fetchCoupons();
    }, 300);

    return () => clearTimeout(timer);
  }, [selectedCategories, searchTerm, selectedCurrency, selectedStatuses, onlyActive]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-black transition-colors">
      <Header />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white tracking-tight mb-6">
            Trade unused <span className="text-emerald-600 dark:text-emerald-400 bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400">Promo Codes </span> instantly
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Buy and sell discount promo codes securely with USDC through <a href="https://x402.org" target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold transition-all">x402</a>.
            Stop letting your unused coupons expire. Start earning from them!!!
          </p>
        </div>

        {/* Unified Discovery Bar */}
        <div className="mb-8">
          <div className="flex flex-col bg-white dark:bg-gray-900 p-2 rounded-2xl shadow-xl ring-1 ring-gray-900/5 dark:ring-gray-800 transition-all duration-300">
            {/* Search & Categories Row */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2">
              {/* Main Actions: Search + Filter Toggle */}
              <div className="flex items-center gap-2 flex-grow">
                {/* Search Part */}
                <div className="relative flex-grow flex items-center bg-gray-50 dark:bg-gray-800 rounded-xl px-4 border border-gray-100 dark:border-gray-700 focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-400 transition-all">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-3.5 bg-transparent border-none focus:ring-0 text-sm md:text-base text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 font-medium outline-none"
                  />
                </div>

                {/* Filter Toggle (outside right) */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`p-3 rounded-xl transition-all duration-200 flex-shrink-0 ${showFilters
                    ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400"
                    : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                  title="Toggle Filters"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </button>
              </div>

              {/* Divider (Desktop) */}
              <div className="hidden lg:block w-px h-10 bg-gray-200 dark:bg-gray-700 mx-1" />

              {/* Categories Selection */}
              <div className="relative flex-grow flex items-center min-w-0">
                <div
                  ref={categoriesRef}
                  className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1 pr-10"
                >
                  <div className="flex items-center gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => toggleCategory(cat)}
                        className={`whitespace-nowrap px-4 py-2 rounded-full text-xs md:text-sm font-bold transition-all duration-200 ${(cat === "All" && selectedCategories.length === 0) || selectedCategories.includes(cat)
                          ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-md shadow-gray-900/10"
                          : "bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-gray-700 font-semibold hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                          }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* More Indicator (Fade + Chevron) */}
                <button
                  onClick={scrollCategories}
                  className="absolute right-0 inset-y-0 w-12 flex items-center justify-end bg-gradient-to-l from-white dark:from-gray-900 via-white/80 dark:via-gray-900/80 to-transparent hover:via-white dark:hover:via-gray-900 transition-all group"
                >
                  <svg className="w-5 h-5 text-gray-400 mr-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Bottom Row: Advanced Filters */}
            {showFilters && (
              <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-center lg:justify-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300 px-2 pb-1">
                {/* Currency Pill Dropdown */}
                <div className="relative flex items-center">
                  <select
                    value={selectedCurrency}
                    onChange={(e) => setSelectedCurrency(e.target.value)}
                    className="appearance-none bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-4 py-2 pr-9 rounded-full text-xs font-bold border border-gray-100 dark:border-gray-700 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 focus:outline-none cursor-pointer shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-200 dark:hover:border-gray-600 transition-all max-w-[140px] truncate"
                  >
                    <option value="All">All Currencies</option>
                    {CURRENCIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Status Filter Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowStatusMenu(!showStatusMenu)}
                    className="px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 transition-all border shadow-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-200 dark:hover:border-gray-600"
                  >
                    Status
                    {selectedStatuses.length > 0 && (
                      <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-[10px] px-1.5 py-0.5 rounded-full ml-1">
                        {selectedStatuses.length}
                      </span>
                    )}
                    <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${showStatusMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {showStatusMenu && (
                    <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-100 dark:border-gray-800 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="p-1">
                        {[
                          { id: "verified", label: "Verified" },
                          { id: "unverified", label: "Unverified" },
                          { id: "invalid", label: "Invalid" },
                          { id: "sold", label: "Sold" },
                          { id: "expired", label: "Expired" }
                        ].map((status) => (
                          <label
                            key={status.id}
                            className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer transition-colors"
                          >
                            <div className="relative flex items-center">
                              <input
                                type="checkbox"
                                checked={selectedStatuses.includes(status.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedStatuses([...selectedStatuses, status.id]);
                                  } else {
                                    setSelectedStatuses(selectedStatuses.filter(s => s !== status.id));
                                  }
                                }}
                                className={`w-4 h-4 rounded border-2 transition-colors cursor-pointer appearance-none ${selectedStatuses.includes(status.id)
                                  ? 'bg-emerald-500 border-emerald-500'
                                  : 'border-gray-300 dark:border-gray-600 bg-transparent'
                                  }`}
                              />
                              {selectedStatuses.includes(status.id) && (
                                <svg className="absolute inset-0 w-4 h-4 text-white p-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                              {status.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>


        <CouponList coupons={coupons} isLoading={isLoading} />
      </main>

      <Footer />
    </div>
  );
}
