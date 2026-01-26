"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Cookie, ArrowLeft, Shield, Eye, Settings } from "lucide-react";

const sections = [
    {
        icon: Eye,
        title: "What are cookies?",
        content: "Cookies are small text files that are stored on your device when you visit a website. They help the website remember your preferences and improve your browsing experience."
    },
    {
        icon: Shield,
        title: "How we use cookies",
        content: "We use cookies to provide essential website functionality, analyze site traffic, and serve personalized advertisements through Google AdSense. Some cookies are necessary for the site to function, while others help us improve your experience."
    },
    {
        icon: Settings,
        title: "Managing cookies",
        content: "You can manage your cookie preferences through your browser settings. Most browsers allow you to block or delete cookies, but doing so may affect certain features of the website."
    }
];

export default function CookiePolicyPage() {
    return (
        <main className="min-h-screen pt-32 pb-20 px-4">
            <div className="fixed inset-0 -z-10">
                <div className="absolute top-20 right-10 w-96 h-96 bg-gray-100 rounded-full blur-3xl opacity-50" />
                <div className="absolute bottom-20 left-10 w-72 h-72 bg-gray-50 rounded-full blur-3xl opacity-60" />
            </div>

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
                        <Cookie className="w-10 h-10" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                        Cookie Policy
                    </h1>
                    <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                        Learn how SimplyPDF use cookies and similar technologies.
                    </p>
                </motion.div>

                <div className="space-y-8">
                    {sections.map((section, index) => (
                        <motion.div
                            key={section.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 + index * 0.1 }}
                            className="bg-white rounded-2xl border border-gray-100 p-8 hover:border-gray-200 hover:shadow-lg transition-all duration-300"
                        >
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
                                    <section.icon className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-xl font-bold mb-4">{section.title}</h2>
                                    <p className="text-gray-600 leading-relaxed">
                                        {section.content}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </main>
    );
}
