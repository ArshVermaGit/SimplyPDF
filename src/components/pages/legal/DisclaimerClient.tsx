"use client";

import { AlertCircle } from "lucide-react";
import { disclaimerSections } from "@/lib/legal-data";
import { LegalHeader } from "@/components/sections/legal/LegalHeader";
import { LegalContent } from "@/components/sections/legal/LegalContent";

import { BackgroundGradient } from "@/components/ui/BackgroundGradient";

export default function DisclaimerClient() {
  return (
    <main className="min-h-screen px-4 pt-32 pb-20">
      {/* Background */}
      <BackgroundGradient />

      <div className="container mx-auto max-w-4xl">
        <LegalHeader
          title="Disclaimer"
          description="Please read this disclaimer carefully before using SimplyPDF."
          icon={AlertCircle}
        />

        <LegalContent sections={disclaimerSections} />
      </div>
    </main>
  );
}
