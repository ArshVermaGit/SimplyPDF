import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Hammer, Info, Layout } from "lucide-react";

export const metadata: Metadata = {
  title: "All PDF Tools | SimplyPDF",
  description:
    "A complete list of all the free online PDF tools and resources available on SimplyPDF.",
};

const sections = [
  {
    title: "Core Tools",
    icon: Hammer,
    pages: [
      { name: "Merge PDF", href: "/merge-pdf" },
      { name: "Split PDF", href: "/split-pdf" },
      { name: "Compress PDF", href: "/compress-pdf" },
      { name: "Edit PDF", href: "/edit-pdf" },
      { name: "PDF to Word", href: "/pdf-to-word" },
      { name: "Word to PDF", href: "/word-to-pdf" },
      { name: "JPG to PDF", href: "/jpg-to-pdf" },
      { name: "PDF to JPG", href: "/pdf-to-jpg" },
      { name: "OCR PDF", href: "/ocr-pdf" },
      { name: "Sign PDF", href: "/sign-pdf" },
      { name: "Watermark PDF", href: "/watermark-pdf" },
      { name: "Protect PDF", href: "/protect-pdf" },
      { name: "Unlock PDF", href: "/unlock-pdf" },
      { name: "Rotate PDF", href: "/rotate-pdf" },
      { name: "Organize PDF", href: "/organize-pdf" },
      { name: "PDF to Excel", href: "/pdf-to-excel" },
      { name: "Repair PDF", href: "/repair-pdf" },
      { name: "Edit Metadata", href: "/edit-metadata" },
    ],
  },
  {
    title: "Resources",
    icon: Info,
    pages: [
      { name: "How It Works", href: "/how-it-works" },
      { name: "Features", href: "/features" },
      { name: "FAQ", href: "/faq" },
      { name: "Changelog", href: "/changelog" },
      { name: "Support", href: "/support" },
      { name: "About Us", href: "/about" },
      { name: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Legal",
    icon: Layout,
    pages: [
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
      { name: "Disclaimer", href: "/disclaimer" },
      { name: "Cookie Policy", href: "/cookie-policy" },
    ],
  },
];

export default function SitemapPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="container mx-auto max-w-5xl px-4">
        <Link
          href="/"
          className="group mb-8 inline-flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-black"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Home
        </Link>

        <div className="mb-12">
          <h1 className="mb-4 text-4xl font-black tracking-tight">
            All PDF Tools
          </h1>
          <p className="text-lg font-medium text-gray-500">
            Every tool, feature, and legal document on{" "}
            <span className="text-black">SimplyPDF</span> — all in one place.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
          {sections.map((section) => (
            <div
              key={section.title}
              className="rounded-[32px] border border-gray-100 bg-white p-8 shadow-sm transition-shadow duration-300 hover:shadow-xl"
            >
              <div className="mb-8 flex items-center gap-3">
                <div className="rounded-xl bg-gray-50 p-2.5">
                  <section.icon className="h-5 w-5 text-gray-400" />
                </div>
                <h2 className="text-sm font-bold tracking-widest text-gray-900 uppercase">
                  {section.title}
                </h2>
              </div>
              <ul className="space-y-4">
                {section.pages.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group flex items-center justify-between text-sm font-bold text-gray-500 transition-colors hover:text-black"
                    >
                      {link.name}
                      <ArrowLeft className="h-3.5 w-3.5 -translate-x-2 rotate-180 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
