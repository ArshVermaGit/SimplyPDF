"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FileText,
  Download,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  Save,
} from "lucide-react";
import { setPDFMetadata } from "@/lib/pdf/enhance";
import {
  AnimatedBackground,
  FloatingDecorations,
  ToolHeader,
  ToolCard,
  ProcessingState,
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
  const [status, setStatus] = useState<
    "idle" | "editing" | "processing" | "success" | "error"
  >("idle");
  const [processedPdf, setProcessedPdf] = useState<Uint8Array | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const [metadata, setMetadata] = useState<MetadataForm>({
    title: "",
    author: "",
    subject: "",
    keywords: "",
    creator: "SimplyPDF",
    producer: "SimplyPDF",
  });

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.type === "application/pdf") {
      setFile(droppedFile);
      // In a real app we might read existing metadata here
      // For now we start blank or prepopulate based on filename
      setMetadata((prev) => ({
        ...prev,
        title: droppedFile.name.replace(".pdf", ""),
      }));
      setStatus("editing");
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setMetadata((prev) => ({
        ...prev,
        title: selectedFile.name.replace(".pdf", ""),
      }));
      setStatus("editing");
    }
  };

  const handleSave = async () => {
    if (!file) return;
    setStatus("processing");

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const keywordArray = metadata.keywords
        .split(",")
        .map((k) => k.trim())
        .filter((k) => k);

      const newBytes = await setPDFMetadata(file, {
        ...metadata,
        keywords: keywordArray,
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
      producer: "SimplyPDF",
    });
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
                title="Edit Metadata"
                description="View and modify PDF properties like Title, Author, Subject, and Keywords."
                icon={FileText}
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
                    Drop PDF to Edit Metadata
                  </p>
                  <p className="text-sm text-gray-400">or click to browse</p>
                </div>
              </ToolCard>
            </motion.div>
          )}

          {status === "editing" && (
            <motion.div
              key="editing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mx-auto max-w-2xl"
            >
              <ToolCard className="p-8">
                <h3 className="mb-6 flex items-center gap-2 text-xl font-bold">
                  <FileText className="h-5 w-5" />
                  PDF Properties
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Title
                    </label>
                    <input
                      type="text"
                      value={metadata.title}
                      onChange={(e) =>
                        setMetadata({ ...metadata, title: e.target.value })
                      }
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 transition-all outline-none focus:border-black focus:ring-0"
                      placeholder="Document Title"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Author
                      </label>
                      <input
                        type="text"
                        value={metadata.author}
                        onChange={(e) =>
                          setMetadata({ ...metadata, author: e.target.value })
                        }
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 transition-all outline-none focus:border-black focus:ring-0"
                        placeholder="Author Name"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Subject
                      </label>
                      <input
                        type="text"
                        value={metadata.subject}
                        onChange={(e) =>
                          setMetadata({ ...metadata, subject: e.target.value })
                        }
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 transition-all outline-none focus:border-black focus:ring-0"
                        placeholder="Subject"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Keywords
                    </label>
                    <input
                      type="text"
                      value={metadata.keywords}
                      onChange={(e) =>
                        setMetadata({ ...metadata, keywords: e.target.value })
                      }
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 transition-all outline-none focus:border-black focus:ring-0"
                      placeholder="comma, separated, keywords"
                    />
                    <p className="mt-1 text-xs text-gray-400">
                      Separate keywords with commas
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Creator Application
                      </label>
                      <input
                        type="text"
                        value={metadata.creator}
                        onChange={(e) =>
                          setMetadata({ ...metadata, creator: e.target.value })
                        }
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 transition-all outline-none focus:border-black focus:ring-0"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Producer
                      </label>
                      <input
                        type="text"
                        value={metadata.producer}
                        onChange={(e) =>
                          setMetadata({ ...metadata, producer: e.target.value })
                        }
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 transition-all outline-none focus:border-black focus:ring-0"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex gap-3">
                  <button
                    onClick={handleSave}
                    className="btn-primary flex flex-1 items-center justify-center gap-2 py-4"
                  >
                    <Save className="h-5 w-5" />
                    Save Metadata
                  </button>
                  <button
                    onClick={reset}
                    className="btn-ghost px-6 text-gray-500 hover:text-red-500"
                  >
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
              className="mx-auto max-w-lg text-center"
            >
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[32px] bg-black text-white shadow-2xl">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h2 className="mb-2 text-3xl font-bold">Metadata Updated!</h2>
              <p className="mb-8 text-gray-500">
                Your PDF header information has been successfully modified.
              </p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleDownload}
                  className="btn-primary flex items-center justify-center gap-2 px-8 py-4 shadow-lg shadow-black/10"
                >
                  <Download className="h-5 w-5" />
                  Download PDF
                </button>
                <button
                  onClick={reset}
                  className="btn-ghost flex items-center justify-center gap-2 py-3 text-gray-500 hover:text-black"
                >
                  <RefreshCw className="h-4 w-4" />
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
              className="mx-auto max-w-lg text-center"
            >
              <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-[32px] bg-red-50 text-red-500 shadow-sm">
                <AlertCircle className="h-12 w-12" />
              </div>
              <h2 className="mb-2 text-3xl font-bold">Update Failed</h2>
              <p className="mb-8 text-gray-500">{errorMessage}</p>

              <button
                onClick={reset}
                className="btn-primary flex w-full items-center justify-center gap-2 px-8 py-4"
              >
                <RefreshCw className="h-5 w-5" />
                Try Again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
