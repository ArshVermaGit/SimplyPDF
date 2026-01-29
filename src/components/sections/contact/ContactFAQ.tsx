"use client";

import { motion } from "framer-motion";
import { contactFaqs } from "@/lib/constants";

export const ContactFAQ = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-20"
        >
            <h2 className="text-2xl font-bold mb-8 text-center">Common Questions</h2>
            <div className="grid md:grid-cols-3 gap-6">
                {contactFaqs.map((faq, index) => (
                    <motion.div
                        key={faq.q}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.55 + index * 0.05 }}
                        className="p-6 bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300"
                    >
                        <h3 className="font-semibold mb-3">{faq.q}</h3>
                        <p className="text-gray-500 text-sm">{faq.a}</p>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
};
