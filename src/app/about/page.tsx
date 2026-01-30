import { Metadata } from "next";
import AboutClient from "@/components/pages/about/AboutClient";

export const metadata: Metadata = {
  title: "About | Arsh Verma - SimplyPDF",
  description:
    "Learn more about Arsh Verma, the creator of SimplyPDF, and his mission to build polished, engaging digital realities.",
};

export default function AboutPage() {
  return <AboutClient />;
}
