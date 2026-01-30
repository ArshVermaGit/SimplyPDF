import type { Metadata } from "next";
import { HTMLToPDFClient } from "@/components/pages/html-to-pdf/HtmlToPdfClient";

export const metadata: Metadata = {
  title: "HTML to PDF - Convert Webpages and Code to PDF | SimplyPDF",
  description:
    "Convert HTML files, code snippets, or webpages to high-quality PDF documents. Fast, secure, and 100% private conversion inside your browser.",
};

export default function HTMLToPDFPage() {
  return <HTMLToPDFClient />;
}
