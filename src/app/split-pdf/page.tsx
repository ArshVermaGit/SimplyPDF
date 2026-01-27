import { Metadata } from 'next';
import { SplitPDFClient } from './SplitPDFClient';

export const metadata: Metadata = {
  title: 'Split PDF Online | Separate PDF Pages for Free',
  description: 'Easily split PDF files into individual pages or extract specific page ranges into new documents. 100% private, free, and secure processing in your browser.',
  keywords: ['Split PDF', 'Separate PDF Pages', 'Extract PDF Pages', 'Free PDF Splitter', 'SimplyPDF'],
  openGraph: {
    title: 'Split PDF Online | #1 Free PDF Splitting Tool',
    description: 'Separate or extract PDF pages in seconds. Fast, free, and secure.',
    url: 'https://simplypdf.vercel.app/split-pdf',
  },
};

export default function Page() {
  return <SplitPDFClient />;
}
