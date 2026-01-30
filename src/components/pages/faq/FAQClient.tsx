"use client";

import { useState } from "react";
import { faqCategories } from "@/lib/constants";
import { FAQHeader } from "@/components/sections/faq/FAQHeader";
import { FAQSearch } from "@/components/sections/faq/FAQSearch";
import { FAQQuickLinks } from "@/components/sections/faq/FAQQuickLinks";
import { FAQCategories } from "@/components/sections/faq/FAQCategories";
import { SimpleCTA } from "@/components/sections/common/SimpleCTA";
import { BackgroundGradient } from "@/components/ui/BackgroundGradient";

export default function FAQClient() {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  const toggleItem = (key: string) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(key)) {
      newOpenItems.delete(key);
    } else {
      newOpenItems.add(key);
    }
    setOpenItems(newOpenItems);
  };

  const filteredCategories = faqCategories
    .map((category) => ({
      ...category,
      faqs: category.faqs.filter(
        (faq) =>
          faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((category) => category.faqs.length > 0);

  return (
    <main className="min-h-screen px-4 pt-32 pb-20">
      {/* Background */}
      <BackgroundGradient />

      <div className="container mx-auto max-w-4xl">
        <FAQHeader />
        <FAQSearch searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <FAQQuickLinks />
        <FAQCategories
          filteredCategories={filteredCategories}
          openItems={openItems}
          toggleItem={toggleItem}
        />
        <SimpleCTA
          title="Still Have Questions?"
          description="Can't find what you're looking for? We're here to help."
          primaryBtnText="Contact Us"
          primaryBtnLink="/contact"
          secondaryBtnText="Explore Tools"
          secondaryBtnLink="/"
        />
      </div>
    </main>
  );
}
