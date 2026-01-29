import { Metadata } from "next";
import TermsClient from "@/components/pages/legal/TermsClient";

export const metadata: Metadata = {
    title: "Terms of Service | SimplyPDF",
    description: "Read the Terms of Service for using SimplyPDF's free online PDF tools.",
};

export default function TermsPage() {
    return <TermsClient />;
}
