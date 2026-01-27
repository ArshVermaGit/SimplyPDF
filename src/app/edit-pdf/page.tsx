import { Metadata } from 'next';
import { EditPDFClient } from './EditPDFClient';

export const metadata: Metadata = {
  title: 'PDF Editor Online | Edit PDF Documents for Free',
  description: 'The easiest way to edit PDF files online. Add text, shapes, signatures, and images to your PDF documents 100% privately in your browser. No sign-up required.',
  keywords: ['PDF Editor', 'Edit PDF Online', 'Free PDF Editor', 'Annotate PDF', 'PDF Signer', 'SimplyPDF'],
  openGraph: {
    title: 'PDF Editor Online | #1 Free PDF Editing Tool',
    description: 'Professional PDF editing made simple. Edit your documents for free and securely.',
    url: 'https://simplypdf.vercel.app/edit-pdf',
  },
};

export default function Page() {
  return <EditPDFClient />;
}
