import { Metadata } from "next";
import FAQClient from "@/components/pages/faq/FAQClient";

export const metadata: Metadata = {
    title: "FAQ | SimplyPDF",
    description: "Get answers to frequently asked questions about SimplyPDF tools, privacy, security, and more.",
};

export default function FAQPage() {
    return <FAQClient />;
}
