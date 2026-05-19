"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { detectLocationClientSide } from "@/lib/client-location";
import { DEFAULT_LOCATION_SLUG } from "@/lib/location-resolver";

interface ClientLocationResolverProps {
  initialLocationSlug: string;
}

export function ClientLocationResolver({
  initialLocationSlug,
}: ClientLocationResolverProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const attemptedResolution = useRef(false);

  useEffect(() => {
    const explicitLocation = searchParams.get("loc");
    const manualLocation = searchParams.get("manual") === "1";
    const hasExplicitNonDefaultLocation =
      !!explicitLocation && explicitLocation !== DEFAULT_LOCATION_SLUG;

    if (
      manualLocation ||
      hasExplicitNonDefaultLocation ||
      initialLocationSlug !== DEFAULT_LOCATION_SLUG ||
      attemptedResolution.current
    ) {
      return;
    }

    attemptedResolution.current = true;

    let cancelled = false;

    void (async () => {
      const detected = await detectLocationClientSide();
      if (!detected || cancelled || !detected.slug) return;

      const params = new URLSearchParams(searchParams.toString());
      params.set("loc", detected.slug);
      params.set("lat", detected.lat.toFixed(4));
      params.set("lon", detected.lon.toFixed(4));
      params.set("city", detected.city);
      params.set("country", detected.country);

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

      params.delete("manual");

      const queryString = params.toString();
      window.location.replace(queryString ? `${pathname}?${queryString}` : pathname);
    })();

    return () => {
      cancelled = true;
    };
  }, [initialLocationSlug, pathname, searchParams]);

  return null;
}
