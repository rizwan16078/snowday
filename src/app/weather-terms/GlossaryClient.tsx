"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, ArrowRight, X } from "lucide-react";
import type { GlossaryTerm } from "@/lib/glossary-data";

interface GlossaryClientProps {
  terms: GlossaryTerm[];
  letters: string[];
}

const CATEGORY_LABELS: Record<GlossaryTerm["category"], string> = {
  snow: "Snow",
  cold: "Cold Weather",
  "weather-science": "Weather Science",
  storm: "Storms",
  atmospheric: "Atmospheric",
  phenomenon: "Phenomenon",
  safety: "Safety",
};

const CATEGORY_COLORS: Record<GlossaryTerm["category"], string> = {
  snow: "bg-blue-500/15 text-blue-300 border-blue-400/20",
  cold: "bg-cyan-500/15 text-cyan-300 border-cyan-400/20",
  "weather-science": "bg-purple-500/15 text-purple-300 border-purple-400/20",
  storm: "bg-red-500/15 text-red-300 border-red-400/20",
  atmospheric: "bg-emerald-500/15 text-emerald-300 border-emerald-400/20",
  phenomenon: "bg-amber-500/15 text-amber-300 border-amber-400/20",
  safety: "bg-orange-500/15 text-orange-300 border-orange-400/20",
};

export function GlossaryClient({ terms, letters }: GlossaryClientProps) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let result = terms;
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (t) =>
          t.term.toLowerCase().includes(q) ||
          t.definition.toLowerCase().includes(q)
      );
    }
    if (activeCategory) {
      result = result.filter((t) => t.category === activeCategory);
    }
    return result;
  }, [terms, query, activeCategory]);

  // Group filtered terms by first letter
  const grouped = useMemo(() => {
    const map: Record<string, GlossaryTerm[]> = {};
    for (const t of filtered) {
      const l = t.term[0].toUpperCase();
      if (!map[l]) map[l] = [];
      map[l].push(t);
    }
    return map;
  }, [filtered]);

  const visibleLetters = useMemo(
    () => Object.keys(grouped).sort(),
    [grouped]
  );

  const allCategories = useMemo(() => {
    const set = new Set(terms.map((t) => t.category));
    return Array.from(set);
  }, [terms]);

  return (
    <>
      {/* Search + Filter Bar */}
      <div className="sticky top-20 z-30 -mx-4 px-4 py-4 mb-8 bg-[#050a14]/85 backdrop-blur-xl border-b border-white/[0.05]">
        <div className="max-w-4xl mx-auto">
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Search terms... (e.g. petrichor, wind chill, ice dam)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/10 rounded-2xl py-3 pl-11 pr-11 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-400/50 focus:ring-1 focus:ring-blue-400/30 transition-all"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category filter chips */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-3 py-1.5 rounded-full text-[11px] uppercase tracking-wider font-bold border transition-all ${
                !activeCategory
                  ? "bg-white/15 border-white/20 text-white"
                  : "bg-transparent border-white/10 text-white/40 hover:text-white/70"
              }`}
            >
              All
            </button>
            {allCategories.map((cat) => (
              <button
                key={cat}
                onClick={() =>
                  setActiveCategory(activeCategory === cat ? null : cat)
                }
                className={`px-3 py-1.5 rounded-full text-[11px] uppercase tracking-wider font-bold border transition-all ${
                  activeCategory === cat
                    ? CATEGORY_COLORS[cat]
                    : "bg-transparent border-white/10 text-white/40 hover:text-white/70"
                }`}
              >
                {CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4">
        {/* Alphabet jump nav (only when no filter) */}
        {!query && !activeCategory && (
          <div className="flex flex-wrap gap-1.5 mb-10 pb-6 border-b border-white/[0.05]">
            {letters.map((l) => (
              <a
                key={l}
                href={`#letter-${l}`}
                className="w-9 h-9 inline-flex items-center justify-center rounded-lg bg-white/[0.03] border border-white/10 text-sm font-bold text-white/60 hover:text-blue-300 hover:border-blue-400/30 hover:bg-blue-500/10 transition-all"
              >
                {l}
              </a>
            ))}
          </div>
        )}

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-white/40 text-sm">
              No terms match{" "}
              <span className="text-white/70 font-bold">
                &ldquo;{query}&rdquo;
              </span>
              . Try a different word.
            </p>
          </div>
        )}

        {/* Grouped term list */}
        {visibleLetters.map((letter) => (
          <section key={letter} id={`letter-${letter}`} className="mb-14 scroll-mt-44">
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-4xl font-display font-black text-blue-400/80">
                {letter}
              </h2>
              <div className="flex-1 h-px bg-gradient-to-r from-blue-400/20 via-white/5 to-transparent" />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {grouped[letter].map((t) => {
                const cardClasses =
                  "group glass-card rounded-2xl p-5 border border-white/[0.06] transition-all hover:border-blue-400/30 hover:bg-white/[0.02] scroll-mt-44 block h-full";
                const inner = (
                  <>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <h3 className="text-lg font-bold text-white leading-snug group-hover:text-blue-200 transition-colors">
                        {t.term}
                      </h3>
                      <span
                        className={`shrink-0 px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider font-bold border ${
                          CATEGORY_COLORS[t.category]
                        }`}
                      >
                        {CATEGORY_LABELS[t.category]}
                      </span>
                    </div>
                    <p className="text-sm text-white/65 leading-relaxed mb-3">
                      {t.definition}
                    </p>
                    {t.relatedBlog && (
                      <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-bold text-blue-300 group-hover:text-blue-200 transition-colors">
                        Learn More
                        <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    )}
                  </>
                );

                // If the term has a related blog post, the whole card is clickable.
                // Otherwise it remains a static anchor target so users can deep-link
                // to it via /weather-terms#<slug>.
                if (t.relatedBlog) {
                  return (
                    <Link
                      key={t.slug}
                      id={t.slug}
                      href={`/blog/${t.relatedBlog}`}
                      className={cardClasses}
                    >
                      {inner}
                    </Link>
                  );
                }
                return (
                  <article key={t.slug} id={t.slug} className={cardClasses}>
                    {inner}
                  </article>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
