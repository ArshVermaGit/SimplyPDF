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
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white">
            <AnimatedBackground />
            
            <div className="relative z-10 max-w-lg mx-auto text-center px-6 py-12 bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-100 shadow-2xl">
                <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle className="w-10 h-10" />
                </div>
                
                <h2 className="text-3xl font-bold mb-3 text-gray-900">Something went wrong!</h2>
                <p className="text-gray-500 mb-8 text-lg">
                    We apologize for the inconvenience. An unexpected error has occurred.
                </p>
                
                <button
                    onClick={reset}
                    className="inline-flex items-center gap-2 bg-black text-white px-8 py-4 rounded-full font-medium hover:bg-gray-800 transition-all hover:scale-105"
                >
                    <RefreshCw className="w-5 h-5" />
                    Try Again
                </button>
            </div>
        </div>
    );
}
