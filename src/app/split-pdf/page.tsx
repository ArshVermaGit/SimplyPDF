"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, File, X, Download, Loader2, CheckCircle2, RefreshCw, AlertCircle, Scissors, Eye, Check } from "lucide-react";
import { splitPDF, downloadAsZip, formatFileSize } from "@/lib/pdf-utils";
import { PDFPreviewModal } from "@/components/PDFPreviewModal";

type SplitMode = "all" | "range" | "select";

interface PageInfo {
    pageNumber: number;
    image: string;
    selected: boolean;
}

export default function SplitPDFPage() {
    const [file, setFile] = useState<File | null>(null);
    const [mode, setMode] = useState<SplitMode>("all");
    const [ranges, setRanges] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "ready" | "processing" | "success" | "error">("idle");
    const [results, setResults] = useState<{ name: string; data: Uint8Array }[]>([]);
    const [errorMessage, setErrorMessage] = useState("");
    const [dragActive, setDragActive] = useState(false);
    const [pages, setPages] = useState<PageInfo[]>([]);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewPage, setPreviewPage] = useState(0);

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile?.type === "application/pdf") {
            setFile(droppedFile);
            await loadPages(droppedFile);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            await loadPages(selectedFile);
        }
    };

    const loadPages = async (pdfFile: File) => {
        setStatus("loading");
        try {
            const pdfjsLib = await import("pdfjs-dist");
            pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

            const arrayBuffer = await pdfFile.arrayBuffer();
            const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            const numPages = pdfDoc.numPages;

            const pageInfos: PageInfo[] = [];
            for (let i = 1; i <= numPages; i++) {
                const page = await pdfDoc.getPage(i);
                const viewport = page.getViewport({ scale: 0.4 });
                const canvas = document.createElement("canvas");
                const context = canvas.getContext("2d")!;
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                await page.render({ canvasContext: context, viewport } as any).promise;

                pageInfos.push({
                    pageNumber: i,
                    image: canvas.toDataURL("image/jpeg", 0.6),
                    selected: true,
                });
            }

            setPages(pageInfos);
            setStatus("ready");
        } catch (error) {
            console.error(error);
            setErrorMessage("Failed to load PDF pages.");
            setStatus("error");
        }
    };

    const togglePage = (pageNumber: number) => {
        setPages(pages.map(p =>
            p.pageNumber === pageNumber ? { ...p, selected: !p.selected } : p
        ));
    };

    const selectAll = () => setPages(pages.map(p => ({ ...p, selected: true })));
    const deselectAll = () => setPages(pages.map(p => ({ ...p, selected: false })));

    const handleSplit = async () => {
        if (!file) return;
        setStatus("processing");
        setErrorMessage("");

        try {
            let splitFiles;
            if (mode === "select") {
                // Build ranges from selected pages
                const selectedRanges = pages
                    .filter(p => p.selected)
                    .map(p => p.pageNumber.toString())
                    .join(",");
                splitFiles = await splitPDF(file, "range", selectedRanges);
            } else {
                splitFiles = await splitPDF(file, mode, ranges);
            }
            setResults(splitFiles);
            setStatus("success");
        } catch (error) {
            console.error(error);
            setErrorMessage(error instanceof Error ? error.message : "Failed to split PDF");
            setStatus("error");
        }
    };

    const handleDownloadAll = async () => {
        if (results.length === 0) return;
        await downloadAsZip(results, "split-pdfs.zip");
    };

    const handleDownloadSingle = (result: { name: string; data: Uint8Array }) => {
        const blob = new Blob([result.data.slice().buffer], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = result.name;
        link.click();
        URL.revokeObjectURL(url);
    };

    const reset = () => {
        setFile(null);
        setMode("all");
        setRanges("");
        setStatus("idle");
        setResults([]);
        setPages([]);
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
                                    <Scissors className="w-8 h-8" />
                                </div>
                                <h1 className="text-4xl md:text-5xl font-bold mb-4">Split PDF</h1>
                                <p className="text-gray-500 text-lg max-w-xl mx-auto">
                                    Extract pages from your PDF with visual selection.
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
                            <p className="text-gray-500">Generating page previews...</p>
                        </motion.div>
                    )}

                    {status === "ready" && (
                        <motion.div
                            key="ready"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="max-w-6xl mx-auto"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <File className="w-8 h-8" />
                                    <div>
                                        <p className="font-semibold text-lg">{file?.name}</p>
                                        <p className="text-gray-500">{pages.length} pages</p>
                                    </div>
                                </div>
                                <button onClick={reset} className="btn-outline py-2 px-4 text-sm">
                                    Cancel
                                </button>
                            </div>

                            {/* Split Mode Selection */}
                            <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
                                <h3 className="font-semibold mb-4">Split Mode</h3>
                                <div className="flex flex-wrap gap-3">
                                    {[
                                        { value: "all", label: "Extract All Pages", desc: "Split into individual pages" },
                                        { value: "select", label: "Select Pages", desc: "Choose specific pages" },
                                        { value: "range", label: "Page Ranges", desc: "e.g., 1-3, 5, 7-9" },
                                    ].map((option) => (
                                        <button
                                            key={option.value}
                                            onClick={() => setMode(option.value as SplitMode)}
                                            className={`flex-1 min-w-48 p-4 rounded-xl border-2 text-left transition-all ${mode === option.value
                                                    ? "border-black bg-gray-50"
                                                    : "border-gray-200 hover:border-gray-400"
                                                }`}
                                        >
                                            <p className="font-medium">{option.label}</p>
                                            <p className="text-sm text-gray-500">{option.desc}</p>
                                        </button>
                                    ))}
                                </div>

                                {mode === "range" && (
                                    <div className="mt-4">
                                        <input
                                            type="text"
                                            value={ranges}
                                            onChange={(e) => setRanges(e.target.value)}
                                            placeholder="e.g., 1-3, 5, 7-9"
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-black"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Page Selection Grid */}
                            {mode === "select" && (
                                <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-semibold">Select Pages ({pages.filter(p => p.selected).length} selected)</h3>
                                        <div className="flex gap-2">
                                            <button onClick={selectAll} className="text-sm px-3 py-1 bg-gray-100 rounded-lg hover:bg-gray-200">
                                                Select All
                                            </button>
                                            <button onClick={deselectAll} className="text-sm px-3 py-1 bg-gray-100 rounded-lg hover:bg-gray-200">
                                                Deselect All
                                            </button>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                                        {pages.map((page, index) => (
                                            <motion.div
                                                key={page.pageNumber}
                                                layout
                                                whileHover={{ y: -2 }}
                                                className="relative group cursor-pointer"
                                            >
                                                <div
                                                    className={`relative overflow-hidden rounded-lg border-2 transition-all ${page.selected ? "border-black" : "border-gray-200 opacity-50"
                                                        }`}
                                                >
                                                    <div
                                                        className="aspect-[3/4] bg-white"
                                                        onClick={() => { setPreviewPage(index); setPreviewOpen(true); }}
                                                    >
                                                        <img src={page.image} alt={`Page ${page.pageNumber}`} className="w-full h-full object-contain" />
                                                    </div>

                                                    {/* Hover overlay */}
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center pointer-events-none">
                                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Eye className="w-5 h-5 text-white" />
                                                        </div>
                                                    </div>

                                                    <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black text-white text-xs font-bold rounded">
                                                        {page.pageNumber}
                                                    </div>

                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); togglePage(page.pageNumber); }}
                                                        className={`absolute top-1 right-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${page.selected ? "bg-black border-black text-white" : "bg-white border-gray-300"
                                                            }`}
                                                    >
                                                        {page.selected && <Check className="w-3 h-3" />}
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Action Button */}
                            <div className="flex justify-center">
                                <button
                                    onClick={handleSplit}
                                    disabled={mode === "select" && pages.filter(p => p.selected).length === 0}
                                    className="btn-primary py-4 px-12 text-lg disabled:opacity-50"
                                >
                                    <Scissors className="w-5 h-5 inline mr-2" />
                                    Split PDF
                                </button>
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
                            <h2 className="text-2xl font-bold mb-2">Splitting PDF...</h2>
                            <p className="text-gray-500">This won&apos;t take long...</p>
                        </motion.div>
                    )}

                    {status === "success" && (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="max-w-4xl mx-auto"
                        >
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle2 className="w-8 h-8" />
                                </div>
                                <h2 className="text-3xl font-bold mb-2">PDF Split Successfully!</h2>
                                <p className="text-gray-500">Created {results.length} files</p>
                            </div>

                            <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
                                <div className="space-y-2 max-h-80 overflow-y-auto">
                                    {results.map((result, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <File className="w-5 h-5 text-gray-400" />
                                                <span className="font-medium">{result.name}</span>
                                            </div>
                                            <button
                                                onClick={() => handleDownloadSingle(result)}
                                                className="text-sm px-3 py-1 bg-black text-white rounded-lg hover:bg-gray-800"
                                            >
                                                Download
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <button onClick={handleDownloadAll} className="btn-primary py-4 px-10 flex items-center gap-2 justify-center">
                                    <Download className="w-5 h-5" />
                                    Download All (ZIP)
                                </button>
                                <button onClick={reset} className="btn-outline py-4 px-10 flex items-center gap-2 justify-center">
                                    <RefreshCw className="w-5 h-5" />
                                    Split Another
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
                images={pages.map(p => p.image)}
                currentPage={previewPage}
                onPageChange={setPreviewPage}
                title={file?.name || "PDF Preview"}
            />
        </div>
    );
}
