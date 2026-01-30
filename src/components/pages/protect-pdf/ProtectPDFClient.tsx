"use client";

export const dynamic = "force-dynamic";

import { PageInfo } from "@/types";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  File,
  Download,
  RefreshCw,
  AlertCircle,
  Shield,
  Lock,
  ArrowRight,
  Zap,
  Printer,
  Copy,
  Edit,
  Maximize2,
} from "lucide-react";
import { formatFileSize, uint8ArrayToBlob, protectPDF } from "@/lib/pdf-utils";
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
import Image from "next/image";

export function ProtectPDFClient() {
  const { addToHistory } = useHistory();
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "ready" | "processing" | "success" | "error"
  >("idle");
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
    annotating: false,
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
        isEvalSupported: false,
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
      setErrorMessage(
        "Passwords do not match. Please ensure both passwords are identical."
      );
      setStatus("error");
      return;
    }

    if (password.length < 4) {
      setErrorMessage(
        "Security notice: Password must be at least 4 characters long for adequate protection."
      );
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
        annotating: permissions.annotating,
      });

      const blob = uint8ArrayToBlob(pdfBytes);
      setResultBlob(blob);
      setStatus("success");

      addToHistory(
        "Protected PDF",
        file.name,
        "Added security restrictions and encryption"
      );
    } catch (error: unknown) {
      console.error(error);
      const msg =
        error instanceof Error ? error.message : "Failed to protect PDF";
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
      annotating: false,
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
                title="Protect PDF"
                description="Secure your documents with strong encryption and granular access controls."
                icon={Shield}
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
                  <p className="mb-2 text-lg font-medium">Drop your PDF here</p>
                  <p className="text-sm text-gray-400">or click to browse</p>
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
              className="mx-auto max-w-6xl"
            >
              <div className="grid items-start gap-8 lg:grid-cols-12">
                {/* Left: Preview & File Info */}
                <div className="space-y-6 lg:col-span-4">
                  <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xl">
                    <div className="group relative mb-6 aspect-3/4 overflow-hidden rounded-2xl border border-gray-100">
                      {pages[0] && (
                        <Image
                          src={pages[0].image}
                          alt="Preview"
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      )}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/40 group-hover:opacity-100">
                        <button
                          onClick={() => setPreviewOpen(true)}
                          className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-black"
                        >
                          <Maximize2 className="h-6 w-6" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
                          <File className="h-5 w-5 text-gray-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-bold text-gray-900">
                            {file?.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatFileSize(file?.size || 0)}
                          </p>
                        </div>
                      </div>
                      <div className="h-px bg-gray-50" />
                      <button
                        onClick={reset}
                        className="w-full py-3 text-sm font-bold text-gray-400 transition-colors hover:text-red-500"
                      >
                        Select different file
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right: Security Settings */}
                <div className="space-y-6 lg:col-span-8">
                  <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-xl">
                    <h3 className="mb-8 text-xl font-bold text-gray-900">
                      Security Configuration
                    </h3>

                    <div className="space-y-8">
                      {/* Password Section */}
                      <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                          <label className="px-1 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                            Access Password
                          </label>
                          <div className="group relative">
                            <Lock className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-black" />
                            <input
                              type="password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="Set security password"
                              className="w-full rounded-2xl border-2 border-transparent bg-gray-50 py-4 pr-4 pl-11 text-sm font-medium transition-all outline-none focus:border-black focus:ring-4 focus:ring-black/5"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="px-1 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                            Confirm Password
                          </label>
                          <div className="group relative">
                            <Lock className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-black" />
                            <input
                              type="password"
                              value={confirmPassword}
                              onChange={(e) =>
                                setConfirmPassword(e.target.value)
                              }
                              placeholder="Re-enter password"
                              className="w-full rounded-2xl border-2 border-transparent bg-gray-50 py-4 pr-4 pl-11 text-sm font-medium transition-all outline-none focus:border-black focus:ring-4 focus:ring-black/5"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Permissions Section */}
                      <div>
                        <label className="mb-4 block px-1 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                          Document Permissions
                        </label>
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                          {[
                            {
                              id: "printing",
                              icon: Printer,
                              label: "Printing",
                            },
                            { id: "copying", icon: Copy, label: "Copying" },
                            { id: "modifying", icon: Edit, label: "Editing" },
                            {
                              id: "annotating",
                              icon: Zap,
                              label: "Annotating",
                            },
                          ].map((perm) => (
                            <button
                              key={perm.id}
                              onClick={() =>
                                setPermissions((prev) => ({
                                  ...prev,
                                  [perm.id]:
                                    !prev[perm.id as keyof typeof prev],
                                }))
                              }
                              className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition-all ${
                                permissions[perm.id as keyof typeof permissions]
                                  ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                                  : "border-gray-100 text-gray-400 grayscale hover:grayscale-0"
                              }`}
                            >
                              <perm.icon className="h-5 w-5" />
                              <span className="text-[10px] font-bold tracking-tighter uppercase">
                                {perm.label}
                              </span>
                              <div
                                className={`relative mt-1 h-4 w-8 rounded-full transition-colors ${
                                  permissions[
                                    perm.id as keyof typeof permissions
                                  ]
                                    ? "bg-emerald-500"
                                    : "bg-gray-200"
                                }`}
                              >
                                <div
                                  className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition-all ${
                                    permissions[
                                      perm.id as keyof typeof permissions
                                    ]
                                      ? "left-4.5"
                                      : "left-0.5"
                                  }`}
                                />
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="px-1 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                          Output Filename
                        </label>
                        <input
                          type="text"
                          value={customFileName}
                          onChange={(e) => setCustomFileName(e.target.value)}
                          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium transition-all focus:ring-2 focus:ring-black focus:outline-none"
                        />
                      </div>

                      <button
                        onClick={handleProtect}
                        disabled={!password || password !== confirmPassword}
                        className="btn-primary group flex w-full items-center justify-center gap-2 rounded-2xl py-5 shadow-xl shadow-black/10 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:grayscale"
                      >
                        <Shield className="h-5 w-5 transition-transform group-hover:scale-110" />
                        <span className="text-base font-bold">
                          Protect this PDF
                        </span>
                        <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
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
              className="mx-auto max-w-4xl"
            >
              <div className="mb-12 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[32px] bg-black text-white shadow-xl shadow-black/20"
                >
                  <Shield className="h-10 w-10 fill-white" />
                </motion.div>
                <h2 className="mb-2 text-4xl font-black text-gray-900">
                  PDF Fully Secured!
                </h2>
                <p className="text-lg font-medium text-gray-500">
                  Your document is now encrypted and ready for sharing.
                </p>
              </div>

              <ToolCard className="mx-auto max-w-2xl p-10 shadow-2xl">
                <div className="flex flex-col items-center gap-8">
                  <div className="flex w-full items-center gap-6 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
                      <Lock className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">
                        Strong Encryption Applied
                      </p>
                      <p className="text-xs font-medium text-emerald-700">
                        Document is now protected with AES-256 standard
                      </p>
                    </div>
                  </div>

                  <div className="w-full space-y-4">
                    <button
                      onClick={handleDownload}
                      className="btn-primary group flex w-full items-center justify-center gap-3 rounded-2xl py-5 text-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <Download className="h-6 w-6 transition-transform group-hover:translate-y-0.5" />
                      <span className="font-bold">Download Protected PDF</span>
                    </button>
                    <button
                      onClick={reset}
                      className="btn-outline flex w-full items-center justify-center gap-3 rounded-2xl py-5 text-lg transition-all"
                    >
                      <RefreshCw className="h-5 w-5" />
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
              className="mx-auto flex max-w-lg flex-col items-center justify-center py-24 text-center"
            >
              <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-red-600">
                <AlertCircle className="h-10 w-10" />
              </div>
              <h2 className="mb-2 text-3xl font-bold">Action needed</h2>
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
            title: "How to Protect PDF",
            steps: [
              "Upload your document to our secure local workspace.",
              "Set your strong password and configure granular permissions like printing and copying.",
              "SimplyPDF will encrypt your file using industry-standard protocols. Download the secured version instantly.",
            ],
          }}
          benefits={{
            title: "Enterprise-Grade Document Security",
            items: [
              {
                title: "AES-256 Encryption",
                desc: "We use standard military-grade encryption to ensure your data remains completely private.",
              },
              {
                title: "Granular Permissions",
                desc: "Control exactly who can print, copy, or edit your document with precision.",
              },
              {
                title: "Zero Data Leakage",
                desc: "By processing everything in your browser, your sensitive data NEVER leaves your computer.",
              },
              {
                title: "Smart Filenames",
                desc: "Automatically suggests secure naming conventions for your protected files.",
              },
            ],
          }}
          faqs={[
            {
              question: "How secure is my password?",
              answer:
                "Your password is never sent to our servers. We use it locally to generate the encryption keys required to lock your PDF document.",
            },
            {
              question: "What if I forget my password?",
              answer:
                "Since SimplyPDF does not store your passwords, we cannot recover them. Please ensure you keep a safe record of your document passwords.",
            },
            {
              question: "Will the PDF work in all readers?",
              answer:
                "Yes, we use standard PDF security features that are recognized by all major readers including Adobe Acrobat, Chrome, and Apple Preview.",
            },
          ]}
        />
      </div>

      {/* Preview Modal */}
      <PDFPreviewModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        images={pages.map((p) => p.image)}
        currentPage={previewPage}
        onPageChange={setPreviewPage}
        onDownload={handleProtect}
        title="Protect PDF Preview"
      />
    </div>
  );
}
