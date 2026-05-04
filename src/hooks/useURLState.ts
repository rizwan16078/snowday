"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { GeocodingResult, StrictnessLevel } from "@/types/snow";
import { DEFAULT_LOCATION } from "@/lib/geocoding";

/**
 * useURLState — Sync all prediction state with URL params
 *
 * URL format: ?loc=boston-ma&lat=42.3601&lon=-71.0589&strictness=normal
 *
 * Enables:
 * - Shareable links that reproduce exact state
 * - Deep linking from shared predictions
 * - SEO consistency
 * - Browser back/forward navigation
 */

interface URLState {
  location: GeocodingResult | null;
  strictness: StrictnessLevel;
  setLocation: (loc: GeocodingResult) => void;
  setStrictness: (s: StrictnessLevel) => void;
  isFromURL: boolean; // true if state was hydrated from URL
}

const VALID_STRICTNESS: StrictnessLevel[] = ["lenient", "normal", "strict"];

function parseStrictness(val: string | null): StrictnessLevel {
  if (val && VALID_STRICTNESS.includes(val as StrictnessLevel)) {
    return val as StrictnessLevel;
  }
  return "normal";
}

export function useURLState(): URLState {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const initializedRef = useRef(false);
  const [isFromURL, setIsFromURL] = useState(false);

  const [location, setLocationState] = useState<GeocodingResult | null>(null);
  const [strictness, setStrictnessState] = useState<StrictnessLevel>("normal");

  // Hydrate state from URL on first mount
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");
    const loc = searchParams.get("loc");
    const str = searchParams.get("strictness");

    // If lat/lon are in URL, hydrate from URL
    if (lat && lon) {
      const parsedLat = parseFloat(lat);
      const parsedLon = parseFloat(lon);
      if (!isNaN(parsedLat) && !isNaN(parsedLon)) {
        // Parse location name from loc param
        const locParts = (loc || "").split(",").map((s) => s.replace(/-/g, " ").trim());
        const city = locParts[0]
          ? locParts[0].replace(/\b\w/g, (c) => c.toUpperCase())
          : "Unknown";
        const state = locParts[1]
          ? locParts[1].replace(/\b\w/g, (c) => c.toUpperCase())
          : "";

        setLocationState({
          lat: parsedLat,
          lon: parsedLon,
          city,
          state,
          country: "US",
        });
        setIsFromURL(true);
      }
    } else {
      // Server is single source of truth now
      // This branch should only be hit if someone manually removed params
      setLocationState(DEFAULT_LOCATION);
    }

    if (str) {
      setStrictnessState(parseStrictness(str));
    }
  }, [searchParams]);

  // Update URL when state changes (but not on initial hydration)
  const updateURL = useCallback(
    (loc: GeocodingResult | null, str: StrictnessLevel) => {
      if (!loc) return;
      const params = new URLSearchParams();
      const locSlug = [loc.city, loc.state]
        .filter(Boolean)
        .join(",")
        .toLowerCase()
        .replace(/\s+/g, "-");
      params.set("loc", locSlug);
      params.set("lat", loc.lat.toFixed(4));
      params.set("lon", loc.lon.toFixed(4));
      if (str !== "normal") {
        params.set("strictness", str);
      }
      const url = `${pathname}?${params.toString()}`;
      router.replace(url, { scroll: false });
    },
    [pathname, router]
  );

  const setLocation = useCallback(
    (loc: GeocodingResult) => {
      setLocationState(loc);
      localStorage.setItem("snowday_location", JSON.stringify(loc));
      updateURL(loc, strictness);
    },
    [strictness, updateURL]
  );

  const setStrictness = useCallback(
    (s: StrictnessLevel) => {
      setStrictnessState(s);
      updateURL(location, s);
    },
    [location, updateURL]
  );

  return {
    location,
    strictness,
    setLocation,
    setStrictness,
    isFromURL,
  };
}


