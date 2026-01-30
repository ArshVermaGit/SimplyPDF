"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  Download,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  FileImage,
  ArrowRight,
  X,
  Plus,
} from "lucide-react";
import { uint8ArrayToBlob } from "@/lib/pdf-utils";
import { PDFDocument } from "pdf-lib";
import {
  AnimatedBackground,
  FloatingDecorations,
  ToolHeader,
  ToolCard,
  ProcessingState,
} from "@/components/ui/ToolPageElements";
import { useHistory } from "@/context/HistoryContext";
import { EducationalContent } from "@/components/layout/EducationalContent";
import Image from "next/image";

interface ImageFile {
  file: File;
  preview: string;
}

export function ImagesToPDFClient() {
  const { addToHistory } = useHistory();
  const [files, setFiles] = useState<ImageFile[]>([]);
  const [status, setStatus] = useState<
    "idle" | "processing" | "success" | "error"
  >("idle");
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;
    const validFiles = Array.from(newFiles).filter((f) =>
      f.type.startsWith("image/")
    );
    const withPreviews = validFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setFiles((prev) => [...prev, ...withPreviews]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const next = [...prev];
      URL.revokeObjectURL(next[index].preview);
      next.splice(index, 1);
      return next;
    });
  };

  const handleConvert = async () => {
    if (files.length === 0) return;
    setStatus("processing");
    setErrorMessage("");
    setProgress(0);

    try {
      const pdfDoc = await PDFDocument.create();

      for (let i = 0; i < files.length; i++) {
        setProgress(Math.round((i / files.length) * 100));
        const imageFile = files[i].file;
        const imageBytes = await imageFile.arrayBuffer();

        let image;
        if (imageFile.type === "image/jpeg" || imageFile.type === "image/jpg") {
          image = await pdfDoc.embedJpg(imageBytes);
        } else if (imageFile.type === "image/png") {
          image = await pdfDoc.embedPng(imageBytes);
        } else {
          // For WebP or others, we might need a canvas to convert to PNG first
          const img = new window.Image();
          img.src = files[i].preview;
          await new Promise((resolve) => {
            img.onload = resolve;
          });
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0);
          const pngData = canvas.toDataURL("image/png").split(",")[1];
          const pngBytes = Uint8Array.from(atob(pngData), (c) =>
            c.charCodeAt(0)
          );
          image = await pdfDoc.embedPng(pngBytes.buffer);
        }

        const page = pdfDoc.addPage([image.width, image.height]);
        page.drawImage(image, {
          x: 0,
          y: 0,
          width: image.width,
          height: image.height,
        });
      }

      const pdfBytes = await pdfDoc.save();
      setResultBlob(uint8ArrayToBlob(pdfBytes));
      setStatus("success");
      setProgress(100);
      addToHistory(
        "Images to PDF",
        `${files.length} images`,
        "Converted to PDF"
      );
    } catch (error) {
      console.error(error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to convert images to PDF"
      );
      setStatus("error");
    }
  };

  const handleDownload = () => {
    if (!resultBlob) return;
    const url = URL.createObjectURL(resultBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "images_converted.pdf";
    link.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    files.forEach((f) => URL.revokeObjectURL(f.preview));
    setFiles([]);
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
                title="Images to PDF"
                description="Combine JPG, PNG, and WebP images into a single high-quality PDF document."
                icon={FileImage}
              />

              <ToolCard className="p-8">
                {files.length === 0 ? (
                  <div
                    className={`drop-zone active:border-black ${dragActive ? "active" : ""}`}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragActive(true);
                    }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={handleDrop}
                    onClick={() =>
                      document.getElementById("file-input")?.click()
                    }
                  >
                    <input
                      id="file-input"
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => handleFiles(e.target.files)}
                    />
                    <Upload className="mb-4 h-12 w-12 text-gray-400" />
                    <p className="mb-2 text-lg font-medium">
                      Drop your images here
                    </p>
                    <p className="text-sm font-medium text-gray-400">
                      Supports JPG, PNG, and WebP
                    </p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                      {files.map((file, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="group relative flex aspect-3/4 items-center justify-center overflow-hidden rounded-xl border border-gray-100 bg-gray-50 p-2"
                        >
                          <Image
                            src={file.preview}
                            alt="preview"
                            fill
                            className="object-contain p-2"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all group-hover:bg-black/40">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeFile(idx);
                              }}
                              className="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition-all group-hover:opacity-100 hover:scale-110"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="absolute right-2 bottom-2 left-2 truncate rounded-lg bg-black/60 px-2 py-1 text-[10px] font-medium text-white opacity-0 backdrop-blur-md transition-opacity group-hover:opacity-100">
                            {file.file.name}
                          </div>
                        </motion.div>
                      ))}
                      <button
                        onClick={() =>
                          document.getElementById("file-input-add")?.click()
                        }
                        className="group flex aspect-3/4 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 transition-all hover:border-black hover:text-black"
                      >
                        <input
                          id="file-input-add"
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={(e) => handleFiles(e.target.files)}
                        />
                        <Plus className="h-8 w-8 transition-transform group-hover:scale-110" />
                        <span className="text-xs font-bold">Add More</span>
                      </button>
                    </div>

                    <div className="flex flex-col items-center border-t border-gray-50 pt-8">
                      <button
                        onClick={handleConvert}
                        className="btn-primary group flex items-center gap-3 px-16 py-5 text-xl shadow-2xl shadow-black/10 transition-all hover:scale-[1.02]"
                      >
                        Convert to PDF
                        <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-1" />
                      </button>
                      <p className="mt-4 text-sm font-medium text-gray-400">
                        {files.length} {files.length === 1 ? "image" : "images"}{" "}
                        selected
                      </p>
                    </div>
                  </div>
                )}
              </ToolCard>
            </motion.div>
          )}

          {status === "processing" && (
            <ProcessingState
              title="Converting Images..."
              description="Optimizing image quality and generating PDF pages..."
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
              <h2 className="mb-2 text-3xl font-bold">Great Success!</h2>
              <p className="mb-10 text-lg text-gray-500">
                Your images have been combined into a single PDF.
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
                  Choose More
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
              <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-red-600">
                <AlertCircle className="h-12 w-12" />
              </div>
              <h2 className="mb-2 text-3xl font-bold">Oops!</h2>
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
            title: "How to Convert Images to PDF",
            steps: [
              "Upload your photos (JPG, PNG, or WebP) to the tool.",
              "Rearrange them or add more images as needed.",
              "Download your perfectly combined PDF document in seconds.",
            ],
          }}
          benefits={{
            title: "Professional Image Portfolios",
            items: [
              {
                title: "Universal Viewer",
                desc: "PDFs ensure your images look sharp and consistent across any device or operating system.",
              },
              {
                title: "Safe & Private",
                desc: "Your photos never leave your device. We process everything locally in your browser.",
              },
              {
                title: "High Consistency",
                desc: "Perfect for creating digital portfolios, scanning documents with your phone, or archiving photos.",
              },
              {
                title: "No Compression Loss",
                desc: "We maintain high image quality during the conversion process for professional results.",
              },
            ],
          }}
          faqs={[
            {
              question: "Which image formats are supported?",
              answer:
                "SimplyPDF supports JPG, PNG, and WebP formats for instant conversion to PDF.",
            },
            {
              question: "Is there a limit to how many images I can add?",
              answer:
                "No, you can add as many images as you need. Our tool will combined them all into one continuous PDF.",
            },
            {
              question: "Can I change the order of images?",
              answer:
                "Yes, you can remove and add images to get the exact sequence you desire before converting.",
            },
          ]}
        />
      </div>
    </div>
  );
}
