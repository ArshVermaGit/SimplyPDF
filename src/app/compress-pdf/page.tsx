"use client";

import { ToolPageLayout } from "@/components/ToolPageLayout";
import { compressPDF, uint8ArrayToBlob } from "@/lib/pdf-utils";

export default function CompressPDFPage() {
    const handleCompress = async (files: File[]): Promise<Blob | null> => {
        try {
            const file = files[0];
            const compressedBytes = await compressPDF(file);
            return uint8ArrayToBlob(compressedBytes);
        } catch (error) {
            console.error("Compress error:", error);
            throw new Error("Failed to compress PDF. Please ensure the file is a valid PDF.");
        }
    };

    return (
        <ToolPageLayout
            title="Compress PDF"
            description="Reduce file size while optimizing for maximal PDF quality."
            actionButtonText="Compress PDF"
            processingText="Compressing your PDF..."
            successTitle="PDF Compressed!"
            successDescription="Your optimized PDF is ready. File size has been reduced while maintaining quality."
            onProcess={handleCompress}
            multiple={false}
            downloadFileName="compressed.pdf"
        />
    );
}
