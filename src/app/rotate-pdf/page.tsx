"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, File, X, Download, Loader2, CheckCircle2, RefreshCw, AlertCircle, RotateCw, RotateCcw } from "lucide-react";
import { rotatePDF, formatFileSize, uint8ArrayToBlob } from "@/lib/pdf-utils";

export default function RotatePDFPage() {
    const [file, setFile] = useState<File | null>(null);
    const [rotation, setRotation] = useState<90 | 180 | 270>(90);
    const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
    const [resultBlob, setResultBlob] = useState<Blob | null>(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [dragActive, setDragActive] = useState(false);

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

    const handleRotate = async () => {
        if (!file) return;
        setStatus("processing");
        setErrorMessage("");

        try {
            const rotatedBytes = await rotatePDF(file, rotation);
            setResultBlob(uint8ArrayToBlob(rotatedBytes));
            setStatus("success");
        } catch (error) {
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
        link.download = "rotated.pdf";
        link.click();
        URL.revokeObjectURL(url);
    };

    const reset = () => {
        setFile(null);
        setRotation(90);
        setStatus("idle");
        setResultBlob(null);
        setErrorMessage("");
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
                                    <h2 className="text-3xl font-bold text-foreground mb-3">Rotate PDF</h2>
                                    <p className="text-muted-foreground mb-8 text-center max-w-md">
                                        Rotate your PDFs the way you need them. All pages will be rotated.
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
                                    {/* Selected file */}
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

                                    {/* Rotation options */}
                                    <div className="bg-white p-6 rounded-xl border border-border">
                                        <h3 className="text-lg font-semibold text-foreground mb-4">Select Rotation</h3>

                                        <div className="grid grid-cols-3 gap-4">
                                            <button
                                                onClick={() => setRotation(90)}
                                                className={`flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all ${rotation === 90
                                                    ? "border-primary bg-primary/5"
                                                    : "border-border hover:border-primary/50"
                                                    }`}
                                            >
                                                <RotateCw className="w-10 h-10 text-primary" />
                                                <span className="font-medium">90° Right</span>
                                            </button>

                                            <button
                                                onClick={() => setRotation(180)}
                                                className={`flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all ${rotation === 180
                                                    ? "border-primary bg-primary/5"
                                                    : "border-border hover:border-primary/50"
                                                    }`}
                                            >
                                                <div className="relative w-10 h-10">
                                                    <RotateCw className="w-10 h-10 text-primary absolute" />
                                                    <RotateCw className="w-10 h-10 text-primary/50 absolute rotate-180" />
                                                </div>
                                                <span className="font-medium">180°</span>
                                            </button>

                                            <button
                                                onClick={() => setRotation(270)}
                                                className={`flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all ${rotation === 270
                                                    ? "border-primary bg-primary/5"
                                                    : "border-border hover:border-primary/50"
                                                    }`}
                                            >
                                                <RotateCcw className="w-10 h-10 text-primary" />
                                                <span className="font-medium">90° Left</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Action button */}
                                    <div className="flex justify-center">
                                        <button
                                            onClick={handleRotate}
                                            className="btn-primary !py-5 !px-16 !text-xl flex items-center gap-3 shadow-2xl shadow-primary/40 hover:-translate-y-1 transition-transform"
                                        >
                                            <RotateCw className="w-6 h-6" /> Rotate PDF
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
                            <div className="relative">
                                <div className="w-24 h-24 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                                <Loader2 className="w-10 h-10 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                            </div>
                            <h3 className="text-2xl font-bold text-foreground mt-8 mb-2">Rotating your PDF...</h3>
                            <p className="text-muted-foreground">Please wait, this won&apos;t take long.</p>
                        </motion.div>
                    )}

                    {status === "success" && (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-border shadow-xl max-w-2xl mx-auto text-center"
                        >
                            <div className="bg-emerald-100 p-5 rounded-2xl mb-6">
                                <CheckCircle2 className="w-16 h-16 text-emerald-500" />
                            </div>
                            <h3 className="text-3xl font-bold text-foreground mb-2">PDF Rotated!</h3>
                            <p className="text-muted-foreground mb-10 max-w-md px-4">
                                Your PDF has been rotated {rotation}° successfully.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={handleDownload}
                                    className="btn-primary !py-4 !px-10 flex items-center gap-2"
                                >
                                    <Download className="w-5 h-5" /> Download PDF
                                </button>
                                <button onClick={reset} className="btn-outline flex items-center gap-2">
                                    <RefreshCw className="w-5 h-5" /> Rotate Another
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
