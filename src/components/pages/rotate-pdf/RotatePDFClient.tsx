"use client";

export const dynamic = "force-dynamic";

import { PageInfo } from "@/types";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Upload, File as FileIcon, Download, CheckCircle2, RefreshCw, 
    AlertCircle, RotateCw, ArrowRight
} from "lucide-react";
import Image from "next/image";
import { rotatePDF, uint8ArrayToBlob } from "@/lib/pdf-utils";
import { PDFPreviewModal } from "@/components/pdf/PDFPreviewModal";
import {
    AnimatedBackground,
    FloatingDecorations,
    ToolHeader,
    ToolCard,
    ProcessingState
} from "@/components/ui/ToolPageElements";
import { EducationalContent } from "@/components/layout/EducationalContent";
import { useHistory } from "@/context/HistoryContext";


export function RotatePDFClient() {
    const { addToHistory } = useHistory();
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<"idle" | "loading" | "ready" | "processing" | "success" | "error">("idle");
    const [resultBlob, setResultBlob] = useState<Blob | null>(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [dragActive, setDragActive] = useState(false);
    const [pages, setPages] = useState<PageInfo[]>([]);
    const [globalRotation, setGlobalRotation] = useState<0 | 90 | 180 | 270>(0);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewPage, setPreviewPage] = useState(0);
    const [customFileName, setCustomFileName] = useState("rotated.pdf");

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
        setErrorMessage("");
        try {
            const pdfjsLib = await import("pdfjs-dist");
            const workerUrl = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
            pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

            const arrayBuffer = await pdfFile.arrayBuffer();
            const loadingTask = pdfjsLib.getDocument({
                data: new Uint8Array(arrayBuffer),
                useWorkerFetch: true,
                isEvalSupported: false
            });

            const pdfDoc = await loadingTask.promise;
            const numPages = pdfDoc.numPages;

            const pageInfos: PageInfo[] = [];
            for (let i = 1; i <= numPages; i++) {
                const page = await pdfDoc.getPage(i);
                const viewport = page.getViewport({ scale: 0.4 });
                const canvas = document.createElement("canvas");
                const context = canvas.getContext("2d")!;
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                await page.render({ canvasContext: context, viewport }).promise;

                pageInfos.push({
                    pageNumber: i,
                    image: canvas.toDataURL("image/jpeg", 0.7),
                    rotation: 0,
                    selected: true,
                });

                (page as { cleanup?: () => void }).cleanup?.();
            }

            setPages(pageInfos);
            setCustomFileName(`rotated_${pdfFile.name}`);
            setStatus("ready");
            await pdfDoc.destroy();
        } catch (error: unknown) {
            const err = error as Error;
            console.error("PDF loading error:", err);
            setErrorMessage(`Failed to load PDF pages: ${err.message || "Unknown error"}`);
            setStatus("error");
        }
    };

    const handleRotateIndividual = (index: number, delta: number) => {
        setPages(prev => prev.map((p, i) => {
            if (i === index) {
                const newRotation = (((p.rotation ?? 0) + delta) % 360 + 360) % 360;
                return { ...p, rotation: newRotation as 0 | 90 | 180 | 270 };
            }
            return p;
        }));
    };

    const handleRotate = async () => {
        if (!file) return;
        setStatus("processing");
        setErrorMessage("");

        try {
            const rotations = pages.map(p => ((p.rotation ?? 0) + globalRotation) % 360);
            const pdfBytes = await rotatePDF(file, rotations);
            setResultBlob(uint8ArrayToBlob(pdfBytes));
            setStatus("success");
            addToHistory("Rotated PDF", file.name, `Custom per-page rotations applied`);
        } catch (error: unknown) {
            console.error(error);
            setErrorMessage(error instanceof Error ? error.message : "Failed to rotate PDF");
            setStatus("error");
        }
    };

    const handleDownload = () => {
        if (!resultBlob) return;
        const url = URL.createObjectURL(resultBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = customFileName;
        link.click();
        URL.revokeObjectURL(url);
    };

    const reset = () => {
        setFile(null);
        setStatus("idle");
        setPages([]);
        setResultBlob(null);
        setErrorMessage("");
        setGlobalRotation(90);
    };

    return (
        <div className="relative min-h-[calc(100vh-80px)] pt-24 pb-16 overflow-hidden">
            <AnimatedBackground />
            <FloatingDecorations />

            <div className="container mx-auto px-4 relative z-10">
                <AnimatePresence mode="wait">
                    {status === "idle" && (
                        <motion.div
                            key="idle"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="max-w-4xl mx-auto"
                        >
                            <ToolHeader
                                title="Rotate PDF"
                                description="Rotate your PDF pages with pixel-perfect visual preview and local processing."
                                icon={RotateCw}
                            />

                            <ToolCard className="p-8">
                                <div
                                    className={`drop-zone active:border-black ${dragActive ? "active" : ""}`}
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
                            </ToolCard>
                        </motion.div>
                    )}

                    {status === "loading" && (
                        <ProcessingState
                            message="Loading PDF..."
                            description="Generating high-definition previews..."
                        />
                    )}

                    {status === "ready" && (
                        <motion.div
                            key="ready"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="max-w-6xl mx-auto"
                        >
                            <div className="flex flex-col gap-8">
                                {/* Configuration Toolbar */}
                                <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center">
                                            <FileIcon className="w-6 h-6 text-gray-600" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 truncate max-w-[200px]">{file?.name}</p>
                                            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">{pages.length} Pages</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-center gap-2">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Global Rotation Offset</p>
                                        <div className="flex bg-gray-100 p-1 rounded-2xl">
                                            {[
                                                { value: 0, label: "0°" },
                                                { value: 90, label: "90°" },
                                                { value: 180, label: "180°" },
                                                { value: 270, label: "270°" },
                                            ].map((option) => (
                                                <button
                                                    key={option.value}
                                                    onClick={() => setGlobalRotation(option.value as 0 | 90 | 180 | 270)}
                                                    className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${
                                                        globalRotation === option.value
                                                        ? "bg-white text-black shadow-sm"
                                                        : "text-gray-500 hover:text-black"
                                                    }`}
                                                >
                                                    {option.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex gap-4 w-full md:w-auto">
                                        <button onClick={reset} className="flex-1 md:flex-none btn-outline py-4 px-8 rounded-2xl font-bold">
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleRotate}
                                            className="flex-1 md:flex-none btn-primary py-4 px-10 rounded-2xl flex items-center justify-center gap-2 group shadow-xl shadow-black/10 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                        >
                                            <RotateCw className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                                            <span className="font-bold">Apply & Save</span>
                                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </div>

                                {/* Preview Grid */}
                                <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-xl">
                                    <div className="flex items-center justify-between mb-8">
                                        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Visual Layout Preview</h3>
                                        <div className="flex items-center gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                            <span>Click to preview</span>
                                            <div className="w-px h-3 bg-gray-200" />
                                            <span>Use arrows to rotate individual pages</span>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-8">
                                        {pages.map((page, index) => (
                                            <motion.div
                                                key={page.pageNumber}
                                                layout
                                                className="relative group"
                                            >
                                                <div className="relative aspect-[3/4.2] rounded-xl overflow-hidden border border-gray-100 group-hover:border-black transition-all shadow-sm group-hover:shadow-2xl">
                                                    <div
                                                        className="w-full h-full transition-transform duration-500 origin-center cursor-pointer"
                                                        onClick={() => { setPreviewPage(index); setPreviewOpen(true); }}
                                                        style={{ transform: `rotate(${((page.rotation ?? 0) + globalRotation) % 360}deg)` }}
                                                    >
                                                        <Image
                                                            src={page.image}
                                                            alt={`Page ${page.pageNumber}`}
                                                            fill
                                                            className="object-cover"
                                                            unoptimized
                                                        />
                                                    </div>
                                                    
                                                    {/* Individual Page Controls */}
                                                    <div className="absolute top-1 right-1 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); handleRotateIndividual(index, 90); }}
                                                            className="w-8 h-8 bg-black/90 text-white rounded-lg flex items-center justify-center hover:bg-black transition-colors shadow-lg"
                                                            title="Rotate 90° clockwise"
                                                        >
                                                            <RotateCw className="w-4 h-4" />
                                                        </button>
                                                    </div>

                                                    <div className="absolute inset-0 pointer-events-none bg-black/0 group-hover:bg-black/10 transition-all duration-300" />

                                                    <div className="absolute top-2 left-2 w-6 h-6 bg-black/80 backdrop-blur-md text-white text-[10px] font-bold rounded-lg flex items-center justify-center pointer-events-none">
                                                        {page.pageNumber}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>

                                <div className="max-w-md mx-auto w-full">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1 mb-2 block text-center">Output Filename</label>
                                    <input 
                                        type="text"
                                        value={customFileName}
                                        onChange={(e) => setCustomFileName(e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-black/5 transition-all text-sm font-medium text-center shadow-lg"
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}


                    {status === "processing" && (
                        <ProcessingState
                            message="Rotating pages..."
                            description="Applying orientation fixes locally..."
                        />
                    )}

                    {status === "success" && (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="max-w-4xl mx-auto"
                        >
                            <div className="text-center mb-12">
                                <motion.div 
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="w-20 h-20 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-black/10"
                                >
                                    <CheckCircle2 className="w-10 h-10" />
                                </motion.div>
                                <h2 className="text-4xl font-black text-gray-900 mb-2">PDF Rotated!</h2>
                                <p className="text-gray-500 font-medium text-lg">All pages have been successfully reoriented.</p>
                            </div>

                            <ToolCard className="p-10 max-w-2xl mx-auto shadow-2xl">
                                <div className="flex flex-col items-center gap-8">
                                    <div className="flex items-center gap-6 w-full p-6 bg-blue-50 rounded-2xl border border-blue-100">
                                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-blue-600">
                                            <RotateCw className="w-6 h-6" style={{ transform: `rotate(${globalRotation}deg)` }} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">Orientation Applied</p>
                                            <p className="text-xs text-blue-700 font-medium">{globalRotation}&deg; rotation applied to all pages</p>
                                        </div>
                                    </div>

                                    <div className="w-full space-y-4">
                                        <button 
                                            onClick={handleDownload}
                                            className="w-full btn-primary py-5 rounded-2xl flex items-center justify-center gap-3 text-lg group hover:scale-[1.02] active:scale-[0.98] transition-all"
                                        >
                                            <Download className="w-6 h-6 group-hover:translate-y-0.5 transition-transform" />
                                            <span className="font-bold">Download Rotated PDF</span>
                                        </button>
                                        <button 
                                            onClick={reset}
                                            className="w-full btn-outline py-5 rounded-2xl flex items-center justify-center gap-3 text-lg transition-all"
                                        >
                                            <RefreshCw className="w-5 h-5" />
                                            Rotate New
                                        </button>
                                    </div>
                                </div>
                            </ToolCard>
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

                <EducationalContent
                    howItWorks={{
                        title: "How to Rotate PDF",
                        steps: [
                            "Upload your PDF and wait for our local engine to generate high-speed previews.",
                            "Select your desired rotation angle (90, 180, or 270 degrees) and watch the previews update in real-time.",
                            "Download your perfectly oriented PDF. All processing happens locally for maximum privacy."
                        ]
                    }}
                    benefits={{
                        title: "Professional PDF Orientation",
                        items: [
                            { title: "Visual Preview", desc: "See exactly how your document will look before you commit the changes." },
                            { title: "Browser-side Processing", desc: "No files are ever uploaded. Your data stays on your machine, 100% private." },
                            { title: "High Speed", desc: "Reorient large documents in milliseconds using our optimized PDF engine." },
                            { title: "Lossless Rotation", desc: "We update the orientation flags without re-encoding, preserving 100% quality." }
                        ]
                    }}
                    faqs={[
                        {
                            question: "Can I rotate individual pages?",
                            answer: "Currently, our 'Rotate All' tool applies the rotation to the entire document. For individual page management, try our 'Organize PDF' tool."
                        },
                        {
                            question: "Does rotation affect image quality?",
                            answer: "Not at all. We use lossless rotation that simply updates the display metadata within the PDF structure, keeping every pixel exactly as it was."
                        },
                        {
                            question: "Is there a file size limit?",
                            answer: "Since processing happens in your browser, the limit is governed by your device's memory. Most files up to 200MB rotate instantly."
                        }
                    ]}
                />
            </div>

            {/* Preview Modal */}
            <PDFPreviewModal
                isOpen={previewOpen}
                onClose={() => setPreviewOpen(false)}
                images={pages.map(p => p.image)}
                currentPage={previewPage}
                onPageChange={setPreviewPage}
                rotation={(pages[previewPage]?.rotation ?? 0) + globalRotation}
                onDownload={handleRotate}
                title="Rotate PDF Preview"
            />
        </div>
    );
}
