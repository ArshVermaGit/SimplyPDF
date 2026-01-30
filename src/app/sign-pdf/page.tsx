import { Metadata } from "next";
import { SignPDFClient } from "@/components/pages/sign-pdf/SignPDFClient";

export const metadata: Metadata = {
  title: "Sign PDF Online | Add Digital Signature to PDF Free",
  description:
    "Sign your PDF documents online with ease. Draw your signature or upload an image to sign files 100% privately and securely in your browser. No sign-up required.",
  keywords: [
    "Sign PDF",
    "Digital Signature",
    "Electronic Signature",
    "PDF Signer",
    "Free PDF Sign",
    "SimplyPDF",
  ],
  openGraph: {
    title: "Sign PDF Online | #1 Free PDF Signing Tool",
    description:
      "The easiest way to sign your PDF documents electronically. Fast, free, and secure.",
    url: "https://simplypdf.vercel.app/sign-pdf",
  },
};

export default function Page() {
  return <SignPDFClient />;
}
