"use client";

import { motion } from "framer-motion";
import { Lock, Eye } from "lucide-react";

export const PrivacyHighlights = () => {
    return (
        <>
            {/* Key Privacy Highlight */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-linear-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 mb-12"
            >
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-500 text-white rounded-xl flex items-center justify-center shrink-0">
                        <Lock className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-green-800 mb-2">
                            Your Files Never Leave Your Device
                        </h3>
                        <p className="text-green-700">
                            All PDF processing happens directly in your browser. We never upload, store, or access your files. This is the core of our privacy-first approach.
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Google Data Usage Link - Required by AdSense */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-12"
            >
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-500 text-white rounded-xl flex items-center justify-center shrink-0">
                        <Eye className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-blue-800 mb-2">
                            How Google Uses Your Data
                        </h3>
                        <p className="text-blue-700 mb-3">
                            We use Google AdSense to display ads on our website. Google and its partners may use cookies to serve ads based on your prior visits to this or other websites.
                        </p>
                        <a
                            href="https://policies.google.com/technologies/partner-sites"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-blue-600 font-medium hover:underline"
                        >
                            Learn how Google uses data when you use our site →
                        </a>
                    </div>
                </div>
            </motion.div>
        </>
    );
};
