import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Analytics } from "@vercel/analytics/next"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://promoxchange.xyz"),
  title: {
    default: "PromoXchange - Buy & Sell Coupons",
    template: "%s | PromoXchange",
  },
  description: "A marketplace for buying and selling coupon codes with x402 payments. Save money on your favorite brands or sell your unused coupons.",
  keywords: ["Coupons", "Crypto", "x402", "Marketplace", "Promo Codes", "Discounts", "Blockchain", "USDC", "Ethereum"],
  authors: [{ name: "PromoXchange Team" }],
  creator: "PromoXchange",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "PromoXchange",
    title: "PromoXchange - Buy & Sell Coupons",
    description: "A marketplace for buying and selling coupon codes with x402 payments",
  },
  twitter: {
    card: "summary_large_image",
    title: "PromoXchange - Buy & Sell Coupons",
    description: "A marketplace for buying and selling coupon codes with x402 payments",
    creator: "@0xlord_forever",
  },
  icons: {
    icon: "/promoxchange.png",
    apple: "/promoxchange.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          {children}
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
