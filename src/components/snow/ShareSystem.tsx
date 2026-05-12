"use client";

import { useRef, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { SnowDayPrediction, SchoolType } from "@/types/snow";
import { Share2, Link, Download, Check, X } from "lucide-react";

/**
 * ShareSystem — Viral sharing experience
 *
 * All shared links include full URL state:
 * /?loc=boston&daysUsed=2&type=public
 *
 * Behavior:
 * - Identical results for all users
 * - No fallback state
 * - No client-side overrides
 */

interface ShareSystemProps {
  prediction: SnowDayPrediction;
  locationStr: string;
  locationSlug: string;
  daysUsed: number;
  schoolType: SchoolType;
}

const statusEmoji: Record<string, string> = {
  Unlikely: "❄️",
  Possible: "🌨️",
  "Very Likely": "☃️",
};

const statusColor: Record<string, string> = {
  Unlikely: "#ef4444",
  Possible: "#f59e0b",
  "Very Likely": "#22c55e",
};

function buildShareUrl(
  locationSlug: string,
  daysUsed: number,
  schoolType: SchoolType,
  prediction: SnowDayPrediction
): string {
  const params = new URLSearchParams({
    loc: locationSlug,
    daysUsed: daysUsed.toString(),
    type: schoolType,
    p: String(prediction.probability),
    s: prediction.status,
  });
  return `${typeof window !== "undefined" ? window.location.origin : ""}/?${params}`;
}

/**
 * Fetch the dynamic OG card PNG so we can attach it to the native share
 * sheet via Web Share Level 2 (Messages / Mail / AirDrop will then carry
 * the image, not just the link).
 */
async function fetchOgCardFile(
  locationStr: string,
  prediction: SnowDayPrediction
): Promise<File | null> {
  if (typeof window === "undefined") return null;
  try {
    const params = new URLSearchParams({
      loc: locationStr,
      p: String(prediction.probability),
      s: prediction.status,
    });
    const res = await fetch(`/api/og?${params.toString()}`, {
      cache: "force-cache",
    });
    if (!res.ok) return null;
    const blob = await res.blob();
    const filename = `snowsense-${locationStr.replace(/[\s,]+/g, "-").toLowerCase()}.png`;
    return new File([blob], filename, { type: blob.type || "image/png" });
  } catch {
    return null;
  }
}

function drawShareImage(
  canvas: HTMLCanvasElement,
  locationStr: string,
  prediction: SnowDayPrediction
) {
  const W = 600;
  const H = 340;
  const dpr =
    typeof window !== "undefined" ? window.devicePixelRatio || 2 : 2;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  canvas.style.width = `${W}px`;
  canvas.style.height = `${H}px`;

  const ctx = canvas.getContext("2d")!;
  ctx.scale(dpr, dpr);

  // Background
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#060c1e");
  bg.addColorStop(0.5, "#0c1830");
  bg.addColorStop(1, "#050810");
  ctx.fillStyle = bg;
  ctx.roundRect(0, 0, W, H, 20);
  ctx.fill();

  // Border
  ctx.strokeStyle = "rgba(255,255,255,0.06)";
  ctx.lineWidth = 1;
  ctx.roundRect(0, 0, W, H, 20);
  ctx.stroke();

  const color = statusColor[prediction.status] ?? "#3b82f6";

  // Subtle glow behind number
  ctx.shadowBlur = 80;
  ctx.shadowColor = color;
  ctx.fillStyle = "transparent";
  ctx.fillRect(W / 2 - 50, 120, 100, 80);
  ctx.shadowBlur = 0;

  // Header
  ctx.fillStyle = "rgba(255,255,255,0.25)";
  ctx.font = "500 11px Inter, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("SnowSense™ Prediction", W / 2, 48);

  // Location
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 20px Inter, system-ui, sans-serif";
  ctx.fillText(locationStr, W / 2, 85);

  // Probability number
  ctx.fillStyle = color;
  ctx.font = "900 88px Inter, system-ui, sans-serif";
  ctx.fillText(`${prediction.probability}%`, W / 2, 195);

  // Glow
  ctx.shadowBlur = 40;
  ctx.shadowColor = color;
  ctx.fillText(`${prediction.probability}%`, W / 2, 195);
  ctx.shadowBlur = 0;

  // Status
  ctx.fillStyle = color;
  ctx.font = "700 16px Inter, system-ui, sans-serif";
  ctx.letterSpacing = "2px";
  ctx.fillText(prediction.status.toUpperCase(), W / 2, 235);

  // Footer
  ctx.fillStyle = "rgba(255,255,255,0.15)";
  ctx.font = "400 10px Inter, system-ui, sans-serif";
  ctx.fillText("snowsense.app", W / 2, 310);
}

export function ShareSystem({
  prediction,
  locationStr,
  locationSlug,
  daysUsed,
  schoolType,
}: ShareSystemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const shareUrl = buildShareUrl(locationSlug, daysUsed, schoolType, prediction);
  const shareText = `${statusEmoji[prediction.status] ?? "❄️"} ${prediction.probability}% chance of a snow day in ${locationStr}! Check your area:`;

  const handleNativeShare = useCallback(async () => {
    if (!navigator.share) return;

    // Try Web Share Level 2 (attach the OG card image as a File). Falls back
    // to URL-only share if the OS or browser doesn't accept files.
    const file = await fetchOgCardFile(locationStr, prediction);
    const payloadWithFile: ShareData =
      file && typeof navigator.canShare === "function" && navigator.canShare({ files: [file] })
        ? {
            title: `SnowSense™ — ${locationStr}`,
            text: shareText,
            url: shareUrl,
            files: [file],
          }
        : {
            title: `SnowSense™ — ${locationStr}`,
            text: shareText,
            url: shareUrl,
          };

    try {
      await navigator.share(payloadWithFile);
    } catch {
      // User cancelled or share failed — silently no-op (user can use the modal copy/save).
    }
  }, [locationStr, prediction, shareText, shareUrl]);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
    }
  }, [shareUrl]);

  const handleDownload = useCallback(async () => {
    const filename = `snowday-${locationStr
      .replace(/[\s,]+/g, "-")
      .toLowerCase()}.png`;

    // Primary: fetch the OG card PNG — same image receivers will see.
    const file = await fetchOgCardFile(locationStr, prediction);
    if (file) {
      const url = URL.createObjectURL(file);
      const link = document.createElement("a");
      link.download = filename;
      link.href = url;
      link.click();
      // Release the blob URL on the next tick (after the click is dispatched).
      setTimeout(() => URL.revokeObjectURL(url), 0);
      return;
    }

    // Fallback: synchronous canvas-drawn card.
    const canvas = canvasRef.current;
    if (!canvas) return;
    drawShareImage(canvas, locationStr, prediction);
    const link = document.createElement("a");
    link.download = filename;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }, [locationStr, prediction]);

  const supportsShare =
    typeof navigator !== "undefined" && !!navigator.share;

  return (
    <>
      {/* Share trigger button */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        onClick={() => {
          if (supportsShare) {
            handleNativeShare();
          } else {
            setIsOpen(true);
          }
        }}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass hover:bg-white/8 transition-all text-sm font-semibold text-white/60 hover:text-white/90"
        aria-label="Share this prediction"
      >
        <Share2 className="w-4 h-4" />
        Share
      </motion.button>

      {/* Hidden canvas for image generation */}
      <canvas ref={canvasRef} className="hidden" aria-hidden="true" />

      {/* Desktop share modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={(e) =>
              e.target === e.currentTarget && setIsOpen(false)
            }
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="glass-card rounded-3xl p-6 w-full max-w-sm space-y-5"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-white/80">
                  Share Prediction
                </p>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg hover:bg-white/5 text-white/30 hover:text-white/60 transition-colors"
                  aria-label="Close share modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Preview */}
              <div
                className="rounded-2xl p-5 text-center"
                style={{
                  background:
                    "linear-gradient(135deg, #060c1e, #0c1830, #050810)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <p className="text-[10px] text-white/25 uppercase tracking-widest mb-2">
                  SnowSense™
                </p>
                <p className="text-white font-bold text-sm mb-1">
                  {locationStr}
                </p>
                <div
                  className="text-5xl font-black my-3"
                  style={{
                    color: statusColor[prediction.status],
                    textShadow: `0 0 30px ${statusColor[prediction.status]}44`,
                  }}
                >
                  {prediction.probability}%
                </div>
                <p
                  className="text-xs font-bold uppercase tracking-widest"
                  style={{ color: statusColor[prediction.status] }}
                >
                  {prediction.status}
                </p>
              </div>

              {/* URL preview */}
              <div className="px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.04]">
                <p className="text-[10px] text-white/20 font-mono truncate">
                  {shareUrl}
                </p>
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleCopyLink}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl glass hover:bg-white/8 transition-all text-sm font-semibold text-white/70 hover:text-white"
                  aria-label="Copy shareable link"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-green-400" />
                      <span className="text-green-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Link className="w-4 h-4" />
                      Copy Link
                    </>
                  )}
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl transition-all text-sm font-semibold"
                  style={{
                    background: `linear-gradient(135deg, ${
                      statusColor[prediction.status]
                    }18, ${statusColor[prediction.status]}08)`,
                    border: `1px solid ${statusColor[prediction.status]}33`,
                    color: statusColor[prediction.status],
                  }}
                  aria-label="Download prediction as image"
                >
                  <Download className="w-4 h-4" />
                  Save Image
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
