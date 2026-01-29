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
        description: "A complete redesign of the application with a focus on modern aesthetics and user experience.",
        changes: [
            { icon: Layout, text: "Introduced Bento-style grid for tool navigation" },
            { icon: Zap, text: "Optimized PDF processing engine for 2x faster performance" },
            { icon: Shield, text: "Enhanced privacy measures with 100% local processing" }
        ]
    },
    {
        version: "v1.0.0",
        date: "December 15, 2025",
        title: "Official Launch",
        description: "SimplyPDF is now live with a comprehensive set of free PDF tools.",
        changes: [
            { icon: Star, text: "Launched with 15+ essential PDF tools" },
            { icon: Layout, text: "Responsive design for mobile and desktop" },
            { icon: Shield, text: "Privacy-first architecture from day one" }
        ]
    }
];

export default function ChangelogClient() {
    return (
        <main className="min-h-screen pt-32 pb-20 px-4">
            <BackgroundGradient />

            <div className="container mx-auto max-w-4xl">
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

                    <div className="w-20 h-20 bg-black text-white rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <History className="w-10 h-10" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                        Changelog
                    </h1>
                    <p className="text-gray-500 text-lg max-w-2xl mx-auto">
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
                            className="relative pl-8 border-l border-gray-100"
                        >
                            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-black border-4 border-white" />
                            
                            <div className="mb-2 flex items-center gap-3">
                                <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-bold uppercase tracking-wider">
                                    {entry.version}
                                </span>
                                <span className="text-gray-400 text-sm">{entry.date}</span>
                            </div>
                            
                            <h2 className="text-2xl font-bold mb-3">{entry.title}</h2>
                            <p className="text-gray-500 mb-6">{entry.description}</p>
                            
                            <div className="grid sm:grid-cols-2 gap-4">
                                {entry.changes.map((change, cIdx) => (
                                    <div key={cIdx} className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-50">
                                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                                            <change.icon className="w-4 h-4 text-gray-600" />
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
