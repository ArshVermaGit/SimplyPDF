import { Metadata } from 'next';
import { OCRPDFClient } from '@/components/pages/ocr-pdf/OCRPDFClient';

export const metadata: Metadata = {
  title: 'OCR PDF Online | Extract Text from Scanned PDFs Free',
  description: 'Make your scanned PDF documents searchable and editable using our advanced OCR tool. Highly accurate text extraction processed 100% locally for your privacy.',
  keywords: ['OCR PDF', 'Optical Character Recognition', 'Searchable PDF', 'Extract Text from PDF', 'SimplyPDF'],
  openGraph: {
    title: 'OCR PDF Online | #1 Free OCR Tool',
    description: 'Convert scanned PDFs into searchable documents in seconds. Fast and private.',
    url: 'https://simplypdf.vercel.app/ocr-pdf',
  },
};

export default function Page() {
  return <OCRPDFClient />;
}
