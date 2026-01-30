"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  Download,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  ArrowRight,
  Table as TableIcon,
} from "lucide-react";
import { formatFileSize, uint8ArrayToBlob } from "@/lib/pdf-utils";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import {
  AnimatedBackground,
  FloatingDecorations,
  ToolHeader,
  ToolCard,
  ProcessingState,
} from "@/components/ui/ToolPageElements";
import { useHistory } from "@/context/HistoryContext";
import { EducationalContent } from "@/components/layout/EducationalContent";

export function ExcelToPDFClient() {
  const { addToHistory } = useHistory();
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<
    "idle" | "processing" | "success" | "error"
  >("idle");
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const droppedFile = e.dataTransfer.files[0];
    if (
      droppedFile &&
      (droppedFile.name.endsWith(".xlsx") ||
        droppedFile.name.endsWith(".xls") ||
        droppedFile.name.endsWith(".csv"))
    ) {
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
    setProgress(10);

    try {
      const XLSX = await import("xlsx");
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      setProgress(40);

      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const fontSize = 10;
      const margin = 50;

      for (const sheetName of workbook.SheetNames) {
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
        }) as string[][];

        if (data.length === 0) continue;

        let page = pdfDoc.addPage();
        const { width, height } = page.getSize();
        let y = height - margin;

        // Add Sheet Title
        page.drawText(`Sheet: ${sheetName}`, {
          x: margin,
          y: y,
          size: 14,
          font: boldFont,
          color: rgb(0, 0, 0),
        });
        y -= 30;

        // Calculate column widths based on max content length per column
        const colCount = Math.max(...data.map((row) => row.length));
        const colWidths: number[] = new Array(colCount).fill(50); // Min width 50

        // Sample some rows to get better width estimates
        data.slice(0, 10).forEach((row) => {
          row.forEach((cell, idx) => {
            const len = String(cell || "").length * 6;
            if (len > colWidths[idx]) colWidths[idx] = Math.min(len, 200); // Max width 200
          });
        });

        // Adjust colWidths to fit page if they exceed
        const totalWidthNeeded = colWidths.reduce((a, b) => a + b, 0);
        const availableWidth = width - margin * 2;
        if (totalWidthNeeded > availableWidth) {
          const scale = availableWidth / totalWidthNeeded;
          for (let i = 0; i < colWidths.length; i++) colWidths[i] *= scale;
        }

        for (let i = 0; i < data.length; i++) {
          const row = data[i];

          if (y < margin + 20) {
            page = pdfDoc.addPage();
            y = height - margin;
          }

          let currentX = margin;
          for (let j = 0; j < row.length; j++) {
            const cellValue = String(row[j] || "").trim();
            if (cellValue) {
              // Simple clipping/wrapping
              const textToDraw =
                cellValue.length * 6 > colWidths[j]
                  ? cellValue.substring(0, Math.floor(colWidths[j] / 6)) + ".."
                  : cellValue;

              page.drawText(textToDraw, {
                x: currentX,
                y: y,
                size: fontSize,
                font: i === 0 ? boldFont : font,
                color: rgb(0, 0, 0),
              });
            }
            currentX += colWidths[j] + 5; // spacing
            if (currentX > width - margin) break;
          }
          y -= 15;
        }
      }

      setProgress(90);
      const pdfBytes = await pdfDoc.save();
      setResultBlob(uint8ArrayToBlob(pdfBytes));
      setStatus("success");
      setProgress(100);

      addToHistory("Excel to PDF", file.name, "Converted to PDF");
    } catch (error) {
      console.error(error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to convert Excel to PDF"
      );
      setStatus("error");
    }
  };

  const handleDownload = () => {
    if (!resultBlob) return;
    const url = URL.createObjectURL(resultBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download =
      file?.name.replace(/\.(xlsx|xls|csv)$/i, ".pdf") || "document.pdf";
    link.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setFile(null);
    setStatus("idle");
    setResultBlob(null);
    setErrorMessage("");
    setProgress(0);
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
                title="Excel to PDF"
                description="Convert your Excel spreadsheets (.xlsx, .xls, .csv) to high-quality PDF documents."
                icon={TableIcon}
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
                    accept=".xlsx,.xls,.csv"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <Upload className="mb-4 h-12 w-12 text-gray-400" />
                  <p className="mb-2 text-lg font-medium">
                    Drop your spreadsheet here
                  </p>
                  <p className="text-sm font-medium text-gray-400">
                    Supports .xlsx, .xls, and .csv files
                  </p>
                </div>

                {file && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 flex flex-col items-center"
                  >
                    <div className="flex w-full max-w-md items-center gap-4 rounded-2xl bg-gray-50 p-4">
                      <div className="rounded-xl bg-white p-3 shadow-sm">
                        <TableIcon className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-bold">{file.name}</p>
                        <p className="text-sm font-medium text-gray-400">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handleConvert}
                      className="btn-primary group mt-8 flex items-center gap-3 px-16 py-5 text-xl shadow-2xl shadow-black/10 transition-all hover:scale-[1.02]"
                    >
                      Convert to PDF
                      <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-1" />
                    </button>
                  </motion.div>
                )}
              </ToolCard>

              <div className="mt-12 grid grid-cols-1 gap-6 text-center md:grid-cols-3">
                {[
                  {
                    label: "Offline First",
                    desc: "No data leaves your device",
                  },
                  { label: "High Quality", desc: "Perfectly rendered tables" },
                  { label: "All Formats", desc: "XLS, XLSX, CSV supported" },
                ].map((feature) => (
                  <div
                    key={feature.label}
                    className="rounded-2xl border border-white/20 bg-white/50 p-4 backdrop-blur-sm"
                  >
                    <div className="mb-1 text-lg font-bold">
                      {feature.label}
                    </div>
                    <div className="text-sm font-medium text-gray-400">
                      {feature.desc}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {status === "processing" && (
            <ProcessingState
              title="Converting to PDF..."
              description="Processing your spreadsheet data..."
              progress={progress}
            />
          )}

          {status === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-auto flex max-w-lg flex-col items-center justify-center py-24 text-center"
            >
              <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-black text-white">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h2 className="mb-2 text-3xl font-bold">Conversion Complete!</h2>
              <p className="mb-10 text-lg text-gray-500">
                Your spreadsheet has been converted to PDF.
              </p>

              <div className="flex flex-col gap-4 sm:flex-row">
                <button
                  onClick={handleDownload}
                  className="btn-primary flex items-center gap-2 px-10 py-4 text-lg"
                >
                  <Download className="h-5 w-5" />
                  Download PDF
                </button>
                <button
                  onClick={reset}
                  className="btn-outline flex items-center gap-2 px-10 py-4 text-lg"
                >
                  <RefreshCw className="h-5 w-5" />
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
              className="mx-auto flex max-w-lg flex-col items-center justify-center py-24 text-center"
            >
              <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-red-600 shadow-lg shadow-red-100">
                <AlertCircle className="h-12 w-12" />
              </div>
              <h2 className="mb-2 text-3xl font-bold">Something went wrong</h2>
              <p className="mb-10 text-lg text-gray-500">{errorMessage}</p>

              <button
                onClick={reset}
                className="btn-primary flex items-center gap-2 px-10 py-4 text-lg"
              >
                <RefreshCw className="h-5 w-5" />
                Try Again
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <EducationalContent
          howItWorks={{
            title: "How to Convert Excel to PDF",
            steps: [
              "Upload your Excel file (.xlsx, .xls) or CSV document.",
              "Our converter instantly transforms your data into a professional PDF table.",
              "Download your perfectly formatted PDF ready for printing or sharing.",
            ],
          }}
          benefits={{
            title: "Professional Reports Made Simple",
            items: [
              {
                title: "No Uploads",
                desc: "Your data stays private. Conversion happens entirely in your browser.",
              },
              {
                title: "Format Preserved",
                desc: "We maintain the tabular structure and sheet names of your workbook.",
              },
              {
                title: "Completely Free",
                desc: "No watermarks, no registrations, no limits on file size or usage.",
              },
              {
                title: "Shareable Results",
                desc: "PDFs are perfect for sending reports that look the same on every device.",
              },
            ],
          }}
          faqs={[
            {
              question: "Does it support multiple sheets?",
              answer:
                "Yes, our converter processes all sheets in your workbook and includes them in the final PDF.",
            },
            {
              question: "Is my financial data safe?",
              answer:
                "Absolutely. Since the file is processed locally on your computer, no one else can see your data.",
            },
            {
              question: "Can I convert CSV files?",
              answer:
                "Yes, SimplyPDF supports .csv, .xls, and .xlsx formats for automatic conversion to PDF.",
            },
          ]}
        />
      </div>
    </div>
  );
}
