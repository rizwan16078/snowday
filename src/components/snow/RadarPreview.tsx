"use client";

import Image from "next/image";
import { motion } from "framer-motion";

interface RadarPreviewProps {
  radarSrc: string;
  locationLabel: string;
}

export function RadarPreview({ radarSrc, locationLabel }: RadarPreviewProps) {
  return (
    <section className="mx-auto w-full max-w-4xl px-5" aria-label="Radar preview">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-8 text-center"
      >
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-400/60">
          Edge Radar Cache
        </p>
        <h2 className="text-2xl font-display font-black text-white/90 sm:text-3xl">
          Cached Radar Tile
        </h2>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.1 }}
        className="glass-card relative overflow-hidden rounded-2xl"
      >
        <Image
          src={radarSrc}
          alt={`Static radar tile for ${locationLabel}`}
          width={1600}
          height={980}
          unoptimized
          className="block h-[280px] w-full object-cover"
        />

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#050a14]/28" />
        <div className="absolute left-4 top-4 flex items-center gap-2">
          <div className="radar-dot-pulse h-2 w-2 rounded-full bg-emerald-400" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400/60">
            Cached edge radar
          </span>
        </div>

        <div className="absolute right-4 top-4">
          <span className="text-[10px] font-mono text-white/20">
            SWR 300
          </span>
        </div>

        <div className="absolute bottom-4 left-4">
          <span className="text-[10px] font-mono text-white/15">
            {locationLabel}
          </span>
        </div>
      </motion.div>
    </section>
  );
}
