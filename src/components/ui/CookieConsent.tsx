"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, X, Info } from "lucide-react";
import Link from "next/link";

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem("cookie-consent", "declined");
    setIsVisible(false);
  };

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="pointer-events-none fixed right-0 bottom-0 left-0 z-9000 p-4 md:p-6">
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="pointer-events-auto container mx-auto max-w-4xl"
          >
            <div className="flex flex-col items-center gap-6 rounded-[32px] border border-white/20 bg-white/80 p-6 shadow-2xl backdrop-blur-2xl md:flex-row md:gap-8 md:p-8">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-black text-white shadow-lg shadow-black/10">
                <Cookie className="h-8 w-8" />
              </div>

              <div className="flex-1 text-center md:text-left">
                <h3 className="mb-2 text-xl font-bold text-gray-900">
                  We Use Cookies
                </h3>
                <p className="text-sm leading-relaxed font-medium text-gray-500">
                  We use cookies to enhance your experience, analyze site
                  traffic, and serve relevant content. By clicking
                  &quot;Accept&quot;, you agree to our use of cookies.
                </p>
              </div>

              <div className="flex w-full shrink-0 flex-col items-center gap-3 sm:flex-row md:w-auto">
                <Link
                  href="/cookie-policy"
                  className="group flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-400 transition-colors hover:text-black"
                >
                  <Info className="h-4 w-4 transition-transform group-hover:rotate-12" />
                  Learn More
                </Link>
                <button
                  onClick={handleDecline}
                  className="w-full rounded-2xl bg-gray-100 px-8 py-3 text-sm font-bold text-gray-600 transition-all hover:bg-gray-200 sm:w-auto"
                >
                  Decline
                </button>
                <button
                  onClick={handleAccept}
                  className="w-full rounded-2xl bg-black px-10 py-3 text-sm font-bold text-white shadow-xl shadow-black/10 transition-all hover:scale-105 active:scale-95 sm:w-auto"
                >
                  Accept All
                </button>
              </div>

              <button
                onClick={() => setIsVisible(false)}
                className="absolute top-4 right-4 p-2 text-gray-300 transition-colors hover:text-black"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
