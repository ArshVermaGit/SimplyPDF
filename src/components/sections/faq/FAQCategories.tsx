"use client";

import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { FAQAccordion } from "@/components/ui/FAQAccordion";

interface FAQItem {
    question: string;
    answer: string;
}

interface FAQCategory {
    title: string;
    icon: React.ElementType;
    faqs: FAQItem[];
}

interface FAQCategoriesProps {
    filteredCategories: FAQCategory[];
    openItems: Set<string>;
    toggleItem: (key: string) => void;
}

export const FAQCategories = ({ filteredCategories, openItems, toggleItem }: FAQCategoriesProps) => {
    if (filteredCategories.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16 bg-gray-50 rounded-2xl"
            >
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">No results found</h3>
                <p className="text-gray-500">Try searching with different keywords</p>
            </motion.div>
        );
    }

    return (
        <div className="space-y-8">
            {filteredCategories.map((category, catIndex) => (
                <motion.div
                    key={category.title}
                    id={category.title.toLowerCase().replace(/\s+/g, '-')}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + catIndex * 0.05 }}
                    className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
                >
                    <div className="px-6 py-5 bg-gray-50 border-b border-gray-100 flex items-center gap-3">
                        <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center">
                            <category.icon className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-bold">{category.title}</h2>
                        <span className="ml-auto text-sm text-gray-400">
                            {category.faqs.length} questions
                        </span>
                    </div>
                    <div className="px-6">
                        {category.faqs.map((faq, faqIndex) => {
                            const key = `${catIndex}-${faqIndex}`;
                            return (
                                <FAQAccordion
                                    key={key}
                                    item={faq}
                                    isOpen={openItems.has(key)}
                                    onToggle={() => toggleItem(key)}
                                />
                            );
                        })}
                    </div>
                </motion.div>
            ))}
        </div>
    );
};
