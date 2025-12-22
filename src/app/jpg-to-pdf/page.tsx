"use client";

import { ToolPageLayout } from "@/components/ToolPageLayout";
import { imagesToPDF, uint8ArrayToBlob } from "@/lib/pdf-utils";

export default function JpgToPDFPage() {
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
        />
    );
}
