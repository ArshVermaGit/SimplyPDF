import { Metadata } from 'next';
import { RepairPDFClient } from '@/components/pages/repair-pdf/RepairPDFClient';

export const metadata: Metadata = {
  title: 'Repair PDF Online | Fix Corrupted & Broken PDF Files',
  description: 'Recover data from damaged or corrupted PDF documents. Our repair tool attempts to restore the structure and content of your files for free and securely.',
  keywords: ['Repair PDF', 'Fix PDF', 'Recover PDF', 'Broken PDF Fixer', 'SimplyPDF'],
  openGraph: {
    title: 'Repair PDF Online | #1 Free PDF Recovery Tool',
    description: 'Restore your corrupted PDF files in seconds. Fast and private.',
    url: 'https://simplypdf.vercel.app/repair-pdf',
  },
};

export default function Page() {
  return <RepairPDFClient />;
}
