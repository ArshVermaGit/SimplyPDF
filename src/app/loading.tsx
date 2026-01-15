import { Loader2 } from "lucide-react";

export default function Loading() {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-xs">
            <div className="flex flex-col items-center">
                <Loader2 className="w-12 h-12 text-black animate-spin mb-4" />
                <p className="text-gray-500 font-medium animate-pulse">Loading SimplyPDF...</p>
            </div>
        </div>
    );
}
