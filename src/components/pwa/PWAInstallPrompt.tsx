"use client";

/**
 * PWAInstallPrompt — discreet "install app" toast.
 *
 * Goals (informed by SEO/UX best practice):
 *   1. Don't annoy first-time visitors. Only show on the 2nd+ session.
 *   2. Don't show again for 30 days after a dismiss.
 *   3. Don't show if the app is already installed (`display-mode: standalone`).
 *   4. Fire `beforeinstallprompt` is captured and re-played on user gesture
 *      (required by Chrome's install-prompt UX policy).
 *   5. iOS Safari doesn't fire `beforeinstallprompt`; we show "Add to Home
 *      Screen" instructions instead when we detect iOS Safari outside
 *      standalone mode.
 *
 * Storage keys (localStorage):
 *   - `pwa:visits`            — integer, incremented each fresh load
 *   - `pwa:dismissed-at`      — ISO timestamp of last user dismissal
 *   - `pwa:installed`         — "1" once we know the app is installed
 */

import { useEffect, useState, useCallback } from "react";
import { Download, X, Share, Plus } from "lucide-react";

// ─── BeforeInstallPromptEvent — not in lib.dom.d.ts ──────────────────────────
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: ReadonlyArray<string>;
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

// ─── Local storage helpers ───────────────────────────────────────────────────

const VISITS_KEY = "pwa:visits";
const DISMISSED_KEY = "pwa:dismissed-at";
const INSTALLED_KEY = "pwa:installed";
const DISMISS_DAYS = 30;

function incrementVisitCount(): number {
  if (typeof window === "undefined") return 0;
  const prev = parseInt(localStorage.getItem(VISITS_KEY) ?? "0", 10) || 0;
  const next = prev + 1;
  localStorage.setItem(VISITS_KEY, String(next));
  return next;
}

function wasRecentlyDismissed(): boolean {
  if (typeof window === "undefined") return false;
  const ts = localStorage.getItem(DISMISSED_KEY);
  if (!ts) return false;
  const dismissedAt = new Date(ts).getTime();
  const cutoff = Date.now() - DISMISS_DAYS * 24 * 60 * 60 * 1000;
  return dismissedAt > cutoff;
}

function markDismissed() {
  if (typeof window === "undefined") return;
  localStorage.setItem(DISMISSED_KEY, new Date().toISOString());
}

function markInstalled() {
  if (typeof window === "undefined") return;
  localStorage.setItem(INSTALLED_KEY, "1");
}

function isStandaloneDisplay(): boolean {
  if (typeof window === "undefined") return false;
  // Standard PWA detect
  if (window.matchMedia("(display-mode: standalone)").matches) return true;
  // iOS-specific quirk (Safari predates standard media query)
  const navAny = window.navigator as Navigator & { standalone?: boolean };
  return navAny.standalone === true;
}

function isIOSSafari(): boolean {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua);
  // Safari and not Chrome/Firefox/etc. on iOS
  const isSafari = /^((?!chrome|android|crios|fxios).)*safari/i.test(ua);
  return isIOS && isSafari;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function PWAInstallPrompt() {
  // We treat "mode" as a state machine: hidden | chrome | ios
  const [mode, setMode] = useState<"hidden" | "chrome" | "ios">("hidden");
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  // Wait until after first paint so we don't push CLS.
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Bail out if already installed
    if (isStandaloneDisplay()) {
      markInstalled();
      return;
    }

    // Bail out if user dismissed recently
    if (wasRecentlyDismissed()) return;

    // Count this visit
    const visits = incrementVisitCount();

    // Only show on 2nd or later visit — don't pester first-timers
    if (visits < 2) return;

    // ── Chrome / Edge / Android path ──
    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setMode("chrome");
    };

    const onAppInstalled = () => {
      markInstalled();
      setMode("hidden");
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onAppInstalled);

    // ── iOS Safari path — no event, just inference ──
    // Wait a beat so we don't fire at the same time as `beforeinstallprompt`.
    let iosTimer: ReturnType<typeof setTimeout> | null = null;
    if (isIOSSafari()) {
      iosTimer = setTimeout(() => {
        // If by now `beforeinstallprompt` hasn't fired (it never will on iOS),
        // show our iOS-specific instructions.
        setMode((current) => (current === "hidden" ? "ios" : current));
      }, 1500);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onAppInstalled);
      if (iosTimer) clearTimeout(iosTimer);
    };
  }, []);

  const handleInstallClick = useCallback(async () => {
    if (!deferredPrompt) return;
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        markInstalled();
      } else {
        markDismissed();
      }
    } catch (e) {
      // Some browsers throw if prompt() is invoked outside a user gesture.
      console.warn("PWA install prompt failed:", e);
      markDismissed();
    } finally {
      setDeferredPrompt(null);
      setMode("hidden");
    }
  }, [deferredPrompt]);

  const handleDismiss = useCallback(() => {
    markDismissed();
    setMode("hidden");
  }, []);

  if (!mounted || mode === "hidden") return null;

  return (
    <div
      role="dialog"
      aria-labelledby="pwa-install-title"
      aria-describedby="pwa-install-desc"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:bottom-6 sm:right-6 sm:max-w-sm z-[100] pointer-events-auto"
    >
      <div className="glass-card rounded-2xl p-4 border border-white/10 shadow-2xl bg-black/40 backdrop-blur-xl">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center shrink-0">
            <Download className="w-5 h-5 text-blue-400" aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <p
              id="pwa-install-title"
              className="text-sm font-bold text-white mb-1"
            >
              Install SnowSense
            </p>
            <p
              id="pwa-install-desc"
              className="text-xs text-white/55 leading-relaxed"
            >
              {mode === "ios" ? (
                <>
                  Tap{" "}
                  <Share
                    className="inline w-3.5 h-3.5 text-white/70 align-text-bottom mx-0.5"
                    aria-label="Share"
                  />{" "}
                  then <em>Add to Home Screen</em>{" "}
                  <Plus
                    className="inline w-3.5 h-3.5 text-white/70 align-text-bottom mx-0.5"
                    aria-label="Plus"
                  />{" "}
                  for one-tap snow day checks.
                </>
              ) : (
                "Get one-tap snow day checks. Works offline — no app store required."
              )}
            </p>
            {mode === "chrome" && (
              <div className="flex gap-2 mt-3">
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors"
                >
                  Install
                </button>
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white/55 hover:text-white/80 transition-colors"
                >
                  Not now
                </button>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss install prompt"
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white/40 hover:text-white/80 hover:bg-white/5 transition-colors shrink-0"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
