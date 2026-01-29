import { Check } from "lucide-react";
import { features } from "@/lib/constants";

export const Features = () => {
  return (
    <section className="py-24 md:py-32 bg-black text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 grid-pattern" style={{ backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)' }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16 scroll-reveal">
          <h2 className="section-title text-white mb-4">Why SimplyPDF?</h2>
          <p className="section-subtitle text-gray-400 mx-auto">
            Built for speed, privacy, and simplicity.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 stagger-children">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-500 group"
            >
              <div className="w-14 h-14 rounded-2xl bg-white text-black flex items-center justify-center mb-6 transition-transform group-hover:scale-110 group-hover:rotate-6">
                <feature.icon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="mt-20 flex flex-wrap justify-center gap-6 scroll-reveal">
          {["No signup required", "Works offline", "No file limits", "Forever free"].map((badge) => (
            <div key={badge} className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/20">
              <Check className="w-4 h-4 text-green-400" />
              <span className="text-sm">{badge}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
