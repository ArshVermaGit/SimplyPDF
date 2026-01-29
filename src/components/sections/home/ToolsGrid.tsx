import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { tools } from "@/lib/constants";

export const ToolsGrid = () => {
  return (
    <section id="tools" className="py-24 md:py-32">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 scroll-reveal">
          <h2 className="section-title mb-4">Powerful PDF Tools</h2>
          <p className="section-subtitle mx-auto">
            Everything you need to work with PDF files, completely free.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
          {tools.slice(0, 4).map((tool, index) => (
            <Link
              key={tool.href}
              href={tool.href}
              className={`tool-card ${index === 0 ? "lg:col-span-2 lg:row-span-2" : ""}`}
            >
              <div className={`tool-icon ${index === 0 ? "w-20 h-20" : ""} mb-4`}>
                <tool.icon className={index === 0 ? "w-10 h-10" : "w-7 h-7"} />
              </div>
              <h3 className={`font-bold mb-2 ${index === 0 ? "text-2xl" : "text-lg"}`}>{tool.title}</h3>
              <p className="text-gray-500 text-sm">{tool.description}</p>
              <div className="mt-4 flex items-center text-sm font-medium group-hover:underline">
                Use Tool <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>

        {/* Second Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 stagger-children">
          {tools.slice(4).map((tool) => (
            <Link key={tool.href} href={tool.href} className="tool-card">
              <div className="tool-icon mb-4">
                <tool.icon className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-lg mb-2">{tool.title}</h3>
              <p className="text-gray-500 text-sm">{tool.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
