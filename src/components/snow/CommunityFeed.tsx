"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { MapPin, RefreshCw } from "lucide-react";
import { useSystemUI } from "@/components/providers/SystemUIContext";
import type { CommunityFeedItem } from "@/types/snow";

interface CommunityFeedProps {
  items: CommunityFeedItem[];
}

const statusColors: Record<string, string> = {
  Unlikely: "#ef4444",
  Possible: "#f59e0b",
  "Very Likely": "#22c55e",
};

export function CommunityFeed({ items }: CommunityFeedProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { offline } = useSystemUI();
  const featured = items[0];

  return (
    <section className="mx-auto w-full max-w-6xl px-5" aria-label="Community predictions">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-8 text-center"
      >
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.3em] text-amber-400/60">
          Nationwide Intelligence
        </p>
        <h3 className="text-2xl font-display font-black text-white/90 sm:text-3xl">
          Community Feed
        </h3>
        <p className="mt-2 text-sm text-white/50">
          Server-authoritative cached predictions refreshed every 60 seconds
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.1 }}
        className="glass-card rounded-2xl p-6"
      >
        {featured ? (
          <div className="mb-5 flex items-center justify-between rounded-xl border border-white/[0.04] bg-white/[0.03] px-4 py-3">
            <div className="flex items-center gap-3">
              <MapPin className="h-3.5 w-3.5 text-blue-400/60" />
              <span className="text-sm font-semibold text-white/85">
                {featured.city}, {featured.state || featured.country}
              </span>
              <span className="text-white/20">→</span>
              <span
                className="text-sm font-bold"
                style={{ color: statusColors[featured.status] }}
              >
                {featured.probability}% Snow Risk
              </span>
            </div>
            <span className="text-[10px] text-white/20">{featured.timeAgo}</span>
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {items.slice(0, 6).map((item, index) => (
            <motion.article
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, duration: 0.4 }}
              className="flex items-center justify-between rounded-xl border border-white/[0.04] bg-white/[0.02] px-4 py-3 transition-colors hover:bg-white/[0.04]"
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{
                    background: statusColors[item.status],
                    boxShadow: `0 0 6px ${statusColors[item.status]}40`,
                  }}
                />
                <span className="text-sm font-medium text-white/70">
                  {item.city}, {item.state || item.country}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className="text-sm font-bold tabular-nums"
                  style={{ color: statusColors[item.status] }}
                >
                  {item.probability}%
                </span>
                <span className="text-[10px] text-white/50">{item.timeAgo}</span>
              </div>
            </motion.article>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between gap-3 text-[10px] text-white/50">
          <span>Pull to refresh latest predictions</span>
          <button
            onClick={() => startTransition(() => router.refresh())}
            disabled={offline || isPending}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-white/55 transition-colors hover:border-white/20 hover:text-white/80 disabled:cursor-not-allowed disabled:opacity-35"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isPending ? "animate-spin" : ""}`} />
            Refresh feed
          </button>
        </div>
      </motion.div>
    </section>
  );
}
