"use client";

import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";

/**
 * BackToTop — floating scroll-to-top button.
 *
 * Appears in the bottom-right after the user scrolls past 400px. Uses a
 * scroll listener with passive: true and rAF throttling so it doesn't
 * affect main-thread performance.
 */
export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setVisible(window.scrollY > 400);
        ticking = false;
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Back to top"
      title="Back to top"
      data-visible={visible}
      className="
        group fixed bottom-6 right-6 z-[60]
        h-11 w-11 rounded-full
        bg-blue-600/90 hover:bg-blue-500
        border border-white/15 hover:border-white/30
        text-white
        shadow-[0_4px_24px_-2px_rgba(59,130,246,0.55)]
        backdrop-blur-sm
        flex items-center justify-center
        transition-all duration-500 ease-out
        data-[visible=false]:pointer-events-none
        data-[visible=false]:opacity-0
        data-[visible=false]:translate-y-3
        data-[visible=true]:opacity-100
        data-[visible=true]:translate-y-0
        hover:scale-110 active:scale-95
      "
    >
      <ChevronUp className="h-5 w-5 transition-transform group-hover:-translate-y-0.5" aria-hidden="true" />
      <span className="sr-only">Back to top</span>
    </button>
  );
}
