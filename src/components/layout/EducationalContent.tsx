"use client";

import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";

interface EducationalContentProps {
    howItWorks?: { title: string; steps: string[] };
    benefits?: { title: string; items: { title: string; desc: string }[] };
    faqs?: { question: string; answer: string }[];
}

export function EducationalContent({ howItWorks, benefits, faqs }: EducationalContentProps) {
    if (!howItWorks && !benefits && !faqs) return null;

    return (
        <div className="mt-24 space-y-24">
            {/* How it Works */}
            {howItWorks && (
                <motion.section
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="max-w-4xl mx-auto"
                >
                    <h2 className="text-3xl font-bold mb-10 text-center">{howItWorks.title}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {howItWorks.steps.map((step, i) => (
                            <div key={i} className="relative p-6 rounded-2xl bg-white border border-gray-100 shadow-sm">
                                <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-bold mb-4">
                                    {i + 1}
                                </div>
                                <p className="text-gray-600 leading-relaxed font-medium">{step}</p>
                            </div>
                        ))}
                    </div>
                </motion.section>
            )}

            {/* Benefits */}
            {benefits && (
                <motion.section
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="max-w-4xl mx-auto"
                >
                    <h2 className="text-3xl font-bold mb-10 text-center">{benefits.title}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {benefits.items.map((benefit, i) => (
                            <div key={i} className="p-6 rounded-2xl bg-gray-50/50 border border-gray-100 flex gap-4">
                                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center shrink-0">
                                    <Sparkles className="w-6 h-6 text-black" />
                                </div>
                                <div>
                                    <h3 className="font-bold mb-1">{benefit.title}</h3>
                                    <p className="text-gray-500 text-sm leading-relaxed">{benefit.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.section>
            )}

            {/* FAQs */}
            {faqs && (
                <motion.section
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="max-w-3xl mx-auto pb-10"
                >
                    <h2 className="text-3xl font-bold mb-10 text-center">Frequently Asked Questions</h2>
                    <div className="space-y-4">
                        {faqs.map((faq, i) => (
                            <details key={i} className="group bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                                <summary className="flex items-center justify-between p-6 cursor-pointer list-none font-bold text-lg">
                                    {faq.question}
                                    <span className="w-6 h-6 rounded-full bg-gray-50 flex items-center justify-center group-open:rotate-180 transition-transform">
                                        <ArrowRight className="w-4 h-4 rotate-90" />
                                    </span>
                                </summary>
                                <div className="px-6 pb-6 text-gray-600 leading-relaxed">
                                    {faq.answer}
                                </div>
                            </details>
                        ))}
                    </div>
                </motion.section>
            )}
        </div>
    );
}
