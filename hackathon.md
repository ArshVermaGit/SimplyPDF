# 🚀 SimplyPDF: The Ultimate Privacy-First PDF Swiss-Army Knife

## 💡 Inspiration

In an era where data privacy is often a second-thought, we noticed a glaring problem: most online PDF tools require you to upload sensitive documents to their servers. Whether it's a tax return, a contract, or medical records, these files are processed on remote hardware, leaving users vulnerable to data breaches or unwanted tracking.

We were inspired to build **SimplyPDF**—a _"Swiss-Army Knife"_ for PDFs that gives users the power of professional desktop software with the convenience of a web app, all while keeping their data **100% on their own device**. No uploads, no servers, just pure privacy.

---

## 🛠️ What it does

SimplyPDF is a **premium, high-performance** web application offering a comprehensive suite of **16+ professional PDF tools**. Key capabilities include:

- **🔒 Security & Privacy**: Protect/Unlock PDFs and strip metadata locally.
- **🔄 Conversion**: Convert between PDF and Word, Excel, JPG, and even EPUB.
- **✂️ Editing & Optimization**: Merge, Split, Reorder, and Compress PDFs without quality loss.
- **🤖 AI-Powered OCR**: Extract text from scanned documents using client-side AI recognition.
- **🖋️ Personalization**: Add watermarks, page numbers, and digital signatures.

---

## 🛠 Built With

SimplyPDF is built using a modern, high-performance stack optimized for client-side execution:

- **Languages**: [TypeScript](https://www.typescriptlang.org/), [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
- **Frameworks**: [Next.js 16](https://nextjs.org/) (App Router), [React 19](https://react.dev/)
- **Styling & UI**: [Tailwind CSS 4](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/), [Lucide React](https://lucide.dev/)
- **PDF & Binary Processing**: [WebAssembly (WASM)](https://webassembly.org/), [qpdf](https://github.com/qpdf/qpdf), [pdf-lib](https://pdf-lib.js.org/), [pdfjs-dist](https://mozilla.github.io/pdf.js/)
- **AI & OCR**: [Tesseract.js](https://tesseract.projectnaptha.com/) (Local AI recognition)
- **Document Conversion**: [docx](https://docx.js.org/), [SheetJS (XLSX)](https://sheetjs.com/), [PptxGenJS](https://gitbrent.github.io/PptxGenJS/), [mammoth.js](https://github.com/mwilliamson/mammoth.js)
- **Auth**: [Google OAuth](https://developers.google.com/identity/gsi/web/guides/overview)
- **Platform**: [Vercel](https://vercel.com/) (Deployment)

---

We leveraged the absolute latest in web technology to deliver **native-like performance** in the browser:

- **Frontend Stack**: Built with [Next.js 16](https://nextjs.org/) (App Router) and [TypeScript](https://www.typescriptlang.org/) for a robust foundation.
- **Design System**: A hyper-polished UI using **Tailwind CSS 4** and **Framer Motion** for glassmorphism effects and fluid micro-interactions.
- **Core Engine**: Powered by **WebAssembly (WASM)** via [qpdf](https://github.com/qpdf/qpdf) and libraries like [pdf-lib](https://pdf-lib.js.org/).

### Technical Snippet: Client-Side Compression

Here is how we handle metadata stripping for extreme privacy:

```typescript
// Strip metadata for privacy and size
if (level === "extreme" || level === "recommended") {
  pdf.setTitle("");
  pdf.setAuthor("");
  pdf.setProducer("SimplyPDF");

  if (level === "extreme") {
    // Remove structural tags and extra info directly from the PDF Catalog
    const root = pdf.catalog.get(pdf.context.obj("StructTreeRoot"));
    if (root) pdf.catalog.delete(pdf.context.obj("StructTreeRoot"));
  }
}
```

### Compression Logic

We calculate the compression efficiency using:
\\[ \text{Efficiency} = \left( 1 - \frac{\text{Compressed Size}}{\text{Original Size}} \right) \times 100 \\]

---

## 🧗 Challenges we ran into

- **Memory Management**: PDFs can be massive. Handling multi-gigabyte files entirely in the browser's RAM required careful buffer management.
- **Performance Trade-offs**: Running OCR and heavy compression client-side is computationally expensive. We optimized worker threads to ensure the app felt responsive.
- **WASM Integration**: Bridging high-performance C++ binaries with the React ecosystem presented complex state synchronization challenges.

---

## 🏆 Accomplishments that we're proud of

- **True Privacy**: "Zero-Upload" isn't just a marketing slogan—it's the core architecture.
- **Premium Aesthetic**: A design that feels like a premium SaaS product usually hidden behind a $20/month paywall.
- **PWA Readiness**: Fully installable as a native app that works offline.

---

## 📚 What we learned

- **WebAssembly Power**: Learned how WASM enables heavy document processing that was previously impossible in a browser.
- **User-Centric Privacy**: Deepened our understanding of how to communicate technical privacy features to non-technical users.

---

## 🚀 What's next for SimplyPDF

- **In-Canvas Editing**: A full-blown interactive PDF editor.
- **Browser Extensions**: Integration directly into the browser's PDF viewer.
- **Privacy-Preserving Cloud Sync**: End-to-end encrypted storage integration.

---

Built with ❤️ by [Arsh Verma](https://github.com/ArshVermaGit)
