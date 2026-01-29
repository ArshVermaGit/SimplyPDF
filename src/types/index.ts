import { LucideIcon } from "lucide-react";

export interface PageInfo {
  pageNumber: number;
  image: string;
  id?: string;
  fileId?: string;
  fileName?: string;
  rotation?: 0 | 90 | 180 | 270;
  originalArrayBuffer?: ArrayBuffer;
  isHidden?: boolean;
  selected?: boolean;
}

export interface FileInfo {
  id: string;
  name: string;
  size: number;
  pages: PageInfo[];
  isExpanded: boolean;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface FAQCategory {
  title: string;
  icon: LucideIcon;
  faqs: FAQItem[];
}

export interface LegalSection {
  icon: LucideIcon;
  title: string;
  content: string;
}
