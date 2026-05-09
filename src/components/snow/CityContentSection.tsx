import Link from "next/link";
import { MapPin, Snowflake, Clock, Building2, BarChart3, CheckCircle2 } from "lucide-react";
import type { CityContent } from "@/lib/city-content";

interface Props {
  content: CityContent;
}

const ratingColor = {
  "Low": "text-red-400 bg-red-400/10",
  "Medium": "text-amber-400 bg-amber-400/10",
  "High": "text-blue-400 bg-blue-400/10",
  "Very High": "text-emerald-400 bg-emerald-400/10",
};

export function CityContentSection({ content }: Props) {
  return (
    <section
      className="w-full max-w-4xl mx-auto px-5 space-y-6"
      aria-label={`Snow day guide for ${content.city}, ${content.state}`}
    >
      {/* Section Header */}
      <div className="text-center">
        <p className="text-[10px] text-blue-400/60 uppercase tracking-[0.3em] font-bold mb-2">
          Local Snow Day Guide
        </p>
        <h2 className="text-2xl sm:text-3xl font-display font-black text-white/90">
          {content.city}, {content.state} — Snow Day Facts
        </h2>
        <p className="text-sm text-white/30 mt-2 max-w-lg mx-auto">
          Historical patterns, infrastructure data, and what actually triggers school closures in {content.city}.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass-card rounded-2xl p-4 text-center">
          <Snowflake className="w-4 h-4 text-blue-400 mx-auto mb-2" />
          <p className="text-2xl font-black font-display text-white">{content.avgSnowDaysPerYear}</p>
          <p className="text-[10px] text-white/30 uppercase tracking-wider mt-0.5">Snow Days / Year</p>
        </div>
        <div className="glass-card rounded-2xl p-4 text-center">
          <BarChart3 className="w-4 h-4 text-blue-400 mx-auto mb-2" />
          <p className="text-2xl font-black font-display text-white">{content.avgAnnualSnowfallInches}"</p>
          <p className="text-[10px] text-white/30 uppercase tracking-wider mt-0.5">Avg Annual Snow</p>
        </div>
        <div className="glass-card rounded-2xl p-4 text-center">
          <Clock className="w-4 h-4 text-blue-400 mx-auto mb-2" />
          <p className="text-sm font-black font-display text-white leading-tight">{content.typicalDecisionTime}</p>
          <p className="text-[10px] text-white/30 uppercase tracking-wider mt-0.5">Decision Time</p>
        </div>
        <div className="glass-card rounded-2xl p-4 text-center">
          <Building2 className="w-4 h-4 text-blue-400 mx-auto mb-2" />
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${ratingColor[content.infrastructureRating]}`}>
            {content.infrastructureRating}
          </span>
          <p className="text-[10px] text-white/30 uppercase tracking-wider mt-1.5">Infrastructure</p>
        </div>
      </div>

      {/* Closure Threshold */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-blue-500/10 mt-0.5 shrink-0">
            <Snowflake className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white/90 mb-1">
              Typical Closure Threshold: <span className="text-blue-400">{content.closureThresholdInches} inches</span>
            </h3>
            <p className="text-sm text-white/50 leading-relaxed">{content.snowDayContext}</p>
          </div>
        </div>
      </div>

      {/* Historical Pattern */}
      <div className="glass-card rounded-2xl p-5">
        <h3 className="text-sm font-bold text-white/80 mb-3 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-violet-400" />
          Historical School Closure Patterns
        </h3>
        <p className="text-sm text-white/50 leading-relaxed">{content.historicalPattern}</p>
      </div>

      {/* District Notes */}
      <div className="glass-card rounded-2xl p-5">
        <h3 className="text-sm font-bold text-white/80 mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-400" />
          How {content.city} Makes the Decision
        </h3>
        <p className="text-sm text-white/50 leading-relaxed mb-3">{content.districtNotes}</p>
        <div className="flex flex-wrap gap-2 mt-3">
          {content.notificationChannels.map((channel) => (
            <span key={channel} className="text-[10px] font-bold bg-white/5 border border-white/8 text-white/40 px-2.5 py-1 rounded-full">
              {channel}
            </span>
          ))}
        </div>
      </div>

      {/* Regional Facts */}
      <div className="glass-card rounded-2xl p-5">
        <h3 className="text-sm font-bold text-white/80 mb-4 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-emerald-400" />
          {content.city} Snow Day Facts
        </h3>
        <ul className="space-y-2.5">
          {content.regionalFacts.map((fact, i) => (
            <li key={i} className="flex gap-2.5 text-sm text-white/50 leading-relaxed">
              <CheckCircle2 className="w-4 h-4 text-emerald-400/60 shrink-0 mt-0.5" />
              {fact}
            </li>
          ))}
        </ul>
      </div>

      {/* CTA to Calculator */}
      <div className="glass-card rounded-2xl p-5 text-center">
        <p className="text-sm text-white/60 mb-3">
          Ready to see tonight's real-time probability for {content.city}?
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold text-white transition-all hover:scale-105"
          style={{
            background: "linear-gradient(135deg, #1d4ed8, #3b82f6)",
            boxShadow: "0 4px 16px rgba(59,130,246,0.3)",
          }}
        >
          ❄️ Check My Prediction
        </Link>
      </div>
    </section>
  );
}
