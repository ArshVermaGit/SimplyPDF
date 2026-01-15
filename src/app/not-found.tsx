"use client";

import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";
import { AnimatedBackground, FloatingDecorations } from "@/components/ToolPageElements";

export default function NotFound() {
    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
            <AnimatedBackground />
            <FloatingDecorations />
            
            <div className="relative z-10 text-center px-4">
                <h1 className="text-9xl font-bold bg-clip-text text-transparent bg-linear-to-b from-gray-900 to-gray-600">404</h1>
                <h2 className="text-3xl font-semibold mb-6 text-gray-800">Page Not Found</h2>
                <p className="text-gray-500 max-w-md mx-auto mb-10 text-lg">
                    The page you are looking for doesn't exist or has been moved.
                </p>
                
                <Link 
                    href="/"
                    className="inline-flex items-center gap-2 bg-black text-white px-8 py-4 rounded-full font-medium hover:bg-gray-800 transition-all hover:scale-105"
                >
                    <Home className="w-5 h-5" />
                    Back to Home
                </Link>
            </div>
        </div>
    );
}
