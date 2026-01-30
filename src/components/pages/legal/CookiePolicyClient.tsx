"use client";

import { Cookie } from "lucide-react";
import { cookieSections } from "@/lib/legal-data";
import { LegalHeader } from "@/components/sections/legal/LegalHeader";
import { LegalContent } from "@/components/sections/legal/LegalContent";

import { BackgroundGradient } from "@/components/ui/BackgroundGradient";

export default function CookiePolicyClient() {
  return (
    <main className="min-h-screen px-4 pt-32 pb-20">
      {/* Background */}
      <BackgroundGradient />

      <div className="container mx-auto max-w-4xl">
        <LegalHeader
          title="Cookie Policy"
          description="Learn how SimplyPDF use cookies and similar technologies."
          icon={Cookie}
        />

        <LegalContent sections={cookieSections} />
      </div>
    </main>
  );
}
