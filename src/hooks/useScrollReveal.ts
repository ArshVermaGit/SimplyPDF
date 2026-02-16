"use client";

import { useEffect } from "react";

export function useScrollReveal(
  selector: string = ".scroll-reveal, .scroll-reveal-left, .scroll-reveal-right, .scroll-reveal-scale, .stagger-up, .stagger-children"
) {
  useEffect(() => {
    const setupObserver = () => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("visible");
              observer.unobserve(entry.target); // Stop observing once visible
            }
          });
        },
        { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
      );

      const elements = document.querySelectorAll(selector);
      elements.forEach((el) => observer.observe(el));

      return () => observer.disconnect();
    };

    if ("requestIdleCallback" in window) {
      const handle = window.requestIdleCallback(setupObserver);
      return () => window.cancelIdleCallback(handle);
    } else {
      const timeout = setTimeout(setupObserver, 100);
      return () => clearTimeout(timeout);
    }
  }, [selector]);
}
