"use client";

import { motion } from "framer-motion";
import { Search } from "lucide-react";

interface FAQSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const FAQSearch = ({ searchQuery, setSearchQuery }: FAQSearchProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="mb-12"
    >
      <div className="relative">
        <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search questions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-2xl border border-gray-200 bg-white py-4 pr-4 pl-12 text-lg transition-all focus:ring-2 focus:ring-black focus:outline-none"
        />
      </div>
    </motion.div>
  );
};
