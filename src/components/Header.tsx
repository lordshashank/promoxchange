"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <div className="flex-1 flex items-center gap-3">
            {/* Mobile Menu Button - Left End */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 z-50 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              {isMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>

            <Link href="/" className="flex items-center gap-3 z-50">
              <img src="/promoxchange.png" alt="PromoXchange Logo" className="w-8 h-8 rounded-full" />
              <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">PromoXchange</span>
            </Link>
          </div>

          {/* Desktop Navigation - Centered */}
          <nav className="hidden md:flex items-center gap-8 px-4">
            <Link
              href="/"
              className="text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors whitespace-nowrap"
            >
              Browse
            </Link>
            <Link
              href="/list"
              className="text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors whitespace-nowrap"
            >
              Sell Coupon
            </Link>
            <Link
              href="/my-coupons"
              className="text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors whitespace-nowrap"
            >
              My Coupons
            </Link>
          </nav>

          {/* Right Section */}
          <div className="flex-1 flex items-center justify-end gap-2 sm:gap-4">
            {/* Theme Toggle - Desktop Only */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="hidden md:flex p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
            )}

            {/* Mobile: Avatar only to save space */}
            <div className="md:hidden">
              <ConnectButton showBalance={false} accountStatus="avatar" label="Login" />
            </div>

            {/* Desktop: Full address */}
            <div className="hidden md:block">
              <ConnectButton showBalance={false} accountStatus="address" label="Login" />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-xl z-40 md:hidden animate-in slide-in-from-top-2 fade-in duration-200">
          <nav className="flex flex-col p-4">
            <Link
              href="/"
              onClick={() => setIsMenuOpen(false)}
              className="px-4 py-3 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              Browse
            </Link>
            <Link
              href="/list"
              onClick={() => setIsMenuOpen(false)}
              className="px-4 py-3 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              Sell Coupon
            </Link>
            <Link
              href="/my-coupons"
              onClick={() => setIsMenuOpen(false)}
              className="px-4 py-3 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              My Coupons
            </Link>

            <div className={`border-t border-gray-100 dark:border-gray-800 mt-2 pt-4 px-4 pb-2 flex items-center ${mounted ? 'justify-between' : 'justify-end'}`}>
              {/* Mobile Theme Toggle */}
              {mounted && (
                <button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label="Toggle theme"
                >
                  {theme === "dark" ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  )}
                </button>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
