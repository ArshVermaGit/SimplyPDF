"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import { useState, useEffect } from "react";

interface PDFPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    images: string[];
    currentPage: number;
    onPageChange?: (page: number) => void;
    title?: string;
}

export function PDFPreviewModal({
    isOpen,
    onClose,
    images,
    currentPage,
    onPageChange,
    title = "PDF Preview",
}: PDFPreviewModalProps) {
    const [page, setPage] = useState(currentPage);
    const [zoom, setZoom] = useState(1);

    useEffect(() => {
        setPage(currentPage);
    }, [currentPage]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;
            if (e.key === "Escape") onClose();
            if (e.key === "ArrowLeft") handlePrev();
            if (e.key === "ArrowRight") handleNext();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, page, images.length]);

    const handlePrev = () => {
        const newPage = Math.max(0, page - 1);
        setPage(newPage);
        onPageChange?.(newPage);
    };

    const handleNext = () => {
        const newPage = Math.min(images.length - 1, page + 1);
        setPage(newPage);
        onPageChange?.(newPage);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center"
                onClick={onClose}
            >
                {/* Backdrop */}
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

                {/* Modal Content */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="relative z-10 max-w-5xl w-full mx-4 max-h-[90vh] flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between bg-white rounded-t-2xl px-6 py-4 border-b">
                        <h3 className="font-semibold text-lg">{title}</h3>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-500">
                                Page {page + 1} of {images.length}
                            </span>
                            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                                <button
                                    onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
                                    className="p-2 hover:bg-white rounded-lg transition-colors"
                                    disabled={zoom <= 0.5}
                                >
                                    <ZoomOut className="w-4 h-4" />
                                </button>
                                <span className="text-sm font-medium px-2">{Math.round(zoom * 100)}%</span>
                                <button
                                    onClick={() => setZoom(Math.min(2, zoom + 0.25))}
                                    className="p-2 hover:bg-white rounded-lg transition-colors"
                                    disabled={zoom >= 2}
                                >
                                    <ZoomIn className="w-4 h-4" />
                                </button>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Image Container */}
                    <div className="flex-1 bg-gray-50 overflow-auto p-6 flex items-center justify-center rounded-b-2xl">
                        {images[page] && (
                            <img
                                src={images[page]}
                                alt={`Page ${page + 1}`}
                                className="max-w-full max-h-full object-contain shadow-2xl rounded-lg transition-transform duration-300"
                                style={{ transform: `scale(${zoom})` }}
                            />
                        )}
                    </div>

                    {/* Navigation */}
                    {images.length > 1 && (
                        <>
                            <button
                                onClick={handlePrev}
                                disabled={page === 0}
                                className="absolute left-8 top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            <button
                                onClick={handleNext}
                                disabled={page >= images.length - 1}
                                className="absolute right-8 top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        </>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
