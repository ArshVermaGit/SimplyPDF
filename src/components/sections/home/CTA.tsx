import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const CTA = () => {
  return (
    <section className="py-24 md:py-32">
      <div className="container mx-auto px-4">
        <div className="relative max-w-4xl mx-auto text-center p-12 md:p-20 rounded-[3rem] bg-gray-50 overflow-hidden scroll-reveal">
          <div className="absolute inset-0 grid-pattern opacity-50" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-gray-200 rounded-full blur-3xl -translate-y-1/2" />

          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Ready to simplify your PDFs?
            </h2>
            <p className="text-gray-500 text-lg mb-8 max-w-xl mx-auto">
              Join millions who trust SimplyPDF for their document needs.
            </p>
            <Link href="/merge-pdf" className="btn-primary text-lg px-12 py-5 inline-flex items-center gap-2">
              Start Now — It&apos;s Free
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
