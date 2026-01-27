"use client";

import { ToolPageLayout } from "@/components/layout/ToolPageLayout";
import { imagesToPDF, uint8ArrayToBlob } from "@/lib/pdf-utils";

export function JPGToPDFClient() {
    const handleConvert = async (files: File[]): Promise<Blob | null> => {
        try {
            const pdfBytes = await imagesToPDF(files);
            return uint8ArrayToBlob(pdfBytes);
        } catch (error) {
            console.error("Conversion error:", error);
            throw new Error("Failed to convert images to PDF. Please ensure all files are valid images.");
        }
    };

    return (
        <ToolPageLayout
            title="JPG to PDF"
            description="Convert JPG, PNG images to PDF. Select multiple images to combine into one PDF."
            actionButtonText="Convert to PDF"
            processingText="Converting images to PDF..."
            successTitle="Conversion Complete!"
            successDescription="Your images have been converted to a single PDF document."
            onProcess={handleConvert}
            multiple={true}
            accept="image/jpeg,image/png,image/jpg,.jpg,.jpeg,.png"
            allowReorder={true}
            downloadFileName="images-to-pdf.pdf"
            historyAction="JPG to PDF"
            howItWorks={{
                title: "How to Convert JPG to PDF",
                steps: [
                    "Select one or multiple image files (JPG, PNG).",
                    "Arrange your images in the desired order.",
                    "Click 'Convert to PDF' to combine them into a single document."
                ]
            }}
            benefits={{
                title: "Image to Document",
                items: [
                    { title: "Combine Photos", desc: "Easily merge multiple photos into one shareable PDF file." },
                    { title: "No Quality Loss", desc: "We maintain the original quality of your images during conversion." },
                    { title: "Drag & Drop", desc: "Simply drag images from your desktop to arrange them." },
                    { title: "Universal Viewer", desc: "PDFs can be opened on any device, unlike some raw image formats." }
                ]
            }}
            faqs={[
                {
                    question: "Can I reorder pages?",
                    answer: "Yes! After uploading, simply drag and drop the image thumbnails to change their order."
                },
                {
                    question: "What image formats are supported?",
                    answer: "We support the most common formats: JPG, JPEG, and PNG."
                },
                {
                    question: "Is there a limit?",
                    answer: "No, you can add as many images as you want to a single PDF document."
                }
            ]}
        />
    );
}
