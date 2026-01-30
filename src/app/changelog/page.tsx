import { Metadata } from "next";
import ChangelogClient from "@/components/pages/changelog/ChangelogClient";

export const metadata: Metadata = {
  title: "Changelog | SimplyPDF",
  description:
    "Stay updated with the latest features, improvements, and updates to SimplyPDF.",
};

export default function ChangelogPage() {
  return <ChangelogClient />;
}
