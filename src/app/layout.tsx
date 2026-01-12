import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Providers } from "@/components/Providers";
import Script from "next/script";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

import { Great_Vibes, Alex_Brush } from "next/font/google";

const greatVibes = Great_Vibes({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-cursive",
});

const alexBrush = Alex_Brush({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-alex",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://simplypdf.vercel.app'),
  title: "SimplyPDF | The Easiest PDF Tool",
  description: "Merge, split, compress, and convert PDFs with SimplyPDF. The premium, fast, and secure PDF management tool.",
  other: {
    "google-adsense-account": "ca-pub-4266443141083729",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body 
        suppressHydrationWarning
        className={`${inter.variable} ${greatVibes.variable} ${alexBrush.variable} font-sans antialiased min-h-screen flex flex-col`}
      >
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4266443141083729"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <Providers>
          <Header />
          <main className="grow">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
