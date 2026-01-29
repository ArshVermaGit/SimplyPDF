"use client";

import { motion } from "framer-motion";
import { faqCategories } from "@/lib/constants";

export const FAQQuickLinks = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
        >
            {faqCategories.map((category) => (
                <a
                    key={category.title}
                    href={`#${category.title.toLowerCase().replace(/\s+/g, '-')}`}
                    className="p-4 bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300 text-center group"
                >
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:bg-black group-hover:text-white transition-colors">
                        <category.icon className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-medium">{category.title}</span>
                </a>
            ))}
        </motion.div>
    );
};
