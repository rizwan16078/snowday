"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ChevronDown, RefreshCw, AlertTriangle } from "lucide-react";
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
import { CommunityFeed } from "@/components/snow/CommunityFeed";
import { TrustLayer } from "@/components/snow/TrustLayer";
import { RegionalLinks } from "@/components/snow/RegionalLinks";
import { PremiumFAQ } from "@/components/snow/PremiumFAQ";
import { buildRibbonData } from "@/lib/snowsense";
import type {
  CommunityFeedItem,
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
  communityFeed: CommunityFeedItem[];
  initialRibbon: SnowSenseRibbon;
  radarSrc: string;
}

function buildLocationLabel(location: ResolvedLocation): string {
  return [location.city, location.state || location.country].filter(Boolean).join(", ");
}

export default function SnowDayShell({
  initialPrediction,
  location,
  daysUsed,
  schoolType,
  communityFeed,
  initialRibbon,
  radarSrc,
}: SnowDayShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { setRibbon } = useSystemUI();
  const [isPending, startTransition] = useTransition();
  const [hasScrolled, setHasScrolled] = useState(false);
  const [calibrationOpen, setCalibrationOpen] = useState(false);
  const locationLabel = useMemo(() => buildLocationLabel(location), [location]);

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

  const handleLocationChange = useCallback(
    (nextLocation: LocationSelection) => {
      updateURL({
        loc: nextLocation.slug,
        lat: nextLocation.lat.toFixed(4),
        lon: nextLocation.lon.toFixed(4),
        city: nextLocation.city,
        state: nextLocation.state || null,
        country: nextLocation.country,
        tz: nextLocation.timezone || null,
      });
    },
    [updateURL]
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
        className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 pt-24"
        role="main"
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
            <h1 className="sr-only">
              {locationLabel ? `${locationLabel} Snow Day Calculator` : "SnowSense™ Snow Day Calculator"}
            </h1>
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
              className="animate-slide-up relative z-50 mt-8 flex w-full justify-center"
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
              />
            </div>

            {activePrediction && !activePrediction.isFallback ? (
              <div className="mt-6">
                <ShareSystem
                  prediction={activePrediction}
                  locationStr={locationLabel}
                  locationSlug={location.slug}
                  daysUsed={daysUsed}
                  schoolType={schoolType}
                />
              </div>
            ) : null}

            {showDetails && !hasScrolled ? (
              <div className="animate-scroll-bounce absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2">
                <span className="text-[10px] font-medium uppercase tracking-widest text-white/20">
                  Details
                </span>
                <ChevronDown className="h-4 w-4 text-white/20" />
              </div>
            ) : null}
          </>
        )}
      </main>

      {activePrediction ? (
        <div className="relative z-10 mt-16 flex flex-col gap-24 pb-32">
          {showDetails ? (
            <>
              <DetailsPanel prediction={activePrediction} />
              <StormAnatomy prediction={activePrediction} />
              <HourlyCurve prediction={activePrediction} />
              <RadarPreview radarSrc={radarSrc} locationLabel={locationLabel} />
              <CommunityFeed items={communityFeed} />
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
