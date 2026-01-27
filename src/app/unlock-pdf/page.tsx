import { Metadata } from 'next';
import { UnlockPDFClient } from './UnlockPDFClient';

export const metadata: Metadata = {
  title: 'Unlock PDF Online | Remove PDF Password & Restrictions',
  description: 'Remove passwords and permissions from your PDF files instantly. Unlock your documents for editing and printing free and privately in your browser.',
  keywords: ['Unlock PDF', 'Remove PDF Password', 'PDF Decrypt', 'Free PDF Unlocker', 'SimplyPDF'],
  openGraph: {
    title: 'Unlock PDF Online | #1 Free PDF Unlocking Tool',
    description: 'Remove PDF restrictions and passwords in seconds. Fast and private.',
    url: 'https://simplypdf.vercel.app/unlock-pdf',
  },
};

export default function Page() {
  return <UnlockPDFClient />;
}
