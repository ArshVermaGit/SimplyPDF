import { Metadata } from 'next';
import { WordToPDFClient } from './WordToPDFClient';

export const metadata: Metadata = {
  title: 'Word to PDF Converter | Convert DocX to PDF Online Free',
  description: 'Convert your Microsoft Word documents to professional PDF files instantly. Our converter maintains your original formatting, fonts, and layout. 100% private and secure.',
  keywords: ['Word to PDF', 'DocX to PDF', 'Convert Word to PDF', 'Free Online Converter', 'SimplyPDF'],
  openGraph: {
    title: 'Word to PDF Converter | #1 Free Word to PDF Tool',
    description: 'Turn your Word documents into high-quality PDFs in seconds. Fast, free, and secure.',
    url: 'https://simplypdf.vercel.app/word-to-pdf',
  },
};

export default function Page() {
  return <WordToPDFClient />;
}
