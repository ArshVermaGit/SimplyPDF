import { PDFDocument } from 'pdf-lib';
import { uint8ArrayToBlob } from './utils';

/**
 * Convert images (JPG/PNG) to a single PDF
 */
export async function imagesToPDF(files: File[]): Promise<Uint8Array> {
    const pdf = await PDFDocument.create();

    for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        let image;

        if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
            image = await pdf.embedJpg(arrayBuffer);
        } else if (file.type === 'image/png') {
            image = await pdf.embedPng(arrayBuffer);
        } else {
            try {
                image = await pdf.embedJpg(arrayBuffer);
            } catch {
                console.warn('Skipping unsupported file:', file.name);
                continue;
            }
        }

        const page = pdf.addPage([image.width, image.height]);
        page.drawImage(image, {
            x: 0,
            y: 0,
            width: image.width,
            height: image.height,
        });
    }

    return pdf.save();
}

/**
 * Extract images from PDF
 */
export async function extractImagesFromPDF(file: File): Promise<{ name: string; data: Uint8Array }[]> {
    const arrayBuffer = await file.arrayBuffer();
    // Simplified robust implementation: Render pages as images
    const pdfjsLib = await import("pdfjs-dist");
    const workerUrl = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const extractedImages: { name: string; data: Uint8Array }[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 }); // High quality
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        
        if (!context) continue;
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        await page.render({ canvasContext: context, viewport }).promise;
        
        // Export as high-quality JPEG
        const blob = await new Promise<Blob | null>(resolve => 
            canvas.toBlob(resolve, 'image/jpeg', 0.95)
        );
        
        if (blob) {
            extractedImages.push({
                name: `image_page_${i}.jpg`,
                data: new Uint8Array(await blob.arrayBuffer())
            });
        }
    }
    
    return extractedImages;
}
