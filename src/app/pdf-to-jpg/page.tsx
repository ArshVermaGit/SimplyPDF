import { Metadata } from "next";
import { PDFToJPGClient } from "@/components/pages/pdf-to-jpg/PDFToJPGClient";

export const metadata: Metadata = {
  title: "PDF to JPG Converter | Extract PDF Pages as Images",
  description:
    "Convert every PDF page into a high-quality JPG image. Efficient, free, and secure browser-side conversion. Your files never leave your device.",
  keywords: [
    "PDF to JPG",
    "PDF to Image",
    "Extract PDF Pages",
    "Free Online Converter",
    "SimplyPDF",
  ],
  openGraph: {
    title: "PDF to JPG Converter | #1 Free Image Extraction Tool",
    description:
      "Turn your PDF pages into high-quality images in seconds. No uploads, 100% private.",
    url: "https://simplypdf.vercel.app/pdf-to-jpg",
  },
};

export default function Page() {
  return <PDFToJPGClient />;
}
