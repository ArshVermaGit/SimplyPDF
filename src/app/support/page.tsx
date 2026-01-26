"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { HelpCircle, ArrowLeft, Mail, MessageCircle, FileQuestion, BookOpen } from "lucide-react";

const supportOptions = [
    {
        icon: Mail,
        title: "Email Support",
        description: "Get help from our team via email.",
        action: "Send Email",
        href: "mailto:arshverma.dev@gmail.com"
    },
    {
        icon: MessageCircle,
        title: "Contact Form",
        description: "Submit a request through our contact form.",
        action: "Open Form",
        href: "/contact"
    },
    {
        icon: FileQuestion,
        title: "FAQs",
        description: "Find answers to commonly asked questions.",
        action: "View FAQs",
        href: "/faq"
    }
];

export default function SupportPage() {
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
                        <HelpCircle className="w-10 h-10" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                        Support Center
                    </h1>
                    <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                        Need help with SimplyPDF? We&apos;re here to assist you.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-6">
                    {supportOptions.map((option, index) => (
                        <motion.div
                            key={option.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 + index * 0.1 }}
                            className="bg-white rounded-2xl border border-gray-100 p-8 hover:border-gray-200 hover:shadow-lg transition-all duration-300 text-center"
                        >
                            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <option.icon className="w-7 h-7" />
                            </div>
                            <h2 className="text-xl font-bold mb-3">{option.title}</h2>
                            <p className="text-gray-500 text-sm mb-6">{option.description}</p>
                            <Link
                                href={option.href}
                                className="inline-flex items-center justify-center px-6 py-2 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors w-full"
                            >
                                {option.action}
                            </Link>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="mt-12 bg-gray-900 rounded-4xl p-10 text-white text-center relative overflow-hidden"
                >
                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-6">
                            <BookOpen className="w-6 h-6" />
                        </div>
                        <h2 className="text-2xl font-bold mb-4">Help Documentation</h2>
                        <p className="text-gray-400 mb-8 max-w-lg mx-auto">
                            Coming soon: Comprehensive guides and tutorials to help you master every SimplyPDF tool.
                        </p>
                    </div>
                </motion.div>
            </div>
        </main>
    );
}
