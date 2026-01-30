"use client";

import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";

interface EducationalContentProps {
  howItWorks?: { title: string; steps: string[] };
  benefits?: { title: string; items: { title: string; desc: string }[] };
  faqs?: { question: string; answer: string }[];
}

export function EducationalContent({
  howItWorks,
  benefits,
  faqs,
}: EducationalContentProps) {
  if (!howItWorks && !benefits && !faqs) return null;

  return (
    <div className="mt-24 space-y-24">
      {/* How it Works */}
      {howItWorks && (
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-4xl"
        >
          <h2 className="mb-10 text-center text-3xl font-bold">
            {howItWorks.title}
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {howItWorks.steps.map((step, i) => (
              <div
                key={i}
                className="relative rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-black font-bold text-white">
                  {i + 1}
                </div>
                <p className="leading-relaxed font-medium text-gray-600">
                  {step}
                </p>
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
          className="mx-auto max-w-4xl"
        >
          <h2 className="mb-10 text-center text-3xl font-bold">
            {benefits.title}
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {benefits.items.map((benefit, i) => (
              <div
                key={i}
                className="flex gap-4 rounded-2xl border border-gray-100 bg-gray-50/50 p-6"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                  <Sparkles className="h-6 w-6 text-black" />
                </div>
                <div>
                  <h3 className="mb-1 font-bold">{benefit.title}</h3>
                  <p className="text-sm leading-relaxed text-gray-500">
                    {benefit.desc}
                  </p>
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
          className="mx-auto max-w-3xl pb-10"
        >
          <h2 className="mb-10 text-center text-3xl font-bold">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <details
                key={i}
                className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between p-6 text-lg font-bold">
                  {faq.question}
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-50 transition-transform group-open:rotate-180">
                    <ArrowRight className="h-4 w-4 rotate-90" />
                  </span>
                </summary>
                <div className="px-6 pb-6 leading-relaxed text-gray-600">
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
