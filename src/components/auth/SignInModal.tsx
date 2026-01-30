"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { X, LogIn, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SignInModal({ isOpen, onClose }: SignInModalProps) {
  const { login } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

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

  const handleLoginSuccess = (response: CredentialResponse) => {
    login(response);
    onClose();
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Blocking Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-9999 cursor-pointer bg-black/80 backdrop-blur-md transition-opacity"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="pointer-events-none fixed top-1/2 left-1/2 z-10000 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 px-4"
          >
            {/* Glassmorphism Card */}
            <div className="pointer-events-auto overflow-hidden rounded-3xl border border-white/40 bg-white/90 shadow-2xl ring-1 ring-black/5 backdrop-blur-xl">
              {/* Hero Header */}
              <div className="relative border-b border-gray-100 bg-linear-to-b from-gray-50 to-white p-8 text-center">
                <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-blue-500/10 blur-3xl" />
                <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-purple-500/10 blur-3xl" />

                <div className="absolute top-4 right-4">
                  <button
                    onClick={onClose}
                    className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="relative mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-black text-white shadow-lg shadow-black/20"
                >
                  <LogIn className="h-8 w-8" />
                </motion.div>

                <h2 className="mb-2 text-2xl font-bold text-gray-900">
                  Welcome Back
                </h2>
                <p className="text-gray-500">
                  Sign in to access your dashboard
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
                      Secure & Private
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Your files are processed locally. Sync your preferences
                      and history securely.
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
                      text="signin_with"
                      shape="pill"
                      width="100%"
                    />
                  </div>
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
