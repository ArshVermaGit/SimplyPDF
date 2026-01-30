import { Metadata } from "next";
import { MergePDFClient } from "@/components/pages/merge-pdf/MergePDFClient";

export const metadata: Metadata = {
  title: "Merge PDF Online | Combine PDF Files for Free",
  description:
    "The easiest way to merge PDF files. Simply drag and drop your files and combine them into a single high-quality PDF document. 100% private and secure processing in your browser.",
  keywords: [
    "Merge PDF",
    "Combine PDF",
    "Join PDF",
    "Free PDF Merger",
    "Merge PDF Online",
    "SimplyPDF",
  ],
  openGraph: {
    title: "Merge PDF Online | #1 Free PDF Merger",
    description:
      "Combine multiple PDFs into one document easily. Fast, free, and secure.",
    url: "https://simplypdf.vercel.app/merge-pdf",
  },
};

export default function Page() {
  return <MergePDFClient />;
}
