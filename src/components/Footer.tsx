"use client";

import React from "react";

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="border-t border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-black/50 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    {/* Copyright Section */}
                    <div className="text-gray-500 dark:text-gray-400 text-sm font-medium order-2 md:order-1">
                        © {currentYear} PromoXchange. All rights reserved.
                    </div>

                    {/* Social Links Section */}
                    <div className="flex items-center gap-6 order-1 md:order-2">
                        <a
                            href="https://t.me/+y3tw2PmZJ4UwNmJl"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group transition-all duration-300"
                            aria-label="Telegram"
                        >
                            <svg
                                className="w-5 h-5 text-gray-400 group-hover:text-emerald-500 transition-colors"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.25-5.54 3.69-.52.36-1 .53-1.42.52-.47-.01-1.37-.26-2.03-.48-.82-.27-1.47-.42-1.42-.88.03-.24.36-.48.99-.74 3.84-1.67 6.4-2.77 7.68-3.3 3.66-1.51 4.42-1.77 4.92-1.78.11 0 .35.03.5.16.13.11.17.26.19.37.02.09.03.26.02.39z" />
                            </svg>
                        </a>
                        <a
                            href="https://x.com/0xlord_forever/status/2008225879558963513?s=20"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group transition-all duration-300"
                            aria-label="Twitter"
                        >
                            <svg
                                className="w-5 h-5 text-gray-400 group-hover:text-emerald-500 transition-colors"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                            </svg>
                        </a>
                        <a
                            href="https://github.com/lordshashank/promoxchange"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group transition-all duration-300"
                            aria-label="GitHub"
                        >
                            <svg
                                className="w-5 h-5 text-gray-400 group-hover:text-emerald-500 transition-colors"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.63-.33 2.47-.33.83 0 1.68.11 2.47.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z" />
                            </svg>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
