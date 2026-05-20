"use client";

import Image from "next/image";
import { useRef, useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { SnowDayPrediction, SchoolType } from "@/types/snow";
import { Share2, Link, Download, Check, X, Send, Image as ImageIcon } from "lucide-react";

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
  bg.addColorStop(0, "#050a14");
  bg.addColorStop(0.45, "#0a1530");
  bg.addColorStop(1, "#0e2a5c");
  ctx.fillStyle = bg;
  ctx.roundRect(0, 0, W, H, 20);
  ctx.fill();

  // Border
  ctx.strokeStyle = "rgba(255,255,255,0.06)";
  ctx.lineWidth = 1;
  ctx.roundRect(0, 0, W, H, 20);
  ctx.stroke();

  const color = statusColor[prediction.status] ?? "#3b82f6";
  const message =
    prediction.status === "Very Likely"
      ? "Snow day conditions are lining up for tomorrow."
      : prediction.status === "Possible"
        ? "Tomorrow is in the watch zone for a closure call."
        : "A closure looks less likely, but conditions can still shift overnight.";

  // Background accents
  const glow = ctx.createRadialGradient(480, 260, 20, 480, 260, 180);
  glow.addColorStop(0, `${color}40`);
  glow.addColorStop(1, "transparent");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(480, 260, 180, 0, Math.PI * 2);
  ctx.fill();

  const blueGlow = ctx.createRadialGradient(520, 30, 10, 520, 30, 140);
  blueGlow.addColorStop(0, "rgba(59,130,246,0.25)");
  blueGlow.addColorStop(1, "transparent");
  ctx.fillStyle = blueGlow;
  ctx.beginPath();
  ctx.arc(520, 30, 140, 0, Math.PI * 2);
  ctx.fill();

  // Header pill
  ctx.fillStyle = "rgba(255,255,255,0.06)";
  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(370, 22, 190, 34, 999);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,0.72)";
  ctx.font = "700 11px Inter, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("TOMORROW'S FORECAST", 465, 43);

  // Brand
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "left";
  ctx.font = "800 24px Inter, system-ui, sans-serif";
  ctx.fillText("SnowSense™", 34, 46);

  // Left copy
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.font = "700 11px Inter, system-ui, sans-serif";
  ctx.fillText("LIVE SNOW DAY OUTLOOK", 34, 92);

  ctx.fillStyle = "#ffffff";
  ctx.font = "900 36px Inter, system-ui, sans-serif";
  ctx.fillText(locationStr, 34, 132);

  ctx.fillStyle = "rgba(255,255,255,0.68)";
  ctx.font = "500 16px Inter, system-ui, sans-serif";
  wrapCanvasText(ctx, message, 34, 162, 240, 22);

  // Badges
  drawBadge(ctx, 34, 236, 96, "UPDATED LIVE", "rgba(255,255,255,0.85)", "rgba(255,255,255,0.08)", "rgba(255,255,255,0.12)");
  drawBadge(ctx, 140, 236, 145, `${statusEmoji[prediction.status] ?? "❄️"} ${prediction.status.toUpperCase()}`, color, `${color}18`, `${color}44`);

  // Probability panel
  ctx.fillStyle = "rgba(255,255,255,0.05)";
  ctx.strokeStyle = `${color}55`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(340, 92, 226, 190, 28);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "rgba(255,255,255,0.42)";
  ctx.font = "700 11px Inter, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("PROBABILITY", 453, 124);

  ctx.fillStyle = color;
  ctx.shadowBlur = 26;
  ctx.shadowColor = color;
  ctx.font = "900 82px Inter, system-ui, sans-serif";
  ctx.fillText(`${prediction.probability}%`, 453, 200);
  ctx.shadowBlur = 0;

  ctx.font = "800 18px Inter, system-ui, sans-serif";
  ctx.fillText(prediction.status.toUpperCase(), 453, 236);

  // Footer
  ctx.textAlign = "left";
  ctx.fillStyle = "rgba(255,255,255,0.74)";
  ctx.font = "700 16px Inter, system-ui, sans-serif";
  ctx.fillText("Real-time forecast card", 34, 312);

  ctx.textAlign = "right";
  ctx.fillStyle = "rgba(255,255,255,0.48)";
  ctx.font = "700 14px Inter, system-ui, sans-serif";
  ctx.fillText("snowdaycalculate.com", 566, 312);
}

function drawBadge(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  text: string,
  textColor: string,
  fillColor: string,
  borderColor: string
) {
  ctx.fillStyle = fillColor;
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(x, y, width, 30, 999);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = textColor;
  ctx.textAlign = "center";
  ctx.font = "800 10px Inter, system-ui, sans-serif";
  ctx.fillText(text, x + width / 2, y + 19);
}

function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(" ");
  let line = "";
  let currentY = y;

  for (const word of words) {
    const nextLine = line ? `${line} ${word}` : word;
    if (ctx.measureText(nextLine).width > maxWidth && line) {
      ctx.fillText(line, x, currentY);
      line = word;
      currentY += lineHeight;
    } else {
      line = nextLine;
    }
  }

  if (line) {
    ctx.fillText(line, x, currentY);
  }
}

async function buildShareCardFile(
  canvas: HTMLCanvasElement,
  locationStr: string,
  prediction: SnowDayPrediction
): Promise<File | null> {
  drawShareImage(canvas, locationStr, prediction);

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((nextBlob) => resolve(nextBlob), "image/png");
  });

  if (!blob) return null;

  return new File(
    [blob],
    `snowsense-${locationStr.replace(/[\s,]+/g, "-").toLowerCase()}.png`,
    { type: "image/png" }
  );
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
  const [sharingCard, setSharingCard] = useState(false);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const shareUrl = buildShareUrl(locationSlug, daysUsed, schoolType, prediction);
  const shareText = `${statusEmoji[prediction.status] ?? "❄️"} ${prediction.probability}% chance of a snow day in ${locationStr}! Check your area:`;

  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;
    drawShareImage(canvasRef.current, locationStr, prediction);
    setPreviewSrc(canvasRef.current.toDataURL("image/png"));
  }, [isOpen, locationStr, prediction]);

  const handleNativeShare = useCallback(async () => {
    if (!navigator.share) return;

    setSharingCard(true);

    const canvas = canvasRef.current;
    const file = canvas
      ? await buildShareCardFile(canvas, locationStr, prediction)
      : null;

    try {
      if (
        file &&
        typeof navigator.canShare === "function" &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({
          title: `SnowSense™ — ${locationStr}`,
          files: [file],
        });
      } else {
        await navigator.share({
          title: `SnowSense™ — ${locationStr}`,
          text: shareText,
          url: shareUrl,
        });
      }

      setIsOpen(false);
    } catch {
      try {
        await navigator.share({
          title: `SnowSense™ — ${locationStr}`,
          text: shareText,
          url: shareUrl,
        });
        setIsOpen(false);
      } catch {
        // User cancelled or share failed — user can still copy or save from the modal.
      }
    } finally {
      setSharingCard(false);
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
    const canvas = canvasRef.current;
    if (!canvas) return;

    const filename = `snowday-${locationStr
      .replace(/[\s,]+/g, "-")
      .toLowerCase()}.png`;

    const link = document.createElement("a");
    link.download = filename;

    drawShareImage(canvas, locationStr, prediction);
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
        onClick={() => setIsOpen(true)}
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
              className="glass-card rounded-3xl p-6 w-full max-w-md space-y-5"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-white/80">
                  Share Prediction
                </p>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg hover:bg-white/5 text-white/50 hover:text-white/60 transition-colors"
                  aria-label="Close share modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Customized share card */}
              <div className="space-y-3">
                <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[#07101f] shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
                  {previewSrc ? (
                    <Image
                      src={previewSrc}
                      alt={`Share card for ${locationStr}`}
                      width={1200}
                      height={630}
                      unoptimized
                      className="block h-auto w-full"
                    />
                  ) : (
                    <div className="aspect-[1200/630] w-full bg-[#07101f]" />
                  )}
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/35">
                        Custom Share Card
                      </p>
                      <p className="mt-1 text-sm text-white/70">
                        Share the branded image card instead of a plain website link preview.
                      </p>
                    </div>
                    <div
                      className="shrink-0 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em]"
                      style={{
                        background: `${statusColor[prediction.status]}18`,
                        border: `1px solid ${statusColor[prediction.status]}33`,
                        color: statusColor[prediction.status],
                      }}
                    >
                      {prediction.status}
                    </div>
                  </div>
                </div>
              </div>

              {/* URL preview */}
              <div className="px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.04]">
                <p className="text-[10px] text-white/20 font-mono truncate">
                  {shareUrl}
                </p>
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {supportsShare ? (
                  <button
                    onClick={handleNativeShare}
                    disabled={sharingCard}
                    className="flex items-center justify-center gap-2 py-3 rounded-xl transition-all text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                    style={{
                      background: `linear-gradient(135deg, ${statusColor[prediction.status]}22, rgba(59,130,246,0.08))`,
                      border: `1px solid ${statusColor[prediction.status]}44`,
                      color: "#ffffff",
                    }}
                    aria-label="Share the custom card"
                  >
                    {sharingCard ? (
                      <>
                        <ImageIcon className="w-4 h-4 animate-pulse" />
                        Preparing card...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Share Card
                      </>
                    )}
                  </button>
                ) : null}
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
                  className="flex items-center justify-center gap-2 py-3 rounded-xl transition-all text-sm font-semibold sm:col-span-2"
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
                  Save Card
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
