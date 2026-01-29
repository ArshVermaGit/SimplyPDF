"use client";

import { useScrollReveal } from "@/hooks/useScrollReveal";
import { Hero } from "@/components/sections/home/Hero";
import { Stats } from "@/components/sections/home/Stats";
import { ToolsGrid } from "@/components/sections/home/ToolsGrid";
import { Features } from "@/components/sections/home/Features";
import { CTA } from "@/components/sections/home/CTA";
import { Testimonials } from "@/components/sections/common/Testimonials";

export default function Home() {
  // Scroll reveal effect
  useScrollReveal();

  return (
    <main className="overflow-hidden">
      <Hero />
      <Stats />
      <ToolsGrid />
      <Features />
      <CTA />
      <Testimonials />
    </main>
  );
}
