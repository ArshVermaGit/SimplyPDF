import { Metadata } from 'next';
import { OrganizePDFClient } from './OrganizePDFClient';

export const metadata: Metadata = {
  title: 'Organize PDF Pages | Reorder & Delete Pages Online',
  description: 'Manage your PDF pages with ease. Reorder, delete, or rotate pages to organize your document exactly how you want it. 100% private and free.',
  keywords: ['Organize PDF', 'Reorder PDF Pages', 'Delete PDF Pages', 'Manage PDF Pages', 'SimplyPDF'],
  openGraph: {
    title: 'Organize PDF Pages | #1 Free PDF Management Tool',
    description: 'The easiest way to organize your PDF documents. Fast, free, and secure.',
    url: 'https://simplypdf.vercel.app/organize-pdf',
  },
};

export default function Page() {
  return <OrganizePDFClient />;
}
