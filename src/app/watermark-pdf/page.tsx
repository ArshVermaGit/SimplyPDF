"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Upload, File, Download, CheckCircle2, RefreshCw, 
    AlertCircle, Stamp, Maximize2, ArrowRight
} from "lucide-react";
import Image from "next/image";
import { PDFDocument, rgb, StandardFonts, degrees } from "pdf-lib";
import { formatFileSize, uint8ArrayToBlob } from "@/lib/pdf-utils";
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

export default function WatermarkPDFPage() {
    const { addToHistory } = useHistory();
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
    const [customFileName, setCustomFileName] = useState("watermarked.pdf");

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

            const pageImages: string[] = [];
            for (let i = 1; i <= Math.min(numPages, 10); i++) {
                const page = await pdfDoc.getPage(i);
                const viewport = page.getViewport({ scale: 0.5 });
                const canvas = document.createElement("canvas");
                const context = canvas.getContext("2d")!;
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                await page.render({ canvasContext: context, viewport }).promise;
                pageImages.push(canvas.toDataURL("image/jpeg", 0.6));
                (page as { cleanup?: () => void }).cleanup?.();
            }

            setPages(pageImages);
            setCustomFileName(`watermarked_${pdfFile.name}`);
            setStatus("ready");
            await pdfDoc.destroy();
        } catch (error: unknown) {
            console.error(error);
            const msg = error instanceof Error ? error.message : "Unknown error";
            setErrorMessage(`Failed to load PDF preview: ${msg}`);
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
            addToHistory("Watermarked PDF", file.name, "Added text watermark");
        } catch (error: unknown) {
            console.error(error);
            setErrorMessage("Failed to add watermark. The document might be protected or corrupted.");
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
                                title="Watermark PDF"
                                description="Add a professional text watermark to your PDF documents with real-time positioning."
                                icon={Stamp}
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
                            description="Generating live workspace..."
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
                            <div className="grid lg:grid-cols-12 gap-8 items-start">
                                {/* Configuration Panel */}
                                <div className="lg:col-span-12">
                                    <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center">
                                                <File className="w-6 h-6 text-gray-600" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 truncate max-w-[200px]">{file?.name}</p>
                                                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">{formatFileSize(file?.size || 0)}</p>
                                            </div>
                                        </div>

                                        <div className="flex gap-4 w-full md:w-auto">
                                            <button onClick={reset} className="flex-1 md:flex-none btn-outline py-4 px-8 rounded-2xl font-bold">
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleWatermark}
                                                className="flex-2 md:flex-none btn-primary py-4 px-10 rounded-2xl flex items-center justify-center gap-2 group shadow-xl shadow-black/10 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                            >
                                                <Stamp className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                                                <span className="font-bold">Apply Watermark</span>
                                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Sidebar: Settings */}
                                <div className="lg:col-span-4 space-y-6">
                                    <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-xl">
                                        <h3 className="text-xl font-bold text-gray-900 mb-8">Watermark Style</h3>
                                        
                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Watermark Text</label>
                                                <input 
                                                    type="text"
                                                    value={watermarkText}
                                                    onChange={(e) => setWatermarkText(e.target.value)}
                                                    className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:border-black transition-all text-sm font-medium"
                                                />
                                            </div>

                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center">
                                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Opacity: {opacity}%</label>
                                                </div>
                                                <input 
                                                    type="range"
                                                    min="5"
                                                    max="100"
                                                    value={opacity}
                                                    onChange={(e) => setOpacity(Number(e.target.value))}
                                                    className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-black"
                                                />
                                            </div>

                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center">
                                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Font Size: {fontSize}px</label>
                                                </div>
                                                <input 
                                                    type="range"
                                                    min="12"
                                                    max="144"
                                                    value={fontSize}
                                                    onChange={(e) => setFontSize(Number(e.target.value))}
                                                    className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-black"
                                                />
                                            </div>

                                            <div className="pt-4 space-y-2">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Output Filename</label>
                                                <input 
                                                    type="text"
                                                    value={customFileName}
                                                    onChange={(e) => setCustomFileName(e.target.value)}
                                                    className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:border-black transition-all text-sm"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Main Workspace: Preview */}
                                <div className="lg:col-span-8">
                                    <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-xl min-h-[500px] flex flex-col">
                                        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-8">Dynamic Live Preview</h3>
                                        
                                        <div 
                                            className="relative flex-1 aspect-3/4 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 group cursor-pointer shadow-inner"
                                            onClick={() => setPreviewOpen(true)}
                                        >
                                            {pages[0] && (
                                                <>
                                                    <Image
                                                        src={pages[0]}
                                                        alt="Main Preview"
                                                        fill
                                                        className="object-contain"
                                                        unoptimized
                                                    />
                                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
                                                        <motion.div
                                                            animate={{ opacity: opacity / 100 }}
                                                            className="font-bold text-gray-500 whitespace-nowrap"
                                                            style={{ 
                                                                fontSize: `${fontSize * 0.6}px`,
                                                                transform: 'rotate(-45deg)'
                                                            }}
                                                        >
                                                            {watermarkText}
                                                        </motion.div>
                                                    </div>
                                                </>
                                            )}
                                            
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex flex-col items-center justify-center gap-2 backdrop-blur-[2px] opacity-0 group-hover:opacity-100">
                                                <div className="bg-white/20 backdrop-blur-md border border-white/30 p-3 rounded-full shadow-2xl transform scale-75 group-hover:scale-100 transition-transform duration-300">
                                                    <Maximize2 className="w-6 h-6 text-white" />
                                                </div>
                                                <span className="text-[10px] font-bold text-white uppercase tracking-wider">Preview Result</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {status === "processing" && (
                        <ProcessingState
                            message="Applying watermark..."
                            description="Rendering vector text layers..."
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
                                <h2 className="text-4xl font-black text-gray-900 mb-2">Watermark Added!</h2>
                                <p className="text-gray-500 font-medium text-lg">Your document has been professionally watermarked.</p>
                            </div>

                            <ToolCard className="p-10 max-w-2xl mx-auto shadow-2xl">
                                <div className="flex flex-col items-center gap-8">
                                    <div className="flex items-center gap-6 w-full p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
                                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-emerald-600">
                                            <Stamp className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">Branding Applied</p>
                                            <p className="text-xs text-emerald-700 font-medium">&quot;{watermarkText}&quot; added to all {pages.length} pages</p>
                                        </div>
                                    </div>

                                    <div className="w-full space-y-4">
                                        <button 
                                            onClick={handleDownload}
                                            className="w-full btn-primary py-5 rounded-2xl flex items-center justify-center gap-3 text-lg group hover:scale-[1.02] active:scale-[0.98] transition-all"
                                        >
                                            <Download className="w-6 h-6 group-hover:translate-y-0.5 transition-transform" />
                                            <span className="font-bold">Download Watermarked PDF</span>
                                        </button>
                                        <button 
                                            onClick={reset}
                                            className="w-full btn-outline py-5 rounded-2xl flex items-center justify-center gap-3 text-lg transition-all"
                                        >
                                            <RefreshCw className="w-5 h-5" />
                                            Watermark New
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
                            <h2 className="text-3xl font-bold mb-2">Watermark failed</h2>
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
                        title: "How to Watermark PDF",
                        steps: [
                            "Upload your PDF and wait for our local workspace to initialize.",
                            "Customize your watermark text, opacity, and size. Use our live preview to see exactly how it looks.",
                            "Hit 'Apply Watermark' and download your branded PDF instantly. All processing is 100% private."
                        ]
                    }}
                    benefits={{
                        title: "Professional PDF Branding",
                        items: [
                            { title: "Dynamic Preview", desc: "Instantly see how your watermark looks with real-time text and opacity updates." },
                            { title: "Privacy First", desc: "All watermarking is done locally in your browser. Your sensitive files never leave your device." },
                            { title: "Batch Processing", desc: "Apply your watermark to every single page in the document automatically." },
                            { title: "Export Options", desc: "Easily download your watermarked document with custom filenames for better organization." }
                        ]
                    }}
                    faqs={[
                        {
                            question: "Can I add images as watermarks?",
                            answer: "Currently, we support text-based watermarking. Support for image-based watermarks (logos) is coming soon in a future update."
                        },
                        {
                            question: "Does this affect the text in my PDF?",
                            answer: "No, the watermark is added as a semi-transparent layer on top of your existing content, ensuring all original text remains readable."
                        },
                        {
                            question: "Is the watermark permanent?",
                            answer: "The watermark is embedded into the PDF structure of the new file we generate. You will always keep your original original document unchanged."
                        }
                    ]}
                />
            </div>

            {/* Preview Modal */}
            <PDFPreviewModal
                isOpen={previewOpen}
                onClose={() => setPreviewOpen(false)}
                images={pages}
                currentPage={previewPage}
                onPageChange={setPreviewPage}
                watermark={{ text: watermarkText, opacity, fontSize }}
                onDownload={handleWatermark}
                title="Watermark PDF Preview"
            />
        </div>
    );
}
