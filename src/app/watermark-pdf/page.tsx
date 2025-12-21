"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, File, Download, Loader2, CheckCircle2, RefreshCw, AlertCircle, Stamp, Eye } from "lucide-react";
import { PDFDocument, rgb, StandardFonts, degrees } from "pdf-lib";
import { formatFileSize, uint8ArrayToBlob } from "@/lib/pdf-utils";
import { PDFPreviewModal } from "@/components/PDFPreviewModal";

export default function WatermarkPDFPage() {
    const [file, setFile] = useState<File | null>(null);
    const [watermarkText, setWatermarkText] = useState("CONFIDENTIAL");
    const [opacity, setOpacity] = useState(30);
    const [fontSize, setFontSize] = useState(48);
    const [status, setStatus] = useState<"idle" | "loading" | "ready" | "processing" | "success" | "error">("idle");
    const [resultBlob, setResultBlob] = useState<Blob | null>(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [dragActive, setDragActive] = useState(false);
    const [pages, setPages] = useState<string[]>([]);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewPage, setPreviewPage] = useState(0);

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile?.type === "application/pdf") {
            setFile(droppedFile);
            await loadPreview(droppedFile);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            await loadPreview(selectedFile);
        }
    };

    const loadPreview = async (pdfFile: File) => {
        setStatus("loading");
        try {
            const pdfjsLib = await import("pdfjs-dist");
            pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

            const arrayBuffer = await pdfFile.arrayBuffer();
            const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

            const pageImages: string[] = [];
            for (let i = 1; i <= Math.min(pdfDoc.numPages, 10); i++) {
                const page = await pdfDoc.getPage(i);
                const viewport = page.getViewport({ scale: 0.5 });
                const canvas = document.createElement("canvas");
                const context = canvas.getContext("2d")!;
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                await page.render({ canvasContext: context, viewport } as any).promise;
                pageImages.push(canvas.toDataURL("image/jpeg", 0.6));
            }

            setPages(pageImages);
            setStatus("ready");
        } catch (error) {
            console.error(error);
            setErrorMessage("Failed to load PDF preview.");
            setStatus("error");
        }
    };

    const handleWatermark = async () => {
        if (!file) return;
        setStatus("processing");
        setErrorMessage("");

        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await PDFDocument.load(arrayBuffer);
            const font = await pdf.embedFont(StandardFonts.HelveticaBold);
            const pagesArray = pdf.getPages();

            for (const page of pagesArray) {
                const { width, height } = page.getSize();
                const textWidth = font.widthOfTextAtSize(watermarkText, fontSize);

                page.drawText(watermarkText, {
                    x: (width - textWidth) / 2,
                    y: height / 2,
                    size: fontSize,
                    font,
                    color: rgb(0.5, 0.5, 0.5),
                    opacity: opacity / 100,
                    rotate: degrees(-45),
                });
            }

            const pdfBytes = await pdf.save();
            setResultBlob(uint8ArrayToBlob(pdfBytes));
            setStatus("success");
        } catch (error) {
            console.error(error);
            setErrorMessage("Failed to add watermark.");
            setStatus("error");
        }
    };

    const handleDownload = () => {
        if (!resultBlob) return;
        const url = URL.createObjectURL(resultBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `watermarked-${file?.name || "document.pdf"}`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const reset = () => {
        setFile(null);
        setStatus("idle");
        setPages([]);
        setResultBlob(null);
        setErrorMessage("");
    };

    return (
        <div className="min-h-[calc(100vh-80px)] pt-24 pb-16">
            <div className="container mx-auto px-4">
                <AnimatePresence mode="wait">
                    {status === "idle" && (
                        <motion.div
                            key="idle"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="max-w-4xl mx-auto"
                        >
                            <div className="text-center mb-12">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-2xl mb-6">
                                    <Stamp className="w-8 h-8" />
                                </div>
                                <h1 className="text-4xl md:text-5xl font-bold mb-4">Watermark PDF</h1>
                                <p className="text-gray-500 text-lg max-w-xl mx-auto">
                                    Add a text watermark to all pages with live preview.
                                </p>
                            </div>

                            <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-xl">
                                <div
                                    className={`relative flex flex-col items-center justify-center p-12 py-20 border-2 border-dashed rounded-2xl transition-all duration-300 cursor-pointer ${dragActive ? "border-black bg-gray-50" : "border-gray-200 hover:border-gray-400"
                                        }`}
                                    onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                                    onDragLeave={() => setDragActive(false)}
                                    onDrop={handleDrop}
                                    onClick={() => document.getElementById("file-input")?.click()}
                                >
                                    <input
                                        id="file-input"
                                        type="file"
                                        accept=".pdf"
                                        className="hidden"
                                        onChange={handleFileChange}
                                    />
                                    <Upload className="w-12 h-12 text-gray-400 mb-4" />
                                    <p className="text-lg font-medium mb-2">Drop your PDF here</p>
                                    <p className="text-gray-400 text-sm">or click to browse</p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {status === "loading" && (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center py-32 max-w-lg mx-auto text-center"
                        >
                            <div className="relative mb-8">
                                <div className="w-24 h-24 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
                                <Loader2 className="w-10 h-10 text-black absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">Loading PDF...</h2>
                            <p className="text-gray-500">Generating preview...</p>
                        </motion.div>
                    )}

                    {status === "ready" && (
                        <motion.div
                            key="ready"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="max-w-5xl mx-auto"
                        >
                            <div className="grid md:grid-cols-2 gap-8">
                                {/* Settings Panel */}
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <File className="w-8 h-8" />
                                            <div>
                                                <p className="font-semibold">{file?.name}</p>
                                                <p className="text-gray-500 text-sm">{pages.length} pages</p>
                                            </div>
                                        </div>
                                        <button onClick={reset} className="btn-outline py-2 px-4 text-sm">
                                            Cancel
                                        </button>
                                    </div>

                                    <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                        <h3 className="font-semibold mb-4">Watermark Settings</h3>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-2">Watermark Text</label>
                                                <input
                                                    type="text"
                                                    value={watermarkText}
                                                    onChange={(e) => setWatermarkText(e.target.value)}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-black"
                                                    placeholder="Enter watermark text"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-2">
                                                    Opacity: {opacity}%
                                                </label>
                                                <input
                                                    type="range"
                                                    min="10"
                                                    max="100"
                                                    value={opacity}
                                                    onChange={(e) => setOpacity(Number(e.target.value))}
                                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-2">
                                                    Font Size: {fontSize}px
                                                </label>
                                                <input
                                                    type="range"
                                                    min="24"
                                                    max="120"
                                                    value={fontSize}
                                                    onChange={(e) => setFontSize(Number(e.target.value))}
                                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <button onClick={handleWatermark} className="w-full btn-primary py-4 text-lg">
                                        <Stamp className="w-5 h-5 inline mr-2" />
                                        Apply Watermark
                                    </button>
                                </div>

                                {/* Preview Panel */}
                                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                    <h3 className="font-semibold mb-4">Preview</h3>

                                    {/* Main Preview with Watermark Overlay */}
                                    <div
                                        className="relative aspect-[3/4] bg-gray-50 rounded-xl overflow-hidden mb-4 cursor-pointer"
                                        onClick={() => setPreviewOpen(true)}
                                    >
                                        {pages[0] && (
                                            <>
                                                <img
                                                    src={pages[0]}
                                                    alt="Preview"
                                                    className="w-full h-full object-contain"
                                                />
                                                {/* Watermark overlay simulation */}
                                                <div
                                                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                                                    style={{
                                                        transform: "rotate(-45deg)",
                                                    }}
                                                >
                                                    <span
                                                        className="font-bold text-gray-500 whitespace-nowrap"
                                                        style={{
                                                            fontSize: `${fontSize * 0.4}px`,
                                                            opacity: opacity / 100,
                                                        }}
                                                    >
                                                        {watermarkText}
                                                    </span>
                                                </div>
                                            </>
                                        )}

                                        {/* Click to expand hint */}
                                        <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center">
                                            <div className="opacity-0 hover:opacity-100 transition-opacity bg-white p-2 rounded-full shadow-lg">
                                                <Eye className="w-5 h-5" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Page Thumbnails */}
                                    {pages.length > 1 && (
                                        <div className="flex gap-2 overflow-x-auto pb-2">
                                            {pages.map((img, index) => (
                                                <div
                                                    key={index}
                                                    onClick={() => { setPreviewPage(index); setPreviewOpen(true); }}
                                                    className={`relative flex-shrink-0 w-16 aspect-[3/4] rounded-lg border-2 overflow-hidden cursor-pointer hover:border-black transition-colors ${index === 0 ? "border-black" : "border-gray-200"
                                                        }`}
                                                >
                                                    <img src={img} alt={`Page ${index + 1}`} className="w-full h-full object-contain" />
                                                    <div className="absolute bottom-0.5 left-0.5 px-1 py-0.5 bg-black text-white text-xs font-bold rounded">
                                                        {index + 1}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {status === "processing" && (
                        <motion.div
                            key="processing"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center py-32 max-w-lg mx-auto text-center"
                        >
                            <div className="relative mb-8">
                                <div className="w-24 h-24 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
                                <Loader2 className="w-10 h-10 text-black absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">Adding watermark...</h2>
                            <p className="text-gray-500">This won&apos;t take long...</p>
                        </motion.div>
                    )}

                    {status === "success" && (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center justify-center py-24 max-w-lg mx-auto text-center"
                        >
                            <div className="w-20 h-20 bg-black text-white rounded-full flex items-center justify-center mb-8">
                                <CheckCircle2 className="w-10 h-10" />
                            </div>
                            <h2 className="text-3xl font-bold mb-2">Watermark Added!</h2>
                            <p className="text-gray-500 mb-10">&quot;{watermarkText}&quot; applied to all pages</p>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <button onClick={handleDownload} className="btn-primary py-4 px-10 flex items-center gap-2">
                                    <Download className="w-5 h-5" />
                                    Download PDF
                                </button>
                                <button onClick={reset} className="btn-outline py-4 px-10 flex items-center gap-2">
                                    <RefreshCw className="w-5 h-5" />
                                    Watermark Another
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {status === "error" && (
                        <motion.div
                            key="error"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center justify-center py-24 max-w-lg mx-auto text-center"
                        >
                            <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-8">
                                <AlertCircle className="w-10 h-10" />
                            </div>
                            <h2 className="text-3xl font-bold mb-2">Something went wrong</h2>
                            <p className="text-gray-500 mb-10">{errorMessage}</p>

                            <button onClick={reset} className="btn-primary py-4 px-10 flex items-center gap-2">
                                <RefreshCw className="w-5 h-5" />
                                Try Again
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Preview Modal */}
            <PDFPreviewModal
                isOpen={previewOpen}
                onClose={() => setPreviewOpen(false)}
                images={pages}
                currentPage={previewPage}
                onPageChange={setPreviewPage}
                title={file?.name || "PDF Preview"}
            />
        </div>
    );
}
