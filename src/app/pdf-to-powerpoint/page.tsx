import type { Metadata } from "next";
import { PDFToPPTClient } from "@/components/pages/pdf-to-powerpoint/PdfToPptClient";

export const metadata: Metadata = {
  title: "PDF to PowerPoint - Convert PDF to Presentation | SimplyPDF",
  description:
    "Convert your PDF documents into editable PowerPoint presentations (.pptx) safely and for free. Each PDF page is converted into a presentation slide.",
};

export default function PDFToPPTPage() {
  return <PDFToPPTClient />;
}
