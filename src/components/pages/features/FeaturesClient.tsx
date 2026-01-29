"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Zap, Shield, Globe, ArrowLeft, Merge, Split, Minimize2, FileImage, Lock, Type } from "lucide-react";
import { BackgroundGradient } from "@/components/ui/BackgroundGradient";

const mainFeatures = [
  { icon: Zap, title: "Lightning Fast", description: "Process files in seconds with our optimized browser-based engine." },
  { icon: Shield, title: "100% Secure", description: "Files are processed locally on your device and never uploaded to any server." },
  { icon: Globe, title: "Works Anywhere", description: "Compatible with all modern browsers across Windows, Mac, Linux, and mobile." },
];

const toolFeatures = [
  { icon: Merge, title: "Merge PDF", description: "Combine multiple PDF files into a single document effortlessly." },
  { icon: Split, title: "Split PDF", description: "Deconstruct your PDF into separate pages or smaller files." },
  { icon: Minimize2, title: "Compress PDF", description: "Reduce file size while maintaining the best possible quality." },
  { icon: FileImage, title: "PDF to Image", description: "Convert PDF pages into high-quality JPG or PNG images." },
  { icon: Lock, title: "Protect & Unlock", description: "Add secure passwords or remove protection from your documents." },
  { icon: Type, title: "Edit PDF", description: "Annotate, add text, and modify your PDF content with ease." },
];

export default function FeaturesClient() {
    return (
        <main className="min-h-screen pt-32 pb-20 px-4">
            <BackgroundGradient />

            <div className="container mx-auto max-w-5xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-gray-500 hover:text-black mb-8 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Home
                    </Link>

                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
                        Powerful Features for <br />
                        <span className="animate-text-shimmer">Every PDF Task</span>
                    </h1>
                    <p className="text-gray-500 text-xl max-w-2xl mx-auto">
                        Discover the full potential of SimplyPDF&apos;s ecosystem. No signups, no limits, just pure productivity.
                    </p>
                </motion.div>

                {/* Core Benefits */}
                <div className="grid md:grid-cols-3 gap-8 mb-24">
                    {mainFeatures.map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 + index * 0.1 }}
                            className="p-8 rounded-3xl bg-white/50 border border-white backdrop-blur-sm hover:shadow-xl transition-all"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-black text-white flex items-center justify-center mb-6">
                                <feature.icon className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                            <p className="text-gray-600">{feature.description}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Tools Detailed */}
                <div className="bg-gray-950 rounded-[3rem] p-12 md:p-20 text-white relative overflow-hidden">
                    <div className="absolute inset-0 grid-pattern opacity-10" />
                    
                    <div className="relative z-10 text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-4">Complete Toolkit</h2>
                        <p className="text-gray-400">Everything you need to manage your documents effectively.</p>
                    </div>

                    <div className="relative z-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {toolFeatures.map((tool) => (
                            <div key={tool.title} className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center mb-4 text-white">
                                    <tool.icon className="w-5 h-5" />
                                </div>
                                <h3 className="text-lg font-bold mb-2">{tool.title}</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">{tool.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}
