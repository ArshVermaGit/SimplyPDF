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
    <div className="border-b border-gray-100 text-left last:border-0">
      <button
        onClick={onToggle}
        className="group flex w-full items-start justify-between gap-4 py-5 text-left"
      >
        <span className="pr-4 font-medium transition-colors group-hover:text-black">
          {item.question}
        </span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-gray-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
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
            <p className="pb-5 leading-relaxed text-gray-600">{item.answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
