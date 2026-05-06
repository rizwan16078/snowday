"use client";

import { createContext, useContext } from "react";
import type { SnowSenseRibbon } from "@/types/snow";

export interface SystemUIContextValue {
  ribbon: SnowSenseRibbon;
  setRibbon: (nextRibbon: SnowSenseRibbon) => void;
  offline: boolean;
}

export const defaultRibbon: SnowSenseRibbon = {
  locationLabel: "RESOLVING LOCATION",
  latitudeLabel: "--",
  temperatureC: null,
  humidityPercent: null,
};

export const defaultContextValue: SystemUIContextValue = {
  ribbon: defaultRibbon,
  setRibbon: () => {},
  offline: false,
};

export const SystemUIContext = createContext<SystemUIContextValue | null>(null);

export function useSystemUI(): SystemUIContextValue {
  const context = useContext(SystemUIContext);
  return context ?? defaultContextValue;
}
