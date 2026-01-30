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
      <h2 className="mb-8 text-center text-2xl font-bold">Common Questions</h2>
      <div className="grid gap-6 md:grid-cols-3">
        {contactFaqs.map((faq, index) => (
          <motion.div
            key={faq.q}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 + index * 0.05 }}
            className="rounded-2xl border border-gray-100 bg-white p-6 transition-all duration-300 hover:border-gray-200 hover:shadow-lg"
          >
            <h3 className="mb-3 font-semibold">{faq.q}</h3>
            <p className="text-sm text-gray-500">{faq.a}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
