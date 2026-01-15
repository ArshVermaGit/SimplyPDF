import JSZip from 'jszip';

/**
 * Helper to convert Uint8Array to Blob (fixes TypeScript compatibility)
 */
export function uint8ArrayToBlob(data: Uint8Array, mimeType: string = 'application/pdf'): Blob {
    // Using slice() creates a new ArrayBuffer, avoiding SharedArrayBuffer type issues
    return new Blob([data.slice().buffer], { type: mimeType });
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
