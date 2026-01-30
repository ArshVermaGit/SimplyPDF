"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  File,
  Download,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  Image as ImageIcon,
  Eye,
} from "lucide-react";
import {} from "@/lib/pdf-utils";
import { PDFPreviewModal } from "@/components/pdf/PDFPreviewModal";
import JSZip from "jszip";
import Image from "next/image";
import {
  AnimatedBackground,
  FloatingDecorations,
  ToolHeader,
  ToolCard,
  ProcessingState,
} from "@/components/ui/ToolPageElements";
import { useHistory } from "@/context/HistoryContext";

interface ConvertedImage {
  name: string;
  dataUrl: string;
}

export function PDFToJPGClient() {
  const { addToHistory } = useHistory();
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<
    "idle" | "loading" | "converting" | "success" | "error"
  >("idle");
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
      setStatus("converting");
      // Use the shared utility for consistent logic
      const { extractImagesFromPDF } = await import("@/lib/pdf-utils");

      // Note: The shared utility returns Uint8Array, we need to convert to DataURL for display
      // The utility handles the robust extraction/rendering logic now.
      const extracted = await extractImagesFromPDF(pdfFile);

      const convertedImages: ConvertedImage[] = [];
      for (let i = 0; i < extracted.length; i++) {
        const img = extracted[i];
        // img.data is Uint8Array, we ensure a clean buffer copy to avoid type conflicts
        const blob = new Blob([img.data.buffer as ArrayBuffer], {
          type: "image/jpeg",
        });
        const dataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });

        convertedImages.push({
          name: img.name,
          dataUrl: dataUrl,
        });
        // Simulate progress since extraction is atomic in the lib currently
        setProgress(Math.round(((i + 1) / extracted.length) * 100));
      }

      setImages(convertedImages);
      setStatus("success");

      if (pdfFile) {
        addToHistory(
          "PDF to JPG",
          pdfFile.name,
          `Converted to ${convertedImages.length} images`
        );
      }
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
                title="PDF to JPG"
                description="Convert PDF pages to high-quality JPG images instantly."
                icon={ImageIcon}
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

          {(status === "loading" || status === "converting") && (
            <ProcessingState
              title={
                status === "loading" ? "Loading PDF..." : "Converting pages..."
              }
              description="Generating high-quality JPG images..."
              progress={progress}
            />
          )}

          {status === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-auto max-w-6xl"
            >
              <div className="mb-8 text-center">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[32px] bg-black text-white shadow-2xl">
                  <CheckCircle2 className="h-10 w-10" />
                </div>
                <h2 className="mb-2 text-4xl font-bold tracking-tight">
                  Conversion Complete!
                </h2>
                <p className="text-lg text-gray-500">
                  {images.length} images generated successfully
                </p>
              </div>

              {/* Image Grid */}
              <div className="mb-12 grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {images.map((image, index) => (
                  <motion.div
                    key={index}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ y: -5 }}
                    className="group relative cursor-pointer"
                  >
                    <div
                      className="relative overflow-hidden rounded-2xl border-2 border-gray-100 shadow-sm transition-all duration-300 hover:border-black hover:shadow-xl"
                      onClick={() => {
                        setPreviewPage(index);
                        setPreviewOpen(true);
                      }}
                    >
                      <div className="relative aspect-3/4 bg-white p-2">
                        <Image
                          src={image.dataUrl}
                          alt={`Page ${index + 1}`}
                          fill
                          className="h-full w-full object-contain"
                          unoptimized
                        />
                      </div>

                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/5">
                        <div className="opacity-0 transition-opacity group-hover:opacity-100">
                          <div className="rounded-full bg-white p-3 shadow-xl">
                            <Eye className="h-5 w-5" />
                          </div>
                        </div>
                      </div>

                      <div className="absolute bottom-3 left-3 rounded-lg bg-black px-2 py-1 text-[10px] leading-none font-bold text-white">
                        PAGE {index + 1}
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadSingle(image);
                        }}
                        className="absolute right-3 bottom-3 rounded-xl border border-gray-100 bg-white p-2 text-black opacity-0 shadow-lg transition-opacity group-hover:opacity-100 hover:bg-gray-100"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <button
                  onClick={handleDownloadAll}
                  className="btn-primary flex w-full items-center justify-center gap-3 px-12 py-5 text-lg shadow-2xl shadow-black/10 sm:w-auto"
                >
                  <Download className="h-6 w-6" />
                  Download All (ZIP)
                </button>
                <button
                  onClick={reset}
                  className="btn-outline flex w-full items-center justify-center gap-3 px-12 py-5 text-lg sm:w-auto"
                >
                  <RefreshCw className="h-6 w-6" />
                  Convert New
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
              <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-[32px] bg-red-50 text-red-500 shadow-sm">
                <AlertCircle className="h-12 w-12" />
              </div>
              <h2 className="mb-4 text-4xl font-bold tracking-tight">
                Something went wrong
              </h2>
              <p className="mb-12 text-lg text-gray-500">{errorMessage}</p>

              <button
                onClick={reset}
                className="btn-primary flex w-full items-center justify-center gap-3 px-12 py-5 text-lg font-bold"
              >
                <RefreshCw className="h-6 w-6" />
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
        images={images.map((i) => i.dataUrl)}
        currentPage={previewPage}
        onPageChange={setPreviewPage}
        title={file?.name || "Image Preview"}
      />

      <EducationalContent
        howItWorks={{
          title: "How to Convert PDF to JPG",
          steps: [
            "Upload your PDF file. We accept single or multi-page documents.",
            "Our engine renders each page into a high-quality JPG image.",
            "Download individual images or get them all in a single ZIP file.",
          ],
        }}
        benefits={{
          title: "Crystal Clear Images",
          items: [
            {
              title: "High Resolution",
              desc: "We render pages at 2x scale to ensure text remains crisp and readable.",
            },
            {
              title: "Batch Processing",
              desc: "Convert a 100-page PDF into 100 separate images in seconds.",
            },
            {
              title: "Secure & Private",
              desc: "Files are processed locally in your browser and never uploaded to our servers.",
            },
            {
              title: "ZIP Download",
              desc: "Save time by downloading all converted images at once in an organized archive.",
            },
          ],
        }}
        faqs={[
          {
            question: "What is the image quality?",
            answer:
              "We convert at high DPI (approx 150-300 depending on screen) to ensure professional quality suitable for presentations and printing.",
          },
          {
            question: "Can I convert large PDFs?",
            answer:
              "Yes, SimplyPDF can handle large files. Since processing is local, performance depends on your device speed, but most files convert instantly.",
          },
          {
            question: "Is it really free?",
            answer:
              "Yes, 100% free with no limits on the number of pages or files you can convert.",
          },
        ]}
      />
    </div>
  );
}

import { EducationalContent } from "@/components/layout/EducationalContent";
