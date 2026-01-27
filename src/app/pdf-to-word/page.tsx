import { Metadata } from 'next';
import { PDFToWordClient } from './PDFToWordClient';

export const metadata: Metadata = {
  title: 'PDF to Word Converter | Convert PDF to DocX Online Free',
  description: 'Convert your PDF documents to editable Microsoft Word files with incredible accuracy. 100% free, secure, and processed directly in your browser.',
  keywords: ['PDF to Word', 'PDF to DocX', 'Convert PDF to Word', 'Free Online Converter', 'SimplyPDF'],
  openGraph: {
    title: 'PDF to Word Converter | #1 Free Conversion Tool',
    description: 'Turn your PDFs into editable Word documents in seconds. High accuracy and private.',
    url: 'https://simplypdf.vercel.app/pdf-to-word',
  },
};

export default function Page() {
  return <PDFToWordClient />;
}
