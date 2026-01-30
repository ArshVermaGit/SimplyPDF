"use client";

import { ContactHeader } from "@/components/sections/contact/ContactHeader";
import { ContactMethods } from "@/components/sections/contact/ContactMethods";
import { ContactFAQ } from "@/components/sections/contact/ContactFAQ";
import { SimpleCTA } from "@/components/sections/common/SimpleCTA";
import { BackgroundGradient } from "@/components/ui/BackgroundGradient";

export default function ContactClient() {
  return (
    <main className="min-h-screen overflow-hidden px-4 pt-32 pb-20">
      {/* Background Elements */}
      <BackgroundGradient />

      <div className="container mx-auto max-w-5xl">
        <ContactHeader />
        <div className="mx-auto max-w-2xl">
          <ContactMethods />
        </div>
        <ContactFAQ />
        <SimpleCTA
          title="Need Help with PDF Tools?"
          description="Check out our FAQ page for answers to common questions about using SimplyPDF tools."
          primaryBtnText="Visit FAQ"
          primaryBtnLink="/faq"
          className="bg-black text-white"
          primaryBtnClass="bg-white text-black font-semibold py-3 px-8 rounded-full border-2 border-white hover:bg-gray-100 transition-colors"
        />
      </div>
    </main>
  );
}
