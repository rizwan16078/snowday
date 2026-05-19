"use client";

/**
 * PWAInstallPrompt — discreet "install app" toast.
 *
 * Rules:
 *   1. Show only ONCE ever (unless user clears site data).
 *   2. Don't show if the app is already installed.
 *   3. Chrome/Edge/Android: use native `beforeinstallprompt`.
 *   4. iOS Safari: show "Add to Home Screen" instructions once.
 *   5. After dismiss or install, never show again.
 *
 * Storage keys (localStorage):
 *   - `pwa:shown`       — "1" once the prompt has been displayed
 *   - `pwa:dismissed`   — "1" once user dismissed the prompt
 *   - `pwa:installed`   — "1" once we know the app is installed
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

const SHOWN_KEY = "pwa:shown";
const DISMISSED_KEY = "pwa:dismissed";
const INSTALLED_KEY = "pwa:installed";

function wasAlreadyShown(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(SHOWN_KEY) === "1";
}

function markShown() {
  if (typeof window === "undefined") return;
  localStorage.setItem(SHOWN_KEY, "1");
}

function wasDismissed(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(DISMISSED_KEY) === "1";
}

function markDismissed() {
  if (typeof window === "undefined") return;
  localStorage.setItem(DISMISSED_KEY, "1");
}

function markInstalled() {
  if (typeof window === "undefined") return;
  localStorage.setItem(INSTALLED_KEY, "1");
}

function isInstalled(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(INSTALLED_KEY) === "1";
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
  const [mode, setMode] = useState<"hidden" | "chrome" | "ios">("hidden");
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Bail out if already installed (standalone mode or previously recorded)
    if (isStandaloneDisplay() || isInstalled()) {
      markInstalled();
      return;
    }

    // Bail out if already shown and dismissed — never show again
    if (wasAlreadyShown() || wasDismissed()) return;

    // ── Chrome / Edge / Android path ──
    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setMode("chrome");
      markShown();
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
        // show our iOS-specific instructions — but only once.
        setMode((current) => {
          if (current === "hidden") {
            markShown();
            return "ios";
          }
          return current;
        });
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
            <div className="flex gap-2 mt-3">
              {mode === "chrome" && (
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors"
                >
                  Install
                </button>
              )}
              <button
                type="button"
                onClick={handleDismiss}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white/55 hover:text-white/80 transition-colors"
              >
                Not now
              </button>
            </div>
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
