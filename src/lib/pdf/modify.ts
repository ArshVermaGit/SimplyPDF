import { PDFDocument, degrees } from "pdf-lib";

/**
 * Rotate pages in a PDF by given angles
 */
export async function rotatePDF(
  file: File,
  rotations: number[] // Array of absolute angles for each page
): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);
  const pages = pdf.getPages();

  pages.forEach((page, index) => {
    if (rotations[index] !== undefined) {
      const currentRotation = page.getRotation().angle;
      // setRotation is absolute, but usually we want to add to current.
      // However, the requested UX implies "setting" the orientation visually.
      // If we want it to be additive: page.setRotation(degrees(currentRotation + rotations[index]));
      // Given the implementation plan, 'rotations' is expected to be the final orientation.
      page.setRotation(degrees(currentRotation + rotations[index]));
    }
  });

  return pdf.save();
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
