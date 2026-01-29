"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface FAQItem {
    question: string;
    answer: string;
}

interface FAQAccordionProps {
    item: FAQItem;
    isOpen: boolean;
    onToggle: () => void;
}

export function FAQAccordion({ item, isOpen, onToggle }: FAQAccordionProps) {
    return (
        <div className="border-b border-gray-100 last:border-0 text-left">
            <button
                onClick={onToggle}
                className="w-full py-5 flex items-start justify-between gap-4 text-left group"
            >
                <span className="font-medium group-hover:text-black transition-colors pr-4">
                    {item.question}
                </span>
                <ChevronDown
                    className={`w-5 h-5 text-gray-400 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <p className="pb-5 text-gray-600 leading-relaxed">
                            {item.answer}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
