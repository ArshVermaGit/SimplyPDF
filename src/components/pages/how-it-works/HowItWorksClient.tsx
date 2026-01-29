"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { HelpCircle, ArrowLeft, Shield, Cpu, Zap, CloudOff, FileCheck } from "lucide-react";
import { BackgroundGradient } from "@/components/ui/BackgroundGradient";

const steps = [
  {
    icon: Cpu,
    title: "1. Local Processing",
    description: "When you select a file, it remains on your device. SimplyPDF uses WebAssembly and JavaScript to process the file directly in your browser's memory."
  },
  {
    icon: CloudOff,
    title: "2. No Data Upload",
    description: "Your document is never sent to a backend server. This elimates the risk of data interception or unauthorized access during transmission."
  },
  {
    icon: Zap,
    title: "3. Instant Execution",
    description: "By leveraging your device's own hardware, processing is lightning-fast and doesn't depend on internet upload speeds."
  },
  {
    icon: FileCheck,
    title: "4. Secure Output",
    description: "Once processed, the result is generated as a secure blob in your browser, ready for you to download immediately."
  }
];

export default function HowItWorksClient() {
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
                        <HelpCircle className="w-10 h-10" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                        How it Works
                    </h1>
                    <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                        SimplyPDF is built on a &quot;Privacy First&quot; architecture. Here&apos;s how we keep your documents 100% secure.
                    </p>
                </motion.div>

                <div className="grid gap-8">
                    {steps.map((step, index) => (
                        <motion.div
                            key={step.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 + index * 0.1 }}
                            className="bg-white rounded-2xl border border-gray-100 p-8 hover:border-gray-200 hover:shadow-lg transition-all duration-300"
                        >
                            <div className="flex flex-col md:flex-row items-start gap-6">
                                <div className="w-14 h-14 bg-gray-950 text-white rounded-2xl flex items-center justify-center shrink-0">
                                    <step.icon className="w-7 h-7" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold mb-3">{step.title}</h2>
                                    <p className="text-gray-600 leading-relaxed text-lg">
                                        {step.description}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-16 bg-green-50 rounded-[3rem] p-12 border border-green-100 text-center"
                >
                    <div className="w-16 h-16 bg-green-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Shield className="w-8 h-8" />
                    </div>
                    <h2 className="text-3xl font-bold text-green-900 mb-4">The Browser-First Edge</h2>
                    <p className="text-green-800 text-lg max-w-2xl mx-auto">
                        By doing everything in the client, we ensure that your sensitive data never touches anyone else&apos;s computer. It&apos;s the most secure way to handle PDFs online.
                    </p>
                </motion.div>
            </div>
        </main>
    );
}
