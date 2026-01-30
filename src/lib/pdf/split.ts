import { PDFDocument } from "pdf-lib";
import { parseRanges } from "./utils";

/**
 * Split a PDF into individual pages or by range
 */
export async function splitPDF(
  file: File,
  mode: "all" | "range" | "fixed_range" | "size_limit",
  options?: string | number,
  pattern: string = "{filename}_part_{n}"
): Promise<{ name: string; data: Uint8Array }[]> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);
  const totalPages = pdf.getPageCount();
  const results: { name: string; data: Uint8Array }[] = [];
  const baseName = file.name.replace(".pdf", "");

  const createSplitFile = async (
    indices: number[],
    suffix: string,
    index: number
  ) => {
    const newPdf = await PDFDocument.create();
    const copiedPages = await newPdf.copyPages(pdf, indices);
    copiedPages.forEach((page) => newPdf.addPage(page));
    const pdfBytes = await newPdf.save();

    // Dynamic name generation
    const fileName = pattern
      .replace(/{filename}/g, baseName)
      .replace(/{n}/g, String(index + 1))
      .replace(/{suffix}/g, suffix);

    results.push({
      name: fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`,
      data: pdfBytes,
    });
  };

  if (mode === "all") {
    for (let i = 0; i < totalPages; i++) {
      await createSplitFile([i], `page_${i + 1}`, i);
    }
  } else if (mode === "range" && typeof options === "string") {
    const rangesList = parseRanges(options, totalPages);
    for (let i = 0; i < rangesList.length; i++) {
      const indices = rangesList[i].map((p) => p - 1);
      await createSplitFile(indices, `part_${i + 1}`, i);
    }
  } else if (mode === "fixed_range" && typeof options === "number") {
    const pageSize = options;
    let count = 0;
    for (let i = 0; i < totalPages; i += pageSize) {
      const indices = Array.from(
        { length: Math.min(pageSize, totalPages - i) },
        (_, k) => i + k
      );
      await createSplitFile(
        indices,
        `pages_${i + 1}-${i + indices.length}`,
        count++
      );
    }
  } else if (mode === "size_limit" && typeof options === "number") {
    const estimatedBytesPerPage = arrayBuffer.byteLength / totalPages;
    const targetBytes = options * 1024 * 1024;
    const pagesPerSplit = Math.max(
      1,
      Math.floor(targetBytes / estimatedBytesPerPage)
    );

    let count = 0;
    for (let i = 0; i < totalPages; i += pagesPerSplit) {
      const indices = Array.from(
        { length: Math.min(pagesPerSplit, totalPages - i) },
        (_, k) => i + k
      );
      await createSplitFile(indices, `part_${count + 1}`, count++);
    }
  }

  return results;
}
