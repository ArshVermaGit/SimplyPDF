import type { Metadata } from "next";
import { TextToPDFClient } from "@/components/pages/text-to-pdf/TextToPdfClient";

export const metadata: Metadata = {
  title: "Text to PDF - Convert Text Files to PDF | SimplyPDF",
  description:
    "Convert your plain text files (.txt) to high-quality PDF documents for free. Fast, secure, and 100% private conversion inside your browser.",
};

export default function TextToPDFPage() {
  return <TextToPDFClient />;
}
