"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

interface BlogFAQProps {
  items: FAQItem[];
}

export function BlogFAQ({ items }: BlogFAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="my-10 space-y-3">
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div
            key={i}
            className="glass-card rounded-2xl overflow-hidden border border-white/10 transition-all hover:border-blue-400/30"
          >
            <button
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-white/[0.02]"
              aria-expanded={isOpen}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <HelpCircle className="w-4 h-4 text-blue-400 shrink-0" />
                <h3 className="text-sm sm:text-base font-bold text-white leading-snug">
                  {item.question}
                </h3>
              </div>
              <ChevronDown
                className={`w-5 h-5 text-white/40 shrink-0 transition-transform duration-300 ${
                  isOpen ? "rotate-180 text-blue-400" : ""
                }`}
              />
            </button>
            <div
              className={`grid transition-all duration-300 ease-in-out ${
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <div className="px-5 pb-4 pt-1 text-sm text-white/70 leading-relaxed border-t border-white/5">
                  {item.answer}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
