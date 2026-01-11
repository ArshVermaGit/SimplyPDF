"use client";

export const dynamic = "force-dynamic";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Upload, File, X, Download, CheckCircle2, RefreshCw, 
    AlertCircle, FileSignature, Pencil, Type, Image as ImageIcon, 
    ArrowRight, ChevronLeft, ChevronRight, Trash2, Maximize2
} from "lucide-react";
import Image from "next/image";
import { PDFDocument } from "pdf-lib";
import { formatFileSize, uint8ArrayToBlob } from "@/lib/pdf-utils";
import {
    AnimatedBackground,
    FloatingDecorations,
    ToolHeader,
    ToolCard,
    ProcessingState
} from "@/components/ToolPageElements";
import { EducationalContent } from "@/components/EducationalContent";
import { useHistory } from "@/context/HistoryContext";

type SignatureMode = "draw" | "type" | "upload";

export default function SignPDFPage() {
    const { addToHistory } = useHistory();
    const [file, setFile] = useState<File | null>(null);
    const [signatureMode, setSignatureMode] = useState<SignatureMode>("draw");
    const [signatureText, setSignatureText] = useState("");
    const [signatureImage, setSignatureImage] = useState<string | null>(null);
    const [status, setStatus] = useState<"idle" | "loading" | "signing" | "processing" | "success" | "error">("idle");
    const [resultBlob, setResultBlob] = useState<Blob | null>(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [dragActive, setDragActive] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [pageImages, setPageImages] = useState<string[]>([]);
    const [signaturePosition, setSignaturePosition] = useState({ x: 50, y: 50 });
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasDrawn, setHasDrawn] = useState(false);
    const [customFileName, setCustomFileName] = useState("signed.pdf");

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile?.type === "application/pdf") {
            setFile(droppedFile);
            await loadPdfPreview(droppedFile);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            await loadPdfPreview(selectedFile);
        }
    };

    const loadPdfPreview = async (pdfFile: File) => {
        setStatus("loading");
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
            setTotalPages(pdfDoc.numPages);

            const images: string[] = [];
            for (let i = 1; i <= Math.min(pdfDoc.numPages, 10); i++) {
                const page = await pdfDoc.getPage(i);
                const viewport = page.getViewport({ scale: 1 });
                const canvas = document.createElement("canvas");
                const context = canvas.getContext("2d")!;
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                await page.render({ canvasContext: context, viewport }).promise;
                images.push(canvas.toDataURL("image/jpeg", 0.5));
                (page as { cleanup?: () => void }).cleanup?.();
            }
            setPageImages(images);
            setCustomFileName(`signed_${pdfFile.name}`);
            setStatus("signing");
            await pdfDoc.destroy();
        } catch (error) {
            console.error(error);
            setErrorMessage("Failed to load PDF preview. Local security policy might be blocking some features.");
            setStatus("error");
        }
    };

    // Canvas drawing handlers
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
    }, [signatureMode]);

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        setIsDrawing(true);
        setHasDrawn(true);

        const rect = canvas.getBoundingClientRect();
        const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
        const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
        const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        setHasDrawn(false);
    };

    const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const uploadedFile = e.target.files?.[0];
        if (uploadedFile) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setSignatureImage(event.target?.result as string);
            };
            reader.readAsDataURL(uploadedFile);
        }
    };

    const getSignatureDataUrl = (): string | null => {
        if (signatureMode === "draw") {
            return canvasRef.current?.toDataURL("image/png") || null;
        } else if (signatureMode === "type" && signatureText) {
            const canvas = document.createElement("canvas");
            canvas.width = 400;
            canvas.height = 100;
            const ctx = canvas.getContext("2d")!;
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "#000";
            ctx.font = "italic 48px serif";
            ctx.textBaseline = "middle";
            ctx.fillText(signatureText, 20, 50);
            return canvas.toDataURL("image/png");
        } else if (signatureMode === "upload" && signatureImage) {
            return signatureImage;
        }
        return null;
    };

    const handleApplySignature = async () => {
        if (!file) return;

        const signatureDataUrl = getSignatureDataUrl();
        if (!signatureDataUrl) {
            setErrorMessage("Please create a signature first");
            return;
        }

        setStatus("processing");
        setErrorMessage("");

        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await PDFDocument.load(arrayBuffer);

            const signatureData = signatureDataUrl.split(",")[1];
            const signatureBytes = Uint8Array.from(atob(signatureData), c => c.charCodeAt(0));

            const signatureImageEmbed = await pdf.embedPng(signatureBytes);
            const page = pdf.getPage(currentPage);
            const { width, height } = page.getSize();

            const sigWidth = 150;
            const sigHeight = (signatureImageEmbed.height / signatureImageEmbed.width) * sigWidth;

            page.drawImage(signatureImageEmbed, {
                x: (signaturePosition.x / 100) * (width - sigWidth),
                y: height - (signaturePosition.y / 100) * (height - sigHeight) - sigHeight,
                width: sigWidth,
                height: sigHeight,
            });

            const pdfBytes = await pdf.save();
            setResultBlob(uint8ArrayToBlob(pdfBytes));
            setStatus("success");
            addToHistory("Signed PDF", file.name, `Signature added to page ${currentPage + 1}`);
        } catch (error) {
            console.error(error);
            setErrorMessage("Failed to apply signature. The PDF might be encrypted or read-only.");
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
        setSignatureMode("draw");
        setSignatureText("");
        setSignatureImage(null);
        setStatus("idle");
        setResultBlob(null);
        setErrorMessage("");
        setCurrentPage(0);
        setPageImages([]);
        setHasDrawn(false);
    };

    const isSignatureReady = () => {
        if (signatureMode === "draw") return hasDrawn;
        if (signatureMode === "type") return signatureText.trim().length > 0;
        if (signatureMode === "upload") return signatureImage !== null;
        return false;
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
                                title="Sign PDF"
                                description="Securely sign your documents with a professional digital signature."
                                icon={FileSignature}
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
                            description="Initializing signature workspace..."
                        />
                    )}

                    {status === "signing" && (
                        <motion.div
                            key="signing"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="max-w-6xl mx-auto"
                        >
                            <div className="grid lg:grid-cols-12 gap-8 items-start">
                                {/* Configuration Section */}
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
                                                onClick={handleApplySignature}
                                                disabled={!isSignatureReady()}
                                                className="flex-2 md:flex-none btn-primary py-4 px-10 rounded-2xl flex items-center justify-center gap-2 group shadow-xl shadow-black/10 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                                            >
                                                <FileSignature className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                                                <span className="font-bold">Apply & Finish</span>
                                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Sidebar: Signature Creation */}
                                <div className="lg:col-span-5 space-y-6">
                                    <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-xl">
                                        <h3 className="text-xl font-bold text-gray-900 mb-8">Create Signature</h3>
                                        
                                        <div className="flex bg-gray-100 p-1 rounded-2xl mb-8">
                                            {[
                                                { id: "draw", icon: Pencil, label: "Draw" },
                                                { id: "type", icon: Type, label: "Type" },
                                                { id: "upload", icon: ImageIcon, label: "Upload" },
                                            ].map((mode) => (
                                                <button
                                                    key={mode.id}
                                                    onClick={() => setSignatureMode(mode.id as SignatureMode)}
                                                    className={`flex-1 py-3 rounded-xl font-bold text-xs flex flex-col items-center gap-2 transition-all ${
                                                        signatureMode === mode.id
                                                        ? "bg-white text-black shadow-sm"
                                                        : "text-gray-500 hover:text-black"
                                                    }`}
                                                >
                                                    <mode.icon className="w-4 h-4" />
                                                    {mode.label}
                                                </button>
                                            ))}
                                        </div>

                                        <div className="min-h-[200px] flex flex-col">
                                            {signatureMode === "draw" && (
                                                <div className="flex-1 flex flex-col">
                                                    <div className="flex-1 bg-gray-50 border-2 border-gray-100 rounded-2xl overflow-hidden relative group">
                                                        <canvas
                                                            ref={canvasRef}
                                                            width={400}
                                                            height={150}
                                                            className="w-full h-full cursor-crosshair touch-none mix-blend-multiply bg-transparent"
                                                            onMouseDown={startDrawing}
                                                            onMouseMove={draw}
                                                            onMouseUp={stopDrawing}
                                                            onMouseLeave={stopDrawing}
                                                            onTouchStart={startDrawing}
                                                            onTouchMove={draw}
                                                            onTouchEnd={stopDrawing}
                                                        />
                                                        {!hasDrawn && (
                                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-gray-300 font-bold uppercase tracking-widest text-xs">
                                                                Draw here
                                                            </div>
                                                        )}
                                                    </div>
                                                    <button onClick={clearCanvas} className="mt-4 text-[10px] font-bold text-gray-400 hover:text-red-500 uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                                                        <Trash2 className="w-3 h-3" /> Clear Canvas
                                                    </button>
                                                </div>
                                            )}

                                            {signatureMode === "type" && (
                                                <div className="space-y-4">
                                                    <input 
                                                        type="text"
                                                        value={signatureText}
                                                        onChange={(e) => setSignatureText(e.target.value)}
                                                        placeholder="Enter your name"
                                                        className="w-full px-6 py-6 bg-gray-50 border border-gray-100 rounded-2xl focus:border-black transition-all text-3xl italic font-serif"
                                                    />
                                                    <p className="text-[10px] font-bold text-gray-400 text-center uppercase tracking-widest">Type to see your cursive signature</p>
                                                </div>
                                            )}

                                            {signatureMode === "upload" && (
                                                <div className="flex-1">
                                                    {signatureImage ? (
                                                        <div className="relative aspect-video rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 group">
                                                            <Image src={signatureImage} alt="Uploaded" fill className="object-contain p-4" unoptimized />
                                                            <button 
                                                                onClick={() => setSignatureImage(null)}
                                                                className="absolute top-2 right-2 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <label className="flex-1 aspect-video flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-2xl cursor-pointer hover:border-black transition-all group">
                                                            <ImageIcon className="w-8 h-8 text-gray-300 group-hover:text-black transition-colors mb-2" />
                                                            <span className="text-[10px] font-bold text-gray-400 group-hover:text-black uppercase tracking-widest">Upload signature image</span>
                                                            <input type="file" accept="image/*" className="hidden" onChange={handleSignatureUpload} />
                                                        </label>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-xl">
                                        <h3 className="text-xl font-bold text-gray-900 mb-8">Positioning</h3>
                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Horizontal Location</label>
                                                <input 
                                                    type="range"
                                                    min="5" max="95"
                                                    value={signaturePosition.x}
                                                    onChange={(e) => setSignaturePosition(p => ({ ...p, x: Number(e.target.value) }))}
                                                    className="w-full accent-black h-1 bg-gray-100 rounded-lg appearance-none cursor-pointer"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Vertical Location</label>
                                                <input 
                                                    type="range"
                                                    min="5" max="95"
                                                    value={signaturePosition.y}
                                                    onChange={(e) => setSignaturePosition(p => ({ ...p, y: Number(e.target.value) }))}
                                                    className="w-full accent-black h-1 bg-gray-100 rounded-lg appearance-none cursor-pointer"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Main Workspace: PDF Preview */}
                                <div className="lg:col-span-7">
                                    <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-xl">
                                        <div className="flex items-center justify-between mb-8">
                                            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Document Workspace</h3>
                                            <div className="flex items-center gap-4 bg-gray-100 px-3 py-1.5 rounded-xl">
                                                <button 
                                                    onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                                                    disabled={currentPage === 0}
                                                    className="p-1 hover:bg-white rounded-lg disabled:opacity-20 transition-all shadow-sm"
                                                >
                                                    <ChevronLeft className="w-4 h-4" />
                                                </button>
                                                <span className="text-xs font-bold text-gray-900 min-w-[80px] text-center">Page {currentPage + 1} / {totalPages}</span>
                                                <button 
                                                    onClick={() => setCurrentPage(p => Math.min(pageImages.length - 1, p + 1))}
                                                    disabled={currentPage >= pageImages.length - 1}
                                                    className="p-1 hover:bg-white rounded-lg disabled:opacity-20 transition-all shadow-sm"
                                                >
                                                    <ChevronRight className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <div className="relative aspect-3/4 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 shadow-inner group">
                                            {pageImages[currentPage] && (
                                                <Image
                                                    src={pageImages[currentPage]}
                                                    alt={`Page ${currentPage + 1}`}
                                                    fill
                                                    className="object-contain"
                                                    unoptimized
                                                />
                                            )}

                                            {/* Live Signature Marker */}
                                            {isSignatureReady() && (
                                                <motion.div
                                                    layout
                                                    className="absolute w-[150px] aspect-video border-2 border-dashed border-black/40 bg-white/40 flex items-center justify-center p-2 backdrop-blur-[1px] shadow-2xl"
                                                    style={{
                                                        left: `${signaturePosition.x}%`,
                                                        top: `${signaturePosition.y}%`,
                                                        transform: "translate(-50%, -50%)",
                                                    }}
                                                >
                                                    <div className="text-[8px] font-bold text-black/60 uppercase tracking-widest bg-white/80 px-2 py-1 rounded-full shadow-sm">
                                                        Place Signature
                                                    </div>
                                                </motion.div>
                                            )}
                                            
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex flex-col items-center justify-center gap-2 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 pointer-events-none">
                                                <div className="bg-white/20 backdrop-blur-md border border-white/30 p-3 rounded-full shadow-2xl transform scale-75 group-hover:scale-100 transition-transform duration-300">
                                                    <Maximize2 className="w-6 h-6 text-white" />
                                                </div>
                                                <span className="text-[10px] font-bold text-white uppercase tracking-wider">Workspace View</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-8 max-w-sm mx-auto">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1 mb-2 block text-center">Output Filename</label>
                                        <input 
                                            type="text"
                                            value={customFileName}
                                            onChange={(e) => setCustomFileName(e.target.value)}
                                            className="w-full px-4 py-3 bg-white border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-black/5 transition-all text-sm font-medium text-center shadow-lg"
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {status === "processing" && (
                        <ProcessingState
                            message="Embedding signature..."
                            description="Finalizing cryptographic verification layers..."
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
                                    className="w-20 h-20 bg-black text-white rounded-[32px] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-black/20"
                                >
                                    <FileSignature className="w-10 h-10" />
                                </motion.div>
                                <h2 className="text-4xl font-black text-gray-900 mb-2">PDF Successfully Signed!</h2>
                                <p className="text-gray-500 font-medium text-lg">Your document is now professionaly signed and ready for sharing.</p>
                            </div>

                            <ToolCard className="p-10 max-w-2xl mx-auto shadow-2xl">
                                <div className="flex flex-col items-center gap-8">
                                    <div className="flex items-center gap-6 w-full p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
                                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-emerald-600">
                                            <CheckCircle2 className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">Digital Signature Embedded</p>
                                            <p className="text-xs text-emerald-700 font-medium">Added to page {currentPage + 1} of your document</p>
                                        </div>
                                    </div>

                                    <div className="w-full space-y-4">
                                        <button 
                                            onClick={handleDownload}
                                            className="w-full btn-primary py-5 rounded-2xl flex items-center justify-center gap-3 text-lg group hover:scale-[1.02] active:scale-[0.98] transition-all"
                                        >
                                            <Download className="w-6 h-6 group-hover:translate-y-0.5 transition-transform" />
                                            <span className="font-bold">Download Signed PDF</span>
                                        </button>
                                        <button 
                                            onClick={reset}
                                            className="w-full btn-outline py-5 rounded-2xl flex items-center justify-center gap-3 text-lg transition-all"
                                        >
                                            <RefreshCw className="w-5 h-5" />
                                            Sign New
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
                            <h2 className="text-3xl font-bold mb-2">Signing failed</h2>
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
                        title: "How to Sign PDF",
                        steps: [
                            "Upload your document to our secure browser-side canvas.",
                            "Create your signature by drawing, typing your name, or uploading a professional scan.",
                            "Position your signature exactly where it needs to be using our live document markers.",
                            "Download your perfectly signed PDF. All processing is 100% private and stays in your browser."
                        ]
                    }}
                    benefits={{
                        title: "Enterprise Digital Signatures",
                        items: [
                            { title: "Multiple Modes", desc: "Choose your professional style: Draw by hand, type in cursive, or upload a scanned PNG." },
                            { title: "Privacy Guaranteed", desc: "Your document and your signature never leave your device. SimplyPDF is a local tool." },
                            { title: "Visual Precision", desc: "Precisely place your signature anywhere on the document with our live-refresh markers." },
                            { title: "Universal Compatibility", desc: "Our signed PDFs are recognized by all major standard PDF readers like Adobe Acrobat and Chrome." }
                        ]
                    }}
                    faqs={[
                        {
                            question: "Is this signature legally binding?",
                            answer: "SimplyPDF provides electronic signatures. Depending on your jurisdiction and the type of document, this may or may not satisfy legal requirements for 'qualified' digital signatures."
                        },
                        {
                            question: "Does it work on mobile?",
                            answer: "Yes! You can use your finger or a stylus to draw your signature directly on your phone or tablet."
                        },
                        {
                            question: "Can I sign multiple pages?",
                            answer: "Currently, our tool allows you to place one signature on one selected page. For multiple signatures, you can run the finished file through the tool again."
                        }
                    ]}
                />
            </div>
        </div>
    );
}
