"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, File, Download, Loader2, CheckCircle2, RefreshCw, AlertCircle, Image, Eye } from "lucide-react";
import { downloadAsZip, formatFileSize } from "@/lib/pdf-utils";
import { PDFPreviewModal } from "@/components/PDFPreviewModal";
import JSZip from "jszip";

interface ConvertedImage {
    name: string;
    dataUrl: string;
}

export default function PDFToJPGPage() {
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<"idle" | "loading" | "converting" | "success" | "error">("idle");
    const [images, setImages] = useState<ConvertedImage[]>([]);
    const [errorMessage, setErrorMessage] = useState("");
    const [dragActive, setDragActive] = useState(false);
    const [progress, setProgress] = useState(0);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewPage, setPreviewPage] = useState(0);

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile?.type === "application/pdf") {
            await processFile(droppedFile);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            await processFile(selectedFile);
        }
    };

    const processFile = async (pdfFile: File) => {
        setFile(pdfFile);
        setStatus("loading");
        setProgress(0);
        setImages([]);

        try {
            const pdfjsLib = await import("pdfjs-dist");
            const workerUrl = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
            pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

            const arrayBuffer = await pdfFile.arrayBuffer();
            const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            const numPages = pdfDoc.numPages;

            setStatus("converting");
            const convertedImages: ConvertedImage[] = [];

            for (let i = 1; i <= numPages; i++) {
                const page = await pdfDoc.getPage(i);
                const viewport = page.getViewport({ scale: 2 }); // High quality
                const canvas = document.createElement("canvas");
                const context = canvas.getContext("2d")!;
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                await page.render({ canvasContext: context, viewport } as any).promise;

                convertedImages.push({
                    name: `page-${i}.jpg`,
                    dataUrl: canvas.toDataURL("image/jpeg", 0.9),
                });

                setProgress(Math.round((i / numPages) * 100));
            }

            setImages(convertedImages);
            setStatus("success");
        } catch (error) {
            console.error(error);
            setErrorMessage("Failed to convert PDF to images.");
            setStatus("error");
        }
    };

    const handleDownloadSingle = (image: ConvertedImage) => {
        const link = document.createElement("a");
        link.href = image.dataUrl;
        link.download = image.name;
        link.click();
    };

    const handleDownloadAll = async () => {
        const zip = new JSZip();
        for (const image of images) {
            const base64Data = image.dataUrl.split(",")[1];
            zip.file(image.name, base64Data, { base64: true });
        }
        const blob = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "pdf-images.zip";
        link.click();
        URL.revokeObjectURL(url);
    };

    const reset = () => {
        setFile(null);
        setStatus("idle");
        setImages([]);
        setProgress(0);
        setErrorMessage("");
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
                                    <Image className="w-8 h-8" />
                                </div>
                                <h1 className="text-4xl md:text-5xl font-bold mb-4">PDF to JPG</h1>
                                <p className="text-gray-500 text-lg max-w-xl mx-auto">
                                    Convert PDF pages to high-quality JPG images.
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
                            </div>
                        </motion.div>
                    )}

                    {(status === "loading" || status === "converting") && (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center py-32 max-w-lg mx-auto text-center"
                        >
                            <div className="relative mb-8">
                                <div className="w-24 h-24 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
                                <Loader2 className="w-10 h-10 text-black absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">
                                {status === "loading" ? "Loading PDF..." : "Converting pages..."}
                            </h2>
                            <p className="text-gray-500 mb-4">{progress}% complete</p>
                            <div className="w-full max-w-xs bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-black h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </motion.div>
                    )}

                    {status === "success" && (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="max-w-6xl mx-auto"
                        >
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle2 className="w-8 h-8" />
                                </div>
                                <h2 className="text-3xl font-bold mb-2">Conversion Complete!</h2>
                                <p className="text-gray-500">{images.length} images generated</p>
                            </div>

                            {/* Image Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
                                {images.map((image, index) => (
                                    <motion.div
                                        key={index}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        whileHover={{ y: -4 }}
                                        className="relative group cursor-pointer"
                                    >
                                        <div
                                            className="relative overflow-hidden rounded-xl border-2 border-gray-200 hover:border-black transition-all"
                                            onClick={() => { setPreviewPage(index); setPreviewOpen(true); }}
                                        >
                                            <div className="aspect-[3/4] bg-white">
                                                <img
                                                    src={image.dataUrl}
                                                    alt={`Page ${index + 1}`}
                                                    className="w-full h-full object-contain"
                                                />
                                            </div>

                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <div className="p-3 bg-white rounded-full shadow-xl">
                                                        <Eye className="w-5 h-5" />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="absolute bottom-2 left-2 px-2 py-1 bg-black text-white text-xs font-bold rounded">
                                                {index + 1}
                                            </div>

                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDownloadSingle(image); }}
                                                className="absolute bottom-2 right-2 p-1.5 bg-white text-black rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100 shadow-lg"
                                            >
                                                <Download className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <button onClick={handleDownloadAll} className="btn-primary py-4 px-10 flex items-center gap-2 justify-center">
                                    <Download className="w-5 h-5" />
                                    Download All (ZIP)
                                </button>
                                <button onClick={reset} className="btn-outline py-4 px-10 flex items-center gap-2 justify-center">
                                    <RefreshCw className="w-5 h-5" />
                                    Convert Another
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

            {/* Preview Modal */}
            <PDFPreviewModal
                isOpen={previewOpen}
                onClose={() => setPreviewOpen(false)}
                images={images.map(i => i.dataUrl)}
                currentPage={previewPage}
                onPageChange={setPreviewPage}
                title={file?.name || "Image Preview"}
            />
        </div>
    );
}
