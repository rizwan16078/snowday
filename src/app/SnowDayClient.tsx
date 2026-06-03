"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ChevronDown, RefreshCw, AlertTriangle, MapPin } from "lucide-react";
import { useSystemUI } from "@/components/providers/SystemUIContext";
import { WeatherCanvas } from "@/components/snow/WeatherCanvas";
import { HeroPrediction } from "@/components/snow/HeroPrediction";
import { CommandBar } from "@/components/snow/CommandBar";
import { CalibrationLayer } from "@/components/snow/CalibrationLayer";
import { DetailsPanel } from "@/components/snow/DetailsPanel";
import { ShareSystem } from "@/components/snow/ShareSystem";
import { StormAnatomy } from "@/components/snow/StormAnatomy";
import { HourlyCurve } from "@/components/snow/HourlyCurve";
import { RadarPreview } from "@/components/snow/RadarPreview";
import { TrustLayer } from "@/components/snow/TrustLayer";
import { RegionalLinks } from "@/components/snow/RegionalLinks";
import { PremiumFAQ } from "@/components/snow/PremiumFAQ";
import { detectLocationClientSide, detectLocationFromBrowser } from "@/lib/client-location";
import { buildRibbonData } from "@/lib/snowsense";
import { DEFAULT_LOCATION_SLUG } from "@/lib/location-resolver";
import type {
  LocationSelection,
  ResolvedLocation,
  SchoolType,
  SnowDayPrediction,
  SnowSenseRibbon,
} from "@/types/snow";

interface SnowDayShellProps {
  initialPrediction: SnowDayPrediction | null;
  location: ResolvedLocation;
  daysUsed: number;
  schoolType: SchoolType;
  initialRibbon: SnowSenseRibbon;
  radarSrc: string;
  serverResolved?: boolean;
}

function buildLocationLabel(location: ResolvedLocation): string {
  return [location.city, location.state || location.country].filter(Boolean).join(", ");
}

export default function SnowDayShell({
  initialPrediction,
  location,
  daysUsed,
  schoolType,
  initialRibbon,
  radarSrc,
  serverResolved = false,
}: SnowDayShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { setRibbon } = useSystemUI();
  const [isPending, startTransition] = useTransition();
  const [hasScrolled, setHasScrolled] = useState(false);
  const [calibrationOpen, setCalibrationOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const attemptedClientIPResolution = useRef(false);
  const locationLabel = useMemo(() => buildLocationLabel(location), [location]);

  const handleGPSLocate = useCallback(async () => {
    if (!navigator.geolocation) {
      alert("Your browser doesn't support geolocation.");
      return;
    }
    
    setIsLocating(true);
    try {
      const detected = await detectLocationFromBrowser();
      if (detected && detected.slug) {
        const params = new URLSearchParams();
        params.set("loc", detected.slug);
        params.set("lat", detected.lat.toFixed(4));
        params.set("lon", detected.lon.toFixed(4));
        params.set("city", detected.city);
        params.set("country", detected.country);
        if (detected.state) params.set("state", detected.state);
        if (detected.timezone) params.set("tz", detected.timezone);
        params.set("manual", "1");
        
        router.push(`/?${params.toString()}`);
      } else {
        alert("Could not determine your location. Please try searching for your city.");
      }
    } catch (e) {
      console.error("GPS location failed:", e);
      alert("Location access denied or unavailable. Please enable location permissions or search manually.");
    } finally {
      setIsLocating(false);
    }
  }, [router]);

  useEffect(() => {
    setRibbon(initialRibbon);
  }, [initialRibbon, setRibbon]);

  useEffect(() => {
    if (initialPrediction) {
      setRibbon(buildRibbonData(location, initialPrediction));
    }
  }, [initialPrediction, location, setRibbon]);

  useEffect(() => {
    const handler = () => {
      if (window.scrollY > 50) {
        setHasScrolled(true);
      }
    };

    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const updateURL = useCallback(
    (updates: Record<string, string | null>) => {
      startTransition(() => {
        const params = new URLSearchParams(searchParams.toString());

        Object.entries(updates).forEach(([key, value]) => {
          if (!value) {
            params.delete(key);
            return;
          }

          params.set(key, value);
        });

        const queryString = params.toString();
        router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
          scroll: false,
        });
      });
    },
    [pathname, router, searchParams]
  );

  useEffect(() => {
    const explicitLocation = searchParams.get("loc");
    const manualLocation = searchParams.get("manual") === "1";
    const hasExplicitNonDefaultLocation =
      !!explicitLocation && explicitLocation !== DEFAULT_LOCATION_SLUG;

    if (
      manualLocation ||
      hasExplicitNonDefaultLocation ||
      location.slug !== DEFAULT_LOCATION_SLUG ||
      serverResolved ||
      attemptedClientIPResolution.current
    ) {
      return;
    }

    attemptedClientIPResolution.current = true;

    let cancelled = false;

    void (async () => {
      const detected = await detectLocationClientSide();
      if (!detected || cancelled) return;

      const detectedSlug = detected.slug ?? "";
      if (!detectedSlug || detectedSlug === location.slug) return;

      const params = new URLSearchParams(searchParams.toString());
      params.set("loc", detectedSlug);
      params.set("lat", detected.lat.toFixed(4));
      params.set("lon", detected.lon.toFixed(4));
      params.set("city", detected.city);
      params.set("country", detected.country);
      params.delete("manual");

      if (detected.state) {
        params.set("state", detected.state);
      } else {
        params.delete("state");
      }

      if (detected.timezone) {
        params.set("tz", detected.timezone);
      } else {
        params.delete("tz");
      }

      const queryString = params.toString();
      window.location.replace(queryString ? `${pathname}?${queryString}` : pathname);
    })();

    return () => {
      cancelled = true;
    };
  }, [location.slug, searchParams, updateURL]);

  const handleLocationChange = useCallback(
    (nextLocation: LocationSelection) => {
      // Catalog cities have a canonical /snow-day-calculator/[slug] page with
      // richer content (editorial, nearby cities, districts) and a stronger SEO
      // signal — route there instead of staying on the home ?loc= shell.
      if (nextLocation.isCatalogCity) {
        startTransition(() => {
          router.push(`/snow-day-calculator/${nextLocation.slug}`);
        });
        return;
      }
      updateURL({
        loc: nextLocation.slug,
        lat: nextLocation.lat.toFixed(4),
        lon: nextLocation.lon.toFixed(4),
        city: nextLocation.city,
        state: nextLocation.state || null,
        country: nextLocation.country,
        tz: nextLocation.timezone || null,
        manual: "1",
      });
    },
    [updateURL, router]
  );

  const handleDaysUsedChange = useCallback(
    (value: number) => {
      updateURL({ daysUsed: value.toString() });
    },
    [updateURL]
  );

  const handleSchoolTypeChange = useCallback(
    (value: SchoolType) => {
      updateURL({ type: value });
    },
    [updateURL]
  );

  const handleRefresh = useCallback(() => {
    startTransition(() => {
      router.refresh();
    });
  }, [router]);

  const activePrediction = initialPrediction;
  const showDetails = !!activePrediction && !activePrediction.isFallback;
  const showErrorState = initialPrediction === null;

  return (
    <div className="relative min-h-screen">
      <WeatherCanvas
        probability={activePrediction?.probability ?? null}
        isFallback={activePrediction?.isFallback}
        forceSnow={showErrorState}
      />

      <CalibrationLayer
        isOpen={calibrationOpen}
        onClose={() => setCalibrationOpen(false)}
        daysUsed={daysUsed}
        schoolType={schoolType}
        onDaysUsedChange={handleDaysUsedChange}
        onSchoolTypeChange={handleSchoolTypeChange}
        isPending={isPending}
      />

      <main
        className="relative z-10 flex flex-col items-center px-4 pt-24 pb-2 md:min-h-screen md:justify-center md:pb-0"
      >
        {showErrorState ? (
          <div className="flex max-w-md flex-col items-center gap-4 text-center">
            <div className="rounded-full bg-red-500/10 p-4">
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-red-400/60">
              Weather uplink unavailable
            </p>
            <p className="text-base text-white/60">
              SnowSense is holding the interface live while upstream weather data
              reconnects.
            </p>
            <button
              onClick={handleRefresh}
              className="glass inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white/70 transition-all hover:bg-white/8 hover:text-white"
            >
              <RefreshCw className="h-4 w-4" />
              Retry stream
            </button>
          </div>
        ) : (
          <>
            {/* Visible, static H1 — must not depend on visitor IP (B1 fix).
                Static text is the primary ranking signal; dynamic location
                is shown separately by HeroPrediction via locationLabel. */}
            <header className="animate-slide-up text-center mb-4 sm:mb-6">
              <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white">
                Will You Have a Snow Day Tomorrow?
              </h1>
              <p className="mt-2 text-sm sm:text-base font-medium text-white/55 max-w-xl mx-auto">
                Will school be cancelled tomorrow? Check your auto-detected forecast or
                search by ZIP code, city, or district for a real-time probability built
                from live weather, ice risk, and regional school-closure data.
              </p>
            </header>
            <HeroPrediction
              probability={activePrediction?.probability}
              status={activePrediction?.status}
              confidence={activePrediction?.confidence}
              isFallback={activePrediction?.isFallback}
              fallbackMessage={activePrediction?.fallbackMessage}
              isPending={isPending}
              locationLabel={locationLabel}
            />

            <div
              className="animate-slide-up relative z-50 mt-8 flex w-full flex-col items-center gap-3"
              style={{ animationDelay: "0.9s", animationFillMode: "backwards" }}
            >
              <CommandBar
                locationStr={locationLabel}
                locationSlug={location.slug}
                daysUsed={daysUsed}
                schoolType={schoolType}
                isLoading={isPending}
                onLocationChange={handleLocationChange}
                onCalibrationToggle={() => setCalibrationOpen((open) => !open)}
                onRefresh={handleRefresh}
                onShare={() => setShareOpen(true)}
              />
              <button
                onClick={handleGPSLocate}
                disabled={isLocating}
                className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/50 transition-colors hover:bg-white/8 hover:text-white/70 disabled:opacity-50"
                aria-label="Use my exact location"
              >
                <MapPin className={`h-3 w-3 ${isLocating ? "animate-pulse" : ""}`} />
                {isLocating ? "Locating..." : "Use my exact location"}
              </button>
            </div>

            {activePrediction ? (
              <div className="mt-6 hidden md:block">
                <ShareSystem
                  prediction={activePrediction}
                  locationStr={locationLabel}
                  locationSlug={location.slug}
                  daysUsed={daysUsed}
                  schoolType={schoolType}
                  open={shareOpen}
                  onOpenChange={setShareOpen}
                />
              </div>
            ) : null}

            {showDetails && !hasScrolled ? (
              <div className="animate-scroll-bounce absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 md:flex">
                <span className="text-[10px] font-medium uppercase tracking-widest text-white/50">
                  Details
                </span>
                <ChevronDown className="h-4 w-4 text-white/50" />
              </div>
            ) : null}
          </>
        )}
      </main>

      {activePrediction ? (
        <div className="relative z-10 mt-8 md:mt-16 flex flex-col gap-24 pb-32">
          {showDetails ? (
            <>
              <DetailsPanel prediction={activePrediction} />
              <StormAnatomy prediction={activePrediction} />
              <HourlyCurve prediction={activePrediction} />
              <RadarPreview radarSrc={radarSrc} locationLabel={locationLabel} />
            </>
          ) : null}
          <TrustLayer />
          <RegionalLinks />
          <PremiumFAQ location={locationLabel} />
        </div>
      ) : null}
    </div>
  );
}
