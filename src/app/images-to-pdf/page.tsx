import type { Metadata } from "next";
import { ImagesToPDFClient } from "@/components/pages/images-to-pdf/ImagesToPdfClient";

export const metadata: Metadata = {
  title: "Images to PDF - Convert JPG, PNG, WebP to PDF | SimplyPDF",
  description:
    "Convert your images (JPG, PNG, WebP) to high-quality PDF documents for free. Adjust margins, orientation, and image size. 100% private and secure.",
};

export default function ImagesToPDFPage() {
  return <ImagesToPDFClient />;
}
