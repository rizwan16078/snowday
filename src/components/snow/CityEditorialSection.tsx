/**
 * CityEditorialSection — renders the template-generated editorial body
 * for a city page. This is the 500+ word SEO content section that makes
 * each city page uniquely rankable.
 *
 * Fed by `generateCityContent(cityRecord)` from `@/lib/cities/content`.
 */

import type { CityContentSections } from "@/lib/cities/content";
import { Snowflake, MapPin, CalendarDays, Info } from "lucide-react";

interface Props {
  content: CityContentSections;
  cityName: string;
  stateName: string;
}

export function CityEditorialSection({ content, cityName, stateName }: Props) {
  return (
    <section className="relative z-10 py-16 px-4" aria-label={`${cityName} snow day context`}>
      <div className="max-w-3xl mx-auto space-y-10">
        {/* Closure threshold callout */}
        <div className="glass-card rounded-3xl p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Snowflake className="w-5 h-5 text-blue-400" aria-hidden="true" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-blue-400/80">
              Typical closure threshold
            </h3>
          </div>
          <p className="text-white/90 text-2xl sm:text-3xl font-display font-black leading-tight mb-4">
            {content.closureThreshold.short}
          </p>
          <p className="text-white/55 text-[15px] leading-relaxed">
            {content.closureThreshold.paragraph}
          </p>
        </div>

        {/* Local factors — two paragraphs */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-indigo-400" aria-hidden="true" />
            </div>
            <h3 className="text-xl sm:text-2xl font-display font-black text-white">
              {content.localFactors.heading}
            </h3>
          </div>
          <div className="space-y-4">
            {content.localFactors.paragraphs.map((p, i) => (
              <p key={i} className="text-white/60 text-[15px] leading-relaxed">
                {p}
              </p>
            ))}
          </div>
        </div>

        {/* Typical winter block */}
        <div className="glass-card rounded-3xl p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <CalendarDays className="w-5 h-5 text-emerald-400" aria-hidden="true" />
            </div>
            <h3 className="text-xl sm:text-2xl font-display font-black text-white">
              {content.typicalWinter.heading}
            </h3>
          </div>
          <p className="text-white/60 text-[15px] leading-relaxed mb-5">
            {content.typicalWinter.paragraph}
          </p>
          <ul className="space-y-2.5">
            {content.typicalWinter.bullets.map((b, i) => (
              <li key={i} className="flex gap-3 text-sm text-white/55 leading-relaxed">
                <span className="shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400/60" aria-hidden="true" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Closing paragraph */}
        <div className="flex gap-3 items-start border-l-2 border-blue-500/40 pl-5 py-2">
          <Info className="w-4 h-4 text-blue-400/70 mt-1 shrink-0" aria-hidden="true" />
          <p className="text-white/55 text-[15px] leading-relaxed italic">
            {content.closing}
          </p>
        </div>

        {/* Metadata footer — subtle, but visible for transparency */}
        <p className="text-center text-[10px] text-white/25 uppercase tracking-[0.25em]">
          {stateName} · {content.wordCount} words of {cityName.split(",")[0]}-specific context
        </p>
      </div>
    </section>
  );
}
