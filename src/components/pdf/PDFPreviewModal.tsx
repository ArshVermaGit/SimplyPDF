"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Download,
} from "lucide-react";
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
        activeThumb.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
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
        <div className="pointer-events-none absolute top-0 right-0 left-0 z-20 flex items-center justify-between bg-linear-to-b from-black/60 to-transparent p-4 md:p-6">
          <div className="pointer-events-auto flex items-center gap-4">
            <button
              onClick={onClose}
              className="rounded-full border border-white/10 bg-white/10 p-3 text-white backdrop-blur-md transition-all hover:bg-white/20"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="hidden sm:block">
              <h3 className="text-lg font-bold text-white">{title}</h3>
              <p className="text-xs text-white/50">
                Page {page + 1} of {images.length}
              </p>
            </div>
          </div>

          <div className="pointer-events-auto flex items-center gap-3">
            <div className="flex items-center rounded-full border border-white/10 bg-white/10 p-1 px-3 backdrop-blur-md">
              <button
                onClick={() => setZoom(Math.max(0.25, zoom - 0.25))}
                className="p-2 text-white/70 hover:text-white"
                disabled={zoom <= 0.25}
              >
                <ZoomOut className="h-5 w-5" />
              </button>
              <span className="min-w-[45px] text-center text-xs font-bold text-white">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={() => setZoom(Math.min(3, zoom + 0.25))}
                className="p-2 text-white/70 hover:text-white"
                disabled={zoom >= 3}
              >
                <ZoomIn className="h-5 w-5" />
              </button>
            </div>

            {onDownload && (
              <button
                onClick={onDownload}
                className="hidden items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-black shadow-xl transition-all hover:bg-gray-200 sm:flex"
              >
                <Download className="h-4 w-4" />
                Download Result
              </button>
            )}
          </div>
        </div>

        {/* Main Viewport */}
        <div className="relative flex flex-1 items-center justify-center overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={page}
              initial={{ opacity: 0, scale: 0.9, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 1.1, x: -20 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative flex h-full w-full items-center justify-center p-8 md:p-16 lg:p-24"
            >
              {images[page] && (
                <div
                  className="relative h-full w-full transition-all duration-500"
                  style={{
                    transform: `scale(${zoom}) rotate(${rotation}deg)`,
                    transformOrigin: "center",
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
                      className="pointer-events-none absolute inset-0 flex items-center justify-center"
                      style={{ transform: "rotate(-45deg)" }}
                    >
                      <span
                        className="font-bold whitespace-nowrap text-gray-500/50 select-none"
                        style={{
                          fontSize: `${watermark.fontSize}px`,
                          opacity: watermark.opacity / 100,
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
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                disabled={page === 0}
                className="group absolute top-1/2 left-6 -translate-y-1/2 rounded-full border border-white/5 bg-white/5 p-4 text-white backdrop-blur-md transition-all hover:bg-white/10 disabled:opacity-0"
              >
                <ChevronLeft className="h-8 w-8 transition-transform group-hover:-translate-x-1" />
              </motion.button>
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                disabled={page >= images.length - 1}
                className="group absolute top-1/2 right-6 -translate-y-1/2 rounded-full border border-white/5 bg-white/5 p-4 text-white backdrop-blur-md transition-all hover:bg-white/10 disabled:opacity-0"
              >
                <ChevronRight className="h-8 w-8 transition-transform group-hover:translate-x-1" />
              </motion.button>
            </>
          )}
        </div>

        {/* Bottom Thumbnail Strip */}
        <div className="relative z-20 overflow-hidden border-t border-white/10 bg-black/80 p-4 backdrop-blur-md">
          <div
            ref={thumbnailRef}
            className="scrollbar-hide flex snap-x justify-center gap-3 overflow-x-auto px-4 pb-2"
          >
            {images.map((img, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setPage(i);
                  onPageChange?.(i);
                }}
                className={`relative aspect-3/4 w-16 shrink-0 snap-center overflow-hidden rounded-lg border-2 p-0.5 transition-all md:w-20 ${
                  i === page
                    ? "border-white"
                    : "border-white/10 opacity-50 hover:opacity-100"
                }`}
              >
                <Image
                  src={img}
                  alt={`Page ${i + 1}`}
                  fill
                  className="rounded-md object-cover"
                  unoptimized
                />
                <div className="absolute inset-0 bg-black/20" />
                <span className="absolute right-1 bottom-1 rounded bg-black/60 px-1 text-[10px] font-bold text-white">
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
