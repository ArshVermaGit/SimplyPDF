"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Wrench, Download, CheckCircle2, RefreshCw, AlertCircle } from "lucide-react";
import { repairPDF } from "@/lib/pdf/enhance";
import {
    AnimatedBackground,
    FloatingDecorations,
    ToolHeader,
    ToolCard,
    ProcessingState
} from "@/components/ToolPageElements";
import { useHistory } from "@/context/HistoryContext";
import { downloadFile, formatFileSize } from "@/lib/pdf-utils";

export default function RepairPDFPage() {
    const { addToHistory } = useHistory();
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<"idle" | "loading" | "processing" | "success" | "error">("idle");
    const [processedPdf, setProcessedPdf] = useState<Uint8Array | null>(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [dragActive, setDragActive] = useState(false);

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile?.type === "application/pdf") {
            handleFileSelect(droppedFile);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            handleFileSelect(selectedFile);
        }
    };

    const handleFileSelect = async (pdfFile: File) => {
        setFile(pdfFile);
        setStatus("loading");
        
        try {
            setStatus("processing");
            // Add a small delay for better UX so the user sees the state change
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            const repairedBytes = await repairPDF(pdfFile);
            setProcessedPdf(repairedBytes);
            setStatus("success");
            
            addToHistory("Repair PDF", pdfFile.name, `Repaired ${formatFileSize(repairedBytes.length)}`);
        } catch (error) {
            console.error(error);
            setErrorMessage("Failed to repair PDF. The file might be severely corrupted.");
            setStatus("error");
        }
    };

    const handleDownload = () => {
        if (processedPdf && file) {
            downloadFile(processedPdf, `repaired_${file.name}`, "application/pdf");
        }
    };

    const reset = () => {
        setFile(null);
        setStatus("idle");
        setProcessedPdf(null);
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
                                title="Repair PDF"
                                description="Recover data from corrupted or damaged PDF files using advanced structural analysis."
                                icon={Wrench}
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
                                    <p className="text-lg font-medium mb-2">Drop your damaged PDF here</p>
                                    <p className="text-gray-400 text-sm">or click to browse</p>
                                </div>
                            </ToolCard>
                        </motion.div>
                    )}

                    {(status === "loading" || status === "processing") && (
                        <ProcessingState
                            title={status === "loading" ? "Analyzing Structure..." : "Repairing PDF..."}
                            description="Rebuilding internal cross-reference tables and recovering content..."
                        />
                    )}

                    {status === "success" && (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="max-w-lg mx-auto text-center"
                        >
                            <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                                <CheckCircle2 className="w-10 h-10" />
                            </div>
                            <h2 className="text-3xl font-bold mb-2">File Repaired Successfully!</h2>
                            <p className="text-gray-500 mb-8">
                                Your PDF has been reconstructed and is ready for download.
                            </p>

                            <div className="flex flex-col gap-3">
                                <button onClick={handleDownload} className="btn-primary py-4 px-8 flex items-center justify-center gap-2 shadow-lg shadow-green-900/10">
                                    <Download className="w-5 h-5" />
                                    Download Repaired PDF
                                </button>
                                <button onClick={reset} className="btn-ghost py-3 flex items-center justify-center gap-2 text-gray-500 hover:text-black">
                                    <RefreshCw className="w-4 h-4" />
                                    Repair Another File
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {status === "error" && (
                        <motion.div
                            key="error"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="max-w-lg mx-auto text-center"
                        >
                            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                <AlertCircle className="w-10 h-10" />
                            </div>
                            <h2 className="text-3xl font-bold mb-2">Repair Failed</h2>
                            <p className="text-gray-500 mb-8">{errorMessage}</p>

                            <button onClick={reset} className="btn-primary py-4 px-8 w-full flex items-center justify-center gap-2">
                                <RefreshCw className="w-5 h-5" />
                                Try Another File
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
