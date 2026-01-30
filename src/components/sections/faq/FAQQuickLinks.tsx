"use client";

import { motion } from "framer-motion";
import { faqCategories } from "@/lib/constants";

export const FAQQuickLinks = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="mb-12 grid grid-cols-2 gap-4 md:grid-cols-4"
    >
      {faqCategories.map((category) => (
        <a
          key={category.title}
          href={`#${category.title.toLowerCase().replace(/\s+/g, "-")}`}
          className="group rounded-xl border border-gray-100 bg-white p-4 text-center transition-all duration-300 hover:border-gray-200 hover:shadow-lg"
        >
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 transition-colors group-hover:bg-black group-hover:text-white">
            <category.icon className="h-5 w-5" />
          </div>
          <span className="text-sm font-medium">{category.title}</span>
        </a>
      ))}
    </motion.div>
  );
};
