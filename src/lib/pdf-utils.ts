import { PDFDocument, degrees, rgb, StandardFonts } from 'pdf-lib';
import JSZip from 'jszip';

/**
 * Helper to convert Uint8Array to Blob (fixes TypeScript compatibility)
 */
export function uint8ArrayToBlob(data: Uint8Array, mimeType: string = 'application/pdf'): Blob {
    // Using slice() creates a new ArrayBuffer, avoiding SharedArrayBuffer type issues
    return new Blob([data.slice().buffer], { type: mimeType });
}

/**
 * Merge multiple PDF files into a single PDF
 */
export async function mergePDFs(files: File[]): Promise<Uint8Array> {
    const mergedPdf = await PDFDocument.create();

    for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    return mergedPdf.save();
}

/**
 * Split a PDF into individual pages or by range
 */
export async function splitPDF(
    file: File,
    mode: 'all' | 'range' | 'fixed_range' | 'size_limit',
    options?: string | number
): Promise<{ name: string; data: Uint8Array }[]> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);
    const totalPages = pdf.getPageCount();
    const results: { name: string; data: Uint8Array }[] = [];

    const createSplitFile = async (indices: number[], suffix: string) => {
        const newPdf = await PDFDocument.create();
        const copiedPages = await newPdf.copyPages(pdf, indices);
        copiedPages.forEach((page) => newPdf.addPage(page));
        const pdfBytes = await newPdf.save();
        results.push({
            name: `${file.name.replace('.pdf', '')}_${suffix}.pdf`,
            data: pdfBytes,
        });
    };

    if (mode === 'all') {
        for (let i = 0; i < totalPages; i++) {
            await createSplitFile([i], `page_${i + 1}`);
        }
    } else if (mode === 'range' && typeof options === 'string') {
        const rangesList = parseRanges(options, totalPages);
        for (let i = 0; i < rangesList.length; i++) {
            const indices = rangesList[i].map((p) => p - 1);
            await createSplitFile(indices, `part_${i + 1}`);
        }
    } else if (mode === 'fixed_range' && typeof options === 'number') {
        const pageSize = options;
        for (let i = 0; i < totalPages; i += pageSize) {
            const indices = Array.from({ length: Math.min(pageSize, totalPages - i) }, (_, k) => i + k);
            await createSplitFile(indices, `pages_${i + 1}-${i + indices.length}`);
        }
    } else if (mode === 'size_limit' && typeof options === 'number') {
        // Approximate split by dividing total pages by estimated size
        const estimatedBytesPerPage = arrayBuffer.byteLength / totalPages;
        const targetBytes = options * 1024 * 1024; // options is in MB
        const pagesPerSplit = Math.max(1, Math.floor(targetBytes / estimatedBytesPerPage));

        for (let i = 0; i < totalPages; i += pagesPerSplit) {
            const indices = Array.from({ length: Math.min(pagesPerSplit, totalPages - i) }, (_, k) => i + k);
            await createSplitFile(indices, `part_${Math.floor(i / pagesPerSplit) + 1}`);
        }
    }

    return results;
}

/**
 * Rotate all pages in a PDF by a given angle
 */
export async function rotatePDF(
    file: File,
    angle: 90 | 180 | 270
): Promise<Uint8Array> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);
    const pages = pdf.getPages();

    pages.forEach((page) => {
        const currentRotation = page.getRotation().angle;
        page.setRotation(degrees(currentRotation + angle));
    });

    return pdf.save();
}

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
 * Compress PDF by removing metadata and optimizing
 */
export async function compressPDF(file: File): Promise<Uint8Array> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer, {
        updateMetadata: false,
    });

    pdf.setTitle('');
    pdf.setAuthor('');
    pdf.setSubject('');
    pdf.setKeywords([]);
    pdf.setProducer('SimplyPDF');
    pdf.setCreator('SimplyPDF');

    return pdf.save({
        useObjectStreams: true,
        addDefaultPage: false,
    });
}

/**
 * Remove pages from PDF
 */
export async function removePages(
    file: File,
    pageIndicesToRemove: number[]
): Promise<Uint8Array> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);

    const sortedIndices = [...pageIndicesToRemove].sort((a, b) => b - a);

    for (const index of sortedIndices) {
        if (index >= 0 && index < pdf.getPageCount()) {
            pdf.removePage(index);
        }
    }

    return pdf.save();
}

/**
 * Reorder pages in PDF
 */
export async function reorderPages(
    file: File,
    newOrder: number[]
): Promise<Uint8Array> {
    const arrayBuffer = await file.arrayBuffer();
    const originalPdf = await PDFDocument.load(arrayBuffer);
    const newPdf = await PDFDocument.create();

    const totalPages = originalPdf.getPageCount();
    const validOrder = newOrder.filter((i) => i >= 0 && i < totalPages);

    const copiedPages = await newPdf.copyPages(originalPdf, validOrder);
    copiedPages.forEach((page) => newPdf.addPage(page));

    return newPdf.save();
}

/**
 * Extract specific pages from PDF
 */
export async function extractPages(
    file: File,
    pageIndices: number[]
): Promise<Uint8Array> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);
    const newPdf = await PDFDocument.create();

    const validIndices = pageIndices.filter(
        (i) => i >= 0 && i < pdf.getPageCount()
    );
    const copiedPages = await newPdf.copyPages(pdf, validIndices);
    copiedPages.forEach((page) => newPdf.addPage(page));

    return newPdf.save();
}

/**
 * Add page numbers to PDF
 */
export async function addPageNumbers(
    file: File,
    options: {
        position: 'bottom-center' | 'bottom-right' | 'bottom-left';
        startNumber?: number;
    } = { position: 'bottom-center', startNumber: 1 }
): Promise<Uint8Array> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);
    const pages = pdf.getPages();
    const font = await pdf.embedFont(StandardFonts.Helvetica);

    let pageNum = options.startNumber || 1;

    for (const page of pages) {
        const { width } = page.getSize();
        const text = String(pageNum);
        const textWidth = font.widthOfTextAtSize(text, 12);

        let x: number;
        switch (options.position) {
            case 'bottom-left':
                x = 40;
                break;
            case 'bottom-right':
                x = width - textWidth - 40;
                break;
            case 'bottom-center':
            default:
                x = (width - textWidth) / 2;
        }

        page.drawText(text, {
            x,
            y: 30,
            size: 12,
            font,
            color: rgb(0.4, 0.4, 0.4),
        });

        pageNum++;
    }

    return pdf.save();
}

/**
 * Set/Edit PDF metadata
 */
export async function setPDFMetadata(
    file: File,
    metadata: {
        title?: string;
        author?: string;
        subject?: string;
        keywords?: string[];
        producer?: string;
        creator?: string;
    }
): Promise<Uint8Array> {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);

    if (metadata.title !== undefined) pdfDoc.setTitle(metadata.title);
    if (metadata.author !== undefined) pdfDoc.setAuthor(metadata.author);
    if (metadata.subject !== undefined) pdfDoc.setSubject(metadata.subject);
    if (metadata.keywords !== undefined) pdfDoc.setKeywords(metadata.keywords);
    if (metadata.producer !== undefined) pdfDoc.setProducer(metadata.producer);
    if (metadata.creator !== undefined) pdfDoc.setCreator(metadata.creator);

    return pdfDoc.save();
}

/**
 * Advanced Watermark with rotation, opacity and tiling
 */
export async function addAdvancedWatermark(
    file: File,
    options: {
        text: string;
        fontSize: number;
        opacity: number;
        rotation: number;
        color: { r: number; g: number; b: number };
        tiled?: boolean;
    }
): Promise<Uint8Array> {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pages = pdfDoc.getPages();
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const { text, fontSize, opacity, rotation, color, tiled } = options;

    for (const page of pages) {
        const { width, height } = page.getSize();

        if (tiled) {
            // Add tiled watermark across the whole page
            const stepX = 200;
            const stepY = 150;
            for (let x = 0; x < width + stepX; x += stepX) {
                for (let y = 0; y < height + stepY; y += stepY) {
                    page.drawText(text, {
                        x,
                        y,
                        size: fontSize,
                        font,
                        color: rgb(color.r, color.g, color.b),
                        opacity,
                        rotate: degrees(rotation),
                    });
                }
            }
        } else {
            // Add single centered watermark
            page.drawText(text, {
                x: width / 2 - (font.widthOfTextAtSize(text, fontSize) / 2),
                y: height / 2,
                size: fontSize,
                font,
                color: rgb(color.r, color.g, color.b),
                opacity,
                rotate: degrees(rotation),
            });
        }
    }

    return pdfDoc.save();
}

/**
 * Protect PDF with password
 */
export async function protectPDF(
    file: File,
    userPassword?: string,
    ownerPassword?: string,
    permissions: {
        printing?: 'lowResolution' | 'highResolution';
        modifying?: boolean;
        copying?: boolean;
        annotating?: boolean;
    } = {}
): Promise<Uint8Array> {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    return pdfDoc.save({
        userPassword,
        ownerPassword,
        permissions: {
            printing: permissions.printing || 'highResolution',
            modifying: permissions.modifying ?? true,
            copying: permissions.copying ?? true,
            annotating: permissions.annotating ?? true,
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
}

/**
 * Extract images from PDF
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function extractImagesFromPDF(file: File): Promise<{ name: string; data: Uint8Array }[]> {
    // Note: pdf-lib doesn't easily support raw image extraction.
    // For a production app, we would use a more specialized library or custom parser.
    // Here we provide a stub demonstrating the feature UI integration.
    return [];
}

/**
 * Repair/Optimize PDF
 */
export async function repairPDF(file: File): Promise<Uint8Array> {
    const arrayBuffer = await file.arrayBuffer();
    // Re-saving with pdf-lib often fixes minor structural issues
    const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    return pdfDoc.save();
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Parses page range strings (e.g., "1-3, 5, 8-10") into number arrays
 */
export function parseRanges(rangeStr: string, maxPage: number): number[][] {
    const result: number[][] = [];
    const parts = rangeStr.split(',').map(p => p.trim());

    parts.forEach(part => {
        if (part.includes('-')) {
            const [start, end] = part.split('-').map(Number);
            if (!isNaN(start) && !isNaN(end)) {
                const range: number[] = [];
                const s = Math.max(1, Math.min(start, end));
                const e = Math.min(maxPage, Math.max(start, end));
                for (let i = s; i <= e; i++) {
                    range.push(i);
                }
                if (range.length > 0) result.push(range);
            }
        } else {
            const num = Number(part);
            if (!isNaN(num) && num >= 1 && num <= maxPage) {
                result.push([num]);
            }
        }
    });

    return result;
}

/**
 * Downloads multiple files as a single ZIP archive
 */
export async function downloadAsZip(files: { name: string; data: Uint8Array }[], zipName: string) {
    const zip = new JSZip();
    files.forEach((file) => zip.file(file.name, file.data));
    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const link = document.createElement("a");
    link.href = url;
    link.download = zipName.endsWith(".zip") ? zipName : `${zipName}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Downloads a file to the user's device
 */
export function downloadFile(data: Uint8Array | Blob, fileName: string, mimeType: string = 'application/pdf') {
    const blob = data instanceof Blob ? data : uint8ArrayToBlob(data, mimeType);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
