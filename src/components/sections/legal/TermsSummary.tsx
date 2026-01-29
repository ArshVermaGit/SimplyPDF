"use client";

import { motion } from "framer-motion";

export const TermsSummary = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-12"
        >
            <h3 className="font-bold text-lg text-blue-800 mb-3">Quick Summary</h3>
            <ul className="space-y-2 text-blue-700">
                <li>• SimplyPDF is a free service for PDF manipulation</li>
                <li>• All processing happens in your browser - we never access your files</li>
                <li>• You&apos;re responsible for having rights to the documents you process</li>
                <li>• The service is provided as-is without warranties</li>
                <li>• Always keep backups of your original files</li>
            </ul>
        </motion.div>
    );
};
