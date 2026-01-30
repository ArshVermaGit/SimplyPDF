import type { Metadata } from "next";
import { PDFToHTMLClient } from "@/components/pages/pdf-to-html/PdfToHtmlClient";

export const metadata: Metadata = {
  title: "PDF to HTML - Convert PDF to Web Page | SimplyPDF",
  description:
    "Convert your PDF documents into clean, semantic HTML code. Perfect for developers and content creators who need to migrate PDF content to websites.",
};

export default function PDFToHTMLPage() {
  return <PDFToHTMLClient />;
}
