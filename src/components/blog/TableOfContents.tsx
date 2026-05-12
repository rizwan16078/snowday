"use client";

import { useEffect, useState } from "react";
import { List } from "lucide-react";

interface TOCProps {
  headings: { id: string; text: string }[];
}

export function TableOfContents({ headings }: TOCProps) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: 0 }
    );

    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav className="hidden lg:block sticky top-24 self-start">
      <div className="glass-card rounded-2xl p-5 border border-white/10">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
          <List className="w-4 h-4 text-blue-400" />
          <p className="text-[10px] uppercase tracking-[0.2em] text-blue-300 font-bold">
            On This Page
          </p>
        </div>
        <ul className="space-y-2">
          {headings.map(({ id, text }) => {
            const isActive = activeId === id;
            return (
              <li key={id}>
                <a
                  href={`#${id}`}
                  className={`block text-[13px] leading-snug transition-all py-1 pl-3 border-l-2 ${
                    isActive
                      ? "text-blue-300 border-blue-400 font-semibold"
                      : "text-white/50 border-transparent hover:text-white/80 hover:border-white/20"
                  }`}
                >
                  {text}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
