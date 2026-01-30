import type { Metadata } from "next";
import { PDFToEPUBClient } from "@/components/pages/pdf-to-epub/PdfToEpubClient";

export const metadata: Metadata = {
  title: "PDF to EPUB - Convert PDF to eBook | SimplyPDF",
  description:
    "Convert your PDF documents into EPUB eBooks for better reading on mobile devices and eReaders. Fast, free, and 100% private conversion in your browser.",
};

export default function PDFToEPUBPage() {
  return <PDFToEPUBClient />;
}
