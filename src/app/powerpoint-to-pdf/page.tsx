import type { Metadata } from "next";
import { PPTToPDFClient } from "@/components/pages/powerpoint-to-pdf/PptToPdfClient";

export const metadata: Metadata = {
  title: "PowerPoint to PDF - Convert Presentations to PDF | SimplyPDF",
  description:
    "Convert your PowerPoint presentations (.pptx) to high-quality PDF documents for free. No file limits, 100% private and secure processing in your browser.",
};

export default function PPTToPDFPage() {
  return <PPTToPDFClient />;
}
