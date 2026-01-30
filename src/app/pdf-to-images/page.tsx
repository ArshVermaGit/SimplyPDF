import type { Metadata } from "next";
import { PDFToImagesClient } from "@/components/pages/pdf-to-images/PdfToImagesClient";

export const metadata: Metadata = {
  title: "PDF to Images - Convert PDF to JPG, PNG, WebP | SimplyPDF",
  description:
    "Convert your PDF pages into high-quality images (JPG, PNG, WebP) instantly. No file limits, 100% private and secure processing in your browser.",
};

export default function PDFToImagesPage() {
  return <PDFToImagesClient />;
}
