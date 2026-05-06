"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { SnowSenseRibbon } from "@/types/snow";

interface SystemUIContextValue {
  ribbon: SnowSenseRibbon;
  setRibbon: (nextRibbon: SnowSenseRibbon) => void;
  offline: boolean;
}

const defaultRibbon: SnowSenseRibbon = {
  locationLabel: "RESOLVING LOCATION",
  latitudeLabel: "--",
  temperatureC: null,
  humidityPercent: null,
};

const SystemUIContext = createContext<SystemUIContextValue | null>(null);

export function SystemUIProvider({ children }: { children: ReactNode }) {
  const [ribbon, setRibbon] = useState<SnowSenseRibbon>(defaultRibbon);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const applyNetworkState = (nextOffline: boolean) => {
      setOffline(nextOffline);
      document.body.dataset.offline = nextOffline ? "true" : "false";
    };

    applyNetworkState(!navigator.onLine);

    const handleOffline = () => applyNetworkState(true);
    const handleOnline = () => applyNetworkState(false);

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  const value = useMemo(
    () => ({
      ribbon,
      setRibbon,
      offline,
    }),
    [offline, ribbon]
  );

  return (
    <SystemUIContext.Provider value={value}>
      {children}
      {offline ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-5 z-[90] flex justify-center px-4">
          <div className="glass-heavy rounded-full px-5 py-2 text-xs font-semibold tracking-wide text-white/80">
            No Connection - Showing Cached Prediction
          </div>
        </div>
      ) : null}
    </SystemUIContext.Provider>
  );
}

const defaultContextValue: SystemUIContextValue = {
  ribbon: defaultRibbon,
  setRibbon: () => {},
  offline: false,
};

export function useSystemUI(): SystemUIContextValue {
  const context = useContext(SystemUIContext);
  // Return defaults when called outside a SystemUIProvider (e.g. Navbar on non-home pages).
  return context ?? defaultContextValue;
}
