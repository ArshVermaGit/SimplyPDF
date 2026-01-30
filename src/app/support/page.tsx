import { Metadata } from "next";
import SupportClient from "@/components/pages/support/SupportClient";

export const metadata: Metadata = {
  title: "Support | SimplyPDF",
  description:
    "Get help with SimplyPDF. Contact our team, view FAQs, or browse our documentation.",
};

export default function SupportPage() {
  return <SupportClient />;
}
