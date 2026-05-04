"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { MapPin } from "lucide-react";

/**
 * RegionalLinks — SEO city link grid
 * Static generation. No runtime geo computation.
 * Pure internal linking for SEO value.
 */

const regions = [
  {
    name: "Northeast",
    cities: [
      { name: "New York, NY", slug: "new-york-ny" },
      { name: "Boston, MA", slug: "boston-ma" },
      { name: "Philadelphia, PA", slug: "philadelphia-pa" },
      { name: "Hartford, CT", slug: "hartford-ct" },
      { name: "Albany, NY", slug: "albany-ny" },
      { name: "Portland, ME", slug: "portland-me" },
    ],
  },
  {
    name: "Midwest",
    cities: [
      { name: "Chicago, IL", slug: "chicago-il" },
      { name: "Detroit, MI", slug: "detroit-mi" },
      { name: "Minneapolis, MN", slug: "minneapolis-mn" },
      { name: "Milwaukee, WI", slug: "milwaukee-wi" },
      { name: "Cleveland, OH", slug: "cleveland-oh" },
      { name: "Indianapolis, IN", slug: "indianapolis-in" },
    ],
  },
  {
    name: "Mountain & West",
    cities: [
      { name: "Denver, CO", slug: "denver-co" },
      { name: "Salt Lake City, UT", slug: "salt-lake-city-ut" },
      { name: "Seattle, WA", slug: "seattle-wa" },
      { name: "Portland, OR", slug: "portland-or" },
      { name: "Anchorage, AK", slug: "anchorage-ak" },
      { name: "Boise, ID", slug: "boise-id" },
    ],
  },
  {
    name: "Southeast",
    cities: [
      { name: "Washington, DC", slug: "washington-dc" },
      { name: "Charlotte, NC", slug: "charlotte-nc" },
      { name: "Atlanta, GA", slug: "atlanta-ga" },
      { name: "Nashville, TN", slug: "nashville-tn" },
      { name: "Richmond, VA", slug: "richmond-va" },
      { name: "Raleigh, NC", slug: "raleigh-nc" },
    ],
  },
];

export function RegionalLinks() {
  return (
    <section className="w-full max-w-4xl mx-auto px-5" aria-label="Regional snow day predictions">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-10"
      >
        <p className="text-[10px] text-rose-400/60 uppercase tracking-[0.3em] font-bold mb-2">
          Explore by Region
        </p>
        <h2 className="text-2xl sm:text-3xl font-display font-black text-white/90">
          Snow Day Predictions by City
        </h2>
        <p className="text-sm text-white/30 mt-2">
          Check the snow day probability for any major city
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {regions.map((region, ri) => (
          <motion.div
            key={region.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: ri * 0.08 }}
            className="glass-card rounded-2xl p-5"
          >
            <h3 className="text-xs font-bold text-white/50 uppercase tracking-widest mb-4">
              {region.name}
            </h3>
            <div className="space-y-2">
              {region.cities.map((city) => (
                <Link
                  key={city.slug}
                  href={`/snow-day-calculator/${city.slug}`}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white/50 hover:text-white hover:bg-white/5 transition-all group"
                >
                  <MapPin className="w-3 h-3 text-blue-400/40 group-hover:text-blue-400 transition-colors" />
                  <span>{city.name}</span>
                  <span className="ml-auto text-[10px] text-white/15 group-hover:text-white/30 transition-colors">
                    →
                  </span>
                </Link>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
        className="text-center mt-8"
      >
        <Link
          href="/snow-day-calculator"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full glass hover:bg-white/8 text-sm font-bold text-white/60 hover:text-white transition-all"
        >
          View All Cities
          <span className="text-blue-400">→</span>
        </Link>
      </motion.div>
    </section>
  );
}
