import { Metadata } from "next";
import CookiePolicyClient from "@/components/pages/legal/CookiePolicyClient";

export const metadata: Metadata = {
  title: "Cookie Policy | SimplyPDF",
  description:
    "Understand how SimplyPDF uses cookies to improve your experience and deliver personalized content.",
};

export default function CookiePolicyPage() {
  return <CookiePolicyClient />;
}
