"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Zap,
  Shield,
  Globe,
  ArrowLeft,
  Merge,
  Split,
  Minimize2,
  FileImage,
  Lock,
  Type,
} from "lucide-react";
import { BackgroundGradient } from "@/components/ui/BackgroundGradient";

const mainFeatures = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description:
      "Process files in seconds with our optimized browser-based engine.",
  },
  {
    icon: Shield,
    title: "100% Secure",
    description:
      "Files are processed locally on your device and never uploaded to any server.",
  },
  {
    icon: Globe,
    title: "Works Anywhere",
    description:
      "Compatible with all modern browsers across Windows, Mac, Linux, and mobile.",
  },
];

const toolFeatures = [
  {
    icon: Merge,
    title: "Merge PDF",
    description:
      "Combine multiple PDF files into a single document effortlessly.",
  },
  {
    icon: Split,
    title: "Split PDF",
    description: "Deconstruct your PDF into separate pages or smaller files.",
  },
  {
    icon: Minimize2,
    title: "Compress PDF",
    description:
      "Reduce file size while maintaining the best possible quality.",
  },
  {
    icon: FileImage,
    title: "PDF to Image",
    description: "Convert PDF pages into high-quality JPG or PNG images.",
  },
  {
    icon: Lock,
    title: "Protect & Unlock",
    description:
      "Add secure passwords or remove protection from your documents.",
  },
  {
    icon: Type,
    title: "Edit PDF",
    description: "Annotate, add text, and modify your PDF content with ease.",
  },
];

export default function FeaturesClient() {
  return (
    <main className="min-h-screen px-4 pt-32 pb-20">
      <BackgroundGradient />

      <div className="container mx-auto max-w-5xl">
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

          <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl">
            Powerful Features for <br />
            <span className="animate-text-shimmer">Every PDF Task</span>
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-gray-500">
            Discover the full potential of SimplyPDF&apos;s ecosystem. No
            signups, no limits, just pure productivity.
          </p>
        </motion.div>

        {/* Core Benefits */}
        <div className="mb-24 grid gap-8 md:grid-cols-3">
          {mainFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.1 }}
              className="rounded-3xl border border-white bg-white/50 p-8 backdrop-blur-sm transition-all hover:shadow-xl"
            >
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-black text-white">
                <feature.icon className="h-7 w-7" />
              </div>
              <h3 className="mb-3 text-xl font-bold">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Tools Detailed */}
        <div className="relative overflow-hidden rounded-[3rem] bg-gray-950 p-12 text-white md:p-20">
          <div className="grid-pattern absolute inset-0 opacity-10" />

          <div className="relative z-10 mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-5xl">
              Complete Toolkit
            </h2>
            <p className="text-gray-400">
              Everything you need to manage your documents effectively.
            </p>
          </div>

          <div className="relative z-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {toolFeatures.map((tool) => (
              <div
                key={tool.title}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 transition-colors hover:bg-white/10"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-white">
                  <tool.icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 text-lg font-bold">{tool.title}</h3>
                <p className="text-sm leading-relaxed text-gray-400">
                  {tool.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
