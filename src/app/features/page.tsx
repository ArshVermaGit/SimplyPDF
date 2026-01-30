import { Metadata } from "next";
import FeaturesClient from "@/components/pages/features/FeaturesClient";

export const metadata: Metadata = {
  title: "Features | SimplyPDF",
  description:
    "Explore the powerful features of SimplyPDF. Fast, secure, and free online PDF tools.",
};

export default function FeaturesPage() {
  return <FeaturesClient />;
}
