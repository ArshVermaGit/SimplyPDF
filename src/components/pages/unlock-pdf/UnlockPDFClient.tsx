"use client";

export const dynamic = "force-dynamic";

import { PageInfo } from "@/types";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  File,
  Download,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  Key,
  Unlock,
  Shield,
  ArrowRight,
  Lock,
} from "lucide-react";
import {
  formatFileSize,
  uint8ArrayToBlob,
  unlockPDFWithFallback,
} from "@/lib/pdf-utils";
import { PDFPreviewModal } from "@/components/pdf/PDFPreviewModal";
import {
  AnimatedBackground,
  FloatingDecorations,
  ToolHeader,
  ToolCard,
  ProcessingState,
} from "@/components/ui/ToolPageElements";
import { EducationalContent } from "@/components/layout/EducationalContent";
import { useHistory } from "@/context/HistoryContext";

export function UnlockPDFClient() {
  const { addToHistory } = useHistory();
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "ready" | "processing" | "success" | "error"
  >("idle");
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [pages, setPages] = useState<PageInfo[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewPage, setPreviewPage] = useState(0);
  const [customFileName, setCustomFileName] = useState("unlocked.pdf");

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

  const loadPages = async (pdfFile: File, userPwd?: string) => {
    setStatus("loading");
    setErrorMessage("");
    setPages([]);
    try {
      const pdfjsLib = await import("pdfjs-dist");
      const workerUrl = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
      pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

      const arrayBuffer = await pdfFile.arrayBuffer();
      const loadingParams: {
        data: Uint8Array;
        useWorkerFetch: boolean;
        isEvalSupported: boolean;
        password?: string;
      } = {
        data: new Uint8Array(arrayBuffer),
        useWorkerFetch: true,
        isEvalSupported: false,
      };

      if (userPwd) {
        loadingParams.password = userPwd;
      }

      const loadingTask = pdfjsLib.getDocument(loadingParams);

      loadingTask.onPassword = () => {
        // If it asks for password during preview, we pause and wait for user
        setStatus("ready");
      };

      const pdfDoc = await loadingTask.promise;
      const numPages = pdfDoc.numPages;

      const pageInfos: PageInfo[] = [];
      const previewLimit = Math.min(numPages, 5);
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
      setCustomFileName(`unlocked_${pdfFile.name}`);
      setStatus("ready");
      await pdfDoc.destroy();
    } catch (error: unknown) {
      console.error("PDF loading error:", error);
      if (
        error instanceof Error &&
        (error.name === "PasswordException" ||
          error.message.includes("password"))
      ) {
        setCustomFileName(`unlocked_${pdfFile.name}`);
        setStatus("ready");
      } else {
        const msg = error instanceof Error ? error.message : "Unknown error";
        setErrorMessage(`Failed to load PDF: ${msg}`);
        setStatus("error");
      }
    }
  };

  const handleUnlock = async () => {
    if (!file) return;
    setStatus("processing");
    setErrorMessage("");

    try {
      const pdfBytes = await unlockPDFWithFallback(file, password);
      const blob = uint8ArrayToBlob(pdfBytes);
      setResultBlob(blob);
      setStatus("success");

      addToHistory("Unlocked PDF", file.name, "Security restrictions removed");
    } catch (error: unknown) {
      console.error(error);
      const msg =
        error instanceof Error ? error.message : "Failed to unlock PDF";
      if (msg.toLowerCase().includes("password")) {
        setErrorMessage(
          "Incorrect password or unsupported encryption. Please verify the password and try again."
        );
      } else {
        setErrorMessage(
          "Failed to process this PDF. It might be heavily corrupted or use an incompatible security layer."
        );
      }
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
    setStatus("idle");
    setResultBlob(null);
    setPages([]);
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
                title="Unlock PDF"
                description="Remove password protection and restrictions from your PDF files instantly."
                icon={Unlock}
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
                    Drop your protected PDF here
                  </p>
                  <p className="text-sm text-gray-400">or click to browse</p>
                </div>
              </ToolCard>
            </motion.div>
          )}

          {status === "loading" && (
            <ProcessingState
              message="Analyzing security..."
              description="Checking encryption levels..."
            />
          )}

          {status === "ready" && (
            <motion.div
              key="ready"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mx-auto max-w-6xl"
            >
              <div className="grid items-stretch gap-8 lg:grid-cols-12">
                {/* Left: Preview/Locked Area */}
                <div className="lg:col-span-12">
                  <ToolCard className="flex flex-col items-center p-8">
                    <div className="relative mb-8 h-32 w-32">
                      <div className="absolute inset-0 flex items-center justify-center rounded-[40px] bg-black/5">
                        <File className="h-12 w-12 text-gray-300" />
                      </div>
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="absolute -right-2 -bottom-2 flex h-12 w-12 items-center justify-center rounded-2xl border-4 border-white bg-black text-white shadow-xl"
                      >
                        <Lock className="h-5 w-5" />
                      </motion.div>
                    </div>

                    <h2 className="mb-2 text-2xl font-bold text-gray-900">
                      {file?.name}
                    </h2>
                    <p className="mb-10 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                      {formatFileSize(file?.size || 0)} • PROTECTED DOCUMENT
                    </p>

                    <div className="w-full max-w-md space-y-4">
                      <div className="group relative">
                        <Key className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-black" />
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleUnlock();
                          }}
                          placeholder="Enter Password (if known)"
                          className="w-full rounded-2xl border-2 border-transparent bg-gray-50 py-4 pr-4 pl-11 font-medium transition-all outline-none focus:border-black focus:ring-4 focus:ring-black/5"
                        />
                        {password && pages.length === 0 && (
                          <button
                            onClick={() => file && loadPages(file, password)}
                            className="absolute top-1/2 right-3 -translate-y-1/2 rounded-xl bg-black px-3 py-1.5 text-[10px] font-bold text-white transition-colors hover:bg-gray-800"
                          >
                            LOAD PREVIEW
                          </button>
                        )}
                      </div>

                      <div className="flex gap-3 rounded-xl border border-orange-100 bg-orange-50 p-4">
                        <AlertCircle className="h-5 w-5 shrink-0 text-orange-500" />
                        <p className="text-xs leading-relaxed font-medium text-orange-700">
                          SimplyPDF will attempt to remove printing, copying,
                          and standard owner restrictions. User passwords are
                          required for full decryption of strongly encrypted
                          files.
                        </p>
                      </div>

                      <div className="flex gap-4 pt-4">
                        <button
                          onClick={reset}
                          className="btn-outline flex-1 rounded-2xl py-4 font-bold"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleUnlock}
                          className="btn-primary group flex flex-2 items-center justify-center gap-2 rounded-2xl py-4 shadow-xl shadow-black/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                          <Unlock className="h-5 w-5 transition-transform group-hover:rotate-12" />
                          <span className="font-bold">Unlock PDF</span>
                          <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                        </button>
                      </div>
                    </div>
                  </ToolCard>
                </div>
              </div>
            </motion.div>
          )}

          {status === "processing" && (
            <ProcessingState
              message="Decrypting document..."
              description="Bypassing restrictions safely..."
            />
          )}

          {status === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-auto max-w-4xl"
            >
              <div className="mb-12 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-black text-white shadow-xl shadow-black/10"
                >
                  <CheckCircle2 className="h-10 w-10" />
                </motion.div>
                <h2 className="mb-2 text-4xl font-black text-gray-900">
                  Access Restored!
                </h2>
                <p className="text-lg font-medium text-gray-500">
                  Your PDF is now completely unlocked and ready.
                </p>
              </div>

              <ToolCard className="mx-auto max-w-2xl p-10 shadow-2xl">
                <div className="flex flex-col items-center gap-8">
                  <div className="grid w-full grid-cols-2 gap-4">
                    <div className="rounded-2xl bg-gray-50 p-6 text-center">
                      <Unlock className="mx-auto mb-3 h-6 w-6 text-emerald-500" />
                      <p className="mb-1 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                        Restrictions
                      </p>
                      <p className="font-bold text-gray-900">REMOVED</p>
                    </div>
                    <div className="rounded-2xl bg-gray-50 p-6 text-center">
                      <Shield className="mx-auto mb-3 h-6 w-6 text-emerald-500" />
                      <p className="mb-1 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                        Security
                      </p>
                      <p className="font-bold text-gray-900">CLEAN</p>
                    </div>
                  </div>

                  <div className="h-px w-full bg-gray-100" />

                  <div className="w-full space-y-4">
                    <button
                      onClick={handleDownload}
                      className="btn-primary group flex w-full items-center justify-center gap-3 rounded-2xl py-5 text-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <Download className="h-6 w-6 transition-transform group-hover:translate-y-0.5" />
                      <span className="font-bold">Download Unlocked PDF</span>
                    </button>
                    <button
                      onClick={reset}
                      className="btn-outline flex w-full items-center justify-center gap-3 rounded-2xl py-5 text-lg transition-all"
                    >
                      <RefreshCw className="h-5 w-5" />
                      Unlock New
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
              className="mx-auto flex max-w-lg flex-col items-center justify-center py-24 text-center"
            >
              <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-red-600">
                <AlertCircle className="h-10 w-10" />
              </div>
              <h2 className="mb-2 text-3xl font-bold">Unlock failed</h2>
              <p className="mb-10 text-gray-500">{errorMessage}</p>

              <button
                onClick={reset}
                className="btn-primary flex items-center gap-2 px-10 py-4"
              >
                <RefreshCw className="h-5 w-5" />
                Try Again
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <EducationalContent
          howItWorks={{
            title: "How to Unlock PDF",
            steps: [
              "Upload your password-protected or restricted PDF document.",
              "Enter the document password if you know it. For restricted files, we can often bypass them without a password.",
              "SimplyPDF will recreate the document without encryption. Download your fully accessible PDF instantly.",
            ],
          }}
          benefits={{
            title: "Seamless PDF Decryption",
            items: [
              {
                title: "Remove Restrictions",
                desc: "Easily remove printing, copying, and editing restrictions from any PDF.",
              },
              {
                title: "Local Decryption",
                desc: "All decryption happens right in your browser. Your sensitive files never leave your side.",
              },
              {
                title: "Universal Access",
                desc: "Regain access to important documents across all your devices without hassle.",
              },
              {
                title: "No Data Loss",
                desc: "We ensure your document structure, images, and text remain 100% intact.",
              },
            ],
          }}
          faqs={[
            {
              question: "Can you unlock any PDF?",
              answer:
                "Currently, we excel at removing 'Owner' passwords (restrictions on printing/copying). For 'User' passwords (opening the file), you must provide the password so we can decrypt it locally.",
            },
            {
              question: "Is it legal to unlock a PDF?",
              answer:
                "Yes, as long as you have the legal right to access the content. This tool is designed to help owners who have lost passwords or need to bypass standard restrictions.",
            },
            {
              question: "How long does it take?",
              answer:
                "Unlock happens in seconds. Since the processing is done locally on your machine, it's virtually instant once the file is ready.",
            },
          ]}
        />
      </div>

      {/* Preview Modal (Available after success or if previews loaded) */}
      <PDFPreviewModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        images={pages.map((p) => p.image)}
        currentPage={previewPage}
        onPageChange={setPreviewPage}
        title="Unlock PDF Preview"
      />
    </div>
  );
}
