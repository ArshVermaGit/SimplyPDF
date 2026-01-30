"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  Wrench,
  Download,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { repairPDF } from "@/lib/pdf/enhance";
import {
  AnimatedBackground,
  FloatingDecorations,
  ToolHeader,
  ToolCard,
  ProcessingState,
} from "@/components/ui/ToolPageElements";
import { useHistory } from "@/context/HistoryContext";
import { downloadFile, formatFileSize } from "@/lib/pdf-utils";

export function RepairPDFClient() {
  const { addToHistory } = useHistory();
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<
    "idle" | "loading" | "processing" | "success" | "error"
  >("idle");
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
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const repairedBytes = await repairPDF(pdfFile);
      setProcessedPdf(repairedBytes);
      setStatus("success");

      addToHistory(
        "Repair PDF",
        pdfFile.name,
        `Repaired ${formatFileSize(repairedBytes.length)}`
      );
    } catch (error) {
      console.error(error);
      setErrorMessage(
        "Failed to repair PDF. The file might be severely corrupted."
      );
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
    <div className="relative min-h-[calc(100vh-80px)] overflow-hidden pt-24 pb-16">
      <AnimatedBackground />
      <FloatingDecorations />

      <div className="relative z-10 container mx-auto px-4">
        <AnimatePresence mode="wait">
          {status === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mx-auto max-w-4xl"
            >
              <ToolHeader
                title="Repair PDF"
                description="Recover data from corrupted or damaged PDF files using advanced structural analysis."
                icon={Wrench}
              />

              <ToolCard className="p-8">
                <div
                  className={`drop-zone active:border-black ${dragActive ? "active" : ""}`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
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
                  <Upload className="mb-4 h-12 w-12 text-gray-400" />
                  <p className="mb-2 text-lg font-medium">
                    Drop your damaged PDF here
                  </p>
                  <p className="text-sm text-gray-400">or click to browse</p>
                </div>
              </ToolCard>
            </motion.div>
          )}

          {(status === "loading" || status === "processing") && (
            <ProcessingState
              title={
                status === "loading"
                  ? "Analyzing Structure..."
                  : "Repairing PDF..."
              }
              description="Rebuilding internal cross-reference tables and recovering content..."
            />
          )}

          {status === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-auto max-w-lg text-center"
            >
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-50 text-green-600 shadow-xl">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h2 className="mb-2 text-3xl font-bold">
                File Repaired Successfully!
              </h2>
              <p className="mb-8 text-gray-500">
                Your PDF has been reconstructed and is ready for download.
              </p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleDownload}
                  className="btn-primary flex items-center justify-center gap-2 px-8 py-4 shadow-lg shadow-green-900/10"
                >
                  <Download className="h-5 w-5" />
                  Download Repaired PDF
                </button>
                <button
                  onClick={reset}
                  className="btn-ghost flex items-center justify-center gap-2 py-3 text-gray-500 hover:text-black"
                >
                  <RefreshCw className="h-4 w-4" />
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
              className="mx-auto max-w-lg text-center"
            >
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-red-500">
                <AlertCircle className="h-10 w-10" />
              </div>
              <h2 className="mb-2 text-3xl font-bold">Repair Failed</h2>
              <p className="mb-8 text-gray-500">{errorMessage}</p>

              <button
                onClick={reset}
                className="btn-primary flex w-full items-center justify-center gap-2 px-8 py-4"
              >
                <RefreshCw className="h-5 w-5" />
                Try Another File
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
