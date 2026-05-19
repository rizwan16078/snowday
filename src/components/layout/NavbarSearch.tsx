"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";

interface SearchResult {
  city: string;
  state: string;
  country: string;
  slug: string;
  lat: number;
  lon: number;
  timezone?: string;
}

export function NavbarSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
        setResults([]);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Focus input when opened
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setQuery("");
        setResults([]);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const search = useCallback(async (value: string) => {
    if (value.trim().length < 2) {
      setResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(`/api/snow/geocode?q=${encodeURIComponent(value)}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setResults(
          data.slice(0, 5).map((r: SearchResult) => ({
            city: r.city,
            state: r.state,
            country: r.country,
            slug: r.slug,
            lat: r.lat,
            lon: r.lon,
            timezone: r.timezone,
          }))
        );
      } else {
        setResults([]);
      }
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val), 260);
  };

  const handleSelect = (result: SearchResult) => {
    setOpen(false);
    setQuery("");
    setResults([]);
    router.push(`/snow-day-calculator/${result.slug}`);
  };

  return (
    <div ref={panelRef} className="relative">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center justify-center rounded-lg p-2 text-zinc-400 transition-colors hover:text-white hover:bg-white/5"
        aria-label="Search locations"
      >
        <Search className="h-5 w-5" />
      </button>

      {/* Search panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full z-[60] mt-2 w-80 overflow-hidden rounded-2xl border border-white/10 bg-[#0a0f1e]/95 backdrop-blur-2xl shadow-2xl sm:w-96"
          >
            {/* Input */}
            <div className="relative border-b border-white/5 px-3 py-2.5">
              <Search className="absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={handleInput}
                placeholder="Search ZIP code, city, or district..."
                className="w-full bg-transparent py-1.5 pl-10 pr-8 text-sm text-white placeholder-white/30 outline-none"
                aria-label="Search by ZIP code, city, or district"
                aria-autocomplete="list"
                aria-controls="navbar-search-results"
              />
              {searching ? (
                <div className="absolute right-5 top-1/2 -translate-y-1/2">
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/20 border-t-blue-400" />
                </div>
              ) : (
                <button
                  onClick={() => { setOpen(false); setQuery(""); setResults([]); }}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                  aria-label="Close search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Results */}
            <div className="max-h-72 overflow-y-auto p-1.5">
              {results.length > 0 ? (
                <ul id="navbar-search-results" role="listbox">
                  {results.map((result) => (
                    <li key={`${result.slug}-${result.lat}`} role="option" aria-selected={false}>
                      <button
                        onClick={() => handleSelect(result)}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white"
                      >
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-blue-400/60" />
                        <span className="font-medium">{result.city}</span>
                        {result.state ? (
                          <span className="text-white/35">{result.state}</span>
                        ) : (
                          <span className="text-white/35">{result.country}</span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : query.trim().length >= 2 && !searching ? (
                <p className="px-3 py-4 text-center text-xs text-white/30">
                  No locations found for &ldquo;{query}&rdquo;
                </p>
              ) : null}
            </div>

            {/* Footer hint */}
            <div className="border-t border-white/5 px-4 py-2">
              <p className="text-[10px] text-white/20">
                Search any US city, ZIP code, or school district
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
