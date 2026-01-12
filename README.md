# SimplyPDF - The Easiest PDF Tool

![SimplyPDF Banner](public/icon.png)

> **The ultimate, privacy-focused PDF swiss-army knife built with Next.js 16 and Tailwind CSS.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-16.1.0-default?style=flat&logo=next.js&logoColor=white)](https://nextjs.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org)

## 🚀 Overview

**SimplyPDF** is a hyper-premium, client-side PDF manipulation suite designed for speed, privacy, and ease of use. Unlike other tools, SimplyPDF processes files **locally in your browser**, ensuring your documents never leave your device.

Featuring a stunning, responsive UI built with Tailwind CSS and Framer Motion, it offers a desktop-class editing experience on the web.

## ✨ Key Features

SimplyPDF includes **16+ powerful tools** to handle any PDF task:

### 📝 Editing & Modification

- **Edit PDF**: Full-featured editor to add text, shapes, images, freehand drawings, and signatures.
- **Sign PDF**: Add digital signatures to your documents securely.
- **Watermark PDF**: Apply custom text or image watermarks for copyright protection.
- **Rotate PDF**: Rotate individual pages or entire documents.
- **Organize PDF**: Rearrange, delete, or sort pages within your PDF.

### 🔄 Conversion

- **PDF to Word**: Convert non-selectable PDFs to editable Word documents.
- **Word to PDF**: Convert DOC/DOCX files to professional PDFs.
- **PDF to Excel**: Extract tables and data into Excel spreadsheets.
- **PDF to JPG**: Convert PDF pages into high-quality images.
- **JPG to PDF**: Create PDFs from images.

### 🛠️ File Management

- **Merge PDF**: Combine multiple PDFs into a single file.
- **Split PDF**: Extract ranges or specific pages into new PDFs.
- **Compress PDF**: Optimize file size without losing quality.
- **Unlock PDF**: Remove passwords from protected files.
- **Protect PDF**: Encrypt your PDF with strong passwords.
- **OCR PDF**: Recognize text in scanned documents via Tesseract.js.

## 🛠️ Technology Stack

Built with the latest and greatest web technologies:

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) + [Framer Motion](https://www.framer.com/motion/) for animations.
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **PDF Engine**: `pdf-lib`, `pdfjs-dist`, `@neslinesli93/qpdf-wasm`
- **OCR Engine**: `tesseract.js`
- **File Handling**: `file-saver`, `jszip`
- **Icons**: `lucide-react`
- **Auth & Ads**: Google Identity Services + Google AdSense

## ⚡ Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/SimplyPDF.git
   cd SimplyPDF
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env.local` file in the root directory:

   ```env
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
   ```

4. **Run the development server:**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📦 Build & Deploy

This project is optimized for deployment on [Vercel](https://vercel.com).

To create a production build locally:

```bash
npm run build
npm start
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Made with ❤️ by Arsh Verma
</p>
