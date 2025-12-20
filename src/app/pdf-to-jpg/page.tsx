"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, File, X, Download, Loader2, CheckCircle2, RefreshCw, AlertCircle, Image } from "lucide-react";
import { downloadAsZip, formatFileSize } from "@/lib/pdf-utils";

// Force dynamic rendering (no static prerender)
export const dynamic = "force-dynamic";


export default function PdfToJpgPage() {
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
    const [results, setResults] = useState<{ name: string; data: Uint8Array; preview: string }[]>([]);
    const [errorMessage, setErrorMessage] = useState("");
    const [dragActive, setDragActive] = useState(false);
    const [progress, setProgress] = useState(0);

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

    const handleConvert = async () => {
        if (!file) return;
        setStatus("processing");
        setErrorMessage("");
        setProgress(0);

        try {
            // Dynamic import to avoid SSR issues
            const pdfjsLib = await import("pdfjs-dist");
            pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            const numPages = pdf.numPages;
            const images: { name: string; data: Uint8Array; preview: string }[] = [];

            for (let i = 1; i <= numPages; i++) {
                const page = await pdf.getPage(i);
                const scale = 2; // Higher scale for better quality
                const viewport = page.getViewport({ scale });

                const canvas = document.createElement("canvas");
                const context = canvas.getContext("2d")!;
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                await page.render({
                    canvasContext: context,
                    viewport,
                    canvas
                } as any).promise;

                const blob = await new Promise<Blob>((resolve) => {
                    canvas.toBlob((b) => resolve(b!), "image/jpeg", 0.9);
                });

                const data = new Uint8Array(await blob.arrayBuffer());
                const preview = canvas.toDataURL("image/jpeg", 0.3);

                images.push({
                    name: `page_${i}.jpg`,
                    data,
                    preview,
                });

                setProgress(Math.round((i / numPages) * 100));
            }

            setResults(images);
            setStatus("success");
        } catch (error) {
            console.error(error);
            setErrorMessage(error instanceof Error ? error.message : "Failed to convert PDF to images");
            setStatus("error");
        }
    };

    const handleDownloadAll = async () => {
        if (results.length === 0) return;
        const filesForZip = results.map((r) => ({ name: r.name, data: r.data }));
        await downloadAsZip(filesForZip, "pdf-images.zip");
    };

    const handleDownloadSingle = (result: { name: string; data: Uint8Array }) => {
        const blob = new Blob([result.data.slice().buffer], { type: "image/jpeg" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = result.name;
        link.click();
        URL.revokeObjectURL(url);
    };

    const reset = () => {
        setFile(null);
        setStatus("idle");
        setResults([]);
        setErrorMessage("");
        setProgress(0);
    };

    return (
        <div className="min-h-[calc(100vh-80px)] pt-24 pb-16">
            <div className="container mx-auto px-4 py-12 md:py-20">
                <AnimatePresence mode="wait">
                    {status === "idle" && (
                        <motion.div
                            key="idle"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="flex flex-col items-center max-w-4xl mx-auto"
                        >
                            {!file ? (
                                <div
                                    className={`relative w-full flex flex-col items-center justify-center p-12 py-24 border-2 border-dashed rounded-3xl transition-all duration-300 cursor-pointer ${dragActive
                                        ? "border-primary bg-primary/5"
                                        : "border-border bg-white hover:border-primary/50 hover:bg-primary/5"
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
                                    <div className="bg-primary/10 p-6 rounded-2xl mb-6">
                                        <Upload className="w-12 h-12 text-primary" />
                                    </div>
                                    <h2 className="text-3xl font-bold text-foreground mb-3">PDF to JPG</h2>
                                    <p className="text-muted-foreground mb-8 text-center max-w-md">
                                        Convert each PDF page into a JPG image. High quality conversion.
                                    </p>
                                    <button className="btn-primary !py-4 !px-12 !text-lg">
                                        Select PDF file
                                    </button>
                                    <p className="mt-6 text-sm text-muted-foreground">
                                        or drag and drop a PDF here
                                    </p>
                                </div>
                            ) : (
                                <div className="w-full space-y-8">
                                    <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-border shadow-sm">
                                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                                            <File className="w-6 h-6 text-primary" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-foreground truncate">{file.name}</p>
                                            <p className="text-sm text-muted-foreground">{formatFileSize(file.size)}</p>
                                        </div>
                                        <button
                                            onClick={() => setFile(null)}
                                            className="p-2 rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-colors"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="flex justify-center">
                                        <button
                                            onClick={handleConvert}
                                            className="btn-primary !py-5 !px-16 !text-xl flex items-center gap-3 shadow-2xl shadow-primary/40 hover:-translate-y-1 transition-transform"
                                        >
                                            <Image className="w-6 h-6" /> Convert to JPG
                                        </button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {status === "processing" && (
                        <motion.div
                            key="processing"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.1 }}
                            className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-border shadow-xl max-w-2xl mx-auto"
                        >
                            <div className="relative mb-6">
                                <div className="w-24 h-24 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                                <Loader2 className="w-10 h-10 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                            </div>
                            <h3 className="text-2xl font-bold text-foreground mb-2">Converting to JPG...</h3>
                            <p className="text-muted-foreground mb-4">Processing pages...</p>
                            <div className="w-64 h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">{progress}%</p>
                        </motion.div>
                    )}

                    {status === "success" && (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center py-12 bg-white rounded-3xl border border-border shadow-xl max-w-4xl mx-auto"
                        >
                            <div className="bg-emerald-100 p-5 rounded-2xl mb-6">
                                <CheckCircle2 className="w-16 h-16 text-emerald-500" />
                            </div>
                            <h3 className="text-3xl font-bold text-foreground mb-2">Conversion Complete!</h3>
                            <p className="text-muted-foreground mb-8">{results.length} images created</p>

                            {/* Image previews */}
                            <div className="w-full px-8 mb-8">
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-80 overflow-y-auto p-2">
                                    {results.map((result, index) => (
                                        <div
                                            key={index}
                                            className="group relative rounded-lg overflow-hidden border border-border hover:border-primary/50 transition-all cursor-pointer"
                                            onClick={() => handleDownloadSingle(result)}
                                        >
                                            <img
                                                src={result.preview}
                                                alt={result.name}
                                                className="w-full aspect-[3/4] object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <Download className="w-8 h-8 text-white" />
                                            </div>
                                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-2 text-center">
                                                {result.name}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={handleDownloadAll}
                                    className="btn-primary !py-4 !px-10 flex items-center gap-2"
                                >
                                    <Download className="w-5 h-5" /> Download All (ZIP)
                                </button>
                                <button onClick={reset} className="btn-outline flex items-center gap-2">
                                    <RefreshCw className="w-5 h-5" /> Convert Another
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {status === "error" && (
                        <motion.div
                            key="error"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-red-200 shadow-xl max-w-2xl mx-auto text-center"
                        >
                            <div className="bg-red-100 p-5 rounded-2xl mb-6">
                                <AlertCircle className="w-16 h-16 text-red-500" />
                            </div>
                            <h3 className="text-3xl font-bold text-foreground mb-2">Something went wrong</h3>
                            <p className="text-muted-foreground mb-10 max-w-md px-4">{errorMessage}</p>
                            <button onClick={reset} className="btn-primary flex items-center gap-2">
                                <RefreshCw className="w-5 h-5" /> Try Again
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
