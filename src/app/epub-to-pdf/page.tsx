import type { Metadata } from "next";
import { EPUBToPDFClient } from "@/components/pages/epub-to-pdf/EpubToPdfClient";

export const metadata: Metadata = {
  title: "EPUB to PDF - Convert eBooks to PDF | SimplyPDF",
  description:
    "Convert your EPUB eBooks to high-quality PDF documents for free. Perfect for reading on any device without eBook software. Fast, secure, and private.",
};

export default function EPUBToPDFPage() {
  return <EPUBToPDFClient />;
}
