import { Metadata } from 'next';
import { PDFToExcelClient } from './PDFToExcelClient';

export const metadata: Metadata = {
  title: 'PDF to Excel Converter | Extract PDF Tables to XLSX Online',
  description: 'Convert your PDF tables into editable Excel spreadsheets with high accuracy. Extract data into XLSX format free and privately in your browser.',
  keywords: ['PDF to Excel', 'PDF to XLSX', 'Extract Table from PDF', 'Free PDF to Excel Converter', 'SimplyPDF'],
  openGraph: {
    title: 'PDF to Excel Converter | #1 Free Data Extraction Tool',
    description: 'Turn your PDF tables into editable Excel files in seconds. Fast and secure.',
    url: 'https://simplypdf.vercel.app/pdf-to-excel',
  },
};

export default function Page() {
  return <PDFToExcelClient />;
}
