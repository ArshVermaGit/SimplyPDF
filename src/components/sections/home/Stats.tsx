import { stats } from "@/lib/constants";

export const Stats = () => {
  return (
    <section className="border-y border-gray-100 bg-gray-50/50 py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((stat, index) => (
            <div key={index} className="group text-center">
              <div className="mb-3 text-5xl font-black tracking-tighter text-black transition-transform duration-500 group-hover:scale-110 md:text-7xl">
                {stat.value}
              </div>
              <div className="text-[10px] font-black tracking-[0.3em] whitespace-nowrap text-gray-400 uppercase md:text-xs">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
