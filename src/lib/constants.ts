import {
  Merge,
  Split,
  Minimize2,
  RotateCw,
  Image as ImageIcon,
  FileImage,
  Unlock,
  Lock,
  Layers,
  Stamp,
  FileSignature,
  Type,
  FileText,
  FileUp,
  FileDown,
  ScanLine,
  Zap,
  Shield,
  Globe,
  HelpCircle,
} from "lucide-react";

export const tools = [
  { title: "Merge PDF", description: "Combine multiple PDFs into one", icon: Merge, href: "/merge-pdf", featured: true },
  { title: "Split PDF", description: "Separate pages into files", icon: Split, href: "/split-pdf", featured: true },
  { title: "Compress PDF", description: "Reduce file size instantly", icon: Minimize2, href: "/compress-pdf" },
  { title: "Rotate PDF", description: "Rotate pages any direction", icon: RotateCw, href: "/rotate-pdf" },
  { title: "JPG to PDF", description: "Convert images to PDF", icon: ImageIcon, href: "/jpg-to-pdf", featured: true },
  { title: "PDF to JPG", description: "Extract images from PDF", icon: FileImage, href: "/pdf-to-jpg" },
  { title: "Unlock PDF", description: "Remove PDF passwords", icon: Unlock, href: "/unlock-pdf" },
  { title: "Protect PDF", description: "Secure with password", icon: Lock, href: "/protect-pdf" },
  { title: "Organize PDF", description: "Reorder & delete pages", icon: Layers, href: "/organize-pdf" },
  { title: "Watermark", description: "Add text watermarks", icon: Stamp, href: "/watermark-pdf" },
  { title: "Sign PDF", description: "Add digital signature", icon: FileSignature, href: "/sign-pdf" },
  { title: "Edit PDF", description: "Modify PDF content", icon: Type, href: "/edit-pdf" },
  { title: "OCR PDF", description: "Extract text from scans", icon: ScanLine, href: "/ocr-pdf" },
  { title: "PDF to Word", description: "Convert PDF to Word", icon: FileText, href: "/pdf-to-word" },
  { title: "Word to PDF", description: "Convert Word to PDF", icon: FileUp, href: "/word-to-pdf" },
  { title: "PDF to Excel", description: "Convert PDF to Excel", icon: FileDown, href: "/pdf-to-excel" },
];

export const features = [
  { icon: Zap, title: "Lightning Fast", description: "Process files in seconds with our optimized engine" },
  { icon: Shield, title: "100% Secure", description: "Files processed locally, never uploaded to servers" },
  { icon: Globe, title: "Works Anywhere", description: "Use on any device, any browser, anytime" },
];

export const stats = [
  { value: "Secure", label: "Local Processing" },
  { value: "Fast", label: "Optimized Engine" },
  { value: "0", label: "Data Stored" },
  { value: "Free", label: "Accessibility" },
];

export const aboutSocials = [
  {
    name: "Email",
    href: "mailto:arshverma.dev@gmail.com",
    label: "arshverma.dev@gmail.com",
    color: "hover:bg-red-50 hover:text-red-600 hover:border-red-200",
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/arshvermadev/",
    label: "linkedin.com/in/arshvermadev",
    color: "hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200",
  },
  {
    name: "GitHub",
    href: "https://github.com/ArshVermaGit",
    label: "github.com/ArshVermaGit",
    color: "hover:bg-gray-100 hover:text-gray-900 hover:border-gray-300",
  },
  {
    name: "X (Twitter)",
    href: "https://x.com/TheArshVerma",
    label: "x.com/TheArshVerma",
    color: "hover:bg-gray-100 hover:text-gray-900 hover:border-gray-300",
  },
];

export const aboutSkills = [
  { label: "Game Development", detail: "Unity & C#" },
  { label: "Web Development", detail: "Full-Stack Apps" },
  { label: "App Development", detail: "Cross-Platform" },
  { label: "Digital Creation", detail: "UI/UX Design" },
];

export const contactMethods = [
  {
    name: "Email",
    description: "Best for detailed inquiries",
    value: "arshverma.dev@gmail.com",
    href: "mailto:arshverma.dev@gmail.com",
    color: "hover:bg-red-50 hover:border-red-200"
  },
  {
    name: "X (Twitter)",
    description: "Quick questions & updates",
    value: "@TheArshVerma",
    href: "https://x.com/TheArshVerma",
    color: "hover:bg-gray-100 hover:border-gray-300"
  },
  {
    name: "LinkedIn",
    description: "Professional inquiries",
    value: "linkedin.com/in/arshvermadev",
    href: "https://www.linkedin.com/in/arshvermadev/",
    color: "hover:bg-blue-50 hover:border-blue-200"
  },
  {
    name: "GitHub",
    description: "Bug reports & contributions",
    value: "github.com/ArshVermaGit",
    href: "https://github.com/ArshVermaGit",
    color: "hover:bg-gray-100 hover:border-gray-300"
  }
];

export const contactFaqs = [
  {
    q: "How quickly will I get a response?",
    a: "I typically respond within 24-48 hours for email inquiries. For urgent matters, Twitter/X DMs usually get faster responses."
  },
  {
    q: "Can I request new features?",
    a: "Absolutely! I love hearing feature suggestions. Send them via email or create an issue on GitHub."
  },
  {
    q: "Is SimplyPDF open source?",
    a: "The core functionality uses open-source libraries. For full source access or collaboration opportunities, please reach out directly."
  }
];

export const faqCategories = [
  {
    title: "General Questions",
    icon: HelpCircle,
    faqs: [
      {
        question: "What is SimplyPDF?",
        answer: "SimplyPDF is a free online tool that lets you work with PDF files directly in your browser. You can merge, split, compress, convert, rotate, and edit PDFs without uploading them to any server. All processing happens locally on your device for maximum privacy and speed."
      },
      {
        question: "Is SimplyPDF really free?",
        answer: "Yes, SimplyPDF is completely free to use with no hidden costs. All features are available at no charge. We sustain the service through non-intrusive advertising. There are no premium tiers, file limits, or watermarks on your documents."
      },
      {
        question: "Do I need to create an account?",
        answer: "No account is required to use any of our PDF tools. You can optionally sign in with Google to keep a history of your actions across sessions, but this is completely optional. All core features work without signing in."
      },
      {
        question: "What file size limits are there?",
        answer: "Since all processing happens in your browser, file limits depend on your device's available memory. Most modern devices can handle files up to 100MB without issues. For very large files (100MB+), performance may vary based on your device."
      },
      {
        question: "What browsers are supported?",
        answer: "SimplyPDF works on all modern browsers including Chrome, Firefox, Safari, Edge, and Opera. We recommend using the latest version of your browser for the best experience. Mobile browsers are also fully supported."
      }
    ]
  },
  {
    title: "Privacy & Security",
    icon: Shield,
    faqs: [
      {
        question: "Are my files uploaded to your servers?",
        answer: "No, your files are NEVER uploaded to our servers. All PDF processing happens entirely in your web browser using JavaScript. This means your sensitive documents never leave your device, ensuring complete privacy and security."
      },
      {
        question: "Is SimplyPDF safe to use for sensitive documents?",
        answer: "Yes, SimplyPDF is extremely safe for sensitive documents. Since we process everything locally in your browser, confidential information like contracts, financial documents, or personal records never leave your computer. Your data stays on your device."
      },
      {
        question: "What happens to my files after processing?",
        answer: "Your files exist only in your browser's memory while you're using the tool. When you close the tab or navigate away, all file data is automatically cleared. We don't store, cache, or have any access to your documents."
      },
      {
        question: "Do you use cookies?",
        answer: "We use minimal cookies for essential functionality (like remembering theme preferences) and analytics to improve our service. We also use Google AdSense cookies for advertising. You can manage cookie preferences through your browser settings."
      }
    ]
  },
  {
    title: "PDF Tools",
    icon: FileText,
    faqs: [
      {
        question: "How do I merge multiple PDFs?",
        answer: "Go to the Merge PDF tool, drag and drop your PDF files or click to browse and select them. You can reorder files by dragging them into your preferred order. You can also expand each file to see pages, rotate or remove specific pages. When ready, click 'Merge & Download' to combine them into a single PDF."
      },
      {
        question: "How do I split a PDF into multiple files?",
        answer: "Use the Split PDF tool. Upload your PDF, then choose how to split: by specific page ranges (e.g., '1-5, 8-10'), extract all pages as separate files, or select specific pages visually. Click 'Split PDF' to process and download your split files."
      },
      {
        question: "How does PDF compression work?",
        answer: "Our compression tool optimizes your PDF by removing redundant data, optimizing images, and streamlining the file structure. The compression maintains document quality while reducing file size, typically achieving 30-70% size reduction depending on the original file's content."
      },
      {
        question: "Can I convert scanned PDFs to editable text?",
        answer: "Yes! Our OCR (Optical Character Recognition) tool can extract text from scanned documents and image-based PDFs. Upload your scanned PDF, and our tool will process it to extract readable, searchable text. The accuracy depends on the scan quality."
      },
      {
        question: "How do I add a password to my PDF?",
        answer: "Use the Protect PDF tool. Upload your PDF, enter your desired password, and optionally set permissions (like preventing printing or copying). The tool will encrypt your PDF with industry-standard AES encryption."
      },
      {
        question: "What image formats can I convert to PDF?",
        answer: "Our JPG to PDF tool supports JPG, JPEG, PNG, and other common image formats. You can upload multiple images and combine them into a single PDF, or convert each image to its own PDF file."
      }
    ]
  },
  {
    title: "Troubleshooting",
    icon: Zap,
    faqs: [
      {
        question: "Why is processing taking a long time?",
        answer: "Processing time depends on your file size and your device's capabilities. Large PDFs with many pages or high-resolution images take longer. If processing seems stuck, try refreshing the page and using a smaller file, or try on a device with more RAM."
      },
      {
        question: "Why can't I upload my PDF?",
        answer: "Make sure your file has a .pdf extension and is a valid PDF document. Some PDFs may be corrupted or use unsupported features. If the file opens in other PDF readers, try saving it as a new PDF and uploading the new copy."
      },
      {
        question: "The output PDF looks different from the original",
        answer: "PDF processing can sometimes affect formatting, especially for complex documents with special fonts or interactive elements. For best results, use source PDFs that are print-ready. If you're having issues, try using a different tool or contact us."
      },
      {
        question: "My protected PDF won't unlock",
        answer: "Our unlock tool can only remove restrictions (like no-printing) from PDFs. If the PDF requires a password to open (fully encrypted), you'll need to enter the correct password. We cannot bypass password protection without the password."
      },
      {
        question: "The download didn't start",
        answer: "Check if your browser is blocking downloads or pop-ups. Try using a different browser. If the issue persists, make sure you have enough disk space and try right-clicking the download button and selecting 'Save As'."
      }
    ]
  }
];
