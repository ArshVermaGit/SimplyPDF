"use client";

import { Shield, Mail } from "lucide-react";
import { privacySections } from "@/lib/legal-data";
import { LegalHeader } from "@/components/sections/legal/LegalHeader";
import { PrivacyHighlights } from "@/components/sections/legal/PrivacyHighlights";
import { LegalContent } from "@/components/sections/legal/LegalContent";
import { SimpleCTA } from "@/components/sections/common/SimpleCTA";
import { BackgroundGradient } from "@/components/ui/BackgroundGradient";

export default function PrivacyClient() {
  return (
    <main className="min-h-screen px-4 pt-32 pb-20">
      {/* Background */}
      <BackgroundGradient />

      <div className="container mx-auto max-w-4xl">
        <LegalHeader
          title="Privacy Policy"
          description="Your privacy matters to us. Learn how SimplyPDF protects your data and respects your rights."
          lastUpdated="December 22, 2024"
          icon={Shield}
        />

        <PrivacyHighlights />

        <LegalContent sections={privacySections} />

        <SimpleCTA
          title="Questions About Privacy?"
          description="If you have any questions or concerns about our privacy practices, please don't hesitate to reach out."
          primaryBtnText="Contact Us"
          primaryBtnLink="/contact"
          primaryBtnIcon={Mail}
        />
      </div>
    </main>
  );
}
