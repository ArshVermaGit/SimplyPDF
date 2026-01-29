import { Metadata } from 'next';
import { CompressPDFClient } from '@/components/pages/compress-pdf/CompressPDFClient';

export const metadata: Metadata = {
  title: 'Compress PDF Online | Reduce PDF File Size Free',
  description: 'Shrink your PDF files without losing quality. Our online compressor significantly reduces file size for easier sharing and storage. 100% free and private.',
  keywords: ['Compress PDF', 'Reduce PDF Size', 'Shrink PDF', 'Small PDF', 'Free Online Compressor', 'SimplyPDF'],
  openGraph: {
    title: 'Compress PDF Online | #1 Free PDF Compressor',
    description: 'Reduce the size of your PDFs while maintaining top quality. Free and secure.',
    url: 'https://simplypdf.vercel.app/compress-pdf',
  },
};

export default function Page() {
  return <CompressPDFClient />;
}
