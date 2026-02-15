"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface Section {
  icon: LucideIcon;
  title: string;
  content: string;
}

interface LegalContentProps {
  sections: Section[];
  delayOffset?: number;
}

export const LegalContent = ({
  sections,
}: LegalContentProps) => {
  return (
    <div className="space-y-6">
      {sections.map((section, index) => (
        <motion.div
          key={section.title}
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 + index * 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-2xl border border-gray-100 bg-white p-8 transition-all duration-300 hover:border-gray-200 hover:shadow-lg"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-100">
              <section.icon className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h2 className="mb-4 text-xl font-bold">{section.title}</h2>
              <div className="prose prose-gray max-w-none">
                {section.content.split("\n\n").map((paragraph, pIdx) => (
                  <p
                    key={pIdx}
                    className="mb-4 whitespace-pre-line text-gray-600 last:mb-0"
                  >
                    {paragraph.split("**").map((part, partIdx) =>
                      partIdx % 2 === 1 ? (
                        <strong key={partIdx} className="text-black">
                          {part}
                        </strong>
                      ) : (
                        part
                      )
                    )}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
