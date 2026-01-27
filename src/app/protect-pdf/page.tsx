import { Metadata } from 'next';
import { ProtectPDFClient } from './ProtectPDFClient';

export const metadata: Metadata = {
  title: 'Protect PDF with Password | Encrypt PDF Online Free',
  description: 'Add a password to your PDF document to protect sensitive information. Our tool uses professional encryption to secure your files locally in your browser. Fast, free, and 100% private.',
  keywords: ['Protect PDF', 'Encrypt PDF', 'PDF Password', 'Secure PDF', 'Free PDF Locker', 'SimplyPDF'],
  openGraph: {
    title: 'Protect PDF with Password | #1 Free PDF Security Tool',
    description: 'Secure your PDF files with advanced encryption. Free and private.',
    url: 'https://simplypdf.vercel.app/protect-pdf',
  },
};

export default function Page() {
  return <ProtectPDFClient />;
}
