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

export const LegalContent = ({ sections, delayOffset = 0.1 }: LegalContentProps) => {
    return (
        <div className="space-y-6">
            {sections.map((section, index) => (
                <motion.div
                    key={section.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: delayOffset + index * 0.03 }}
                    className="bg-white rounded-2xl border border-gray-100 p-8 hover:border-gray-200 hover:shadow-lg transition-all duration-300"
                >
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
                            <section.icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-xl font-bold mb-4">{section.title}</h2>
                            <div className="prose prose-gray max-w-none">
                                {section.content.split('\n\n').map((paragraph, pIdx) => (
                                    <p key={pIdx} className="text-gray-600 mb-4 last:mb-0 whitespace-pre-line">
                                        {paragraph.split('**').map((part, partIdx) =>
                                            partIdx % 2 === 1 ? <strong key={partIdx} className="text-black">{part}</strong> : part
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
