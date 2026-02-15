"use client";

import dynamic from "next/dynamic";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { Hero } from "@/components/sections/home/Hero";

// Lazy load heavy sections
const Stats = dynamic(() => import("@/components/sections/home/Stats").then(mod => mod.Stats), { ssr: true });
const ToolsGrid = dynamic(() => import("@/components/sections/home/ToolsGrid").then(mod => mod.ToolsGrid), { 
  ssr: true,
  loading: () => <div className="container mx-auto px-4 py-24"><div className="h-96 w-full animate-pulse rounded-[32px] bg-gray-100" /></div>
});
const Features = dynamic(() => import("@/components/sections/home/Features").then(mod => mod.Features), { ssr: true });
const CTA = dynamic(() => import("@/components/sections/home/CTA").then(mod => mod.CTA), { ssr: true });
const Testimonials = dynamic(() => import("@/components/sections/common/Testimonials").then(mod => mod.Testimonials), { ssr: true });

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
