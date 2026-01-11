"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Download, CheckCircle2, RefreshCw, AlertCircle, ScanLine, FileText, Copy } from "lucide-react";
import { formatFileSize } from "@/lib/pdf-utils";
import {
    AnimatedBackground,
    FloatingDecorations,
    ToolHeader,
    ToolCard,
    ProcessingState
} from "@/components/ToolPageElements";
import { EducationalContent } from "@/components/EducationalContent";
import { useHistory } from "@/context/HistoryContext";

export default function OCRPDFPage() {
    const { addToHistory } = useHistory();
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
    const [extractedText, setExtractedText] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [dragActive, setDragActive] = useState(false);
    const [progress, setProgress] = useState(0);
    const [copied, setCopied] = useState(false);
    const [customFileName, setCustomFileName] = useState("extracted-text.txt");

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile?.type === "application/pdf") {
            setFile(droppedFile);
            setCustomFileName(droppedFile.name.replace(".pdf", "-text.txt"));
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setCustomFileName(selectedFile.name.replace(".pdf", "-text.txt"));
        }
    };

    const handleOCR = async () => {
        if (!file) return;
        setStatus("processing");
        setErrorMessage("");
        setProgress(0);

        try {
            const pdfjsLib = await import("pdfjs-dist");
            const workerUrl = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
            pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

            const Tesseract = await import("tesseract.js");

            const arrayBuffer = await file.arrayBuffer();
            const loadingTask = pdfjsLib.getDocument({
                data: new Uint8Array(arrayBuffer),
                useWorkerFetch: true,
                isEvalSupported: false
            });

            const pdfDoc = await loadingTask.promise;
            const numPages = pdfDoc.numPages;

            let fullText = "";

            for (let i = 1; i <= numPages; i++) {
                const page = await pdfDoc.getPage(i);

                // First try to get existing text
                const textContent = await page.getTextContent();
                const pageText = textContent.items
                    .map((item) => ("str" in item ? (item as { str: string }).str : ""))
                    .join(" ");

                if (pageText.trim().length > 50) {
                    fullText += `\n--- Page ${i} ---\n${pageText}\n`;
                    setProgress(Math.round((i / numPages) * 100));
                } else {
                    const viewport = page.getViewport({ scale: 2 });
                    const canvas = document.createElement("canvas");
                    const context = canvas.getContext("2d")!;
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;

                    await page.render({ canvasContext: context, viewport }).promise;

                    const imageData = canvas.toDataURL("image/png");

                    const result = await Tesseract.recognize(imageData, "eng", {
                        logger: (m: { status: string; progress: number }) => {
                            if (m.status === "recognizing text") {
                                setProgress(Math.round(((i - 1) / numPages + m.progress / numPages) * 100));
                            }
                        },
                    });

                    fullText += `\n--- Page ${i} (OCR) ---\n${result.data.text}\n`;
                    (page as { cleanup?: () => void }).cleanup?.();
                }
            }

            setExtractedText(fullText.trim());
            setStatus("success");

            if (file) {
                addToHistory("OCR PDF", file.name, "Text extracted from PDF");
            }

            await pdfDoc.destroy();
        } catch (error) {
            console.error(error);
            setErrorMessage(error instanceof Error ? error.message : "Failed to process PDF with OCR");
            setStatus("error");
        }
    };

    const handleCopy = async () => {
        await navigator.clipboard.writeText(extractedText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownloadText = () => {
        const blob = new Blob([extractedText], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = customFileName || "extracted-text.txt";
        link.click();
        URL.revokeObjectURL(url);
    };

    const reset = () => {
        setFile(null);
        setStatus("idle");
        setExtractedText("");
        setErrorMessage("");
        setProgress(0);
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
                                title="OCR PDF"
                                description="AI-powered text extraction from scanned PDFs and images."
                                icon={ScanLine}
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
                                    <Upload className="w-16 h-16 text-gray-300 mb-6" />
                                    <p className="text-xl font-semibold mb-2">Drop your PDF here</p>
                                    <p className="text-gray-400">or click to browse from your computer</p>
                                </div>

                                {file && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mt-8 flex flex-col items-center"
                                    >
                                        <div className="flex items-center gap-4 p-5 bg-gray-50 border border-gray-100 rounded-[28px] w-full max-w-md">
                                            <div className="p-3.5 bg-white rounded-2xl shadow-sm">
                                                <FileText className="w-7 h-7 text-black" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-gray-900 truncate">{file.name}</p>
                                                <p className="text-sm text-gray-400 font-bold uppercase tracking-wider">{formatFileSize(file.size)}</p>
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleOCR}
                                            className="mt-8 btn-primary text-xl py-5 px-20 flex items-center gap-3 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.3)] group hover:scale-[1.02] active:scale-[0.98] transition-all"
                                        >
                                            <ScanLine className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                                            Extract Text
                                        </button>
                                    </motion.div>
                                )}
                            </ToolCard>
                        </motion.div>
                    )}

                    {status === "processing" && (
                        <ProcessingState
                            message="Analyzing content..."
                            description="Running AI recognition on your document pages..."
                            progress={progress}
                        />
                    )}

                    {status === "success" && (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="max-w-5xl mx-auto py-12"
                        >
                            <div className="text-center mb-12">
                                <motion.div 
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="w-24 h-24 bg-black text-white rounded-[40px] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-black/20"
                                >
                                    <CheckCircle2 className="w-12 h-12" />
                                </motion.div>
                                <h2 className="text-5xl font-black text-gray-900 mb-2 tracking-tight">Text Extracted!</h2>
                                <p className="text-gray-500 font-medium text-lg">We successfully analyzed all pages and extracted the text below.</p>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                                <div className="lg:col-span-2">
                                    <ToolCard className="p-10 shadow-2xl overflow-hidden border-none bg-white/40 backdrop-blur-md">
                                        <div className="flex items-center justify-between mb-8">
                                            <h3 className="font-black text-xl uppercase tracking-wider flex items-center gap-3">
                                                <FileText className="w-6 h-6" />
                                                Text Preview
                                            </h3>
                                            <button
                                                onClick={handleCopy}
                                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all font-bold text-sm ${
                                                    copied ? "bg-green-500 text-white" : "bg-white border border-gray-100 hover:border-black shadow-sm"
                                                }`}
                                            >
                                                {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                                {copied ? "Copied!" : "Copy Text"}
                                            </button>
                                        </div>

                                        <div className="bg-white/60 rounded-[32px] p-8 max-h-[600px] overflow-y-auto border border-white shadow-inner">
                                            <pre className="whitespace-pre-wrap text-sm font-mono text-gray-800 leading-relaxed">
                                                {extractedText || "No text could be extracted from this document."}
                                            </pre>
                                        </div>
                                    </ToolCard>
                                </div>

                                <div className="space-y-6">
                                    <ToolCard className="p-8 shadow-xl">
                                        <h4 className="font-bold text-sm uppercase tracking-widest text-gray-400 mb-6">Download Settings</h4>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-gray-500 uppercase px-1">Filename</label>
                                                <input 
                                                    type="text"
                                                    value={customFileName}
                                                    onChange={(e) => setCustomFileName(e.target.value)}
                                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black transition-all font-medium text-sm"
                                                    placeholder="filename.txt"
                                                />
                                            </div>
                                            <button
                                                onClick={handleDownloadText}
                                                className="w-full btn-primary py-4 rounded-2xl flex items-center justify-center gap-2 font-bold group"
                                            >
                                                <Download className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
                                                Download .txt
                                            </button>
                                        </div>
                                    </ToolCard>

                                    <button
                                        onClick={reset}
                                        className="w-full py-4 border-2 border-dashed border-gray-200 rounded-3xl text-gray-400 font-bold hover:border-black hover:text-black transition-all flex items-center justify-center gap-2"
                                    >
                                        <RefreshCw className="w-5 h-5" />
                                        OCR Another
                                    </button>
                                </div>
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
                            <div className="w-24 h-24 bg-red-100 text-red-600 rounded-[40px] flex items-center justify-center mb-8 shadow-xl shadow-red-100">
                                <AlertCircle className="w-12 h-12" />
                            </div>
                            <h2 className="text-4xl font-black mb-4 tracking-tight">OCR Failed</h2>
                            <p className="text-gray-500 text-lg mb-12 font-medium leading-relaxed">{errorMessage}</p>

                            <button onClick={reset} className="btn-primary py-5 px-16 flex items-center justify-center gap-3 text-lg font-bold group rounded-2xl">
                                <RefreshCw className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
                                Try Again
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="container mx-auto px-4 mt-24">
                <EducationalContent
                    howItWorks={{
                        title: "How OCR Works",
                        steps: [
                            "Upload your scanned PDF or image document.",
                            "Our AI engine analyzes each page for text patterns and structure.",
                            "Optical Character Recognition converts pixels into editable text.",
                            "Preview the results and download your editable .txt file."
                        ]
                    }}
                    benefits={{
                        title: "Hyper-Premium Extraction",
                        items: [
                            { title: "Universal Detection", desc: "Recognizes text from scans, photos, and non-selectable PDFs effortlessly." },
                            { title: "Browser Privacy", desc: "All AI recognition happens in your browser. Your sensitive data never leaves your device." },
                            { title: "High Accuracy", desc: "Powered by Tesseract.js, the most accurate open-source OCR engine available today." },
                            { title: "One-Click Export", desc: "Instantly copy text or download a clean text file with one click." }
                        ]
                    }}
                    faqs={[
                        {
                            question: "What languages are supported?",
                            answer: "Our current implementation is optimized for English, but it can recognize most Latin-based characters with high accuracy."
                        },
                        {
                            question: "Does it handle handwriting?",
                            answer: "OCR works best with printed text. While it can detect some clear handwriting, specialized handwriting AI is usually required for messy scripts."
                        },
                        {
                            question: "Is there a page limit?",
                            answer: "There's no hard limit, but large documents (50+ pages) may take several minutes as all processing is done locally on your CPU."
                        }
                    ]}
                />
            </div>
        </div>
    );
}
