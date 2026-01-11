"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Upload, File, Download, RefreshCw, 
    AlertCircle, Shield, Lock, ArrowRight,
    Zap, Printer, Copy, Edit, Maximize2
} from "lucide-react";
import { formatFileSize, uint8ArrayToBlob, protectPDF } from "@/lib/pdf-utils";
import { PDFPreviewModal } from "@/components/PDFPreviewModal";
import {
    AnimatedBackground,
    FloatingDecorations,
    ToolHeader,
    ToolCard,
    ProcessingState
} from "@/components/ToolPageElements";
import { EducationalContent } from "@/components/EducationalContent";
import { useHistory } from "@/context/HistoryContext";
import Image from "next/image";

interface PageInfo {
    pageNumber: number;
    image: string;
}

export default function ProtectPDFPage() {
    const { addToHistory } = useHistory();
    const [file, setFile] = useState<File | null>(null);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "ready" | "processing" | "success" | "error">("idle");
    const [resultBlob, setResultBlob] = useState<Blob | null>(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [dragActive, setDragActive] = useState(false);
    const [pages, setPages] = useState<PageInfo[]>([]);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewPage, setPreviewPage] = useState(0);
    const [customFileName, setCustomFileName] = useState("protected.pdf");

    const [permissions, setPermissions] = useState({
        printing: false,
        copying: false,
        modifying: false,
        annotating: false
    });


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
            const previewLimit = Math.min(numPages, 10);
            for (let i = 1; i <= previewLimit; i++) {
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
                });
                (page as { cleanup?: () => void }).cleanup?.();
            }

            setPages(pageInfos);
            setCustomFileName(`protected_${pdfFile.name}`);
            setStatus("ready");
            await pdfDoc.destroy();
        } catch (error: unknown) {
            console.error("PDF loading error:", error);
            const msg = error instanceof Error ? error.message : "Unknown error";
            setErrorMessage(`Failed to load PDF preview: ${msg}`);
            setStatus("error");
        }
    };

    const handleProtect = async () => {
        if (!file) return;

        if (password !== confirmPassword) {
            setErrorMessage("Passwords do not match. Please ensure both passwords are identical.");
            setStatus("error");
            return;
        }

        if (password.length < 4) {
            setErrorMessage("Security notice: Password must be at least 4 characters long for adequate protection.");
            setStatus("error");
            return;
        }

        setStatus("processing");
        setErrorMessage("");

        try {
            // We use the same password for both User (to open) and Owner (to change permissions)
            // if we want to provide a seamless "one-password" experience.
            const pdfBytes = await protectPDF(file, password, password, {
                printing: permissions.printing,
                modifying: permissions.modifying,
                copying: permissions.copying,
                annotating: permissions.annotating
            });

            const blob = uint8ArrayToBlob(pdfBytes);
            setResultBlob(blob);
            setStatus("success");

            addToHistory("Protected PDF", file.name, "Added security restrictions and encryption");
        } catch (error: unknown) {
            console.error(error);
            const msg = error instanceof Error ? error.message : "Failed to protect PDF";
            setErrorMessage(msg);
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
        setPassword("");
        setConfirmPassword("");
        setStatus("idle");
        setResultBlob(null);
        setPages([]);
        setErrorMessage("");
        setPermissions({
            printing: false,
            copying: false,
            modifying: false,
            annotating: false
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
                                title="Protect PDF"
                                description="Secure your documents with strong encryption and granular access controls."
                                icon={Shield}
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
                            description="Preparing security workspace..."
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
                                {/* Left: Preview & File Info */}
                                <div className="lg:col-span-4 space-y-6">
                                    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xl">
                                        <div className="relative aspect-3/4 rounded-2xl overflow-hidden border border-gray-100 mb-6 group">
                                            {pages[0] && (
                                                <Image
                                                    src={pages[0].image}
                                                    alt="Preview"
                                                    fill
                                                    className="object-cover"
                                                    unoptimized
                                                />
                                            )}
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                <button 
                                                    onClick={() => setPreviewOpen(true)}
                                                    className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-black"
                                                >
                                                    <Maximize2 className="w-6 h-6" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                                                    <File className="w-5 h-5 text-gray-600" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-gray-900 truncate">{file?.name}</p>
                                                    <p className="text-sm text-gray-500">{formatFileSize(file?.size || 0)}</p>
                                                </div>
                                            </div>
                                            <div className="h-px bg-gray-50" />
                                            <button onClick={reset} className="w-full py-3 text-sm font-bold text-gray-400 hover:text-red-500 transition-colors">
                                                Select different file
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Security Settings */}
                                <div className="lg:col-span-8 space-y-6">
                                    <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-8">
                                        <h3 className="text-xl font-bold text-gray-900 mb-8">Security Configuration</h3>
                                        
                                        <div className="space-y-8">
                                            {/* Password Section */}
                                            <div className="grid md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Access Password</label>
                                                    <div className="relative group">
                                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-black transition-colors" />
                                                        <input 
                                                            type="password"
                                                            value={password}
                                                            onChange={(e) => setPassword(e.target.value)}
                                                            placeholder="Set security password"
                                                            className="w-full pl-11 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-black focus:ring-4 focus:ring-black/5 outline-none font-medium transition-all text-sm"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Confirm Password</label>
                                                    <div className="relative group">
                                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-black transition-colors" />
                                                        <input 
                                                            type="password"
                                                            value={confirmPassword}
                                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                                            placeholder="Re-enter password"
                                                            className="w-full pl-11 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-black focus:ring-4 focus:ring-black/5 outline-none font-medium transition-all text-sm"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Permissions Section */}
                                            <div>
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1 mb-4 block">Document Permissions</label>
                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                                    {[
                                                        { id: 'printing', icon: Printer, label: 'Printing' },
                                                        { id: 'copying', icon: Copy, label: 'Copying' },
                                                        { id: 'modifying', icon: Edit, label: 'Editing' },
                                                        { id: 'annotating', icon: Zap, label: 'Annotating' },
                                                    ].map((perm) => (
                                                        <button
                                                            key={perm.id}
                                                            onClick={() => setPermissions(prev => ({ ...prev, [perm.id]: !prev[perm.id as keyof typeof prev] }))}
                                                            className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                                                                permissions[perm.id as keyof typeof permissions]
                                                                ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                                                                : "border-gray-100 text-gray-400 grayscale hover:grayscale-0"
                                                            }`}
                                                        >
                                                            <perm.icon className="w-5 h-5" />
                                                            <span className="text-[10px] font-bold uppercase tracking-tighter">{perm.label}</span>
                                                            <div className={`mt-1 w-8 h-4 rounded-full relative transition-colors ${
                                                                permissions[perm.id as keyof typeof permissions] ? "bg-emerald-500" : "bg-gray-200"
                                                            }`}>
                                                                <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${
                                                                    permissions[perm.id as keyof typeof permissions] ? "left-4.5" : "left-0.5"
                                                                }`} />
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Output Filename</label>
                                                <input 
                                                    type="text"
                                                    value={customFileName}
                                                    onChange={(e) => setCustomFileName(e.target.value)}
                                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition-all text-sm font-medium"
                                                />
                                            </div>

                                            <button
                                                onClick={handleProtect}
                                                disabled={!password || password !== confirmPassword}
                                                className="w-full btn-primary py-5 rounded-2xl shadow-xl shadow-black/10 flex items-center justify-center gap-2 group hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale"
                                            >
                                                <Shield className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                                <span className="font-bold text-base">Protect this PDF</span>
                                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {status === "processing" && (
                        <ProcessingState
                            message="Encrypting document..."
                            description="Applying AES-256 security layer..."
                        />
                    )}

                    {status === "success" && (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="max-w-4xl mx-auto"
                        >
                            <div className="text-center mb-12">
                                <motion.div 
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="w-20 h-20 bg-black text-white rounded-[32px] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-black/20"
                                >
                                    <Shield className="w-10 h-10 fill-white" />
                                </motion.div>
                                <h2 className="text-4xl font-black text-gray-900 mb-2">PDF Fully Secured!</h2>
                                <p className="text-gray-500 font-medium text-lg">Your document is now encrypted and ready for sharing.</p>
                            </div>

                            <ToolCard className="p-10 max-w-2xl mx-auto shadow-2xl">
                                <div className="flex flex-col items-center gap-8">
                                    <div className="flex items-center gap-6 w-full p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-emerald-600">
                                            <Lock className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">Strong Encryption Applied</p>
                                            <p className="text-xs text-emerald-700 font-medium">Document is now protected with AES-256 standard</p>
                                        </div>
                                    </div>

                                    <div className="w-full space-y-4">
                                        <button 
                                            onClick={handleDownload}
                                            className="w-full btn-primary py-5 rounded-2xl flex items-center justify-center gap-3 text-lg group hover:scale-[1.02] active:scale-[0.98] transition-all"
                                        >
                                            <Download className="w-6 h-6 group-hover:translate-y-0.5 transition-transform" />
                                            <span className="font-bold">Download Protected PDF</span>
                                        </button>
                                        <button 
                                            onClick={reset}
                                            className="w-full btn-outline py-5 rounded-2xl flex items-center justify-center gap-3 text-lg transition-all"
                                        >
                                            <RefreshCw className="w-5 h-5" />
                                            Protect New
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
                            <h2 className="text-3xl font-bold mb-2">Action needed</h2>
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
                        title: "How to Protect PDF",
                        steps: [
                            "Upload your document to our secure local workspace.",
                            "Set your strong password and configure granular permissions like printing and copying.",
                            "SimplyPDF will encrypt your file using industry-standard protocols. Download the secured version instantly."
                        ]
                    }}
                    benefits={{
                        title: "Enterprise-Grade Document Security",
                        items: [
                            { title: "AES-256 Encryption", desc: "We use standard military-grade encryption to ensure your data remains completely private." },
                            { title: "Granular Permissions", desc: "Control exactly who can print, copy, or edit your document with precision." },
                            { title: "Zero Data Leakage", desc: "By processing everything in your browser, your sensitive data NEVER leaves your computer." },
                            { title: "Smart Filenames", desc: "Automatically suggests secure naming conventions for your protected files." }
                        ]
                    }}
                    faqs={[
                        {
                            question: "How secure is my password?",
                            answer: "Your password is never sent to our servers. We use it locally to generate the encryption keys required to lock your PDF document."
                        },
                        {
                            question: "What if I forget my password?",
                            answer: "Since SimplyPDF does not store your passwords, we cannot recover them. Please ensure you keep a safe record of your document passwords."
                        },
                        {
                            question: "Will the PDF work in all readers?",
                            answer: "Yes, we use standard PDF security features that are recognized by all major readers including Adobe Acrobat, Chrome, and Apple Preview."
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
                onDownload={handleProtect}
                title="Protect PDF Preview"
            />
        </div>
    );
}
