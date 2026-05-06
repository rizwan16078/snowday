"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  ChevronDown,
  RefreshCw,
  Search,
  X,
  Settings,
} from "lucide-react";
import { useSystemUI } from "@/components/providers/SystemUIContext";
import type { LocationSelection, SchoolType } from "@/types/snow";

interface CommandBarProps {
  locationStr: string;
  locationSlug: string;
  daysUsed: number;
  schoolType: SchoolType;
  isLoading: boolean;
  onLocationChange: (location: LocationSelection) => void;
  onCalibrationToggle: () => void;
  onRefresh: () => void;
}

type SearchResult = LocationSelection;

export function CommandBar({
  locationStr,
  daysUsed,
  schoolType,
  isLoading,
  onLocationChange,
  onCalibrationToggle,
  onRefresh,
}: CommandBarProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const { offline } = useSystemUI();

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (barRef.current && !barRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (isSearchOpen) {
      inputRef.current?.focus();
    }
  }, [isSearchOpen]);

  const search = useCallback(async (value: string) => {
    if (value.trim().length < 2) {
      setResults([]);
      return;
    }

    setSearching(true);

    try {
      const response = await fetch(`/api/snow/geocode?q=${encodeURIComponent(value)}`);
      const data = await response.json();

      if (Array.isArray(data)) {
        setResults(
          data.slice(0, 5).map((result) => ({
            city: result.city,
            state: result.state,
            country: result.country,
            slug: result.slug,
            lat: result.lat,
            lon: result.lon,
            timezone: result.timezone,
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

  const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;
    setQuery(nextValue);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      search(nextValue);
    }, 260);
  };

  const handleSelect = (location: SearchResult) => {
    onLocationChange(location);
    setIsSearchOpen(false);
    setQuery("");
    setResults([]);
  };

  return (
    <>
      <motion.div
        ref={barRef}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        className="hidden items-center gap-1 rounded-2xl px-2 py-1.5 md:flex glass-command"
        role="toolbar"
        aria-label="Prediction controls"
      >
        <AnimatePresence mode="wait">
          {!isSearchOpen ? (
            <motion.button
              key="loc-display"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSearchOpen(true)}
              className="group flex items-center gap-2 rounded-xl px-4 py-2 transition-colors hover:bg-white/5"
              aria-label={`Current location: ${locationStr}. Click to change.`}
            >
              <MapPin className="h-4 w-4 text-blue-400 transition-colors group-hover:text-blue-300" />
              <span className="max-w-[220px] truncate text-sm font-semibold text-white/90">
                {locationStr}
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-white/30" />
            </motion.button>
          ) : (
            <motion.div
              key="loc-search"
              initial={{ opacity: 0, width: 220 }}
              animate={{ opacity: 1, width: 340 }}
              exit={{ opacity: 0, width: 220 }}
              className="relative"
            >
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={handleInput}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    setIsSearchOpen(false);
                  }
                }}
                placeholder="Search city or district..."
                className="w-full rounded-xl bg-white/5 py-2 pl-9 pr-8 text-sm text-white placeholder-white/30 transition-colors focus:bg-white/8 focus:outline-none"
                aria-label="Search for a location"
                aria-autocomplete="list"
                aria-controls="cmd-location-results"
              />
              <button
                onClick={() => {
                  setIsSearchOpen(false);
                  setQuery("");
                  setResults([]);
                }}
                className="absolute right-2 top-1/2 p-0.5 text-white/30 transition-colors hover:text-white/60 -translate-y-1/2"
                aria-label="Close search"
              >
                <X className="h-3.5 w-3.5" />
              </button>

              <AnimatePresence>
                {results.length > 0 ? (
                  <motion.ul
                    id="cmd-location-results"
                    role="listbox"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="glass-heavy absolute top-full z-50 mt-2 w-full overflow-hidden rounded-xl"
                  >
                    {results.map((result) => (
                      <li key={`${result.slug}-${result.lat}`} role="option" aria-selected={false}>
                        <button
                          onClick={() => handleSelect(result)}
                          className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white"
                        >
                          <MapPin className="h-3.5 w-3.5 shrink-0 text-blue-400/60" />
                          <span className="font-medium">{result.city}</span>
                          {result.state ? (
                            <span className="text-white/40">{result.state}</span>
                          ) : (
                            <span className="text-white/40">{result.country}</span>
                          )}
                        </button>
                      </li>
                    ))}
                  </motion.ul>
                ) : null}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mx-1 h-5 w-px bg-white/10" />

        <button
          onClick={onCalibrationToggle}
          className="group flex items-center gap-2 rounded-xl px-3 py-2 transition-colors hover:bg-white/5"
          aria-label="Open SnowSense calibration"
        >
          <Settings className="h-4 w-4 text-cyan-300/70 transition-colors group-hover:text-cyan-200" />
          <span className="text-xs font-medium text-white/40 transition-colors group-hover:text-white/60">
            {daysUsed}d · {schoolType === "public" ? "Pub" : "Priv"}
          </span>
        </button>

        <div className="mx-1 h-5 w-px bg-white/10" />

        <button
          onClick={onRefresh}
          disabled={isLoading || offline}
          className="group rounded-xl p-2.5 transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="Refresh prediction"
        >
          <RefreshCw
            className={`h-4 w-4 text-white/50 transition-colors group-hover:text-white/80 ${
              isLoading ? "animate-spin" : ""
            }`}
          />
        </button>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
        className="safe-area-bottom fixed inset-x-0 bottom-0 z-50 md:hidden"
        role="toolbar"
        aria-label="Prediction controls"
      >
        <div className="glass-command mx-3 mb-3 rounded-2xl px-3 py-2.5">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex min-w-0 flex-1 items-center gap-2 rounded-xl px-3 py-2 transition-colors hover:bg-white/5"
              aria-label={`Location: ${locationStr}. Tap to change.`}
            >
              <MapPin className="h-4 w-4 shrink-0 text-blue-400" />
              <span className="truncate text-sm font-semibold text-white/90">
                {locationStr}
              </span>
            </button>

            <button
              onClick={onCalibrationToggle}
              className="shrink-0 rounded-xl bg-white/5 px-3 py-2 transition-colors hover:bg-white/8"
              aria-label="Open calibration"
            >
              <span className="flex items-center gap-1.5">
                <Settings className="h-3.5 w-3.5 text-cyan-300/80" />
                <span className="text-xs font-semibold text-white/50">{daysUsed}d</span>
              </span>
            </button>

            <button
              onClick={onRefresh}
              disabled={isLoading || offline}
              className="shrink-0 rounded-xl bg-blue-600 p-2 transition-colors hover:bg-blue-500 disabled:opacity-30"
              aria-label="Refresh prediction"
            >
              <RefreshCw
                className={`h-4 w-4 text-white ${isLoading ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isSearchOpen ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] flex flex-col justify-end bg-black/80 backdrop-blur-sm"
              onClick={(event) => {
                if (event.target === event.currentTarget) {
                  setIsSearchOpen(false);
                  setQuery("");
                  setResults([]);
                }
              }}
            >
              <motion.div
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                exit={{ y: 100 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="max-h-[70vh] overflow-auto rounded-t-3xl border-t border-white/10 bg-[#0a0f1e] p-6"
              >
                <div className="mx-auto mb-6 h-1 w-10 rounded-full bg-white/20" />
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/40">
                  Search Location
                </p>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={handleInput}
                    autoFocus
                    placeholder="City, state, or district..."
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-base text-white placeholder-white/30 transition-colors focus:border-blue-400/50 focus:outline-none"
                    aria-label="Search for a location"
                  />
                  {searching ? (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-blue-400" />
                    </div>
                  ) : null}
                </div>
                {results.length > 0 ? (
                  <ul className="space-y-1">
                    {results.map((result) => (
                      <li key={`${result.slug}-${result.lon}`}>
                        <button
                          onClick={() => handleSelect(result)}
                          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm text-white/80 transition-colors hover:bg-white/5"
                        >
                          <MapPin className="h-4 w-4 shrink-0 text-blue-400/60" />
                          <span>
                            <span className="font-semibold">{result.city}</span>
                            <span className="text-white/40">
                              {result.state ? `, ${result.state}` : `, ${result.country}`}
                            </span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}
                <button
                  onClick={() => {
                    setIsSearchOpen(false);
                    setQuery("");
                    setResults([]);
                  }}
                  className="mt-4 w-full rounded-xl bg-white/5 py-3 text-sm font-medium text-white/50 transition-colors hover:bg-white/8"
                >
                  Cancel
                </button>
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.div>
    </>
  );
}
