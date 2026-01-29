import { Star } from "lucide-react";

export const Testimonials = () => {
  return (
    <section className="py-16 border-t border-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-8 flex-wrap scroll-reveal">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-black" />
            ))}
          </div>
          <div className="text-gray-500">
            Loved by <span className="text-black font-semibold">10,000+</span> users worldwide
          </div>
        </div>
      </div>
    </section>
  );
};
