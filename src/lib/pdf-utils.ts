import { PDFDocument, degrees, rgb, StandardFonts } from 'pdf-lib';

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
    mode: 'all' | 'range',
    ranges?: string
): Promise<{ name: string; data: Uint8Array }[]> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);
    const totalPages = pdf.getPageCount();
    const results: { name: string; data: Uint8Array }[] = [];

    if (mode === 'all') {
        for (let i = 0; i < totalPages; i++) {
            const newPdf = await PDFDocument.create();
            const [copiedPage] = await newPdf.copyPages(pdf, [i]);
            newPdf.addPage(copiedPage);
            const pdfBytes = await newPdf.save();
            results.push({
                name: `page_${i + 1}.pdf`,
                data: pdfBytes,
            });
        }
    } else if (mode === 'range' && ranges) {
        const rangesList = parseRanges(ranges, totalPages);
        for (let i = 0; i < rangesList.length; i++) {
            const range = rangesList[i];
            const newPdf = await PDFDocument.create();
            const pageIndices = range.map((p) => p - 1);
            const copiedPages = await newPdf.copyPages(pdf, pageIndices);
            copiedPages.forEach((page) => newPdf.addPage(page));
            const pdfBytes = await newPdf.save();
            results.push({
                name: `split_${i + 1}.pdf`,
                data: pdfBytes,
            });
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
 * Get PDF info/metadata
 */
export async function getPDFInfo(file: File): Promise<{
    pageCount: number;
    title: string | undefined;
    author: string | undefined;
    creationDate: Date | undefined;
    modificationDate: Date | undefined;
    fileSize: number;
    pages: { width: number; height: number }[];
}> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);
    const pages = pdf.getPages();

    return {
        pageCount: pdf.getPageCount(),
        title: pdf.getTitle(),
        author: pdf.getAuthor(),
        creationDate: pdf.getCreationDate(),
        modificationDate: pdf.getModificationDate(),
        fileSize: file.size,
        pages: pages.map((page) => ({
            width: page.getWidth(),
            height: page.getHeight(),
        })),
    };
}

// Helper function to parse page ranges
function parseRanges(rangesStr: string, totalPages: number): number[][] {
    const ranges: number[][] = [];
    const parts = rangesStr.split(',').map((s) => s.trim());

    for (const part of parts) {
        if (part.includes('-')) {
            const [start, end] = part.split('-').map((s) => parseInt(s.trim(), 10));
            if (!isNaN(start) && !isNaN(end)) {
                const range: number[] = [];
                for (let i = Math.max(1, start); i <= Math.min(totalPages, end); i++) {
                    range.push(i);
                }
                if (range.length > 0) {
                    ranges.push(range);
                }
            }
        } else {
            const page = parseInt(part, 10);
            if (!isNaN(page) && page >= 1 && page <= totalPages) {
                ranges.push([page]);
            }
        }
    }

    return ranges;
}

/**
 * Download a blob/Uint8Array as a file
 */
export function downloadFile(
    data: Uint8Array | Blob,
    filename: string,
    mimeType: string = 'application/pdf'
): void {
    const blob = data instanceof Blob ? data : new Blob([data.slice().buffer], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Download multiple files as a ZIP
 */
export async function downloadAsZip(
    files: { name: string; data: Uint8Array }[],
    zipName: string
): Promise<void> {
    const JSZip = (await import('jszip')).default;
    const { saveAs } = await import('file-saver');

    const zip = new JSZip();

    for (const file of files) {
        zip.file(file.name, file.data);
    }

    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, zipName);
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
