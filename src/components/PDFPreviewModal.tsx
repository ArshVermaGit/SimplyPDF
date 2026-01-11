"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download } from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";

interface PDFPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    images: string[];
    currentPage: number;
    onPageChange?: (page: number) => void;
    title?: string;
    rotation?: number;
    watermark?: {
        text: string;
        opacity: number;
        fontSize: number;
    };
    onDownload?: () => void;
}

export function PDFPreviewModal({
    isOpen,
    onClose,
    images,
    currentPage,
    onPageChange,
    title = "PDF Preview",
    rotation = 0,
    watermark,
    onDownload,
}: PDFPreviewModalProps) {
    const [page, setPage] = useState(currentPage);
    const [zoom, setZoom] = useState(1);
    const thumbnailRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setPage(currentPage);
    }, [currentPage]);

    // Scroll active thumbnail into view
    useEffect(() => {
        if (thumbnailRef.current) {
            const activeThumb = thumbnailRef.current.children[page] as HTMLElement;
            if (activeThumb) {
                activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
        }
    }, [page]);

    const handlePrev = useCallback(() => {
        const newPage = Math.max(0, page - 1);
        setPage(newPage);
        onPageChange?.(newPage);
    }, [page, onPageChange]);

    const handleNext = useCallback(() => {
        const newPage = Math.min(images.length - 1, page + 1);
        setPage(newPage);
        onPageChange?.(newPage);
    }, [images.length, page, onPageChange]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;
            if (e.key === "Escape") onClose();
            if (e.key === "ArrowLeft") handlePrev();
            if (e.key === "ArrowRight") handleNext();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose, handlePrev, handleNext]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-100 flex flex-col bg-black/95 backdrop-blur-xl"
            >
                {/* Header Overlay */}
                <div className="absolute top-0 left-0 right-0 z-20 p-4 md:p-6 flex items-center justify-between bg-linear-to-b from-black/60 to-transparent pointer-events-none">
                    <div className="flex items-center gap-4 pointer-events-auto">
                        <button
                            onClick={onClose}
                            className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all backdrop-blur-md border border-white/10"
                        >
                            <X className="w-6 h-6" />
                        </button>
                        <div className="hidden sm:block">
                            <h3 className="text-white font-bold text-lg">{title}</h3>
                            <p className="text-white/50 text-xs">Page {page + 1} of {images.length}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 pointer-events-auto">
                        <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-full flex items-center p-1 px-3">
                            <button
                                onClick={() => setZoom(Math.max(0.25, zoom - 0.25))}
                                className="p-2 text-white/70 hover:text-white"
                                disabled={zoom <= 0.25}
                            >
                                <ZoomOut className="w-5 h-5" />
                            </button>
                            <span className="text-xs font-bold text-white min-w-[45px] text-center">
                                {Math.round(zoom * 100)}%
                            </span>
                            <button
                                onClick={() => setZoom(Math.min(3, zoom + 0.25))}
                                className="p-2 text-white/70 hover:text-white"
                                disabled={zoom >= 3}
                            >
                                <ZoomIn className="w-5 h-5" />
                            </button>
                        </div>
                        
                        {onDownload && (
                            <button
                                onClick={onDownload}
                                className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-all text-sm shadow-xl"
                            >
                                <Download className="w-4 h-4" />
                                Download Result
                            </button>
                        )}
                    </div>
                </div>

                {/* Main Viewport */}
                <div className="flex-1 relative flex items-center justify-center overflow-hidden">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={page}
                            initial={{ opacity: 0, scale: 0.9, x: 20 }}
                            animate={{ opacity: 1, scale: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 1.1, x: -20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="relative w-full h-full flex items-center justify-center p-8 md:p-16 lg:p-24"
                        >
                            {images[page] && (
                                <div 
                                    className="relative w-full h-full transition-all duration-500"
                                    style={{ 
                                        transform: `scale(${zoom}) rotate(${rotation}deg)`,
                                        transformOrigin: 'center'
                                    }}
                                >
                                    <Image
                                        src={images[page]}
                                        alt={`Page ${page + 1}`}
                                        fill
                                        className="object-contain drop-shadow-[0_0_50px_rgba(255,255,255,0.1)]"
                                        unoptimized
                                        priority
                                    />
                                    
                                    {/* Watermark Overlay in Preview */}
                                    {watermark && (
                                        <div 
                                            className="absolute inset-0 flex items-center justify-center pointer-events-none"
                                            style={{ transform: "rotate(-45deg)" }}
                                        >
                                            <span 
                                                className="font-bold text-gray-500/50 whitespace-nowrap select-none"
                                                style={{ 
                                                    fontSize: `${watermark.fontSize}px`,
                                                    opacity: watermark.opacity / 100
                                                }}
                                            >
                                                {watermark.text}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation Arrows */}
                    {images.length > 1 && (
                        <>
                            <motion.button
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                                disabled={page === 0}
                                className="absolute left-6 top-1/2 -translate-y-1/2 p-4 bg-white/5 hover:bg-white/10 text-white rounded-full backdrop-blur-md border border-white/5 transition-all group disabled:opacity-0"
                            >
                                <ChevronLeft className="w-8 h-8 group-hover:-translate-x-1 transition-transform" />
                            </motion.button>
                            <motion.button
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                onClick={(e) => { e.stopPropagation(); handleNext(); }}
                                disabled={page >= images.length - 1}
                                className="absolute right-6 top-1/2 -translate-y-1/2 p-4 bg-white/5 hover:bg-white/10 text-white rounded-full backdrop-blur-md border border-white/5 transition-all group disabled:opacity-0"
                            >
                                <ChevronRight className="w-8 h-8 group-hover:translate-x-1 transition-transform" />
                            </motion.button>
                        </>
                    )}
                </div>

                {/* Bottom Thumbnail Strip */}
                <div className="bg-black/80 backdrop-blur-md border-t border-white/10 p-4 relative z-20 overflow-hidden">
                    <div 
                        ref={thumbnailRef}
                        className="flex gap-3 overflow-x-auto pb-2 px-4 scrollbar-hide snap-x justify-center"
                    >
                        {images.map((img, i) => (
                            <motion.button
                                key={i}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => { setPage(i); onPageChange?.(i); }}
                                className={`relative shrink-0 w-16 md:w-20 aspect-3/4 rounded-lg border-2 transition-all p-0.5 overflow-hidden snap-center ${
                                    i === page ? "border-white" : "border-white/10 opacity-50 hover:opacity-100"
                                }`}
                            >
                                <Image
                                    src={img}
                                    alt={`Page ${i + 1}`}
                                    fill
                                    className="object-cover rounded-md"
                                    unoptimized
                                />
                                <div className="absolute inset-0 bg-black/20" />
                                <span className="absolute bottom-1 right-1 text-[10px] font-bold text-white bg-black/60 px-1 rounded">
                                    {i + 1}
                                </span>
                            </motion.button>
                        ))}
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
