import { Metadata } from "next";
import PrivacyClient from "@/components/pages/legal/PrivacyClient";

export const metadata: Metadata = {
    title: "Privacy Policy | SimplyPDF",
    description: "Learn how SimplyPDF protects your privacy and data. We process all files locally in your browser for maximum security.",
};

export default function PrivacyPage() {
    return <PrivacyClient />;
}
