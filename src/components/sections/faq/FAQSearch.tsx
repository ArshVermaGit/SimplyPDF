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
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search questions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black transition-all text-lg"
                />
            </div>
        </motion.div>
    );
};
