import { Metadata } from 'next';
import { RotatePDFClient } from './RotatePDFClient';

export const metadata: Metadata = {
  title: 'Rotate PDF Online | Permanently Rotate PDF Pages Free',
  description: 'Rotate your PDF pages permanently. Whether it is one page or the whole document, rotate it to the perfect orientation for free and privately.',
  keywords: ['Rotate PDF', 'Change PDF Orientation', 'Free PDF Rotator', 'SimplyPDF'],
  openGraph: {
    title: 'Rotate PDF Online | #1 Free PDF Rotation Tool',
    description: 'Fix the orientation of your PDF files instantly. 100% private and secure.',
    url: 'https://simplypdf.vercel.app/rotate-pdf',
  },
};

export default function Page() {
  return <RotatePDFClient />;
}
