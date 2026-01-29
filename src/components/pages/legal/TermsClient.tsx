"use client";

import { Scale } from "lucide-react";
import { termsSections } from "@/lib/legal-data";
import { LegalHeader } from "@/components/sections/legal/LegalHeader";
import { TermsSummary } from "@/components/sections/legal/TermsSummary";
import { LegalContent } from "@/components/sections/legal/LegalContent";
import { SimpleCTA } from "@/components/sections/common/SimpleCTA";

import { BackgroundGradient } from "@/components/ui/BackgroundGradient";

export default function TermsClient() {
    return (
        <main className="min-h-screen pt-32 pb-20 px-4">
            {/* Background */}
            <BackgroundGradient />

            <div className="container mx-auto max-w-4xl">
                <LegalHeader 
                    title="Terms of Service"
                    description="Please read these terms carefully before using SimplyPDF."
                    lastUpdated="December 22, 2024"
                    icon={Scale}
                />
                
                <TermsSummary />
                
                <LegalContent sections={termsSections} />
                
                <SimpleCTA 
                    title="Questions About These Terms?"
                    description="If you have any questions about these Terms of Service, please contact us."
                    primaryBtnText="Contact Us"
                    primaryBtnLink="/contact"
                    secondaryBtnText="Privacy Policy"
                    secondaryBtnLink="/privacy"
                />
            </div>
        </main>
    );
}
