import { Star } from "lucide-react";

export const Testimonials = () => {
  return (
    <section className="border-t border-gray-100 py-16">
      <div className="container mx-auto px-4">
        <div className="scroll-reveal flex flex-wrap items-center justify-center gap-8">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-5 w-5 fill-black" />
            ))}
          </div>
          <div className="text-gray-500">
            Loved by <span className="font-semibold text-black">10,000+</span>{" "}
            users worldwide
          </div>
        </div>
      </div>
    </section>
  );
};
