"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, HelpCircle } from "lucide-react";

export const FAQHeader = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
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
                Frequently Asked Questions
            </h1>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                Find answers to common questions about SimplyPDF and our tools.
            </p>
        </motion.div>
    );
};
