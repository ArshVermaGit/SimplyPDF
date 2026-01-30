"use client";

import { motion } from "framer-motion";
import { Eye, Trash2, GripVertical, Check } from "lucide-react";
import Image from "next/image";

interface PDFPageThumbnailProps {
  image: string;
  pageNumber: number;
  isSelected?: boolean;
  showDragHandle?: boolean;
  showDelete?: boolean;
  showSelect?: boolean;
  showPreviewButton?: boolean;
  onSelect?: () => void;
  onDelete?: () => void;
  onPreview?: () => void;
  className?: string;
}

export function PDFPageThumbnail({
  image,
  pageNumber,
  isSelected = true,
  showDragHandle = false,
  showDelete = false,
  showSelect = false,
  showPreviewButton = true,
  onSelect,
  onDelete,
  onPreview,
  className = "",
}: PDFPageThumbnailProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -4 }}
      className={`group relative ${className}`}
    >
      {/* Thumbnail Container */}
      <div
        className={`relative cursor-pointer overflow-hidden rounded-xl border-2 transition-all ${
          isSelected ? "border-black shadow-lg" : "border-gray-200 opacity-60"
        }`}
        onClick={onPreview}
      >
        {/* Drag Handle */}
        {showDragHandle && (
          <div className="absolute top-2 left-2 z-10 cursor-grab active:cursor-grabbing">
            <div className="rounded-lg bg-white/90 p-1.5 opacity-0 shadow-sm backdrop-blur-sm transition-opacity group-hover:opacity-100">
              <GripVertical className="h-4 w-4 text-gray-500" />
            </div>
          </div>
        )}

        {/* Page Image */}
        <div className="relative aspect-3/4 bg-white">
          <Image
            src={image}
            alt={`Page ${pageNumber}`}
            fill
            className="object-contain"
            unoptimized
          />
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/30">
          {showPreviewButton && (
            <div className="opacity-0 transition-opacity group-hover:opacity-100">
              <div className="rounded-full bg-white p-3 shadow-xl">
                <Eye className="h-5 w-5" />
              </div>
            </div>
          )}
        </div>

        {/* Page Number Badge */}
        <div className="absolute bottom-2 left-2 rounded bg-black px-2 py-1 text-xs font-bold text-white">
          {pageNumber}
        </div>

        {/* Selection Indicator */}
        {showSelect && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect?.();
            }}
            className={`absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all ${
              isSelected
                ? "border-black bg-black text-white"
                : "border-gray-300 bg-white hover:border-black"
            }`}
          >
            {isSelected && <Check className="h-3 w-3" />}
          </button>
        )}

        {/* Delete Button */}
        {showDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.();
            }}
            className="absolute top-2 right-2 rounded-lg bg-red-500 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
}
