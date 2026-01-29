"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, Download, CheckCircle2, RefreshCw, AlertCircle, Save } from "lucide-react";
import { setPDFMetadata } from "@/lib/pdf/enhance";
import {
    AnimatedBackground,
    FloatingDecorations,
    ToolHeader,
    ToolCard,
    ProcessingState
} from "@/components/ui/ToolPageElements";
import { useHistory } from "@/context/HistoryContext";
import { downloadFile } from "@/lib/pdf-utils";

interface MetadataForm {
    title: string;
    author: string;
    subject: string;
    keywords: string;
    creator: string;
    producer: string;
}

export function EditMetadataClient() {
    const { addToHistory } = useHistory();
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<"idle" | "editing" | "processing" | "success" | "error">("idle");
    const [processedPdf, setProcessedPdf] = useState<Uint8Array | null>(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [dragActive, setDragActive] = useState(false);
    
    const [metadata, setMetadata] = useState<MetadataForm>({
        title: "",
        author: "",
        subject: "",
        keywords: "",
        creator: "SimplyPDF",
        producer: "SimplyPDF"
    });

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile?.type === "application/pdf") {
            setFile(droppedFile);
            // In a real app we might read existing metadata here
             // For now we start blank or prepopulate based on filename
            setMetadata(prev => ({ ...prev, title: droppedFile.name.replace('.pdf', '') }));
            setStatus("editing");
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setMetadata(prev => ({ ...prev, title: selectedFile.name.replace('.pdf', '') }));
            setStatus("editing");
        }
    };

    const handleSave = async () => {
        if (!file) return;
        setStatus("processing");
        
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const keywordArray = metadata.keywords.split(',').map(k => k.trim()).filter(k => k);
            
            const newBytes = await setPDFMetadata(file, {
                ...metadata,
                keywords: keywordArray
            });
            
            setProcessedPdf(newBytes);
            setStatus("success");
            
            addToHistory("Edit Metadata", file.name, "Metadata updated");
        } catch (error) {
            console.error(error);
            setErrorMessage("Failed to update metadata.");
            setStatus("error");
        }
    };

    const handleDownload = () => {
        if (processedPdf && file) {
            downloadFile(processedPdf, file.name, "application/pdf");
        }
    };

    const reset = () => {
        setFile(null);
        setStatus("idle");
        setProcessedPdf(null);
        setErrorMessage("");
        setMetadata({
            title: "",
            author: "",
            subject: "",
            keywords: "",
            creator: "SimplyPDF",
            producer: "SimplyPDF"
        });
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
                                title="Edit Metadata"
                                description="View and modify PDF properties like Title, Author, Subject, and Keywords."
                                icon={FileText}
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
                                    <p className="text-lg font-medium mb-2">Drop PDF to Edit Metadata</p>
                                    <p className="text-gray-400 text-sm">or click to browse</p>
                                </div>
                            </ToolCard>
                        </motion.div>
                    )}

                    {status === "editing" && (
                        <motion.div
                            key="editing"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="max-w-2xl mx-auto"
                        >
                            <ToolCard className="p-8">
                                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                    <FileText className="w-5 h-5" />
                                    PDF Properties
                                </h3>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                        <input
                                            type="text"
                                            value={metadata.title}
                                            onChange={(e) => setMetadata({...metadata, title: e.target.value})}
                                            className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-black focus:ring-0 outline-none transition-all"
                                            placeholder="Document Title"
                                        />
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                                            <input
                                                type="text"
                                                value={metadata.author}
                                                onChange={(e) => setMetadata({...metadata, author: e.target.value})}
                                                className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-black focus:ring-0 outline-none transition-all"
                                                placeholder="Author Name"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                                            <input
                                                type="text"
                                                value={metadata.subject}
                                                onChange={(e) => setMetadata({...metadata, subject: e.target.value})}
                                                className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-black focus:ring-0 outline-none transition-all"
                                                placeholder="Subject"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Keywords</label>
                                        <input
                                            type="text"
                                            value={metadata.keywords}
                                            onChange={(e) => setMetadata({...metadata, keywords: e.target.value})}
                                            className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-black focus:ring-0 outline-none transition-all"
                                            placeholder="comma, separated, keywords"
                                        />
                                        <p className="text-xs text-gray-400 mt-1">Separate keywords with commas</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                                         <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Creator Application</label>
                                            <input
                                                type="text"
                                                value={metadata.creator}
                                                onChange={(e) => setMetadata({...metadata, creator: e.target.value})}
                                                className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-black focus:ring-0 outline-none transition-all"
                                            />
                                        </div>
                                         <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Producer</label>
                                            <input
                                                type="text"
                                                value={metadata.producer}
                                                onChange={(e) => setMetadata({...metadata, producer: e.target.value})}
                                                className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-black focus:ring-0 outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="mt-8 flex gap-3">
                                    <button onClick={handleSave} className="flex-1 btn-primary py-4 flex items-center justify-center gap-2">
                                        <Save className="w-5 h-5" />
                                        Save Metadata
                                    </button>
                                    <button onClick={reset} className="btn-ghost px-6 text-gray-500 hover:text-red-500">
                                        Cancel
                                    </button>
                                </div>
                            </ToolCard>
                        </motion.div>
                    )}

                    {status === "processing" && (
                        <ProcessingState
                            title="Updating Metadata..."
                            description="Writing new properties to the PDF file structure..."
                        />
                    )}

                    {status === "success" && (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="max-w-lg mx-auto text-center"
                        >
                             <div className="w-20 h-20 bg-black text-white rounded-[32px] flex items-center justify-center mx-auto mb-6 shadow-2xl">
                                <CheckCircle2 className="w-10 h-10" />
                            </div>
                            <h2 className="text-3xl font-bold mb-2">Metadata Updated!</h2>
                            <p className="text-gray-500 mb-8">
                                Your PDF header information has been successfully modified.
                            </p>

                            <div className="flex flex-col gap-3">
                                <button onClick={handleDownload} className="btn-primary py-4 px-8 flex items-center justify-center gap-2 shadow-lg shadow-black/10">
                                    <Download className="w-5 h-5" />
                                    Download PDF
                                </button>
                                <button onClick={reset} className="btn-ghost py-3 flex items-center justify-center gap-2 text-gray-500 hover:text-black">
                                    <RefreshCw className="w-4 h-4" />
                                    Edit Another File
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
                            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-[32px] flex items-center justify-center mb-8 shadow-sm">
                                <AlertCircle className="w-12 h-12" />
                            </div>
                            <h2 className="text-3xl font-bold mb-2">Update Failed</h2>
                            <p className="text-gray-500 mb-8">{errorMessage}</p>

                            <button onClick={reset} className="btn-primary py-4 px-8 w-full flex items-center justify-center gap-2">
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
