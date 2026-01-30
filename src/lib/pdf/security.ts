import { PDFDocument } from "pdf-lib";

/**
 * Protect PDF with password using industrial-grade qpdf-wasm
 * Provides actual AES-256 encryption and working permission flags.
 */
export async function protectPDF(
  file: File,
  userPassword?: string,
  ownerPassword?: string,
  permissions: {
    printing?: boolean;
    modifying?: boolean;
    copying?: boolean;
    annotating?: boolean;
  } = {}
): Promise<Uint8Array> {
  const createModule = (await import("@neslinesli93/qpdf-wasm")).default;
  const arrayBuffer = await file.arrayBuffer();

  // Initialize qpdf module using the local WASM file we've provided in the public folder
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const qpdf: any = await createModule({
    locateFile: (path: string) => `/${path}`,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any);

  const inputName = "/input.pdf";
  const outputName = "/output.pdf";

  // Write input to virtual file system
  qpdf.FS.writeFile(inputName, new Uint8Array(arrayBuffer));

  // Construct qpdf arguments
  // --encrypt <user-pw> <owner-pw> <key-length> [restrictions] --
  const args = [
    inputName,
    "--encrypt",
    userPassword || "",
    ownerPassword || userPassword || "", // If only one provided, use for both
    "256", // AES-256 bit
  ];

  // Add restrictions if any are disabled (by default they are enabled in our UI state if true)
  // qpdf 'restrictions' are actually flags of what is ALLOWED.
  if (!permissions.printing) args.push("--print=none");
  if (!permissions.copying) args.push("--extract=n");
  if (!permissions.modifying) args.push("--modify=none");
  if (!permissions.annotating) args.push("--annotate=n");

  args.push("--", outputName);

  // Run encryption
  try {
    const exitCode = qpdf.callMain(args);
    // If it doesn't throw but returns 3, it's a warning success
    if (exitCode !== 0 && exitCode !== 3) {
      throw new Error(`qpdf exited with code ${exitCode}`);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    // qpdf-wasm/emscripten often throws ExitStatus for non-zero exit codes
    const isWarning =
      err &&
      typeof err === "object" &&
      (err.status === 3 || err.exitCode === 3 || err.code === 3);

    if (!isWarning) {
      console.error("qpdf execution error:", err);
      throw new Error(
        "Encryption engine failed. The file might be corrupted or incompatible."
      );
    }

    console.warn("qpdf completed with warnings (Exit 3):", err);
  }

  // Verify output exists using stat and read result
  try {
    qpdf.FS.stat(outputName);
  } catch {
    throw new Error("Encryption failed: Secure output file was not generated.");
  }

  const outputData = qpdf.FS.readFile(outputName);

  // Cleanup
  qpdf.FS.unlink(inputName);
  qpdf.FS.unlink(outputName);

  return outputData;
}

/**
 * Unlock PDF with fallback strategy
 */
export async function unlockPDFWithFallback(
  file: File,
  password?: string
): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();

  // Tier 1: Try pdf-lib (Good for owner password/restrictions)
  try {
    const pdf = await PDFDocument.load(arrayBuffer, {
      ignoreEncryption: true,
    });

    // If we can load it and it's not actually encrypted or pdf-lib handled it
    if (!pdf.isEncrypted) {
      return pdf.save();
    }

    // Try to copy pages to a new doc (this often strips restrictions)
    const newPdf = await PDFDocument.create();
    const copiedPages = await newPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => newPdf.addPage(page));
    return newPdf.save();
  } catch (error) {
    console.warn(
      "Tier 1 Unlock failed, attempting Tier 2 (Deep Unlock):",
      error
    );
  }

  // Tier 2: Deep Unlock via PDF.js Rendering
  // This is the absolute fallback for strong encryption
  const pdfjsLib = await import("pdfjs-dist");
  const workerUrl = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
    password: password,
  });

  const pdfDoc = await loadingTask.promise;
  const numPages = pdfDoc.numPages;
  const newPdf = await PDFDocument.create();

  for (let i = 1; i <= numPages; i++) {
    const page = await pdfDoc.getPage(i);
    const viewport = page.getViewport({ scale: 2.0 }); // High res for quality
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d")!;
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({ canvasContext: context, viewport }).promise;
    const imgData = canvas.toDataURL("image/jpeg", 0.95);
    const imgBytes = await fetch(imgData).then((res) => res.arrayBuffer());

    const pdfImg = await newPdf.embedJpg(imgBytes);
    const newPage = newPdf.addPage([pdfImg.width, pdfImg.height]);
    newPage.drawImage(pdfImg, {
      x: 0,
      y: 0,
      width: pdfImg.width,
      height: pdfImg.height,
    });

    (page as { cleanup?: () => void }).cleanup?.();
  }

  await pdfDoc.destroy();
  return newPdf.save();
}
