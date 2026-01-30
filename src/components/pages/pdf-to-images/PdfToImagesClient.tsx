"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  Download,
  CheckCircle2,
  RefreshCw,
  Image as ImageIcon,
  Eye,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { formatFileSize } from "@/lib/pdf-utils";
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
import { EducationalContent } from "@/components/layout/EducationalContent";

interface ConvertedImage {
  name: string;
  dataUrl: string;
}

export function PDFToImagesClient() {
  const { addToHistory } = useHistory();
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<
    "idle" | "processing" | "success" | "error"
  >("idle");
  const [images, setImages] = useState<ConvertedImage[]>([]);
  const [format, setFormat] = useState<"jpg" | "png" | "webp">("jpg");
  const [errorMessage, setErrorMessage] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewPage, setPreviewPage] = useState(0);

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
    setImages([]);

    try {
      const pdfjsLib = await import("pdfjs-dist");
      const workerUrl = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
      pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({
        data: new Uint8Array(arrayBuffer),
      }).promise;
      const numPages = pdf.numPages;
      const convertedImages: ConvertedImage[] = [];

      for (let i = 1; i <= numPages; i++) {
        setProgress(Math.round((i / numPages) * 100));
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        if (context) {
          await page.render({ canvasContext: context, viewport }).promise;
          const mimeType = format === "jpg" ? "image/jpeg" : `image/${format}`;
          const dataUrl = canvas.toDataURL(mimeType, 0.9);
          convertedImages.push({
            name: `page-${i}.${format}`,
            dataUrl,
          });
        }
      }

      setImages(convertedImages);
      setStatus("success");
      addToHistory(
        "PDF to Images",
        file.name,
        `Converted to ${convertedImages.length} ${format.toUpperCase()}s`
      );
      await pdf.destroy();
    } catch (error) {
      console.error(error);
      setErrorMessage("Failed to convert PDF to images.");
      setStatus("error");
    }
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
    link.download = `pdf-${format}-images.zip`;
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
                title="PDF to Images"
                description="Transform your PDF document pages into high-quality JPG, PNG, or WebP images."
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
                  <p className="text-sm text-gray-400">
                    Convert pages to crystal clear images
                  </p>
                </div>

                {file && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-12 space-y-8"
                  >
                    <div className="flex flex-col items-center justify-between gap-6 rounded-[32px] bg-gray-50 p-6 md:flex-row">
                      <div className="flex items-center gap-4">
                        <div className="rounded-2xl bg-white p-4 shadow-sm">
                          <ImageIcon className="h-8 w-8 text-black" />
                        </div>
                        <div>
                          <p className="text-lg font-bold">{file.name}</p>
                          <p className="font-medium text-gray-500">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-2 shadow-sm">
                        {(["jpg", "png", "webp"] as const).map((f) => (
                          <button
                            key={f}
                            onClick={() => setFormat(f)}
                            className={`rounded-xl px-6 py-2 font-bold transition-all ${format === f ? "bg-black text-white shadow-lg" : "text-gray-400 hover:text-black"}`}
                          >
                            {f.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-center">
                      <button
                        onClick={handleConvert}
                        className="btn-primary group flex items-center gap-3 px-16 py-5 text-xl shadow-2xl shadow-black/10 transition-all hover:scale-[1.02]"
                      >
                        Start Conversion
                        <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-1" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </ToolCard>
            </motion.div>
          )}

          {status === "processing" && (
            <ProcessingState
              title={`Converting to ${format.toUpperCase()}...`}
              description="Rendering high-resolution pages..."
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
              <div className="mb-12 text-center">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-black text-white">
                  <CheckCircle2 className="h-10 w-10" />
                </div>
                <h2 className="mb-2 text-4xl font-bold">Great Success!</h2>
                <p className="text-lg text-gray-500">
                  {images.length} images generated in {format.toUpperCase()}{" "}
                  format.
                </p>
              </div>

              <div className="mb-12 grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {images.map((image, index) => (
                  <div
                    key={index}
                    className="group relative cursor-pointer"
                    onClick={() => {
                      setPreviewPage(index);
                      setPreviewOpen(true);
                    }}
                  >
                    <div className="aspect-3/4 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl">
                      <Image
                        src={image.dataUrl}
                        alt={`Page ${index + 1}`}
                        fill
                        className="object-cover p-2"
                        unoptimized
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/40 group-hover:opacity-100">
                        <Eye className="h-8 w-8 text-white" />
                      </div>
                      <div className="absolute bottom-3 left-3 rounded-lg bg-black/60 px-2 py-1 text-[10px] font-bold text-white uppercase backdrop-blur-md">
                        Page {index + 1}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <button
                  onClick={handleDownloadAll}
                  className="btn-primary flex items-center gap-2 px-12 py-4 text-lg"
                >
                  <Download className="h-6 w-6" />
                  Download All (ZIP)
                </button>
                <button
                  onClick={reset}
                  className="btn-outline flex items-center gap-2 px-12 py-4 text-lg"
                >
                  <RefreshCw className="h-6 w-6" />
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
      </div>

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
          title: "How to Convert PDF to Images",
          steps: [
            "Upload your PDF and select your preferred output format (JPG, PNG, or WebP).",
            "Our engine renders each page at high resolution locally on your device.",
            "Preview your images and download them individually or as a ZIP archive.",
          ],
        }}
        benefits={{
          title: "High Fidelity Results",
          items: [
            {
              title: "Multiple Formats",
              desc: "Choose between JPG for universal compatibility, PNG for transparency, or WebP for the web.",
            },
            {
              title: "Crystal Clear",
              desc: "We use high-resolution rendering to ensure even small text remains sharp and legible.",
            },
            {
              title: "100% Private",
              desc: "Your images stay on your machine. We never upload your data to any servers.",
            },
            {
              title: "Fast Workflow",
              desc: "Convert hundreds of pages in seconds and save them all at once in a neat ZIP file.",
            },
          ],
        }}
        faqs={[
          {
            question: "What format should I choose?",
            answer:
              "Use JPG for general storage, PNG if you need high quality without compression artifacts, and WebP for your website.",
          },
          {
            question: "Is there a limit on resolution?",
            answer:
              "We render at a high default scale that balances quality and file size perfectly for most professional use cases.",
          },
          {
            question: "Can I convert just one page?",
            answer:
              "Our tool converts all pages, but you can preview and download only the specific page you need if you wish.",
          },
        ]}
      />
    </div>
  );
}
