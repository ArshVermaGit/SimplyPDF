import { Metadata } from "next";
import { EditMetadataClient } from "@/components/pages/edit-metadata/EditMetadataClient";

export const metadata: Metadata = {
  title: "Edit PDF Metadata | Change PDF Title, Author & Tags",
  description:
    "Quickly modify the internal metadata of your PDF documents. Change the title, author, subject, and keywords free and privately in your browser.",
  keywords: [
    "Edit PDF Metadata",
    "Change PDF Title",
    "Update PDF Author",
    "PDF Properties Editor",
    "SimplyPDF",
  ],
  openGraph: {
    title: "Edit PDF Metadata | #1 Free PDF Property Editor",
    description:
      "Manage your PDF file properties easily. Fast, free, and secure.",
    url: "https://simplypdf.vercel.app/edit-metadata",
  },
};

export default function Page() {
  return <EditMetadataClient />;
}
