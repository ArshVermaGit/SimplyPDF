import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';

/**
 * Compress PDF by removing metadata and optimizing internal structure
 */
export async function compressPDF(
    file: File,
    level: 'low' | 'recommended' | 'extreme' = 'recommended'
): Promise<Uint8Array> {
    const arrayBuffer = await file.arrayBuffer();
    
    // Load with structural analysis
    const pdf = await PDFDocument.load(arrayBuffer, {
        updateMetadata: true,
        capNumbers: true,
    });

    // Strip metadata for privacy and size
    if (level === 'extreme' || level === 'recommended') {
        pdf.setTitle('');
        pdf.setAuthor('');
        pdf.setSubject('');
        pdf.setKeywords([]);
        pdf.setProducer('SimplyPDF');
        pdf.setCreator('SimplyPDF');
        
        // Remove structural tags and extra info if extreme
        if (level === 'extreme') {
            // Remove StructTreeRoot if it exists
            const root = pdf.catalog.get(pdf.context.obj('StructTreeRoot'));
            if (root) pdf.catalog.delete(pdf.context.obj('StructTreeRoot'));

            // Remove PieceInfo (App data)
            const pieceInfo = pdf.catalog.get(pdf.context.obj('PieceInfo'));
            if (pieceInfo) pdf.catalog.delete(pdf.context.obj('PieceInfo'));

            // Remove Names dictionary (often contains unused destinations)
            const names = pdf.catalog.get(pdf.context.obj('Names'));
            if (names) pdf.catalog.delete(pdf.context.obj('Names'));

            // Remove Metadata stream directly
            const metadata = pdf.catalog.get(pdf.context.obj('Metadata'));
            if (metadata) pdf.catalog.delete(pdf.context.obj('Metadata'));
        }
    }

    // Optimization settings for pdf-lib
    return pdf.save({
        useObjectStreams: level !== 'low',
        addDefaultPage: false,
        updateFieldAppearances: false, // Don't regenerate field appearances to save space
    });
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
