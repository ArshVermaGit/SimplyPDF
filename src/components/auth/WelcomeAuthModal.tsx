"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { X, Sparkles, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";

export default function WelcomeAuthModal() {
  const [isOpen, setIsOpen] = useState(false);
  const { login, user, isLoading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || isLoading) return;

    // Check if user has visited before
    // Using session storage so it resets per session (better for testing/gatekeeping)
    const hasVisited = sessionStorage.getItem("simplypdf_welcome_session_v1");
    if (!hasVisited && !user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsOpen(true);
    }
  }, [user, isLoading, mounted]);

  // Scroll Locking Effect
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleDismiss = () => {
    setIsOpen(false);
    sessionStorage.setItem("simplypdf_welcome_session_v1", "true");
  };

  const handleLoginSuccess = (response: CredentialResponse) => {
    login(response);
    handleDismiss();
  };

  if (!mounted) return null;

  // If user is already logged in, don't show (unless we want to force it? adapting to "gatekeeper" logic usually implies for non-auth users)
  if (user) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Blocking Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-9999 bg-black/80 backdrop-blur-md transition-opacity"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 z-10000 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 px-4"
          >
            {/* Glassmorphism Card */}
            <div className="overflow-hidden rounded-3xl border border-white/40 bg-white/90 shadow-2xl ring-1 ring-black/5 backdrop-blur-xl">
              {/* Hero Header */}
              <div className="relative border-b border-gray-100 bg-linear-to-b from-gray-50 to-white p-8 text-center">
                <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-blue-500/10 blur-3xl" />
                <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-purple-500/10 blur-3xl" />

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="relative mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-gray-100 bg-white shadow-lg"
                >
                  <Sparkles className="h-8 w-8 text-black" />
                </motion.div>

                <h2 className="mb-2 text-2xl font-bold text-gray-900">
                  Welcome to SimplyPDF
                </h2>
                <p className="text-gray-500">
                  The Ultimate, Private PDF Toolkit
                </p>
              </div>

              {/* Content */}
              <div className="p-8">
                <div className="mb-8 flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-600">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-sm font-semibold text-gray-900">
                      100% Client-Side Privacy
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Your files never leave your device. We process everything
                      locally in your browser for maximum security.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex w-full justify-center">
                    <GoogleLogin
                      onSuccess={handleLoginSuccess}
                      onError={() => console.log("Login Failed")}
                      theme="filled_black"
                      size="large"
                      text="continue_with"
                      shape="pill"
                      width="100%"
                    />
                  </div>

                  <button
                    onClick={handleDismiss}
                    className="group flex w-full items-center justify-center gap-2 py-2.5 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
                  >
                    <X className="h-4 w-4 transition-transform group-hover:scale-110" />
                    Continue as Guest
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
