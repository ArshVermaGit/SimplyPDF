"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Download, Loader2, CheckCircle2, RefreshCw, AlertCircle, ScanLine, FileText, Copy } from "lucide-react";
import { formatFileSize } from "@/lib/pdf-utils";

export default function OCRPDFPage() {
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
    const [extractedText, setExtractedText] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [dragActive, setDragActive] = useState(false);
    const [progress, setProgress] = useState(0);
    const [copied, setCopied] = useState(false);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile?.type === "application/pdf") {
            setFile(droppedFile);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
        }
    };

    const handleOCR = async () => {
        if (!file) return;
        setStatus("processing");
        setErrorMessage("");
        setProgress(0);

        try {
            console.log("Loading pdfjs-dist...");
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
                setProgress(Math.round((i / numPages) * 100));

                const page = await pdfDoc.getPage(i);

                // First try to get existing text
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map((item: any) => item.str).join(" ");

                if (pageText.trim().length > 50) {
                    // Page has existing text, use it
                    fullText += `\n--- Page ${i} ---\n${pageText}\n`;
                } else {
                    // Page might be scanned, use OCR
                    const viewport = page.getViewport({ scale: 2 });
                    const canvas = document.createElement("canvas");
                    const context = canvas.getContext("2d")!;
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;

                    await page.render({ canvasContext: context, viewport } as any).promise;

                    const imageData = canvas.toDataURL("image/png");

                    const result = await Tesseract.recognize(imageData, "eng", {
                        logger: (m: any) => {
                            if (m.status === "recognizing text") {
                                setProgress(Math.round(((i - 1) / numPages + m.progress / numPages) * 100));
                            }
                        },
                    });

                    fullText += `\n--- Page ${i} (OCR) ---\n${result.data.text}\n`;
                    (page as any).cleanup?.();
                }
            }

            setExtractedText(fullText.trim());
            setStatus("success");
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
        link.download = "extracted-text.txt";
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
                                    <ScanLine className="w-8 h-8" />
                                </div>
                                <h1 className="text-4xl md:text-5xl font-bold mb-4">OCR PDF</h1>
                                <p className="text-gray-500 text-lg max-w-xl mx-auto">
                                    Extract text from scanned PDFs using optical character recognition.
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

                                {file && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mt-6"
                                    >
                                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                            <div className="flex items-center gap-3">
                                                <FileText className="w-8 h-8 text-gray-400" />
                                                <div>
                                                    <p className="font-medium">{file.name}</p>
                                                    <p className="text-sm text-gray-400">{formatFileSize(file.size)}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-6 flex justify-center">
                                            <button
                                                onClick={handleOCR}
                                                className="btn-primary text-lg py-4 px-12 flex items-center gap-3"
                                            >
                                                <ScanLine className="w-5 h-5" />
                                                Extract Text
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </div>

                            <div className="mt-12 grid grid-cols-3 gap-6 text-center">
                                {[
                                    { label: "100% Free", desc: "No hidden fees" },
                                    { label: "Private", desc: "Files stay on device" },
                                    { label: "Fast", desc: "Instant processing" },
                                ].map((feature) => (
                                    <div key={feature.label} className="p-4">
                                        <div className="font-semibold mb-1">{feature.label}</div>
                                        <div className="text-gray-400 text-sm">{feature.desc}</div>
                                    </div>
                                ))}
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
                            <h2 className="text-2xl font-bold mb-2">Extracting text with OCR...</h2>
                            <p className="text-gray-500 mb-4">This may take a moment for scanned pages.</p>
                            <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-black transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <p className="text-sm text-gray-400 mt-2">{progress}%</p>
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
                                <h2 className="text-3xl font-bold mb-2">Text Extracted!</h2>
                                <p className="text-gray-500">Here&apos;s the text we found in your PDF.</p>
                            </div>

                            <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xl">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold">Extracted Text</h3>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleCopy}
                                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                        >
                                            <Copy className="w-4 h-4" />
                                            {copied ? "Copied!" : "Copy"}
                                        </button>
                                        <button
                                            onClick={handleDownloadText}
                                            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                                        >
                                            <Download className="w-4 h-4" />
                                            Download TXT
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-xl p-4 max-h-96 overflow-y-auto">
                                    <pre className="whitespace-pre-wrap text-sm font-mono text-gray-700">
                                        {extractedText}
                                    </pre>
                                </div>
                            </div>

                            <div className="flex justify-center mt-8">
                                <button
                                    onClick={reset}
                                    className="btn-outline py-3 px-8 flex items-center gap-2"
                                >
                                    <RefreshCw className="w-5 h-5" />
                                    Process Another PDF
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
        </div>
    );
}
