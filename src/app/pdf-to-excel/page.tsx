"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Download, CheckCircle2, RefreshCw, AlertCircle, FileDown, FileText, ArrowRight, Table } from "lucide-react";
import { formatFileSize } from "@/lib/pdf-utils";
import {
    AnimatedBackground,
    FloatingDecorations,
    ToolHeader,
    ToolCard,
    ProcessingState
} from "@/components/ToolPageElements";
import { useHistory } from "@/context/HistoryContext";

export default function PDFToExcelPage() {
    const { addToHistory } = useHistory();
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
    const [resultBlob, setResultBlob] = useState<Blob | null>(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [dragActive, setDragActive] = useState(false);
    const [progress, setProgress] = useState(0);
    const [extractedData, setExtractedData] = useState<string[][]>([]);
    const [isScanning, setIsScanning] = useState(false);
    const [exportFormat, setExportFormat] = useState<"xlsx" | "csv" | "json">("xlsx");

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
        setIsScanning(true);
        setErrorMessage("");
        setProgress(0);

        try {
            const pdfjsLib = await import("pdfjs-dist");
            const workerUrl = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
            pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

            const XLSX = await import("xlsx");

            const arrayBuffer = await file.arrayBuffer();
            const loadingTask = pdfjsLib.getDocument({
                data: new Uint8Array(arrayBuffer),
                useWorkerFetch: true,
                isEvalSupported: false
            });

            const pdfDoc = await loadingTask.promise;
            const numPages = pdfDoc.numPages;
            const allRows: string[][] = [];

            // Heuristic for row clustering
            const ROW_THRESHOLD = 5; // Pixels

            for (let i = 1; i <= numPages; i++) {
                setProgress(Math.round((i / numPages) * 100));

                const page = await pdfDoc.getPage(i);
                const textContent = await page.getTextContent();
                const items = textContent.items as unknown as { transform: number[]; str: string; width: number; height: number }[];

                if (items.length === 0) continue;

                // 1. Group items by Y coordinate with clustering
                const sortedItems = [...items].sort((a, b) => b.transform[5] - a.transform[5]);
                const clusteredRows: { y: number; items: typeof items }[] = [];

                sortedItems.forEach(item => {
                    const y = item.transform[5];
                    const foundRow = clusteredRows.find(r => Math.abs(r.y - y) < ROW_THRESHOLD);
                    
                    if (foundRow) {
                        foundRow.items.push(item);
                        // Update average Y for the cluster
                        foundRow.y = (foundRow.y + y) / 2;
                    } else {
                        clusteredRows.push({ y, items: [item] });
                    }
                });

                // 2. Statistics for dynamic column gap detection
                const xGaps: number[] = [];
                clusteredRows.forEach(row => {
                    const rowItems = row.items.sort((a, b) => a.transform[4] - b.transform[4]);
                    for (let j = 0; j < rowItems.length - 1; j++) {
                        const gap = rowItems[j+1].transform[4] - (rowItems[j].transform[4] + rowItems[j].width);
                        if (gap > 2) xGaps.push(gap);
                    }
                });

                // Determine gap threshold based on median of positive gaps, or fallback to fixed
                const sortedGaps = xGaps.sort((a, b) => a - b);
                const medianGap = sortedGaps.length > 0 ? sortedGaps[Math.floor(sortedGaps.length / 2)] : 5;
                const dynamicThreshold = Math.max(medianGap * 3, 20); // Heuristic multiplier

                // 3. Process each row into cells
                clusteredRows.forEach(row => {
                    const rowItems = row.items.sort((a, b) => a.transform[4] - b.transform[4]);
                    const cells: string[] = [];
                    let currentCell = "";
                    let lastXRight = -1;

                    rowItems.forEach(item => {
                        const x = item.transform[4];
                        const text = item.str.trim();
                        if (!text) return;

                        if (lastXRight !== -1 && (x - lastXRight) > dynamicThreshold) {
                            cells.push(currentCell.trim());
                            currentCell = text;
                        } else {
                            currentCell += (currentCell ? (x - lastXRight < 2 ? "" : " ") : "") + text;
                        }
                        lastXRight = x + item.width;
                    });

                    if (currentCell.trim()) {
                        cells.push(currentCell.trim());
                    }

                    if (cells.length > 0) {
                        allRows.push(cells);
                    }
                });

                (page as { cleanup?: () => void }).cleanup?.();
            }

            if (allRows.length === 0) {
                throw new Error("No text or tables found in this PDF. It might be a scanned image.");
            }

            setExtractedData(allRows.slice(0, 50)); // More preview rows

            // Create Workbook
            const ws = XLSX.utils.aoa_to_sheet(allRows);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "extracted_data");

            // Store different formats in blobs
            const xlsxBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
            const csvContent = XLSX.utils.sheet_to_csv(ws);
            const jsonContent = JSON.stringify(allRows, null, 2);

            const blobs = {
                xlsx: new Blob([xlsxBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }),
                csv: new Blob([csvContent], { type: "text/csv" }),
                json: new Blob([jsonContent], { type: "application/json" })
            };

            setResultBlob(blobs.xlsx); // Default to xlsx for initial state
            (window as Window & { _blobs?: Record<string, Blob> })._blobs = blobs; // Temporary storage for format switching

            setStatus("success");
            setIsScanning(false);

            if (file) {
                addToHistory("PDF to Excel", file.name, `Converted ${allRows.length} rows`);
            }

            await pdfDoc.destroy();
        } catch (error) {
            console.error(error);
            setErrorMessage(error instanceof Error ? error.message : "Conversion failed");
            setStatus("error");
            setIsScanning(false);
        }
    };

    const handleFormatChange = (format: "xlsx" | "csv" | "json") => {
        setExportFormat(format);
        const blobs = (window as Window & { _blobs?: Record<string, Blob> })._blobs;
        if (blobs && blobs[format]) {
            setResultBlob(blobs[format]);
        }
    };

    const handleDownload = () => {
        if (!resultBlob) return;
        const extension = exportFormat === "xlsx" ? "xlsx" : exportFormat === "csv" ? "csv" : "json";
        const url = URL.createObjectURL(resultBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = file?.name.replace(/\.pdf$/i, "." + extension) || "data." + extension;
        link.click();
        URL.revokeObjectURL(url);
    };

    const reset = () => {
        setFile(null);
        setStatus("idle");
        setResultBlob(null);
        setErrorMessage("");
        setProgress(0);
        setExtractedData([]);
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
                                title="PDF to Excel"
                                description="Extract tables and data from PDF files to Excel spreadsheets."
                                icon={FileDown}
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
                                    <p className="text-gray-400 text-sm font-medium">Best results with PDFs containing tables</p>
                                </div>

                                {file && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mt-8 flex flex-col items-center"
                                    >
                                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl w-full max-w-md">
                                            <div className="p-3 bg-white rounded-xl shadow-sm">
                                                <FileText className="w-6 h-6 text-green-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold truncate">{file.name}</p>
                                                <p className="text-sm text-gray-400 font-medium">{formatFileSize(file.size)}</p>
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleConvert}
                                            className="mt-8 btn-primary text-xl py-5 px-16 flex items-center gap-3 shadow-2xl shadow-black/10 group hover:scale-[1.02] transition-all font-bold"
                                        >
                                            Convert to Excel
                                            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </motion.div>
                                )}
                            </ToolCard>

                            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                                {[
                                    { label: "100% Free", desc: "No hidden fees" },
                                    { label: "Private", desc: "Files stay on device" },
                                    { label: "Fast", desc: "Instant processing" },
                                ].map((feature) => (
                                    <div key={feature.label} className="p-4 bg-white/50 backdrop-blur-sm rounded-2xl border border-white/20">
                                        <div className="font-bold text-lg mb-1">{feature.label}</div>
                                        <div className="text-gray-400 text-sm font-medium">{feature.desc}</div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {status === "processing" && (
                        <div className="relative">
                            <ProcessingState
                                title="Converting to Excel..."
                                description="Analyzing document structure and extracting tables..."
                                progress={progress}
                            />
                            {isScanning && (
                                <motion.div 
                                    initial={{ top: "0%" }}
                                    animate={{ top: "100%" }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    className="absolute left-0 right-0 h-1 bg-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.5)] z-20"
                                />
                            )}
                        </div>
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
                                <h2 className="text-3xl font-bold mb-2">Conversion Complete!</h2>
                                <p className="text-gray-500">Your PDF has been converted to Excel format.</p>
                            </div>

                            {extractedData.length > 0 && (
                                <div className="bg-white rounded-4xl border border-gray-100 p-8 shadow-2xl mb-8 overflow-hidden relative">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                                                <Table className="w-5 h-5 text-green-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg">Smart Data Preview</h3>
                                                <p className="text-sm text-gray-400">Heuristic table detection active</p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100">
                                            {(["xlsx", "csv", "json"] as const).map((fmt) => (
                                                <button
                                                    key={fmt}
                                                    onClick={() => handleFormatChange(fmt)}
                                                    className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                                                        exportFormat === fmt 
                                                        ? "bg-white text-black shadow-sm border border-gray-100" 
                                                        : "text-gray-400 hover:text-gray-600"
                                                    }`}
                                                >
                                                    {fmt.toUpperCase()}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="overflow-x-auto rounded-xl border border-gray-100 max-h-[400px]">
                                        <table className="min-w-full text-sm border-collapse">
                                            <thead className="sticky top-0 bg-gray-50 z-10">
                                                <tr>
                                                    {extractedData[0]?.map((_, i) => (
                                                        <th key={i} className="px-4 py-3 text-left font-bold text-gray-400 border-b border-gray-100 uppercase text-[10px] tracking-wider">
                                                            Col {i + 1}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {extractedData.map((row, i) => (
                                                    <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                                                        {row.map((cell, j) => (
                                                            <td key={j} className={`px-4 py-3 border-b border-gray-50 max-w-48 truncate ${i === 0 ? "font-bold text-black" : "text-gray-600 font-medium"}`}>
                                                                {cell}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="mt-4 flex items-center justify-between text-xs text-gray-400 font-medium">
                                        <span>Previewing up to 50 rows</span>
                                        <span>Total rows extracted: {extractedData.length}</span>
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <button onClick={handleDownload} className="btn-primary py-5 px-12 flex items-center gap-3 text-xl shadow-xl shadow-black/10 transition-transform hover:scale-105 active:scale-95 group">
                                    <Download className="w-6 h-6 group-hover:animate-bounce" />
                                    Download .{exportFormat.toUpperCase()}
                                </button>
                                <button onClick={reset} className="btn-outline py-5 px-12 flex items-center gap-3 text-xl transition-transform hover:scale-105 active:scale-95">
                                    <RefreshCw className="w-6 h-6" />
                                    Start Over
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

                <EducationalContent
                    howItWorks={{
                        title: "How to Convert PDF to Excel",
                        steps: [
                            "Upload any PDF containing tables or structured data.",
                            "Our smart engine detects rows, columns, and tabular structures automatically.",
                            "Review the data preview and download as Excel (.xlsx), CSV, or JSON."
                        ]
                    }}
                    benefits={{
                        title: "Unlock Your Data",
                        items: [
                            { title: "Smart Table Detection", desc: "We use advanced heuristic algorithms to accurately identify tables, even without visible borders." },
                            { title: "Multiple Formats", desc: "Export your data to Excel for analysis, CSV for databases, or JSON for developers." },
                            { title: "Privacy First", desc: "Processing happens on your device. We don't see your sensitive financial or business data." },
                            { title: "Instant Preview", desc: "See exactly what data will be extracted before you download, ensuring 100% accuracy." }
                        ]
                    }}
                    faqs={[
                        {
                            question: "Do I need to highlight the tables manually?",
                            answer: "No! Our tool automatically scans the document structure to find and extract tabular data for you."
                        },
                        {
                            question: "Can I convert bank statements?",
                            answer: "Yes, this tool is perfect for bank statements, invoices, and reports. Since files stay on your device, it's completely secure."
                        },
                        {
                            question: "What if my PDF is a scanned image?",
                            answer: "If your PDF is just an image (no selectable text), try our 'OCR PDF' tool first to make the text recognizing, then use this tool."
                        }
                    ]}
                />
            </div>
        </div>
    );
}

import { EducationalContent } from "@/components/EducationalContent";
