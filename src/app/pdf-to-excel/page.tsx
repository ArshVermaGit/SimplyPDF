"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Download, Loader2, CheckCircle2, RefreshCw, AlertCircle, FileDown, FileText, ArrowRight, Table } from "lucide-react";
import { formatFileSize } from "@/lib/pdf-utils";

export default function PDFToExcelPage() {
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
    const [resultBlob, setResultBlob] = useState<Blob | null>(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [dragActive, setDragActive] = useState(false);
    const [progress, setProgress] = useState(0);
    const [extractedData, setExtractedData] = useState<string[][]>([]);

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
            console.log("Loading pdfjs-dist...");
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

            for (let i = 1; i <= numPages; i++) {
                setProgress(Math.round((i / numPages) * 100));

                const page = await pdfDoc.getPage(i);
                const textContent = await page.getTextContent();

                // Extract text items with positions
                const items = textContent.items as any[];

                // Group by Y position to form rows
                const rows: { [y: number]: { x: number; text: string }[] } = {};

                items.forEach(item => {
                    const y = Math.round(item.transform[5] / 10) * 10; // Round to nearest 10
                    const x = item.transform[4];
                    if (!rows[y]) rows[y] = [];
                    rows[y].push({ x, text: item.str.trim() });
                });

                // Sort rows by Y (top to bottom) and items by X (left to right)
                const sortedYs = Object.keys(rows).map(Number).sort((a, b) => b - a);

                for (const y of sortedYs) {
                    const rowItems = rows[y].sort((a, b) => a.x - b.x);
                    const rowTexts = rowItems.map(item => item.text).filter(t => t);

                    if (rowTexts.length > 0) {
                        // Try to detect columns based on spacing
                        const cells: string[] = [];
                        let currentCell = "";
                        let lastX = 0;

                        for (const item of rowItems) {
                            if (currentCell && item.x - lastX > 50) {
                                cells.push(currentCell.trim());
                                currentCell = item.text;
                            } else {
                                currentCell += (currentCell ? " " : "") + item.text;
                            }
                            lastX = item.x;
                        }

                        if (currentCell.trim()) {
                            cells.push(currentCell.trim());
                        }

                        if (cells.length > 0) {
                            allRows.push(cells);
                        }
                    }
                }
                (page as any).cleanup?.();
            }

            setExtractedData(allRows.slice(0, 20)); // Preview first 20 rows

            // Create Excel workbook
            const ws = XLSX.utils.aoa_to_sheet(allRows);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

            // Generate Excel file
            const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
            const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });

            setResultBlob(blob);
            setStatus("success");
            await pdfDoc.destroy();
        } catch (error: any) {
            console.error(error);
            setErrorMessage(error instanceof Error ? error.message : "Failed to convert PDF to Excel");
            setStatus("error");
        }
    };

    const handleDownload = () => {
        if (!resultBlob) return;
        const url = URL.createObjectURL(resultBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = file?.name.replace(/\.pdf$/i, ".xlsx") || "spreadsheet.xlsx";
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
                                    <FileDown className="w-8 h-8" />
                                </div>
                                <h1 className="text-4xl md:text-5xl font-bold mb-4">PDF to Excel</h1>
                                <p className="text-gray-500 text-lg max-w-xl mx-auto">
                                    Extract tables and data from PDF files to Excel spreadsheets.
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
                                    <p className="text-gray-400 text-sm">Best results with PDFs containing tables</p>
                                </div>

                                {file && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mt-6"
                                    >
                                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                            <div className="flex items-center gap-3">
                                                <FileText className="w-8 h-8 text-red-500" />
                                                <div>
                                                    <p className="font-medium">{file.name}</p>
                                                    <p className="text-sm text-gray-400">{formatFileSize(file.size)}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-6 flex justify-center">
                                            <button
                                                onClick={handleConvert}
                                                className="btn-primary text-lg py-4 px-12 flex items-center gap-3"
                                            >
                                                Convert to Excel
                                                <ArrowRight className="w-5 h-5" />
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
                            <h2 className="text-2xl font-bold mb-2">Converting to Excel...</h2>
                            <p className="text-gray-500 mb-4">Extracting table data...</p>
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
                                <h2 className="text-3xl font-bold mb-2">Conversion Complete!</h2>
                                <p className="text-gray-500">Your PDF has been converted to Excel format.</p>
                            </div>

                            {extractedData.length > 0 && (
                                <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xl mb-8">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Table className="w-5 h-5 text-gray-500" />
                                        <h3 className="font-semibold">Data Preview</h3>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full text-sm">
                                            <tbody>
                                                {extractedData.map((row, i) => (
                                                    <tr key={i} className={i % 2 === 0 ? "bg-gray-50" : ""}>
                                                        {row.map((cell, j) => (
                                                            <td key={j} className="px-3 py-2 border border-gray-200 max-w-48 truncate">
                                                                {cell}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    {extractedData.length >= 20 && (
                                        <p className="text-sm text-gray-400 mt-3 text-center">Showing first 20 rows...</p>
                                    )}
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <button onClick={handleDownload} className="btn-primary py-4 px-10 flex items-center gap-2 justify-center">
                                    <Download className="w-5 h-5" />
                                    Download Excel
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
        </div>
    );
}
