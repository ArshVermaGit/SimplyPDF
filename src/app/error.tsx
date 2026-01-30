"use client";

import { useEffect } from "react";
import { RefreshCw, AlertTriangle } from "lucide-react";
import { AnimatedBackground } from "@/components/ui/ToolPageElements";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white">
      <AnimatedBackground />

      <div className="relative z-10 mx-auto max-w-lg rounded-3xl border border-gray-100 bg-white/80 px-6 py-12 text-center shadow-2xl backdrop-blur-xl">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-red-500">
          <AlertTriangle className="h-10 w-10" />
        </div>

        <h2 className="mb-3 text-3xl font-bold text-gray-900">
          Something went wrong!
        </h2>
        <p className="mb-8 text-lg text-gray-500">
          We apologize for the inconvenience. An unexpected error has occurred.
        </p>

        <button
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-full bg-black px-8 py-4 font-medium text-white transition-all hover:scale-105 hover:bg-gray-800"
        >
          <RefreshCw className="h-5 w-5" />
          Try Again
        </button>
      </div>
    </div>
  );
}
