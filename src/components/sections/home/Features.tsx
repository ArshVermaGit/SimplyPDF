import { Check } from "lucide-react";
import { features } from "@/lib/constants";

export const Features = () => {
  return (
    <section className="relative overflow-hidden bg-black py-24 text-white md:py-32">
      <div className="absolute inset-0 opacity-5">
        <div
          className="grid-pattern absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)",
          }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-4">
        <div className="scroll-reveal mb-16 text-center">
          <h2 className="section-title mb-4 text-white">Why SimplyPDF?</h2>
          <p className="section-subtitle mx-auto text-gray-400">
            Built for speed, privacy, and simplicity.
          </p>
        </div>

        <div className="stagger-up grid gap-8 md:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm transition-all duration-500 hover:bg-white/10"
            >
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-black transition-transform group-hover:scale-110 group-hover:rotate-6">
                <feature.icon className="h-7 w-7" />
              </div>
              <h3 className="mb-3 text-xl font-bold">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="scroll-reveal mt-20 flex flex-wrap justify-center gap-6">
          {[
            "No signup required",
            "Works offline",
            "No file limits",
            "Forever free",
          ].map((badge) => (
            <div
              key={badge}
              className="flex items-center gap-2 rounded-full border border-white/20 px-4 py-2"
            >
              <Check className="h-4 w-4 text-green-400" />
              <span className="text-sm">{badge}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
