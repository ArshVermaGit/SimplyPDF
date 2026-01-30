"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { History, ArrowLeft, Zap, Star, Shield, Layout } from "lucide-react";
import { BackgroundGradient } from "@/components/ui/BackgroundGradient";

const changelog = [
  {
    version: "v1.1.0",
    date: "January 20, 2026",
    title: "The UI Overhaul",
    description:
      "A complete redesign of the application with a focus on modern aesthetics and user experience.",
    changes: [
      { icon: Layout, text: "Introduced Bento-style grid for tool navigation" },
      {
        icon: Zap,
        text: "Optimized PDF processing engine for 2x faster performance",
      },
      {
        icon: Shield,
        text: "Enhanced privacy measures with 100% local processing",
      },
    ],
  },
  {
    version: "v1.0.0",
    date: "December 15, 2025",
    title: "Official Launch",
    description:
      "SimplyPDF is now live with a comprehensive set of free PDF tools.",
    changes: [
      { icon: Star, text: "Launched with 15+ essential PDF tools" },
      { icon: Layout, text: "Responsive design for mobile and desktop" },
      { icon: Shield, text: "Privacy-first architecture from day one" },
    ],
  },
];

export default function ChangelogClient() {
  return (
    <main className="min-h-screen px-4 pt-32 pb-20">
      <BackgroundGradient />

      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16 text-center"
        >
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 text-gray-500 transition-colors hover:text-black"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-black text-white">
            <History className="h-10 w-10" />
          </div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">
            Changelog
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-500">
            Stay updated with the latest features and improvements to SimplyPDF.
          </p>
        </motion.div>

        <div className="space-y-12">
          {changelog.map((entry, index) => (
            <motion.div
              key={entry.version}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative border-l border-gray-100 pl-8"
            >
              <div className="absolute top-0 -left-[9px] h-4 w-4 rounded-full border-4 border-white bg-black" />

              <div className="mb-2 flex items-center gap-3">
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold tracking-wider uppercase">
                  {entry.version}
                </span>
                <span className="text-sm text-gray-400">{entry.date}</span>
              </div>

              <h2 className="mb-3 text-2xl font-bold">{entry.title}</h2>
              <p className="mb-6 text-gray-500">{entry.description}</p>

              <div className="grid gap-4 sm:grid-cols-2">
                {entry.changes.map((change, cIdx) => (
                  <div
                    key={cIdx}
                    className="flex items-center gap-3 rounded-xl border border-gray-50 bg-white p-4"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-50">
                      <change.icon className="h-4 w-4 text-gray-600" />
                    </div>
                    <span className="text-sm text-gray-600">{change.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}
