"use client";

import { motion } from "framer-motion";

export const TermsSummary = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="mb-12 rounded-2xl border border-blue-200 bg-blue-50 p-6"
    >
      <h3 className="mb-3 text-lg font-bold text-blue-800">Quick Summary</h3>
      <ul className="space-y-2 text-blue-700">
        <li>• SimplyPDF is a free service for PDF manipulation</li>
        <li>
          • All processing happens in your browser - we never access your files
        </li>
        <li>
          • You&apos;re responsible for having rights to the documents you
          process
        </li>
        <li>• The service is provided as-is without warranties</li>
        <li>• Always keep backups of your original files</li>
      </ul>
    </motion.div>
  );
};
