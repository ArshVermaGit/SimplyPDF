import type { Metadata } from "next";
import { PDFToTextClient } from "@/components/pages/pdf-to-text/PdfToTextClient";

export const metadata: Metadata = {
  title: "PDF to Text - Extract Text from PDF | SimplyPDF",
  description:
    "Extract text from your PDF documents easily. Convert PDF to plain text (.txt) files for free, 100% locally in your browser for maximum privacy.",
};

export default function PDFToTextPage() {
  return <PDFToTextClient />;
}
