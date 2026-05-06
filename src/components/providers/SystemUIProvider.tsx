"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { SystemUIContext, defaultRibbon } from "./SystemUIContext";
import type { SnowSenseRibbon } from "@/types/snow";

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
    </SystemUIContext.Provider>
  );
}
