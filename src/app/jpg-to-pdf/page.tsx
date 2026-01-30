import { Metadata } from "next";
import { JPGToPDFClient } from "@/components/pages/jpg-to-pdf/JPGToPDFClient";

export const metadata: Metadata = {
  title: "JPG to PDF Converter | Convert Images to PDF Online",
  description:
    "Easily convert your JPG, PNG, and other images to high-quality PDF documents. Combine multiple images into a single PDF. Fast, free, and secure.",
  keywords: [
    "JPG to PDF",
    "Images to PDF",
    "PNG to PDF",
    "Convert JPG to PDF",
    "Free Image Converter",
    "SimplyPDF",
  ],
  openGraph: {
    title: "JPG to PDF Converter | #1 Free Image to PDF Tool",
    description:
      "Convert your photos and images into PDFs instantly. No uploads, 100% private.",
    url: "https://simplypdf.vercel.app/jpg-to-pdf",
  },
};

export default function Page() {
  return <JPGToPDFClient />;
}
