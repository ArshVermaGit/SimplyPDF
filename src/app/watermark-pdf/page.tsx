import { Metadata } from 'next';
import { WatermarkPDFClient } from '@/components/pages/watermark-pdf/WatermarkPDFClient';

export const metadata: Metadata = {
  title: 'Add Watermark to PDF | Professional PDF Watermarking Free',
  description: 'Add custom text or image watermarks to your PDF documents. Set opacity, position, and rotation for a professional look. 100% private and free online tool.',
  keywords: ['Watermark PDF', 'Add Watermark to PDF', 'PDF Watermark Online', 'Protect PDF with Watermark', 'SimplyPDF'],
  openGraph: {
    title: 'Add Watermark to PDF | #1 Free Watermarking Tool',
    description: 'Stamp your PDF files with custom watermarks in seconds. Easy, free, and secure.',
    url: 'https://simplypdf.vercel.app/watermark-pdf',
  },
};

export default function Page() {
  return <WatermarkPDFClient />;
}
