"use client";

import Link from "next/link";
import { Home } from "lucide-react";
import {
  AnimatedBackground,
  FloatingDecorations,
} from "@/components/ui/ToolPageElements";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
      <AnimatedBackground />
      <FloatingDecorations />

      <div className="relative z-10 px-4 text-center">
        <h1 className="bg-linear-to-b from-gray-900 to-gray-600 bg-clip-text text-9xl font-bold text-transparent">
          404
        </h1>
        <h2 className="mb-6 text-3xl font-semibold text-gray-800">
          Page Not Found
        </h2>
        <p className="mx-auto mb-10 max-w-md text-lg text-gray-500">
          The page you are looking for doesn&apos;t exist or has been moved.
        </p>

        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full bg-black px-8 py-4 font-medium text-white transition-all hover:scale-105 hover:bg-gray-800"
        >
          <Home className="h-5 w-5" />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
