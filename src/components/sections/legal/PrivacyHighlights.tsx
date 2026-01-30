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
        className="mb-12 rounded-2xl border border-green-200 bg-linear-to-r from-green-50 to-emerald-50 p-6"
      >
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-500 text-white">
            <Lock className="h-6 w-6" />
          </div>
          <div>
            <h3 className="mb-2 text-lg font-bold text-green-800">
              Your Files Never Leave Your Device
            </h3>
            <p className="text-green-700">
              All PDF processing happens directly in your browser. We never
              upload, store, or access your files. This is the core of our
              privacy-first approach.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Google Data Usage Link - Required by AdSense */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mb-12 rounded-2xl border border-blue-200 bg-blue-50 p-6"
      >
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-500 text-white">
            <Eye className="h-6 w-6" />
          </div>
          <div>
            <h3 className="mb-2 text-lg font-bold text-blue-800">
              How Google Uses Your Data
            </h3>
            <p className="mb-3 text-blue-700">
              We use Google AdSense to display ads on our website. Google and
              its partners may use cookies to serve ads based on your prior
              visits to this or other websites.
            </p>
            <a
              href="https://policies.google.com/technologies/partner-sites"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-medium text-blue-600 hover:underline"
            >
              Learn how Google uses data when you use our site →
            </a>
          </div>
        </div>
      </motion.div>
    </>
  );
};
