import type { Metadata } from "next";
import { ExcelToPDFClient } from "@/components/pages/excel-to-pdf/ExcelToPdfClient";

export const metadata: Metadata = {
  title: "Excel to PDF - Convert Spreadsheets to PDF | SimplyPDF",
  description:
    "Convert your Excel spreadsheets (.xlsx, .xls, .csv) to high-quality PDF documents for free. No file limits, 100% private and secure processing in your browser.",
};

export default function ExcelToPDFPage() {
  return <ExcelToPDFClient />;
}
