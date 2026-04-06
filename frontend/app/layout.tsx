import type { Metadata } from "next";
import "./globals.css";
import LayoutWrapper from "../components/LayoutWrapper";
import Script from "next/script";

export const metadata: Metadata = {
  title: "QuantAI — AI Investment Platform",
  description: "AI-powered investment research and portfolio management",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#0a0a0f]">
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="beforeInteractive"
        />
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}