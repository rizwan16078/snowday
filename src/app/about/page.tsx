import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AnimatedPageWrapper, AnimatedSection } from "@/components/layout/AnimatedPageWrapper";
import { breadcrumbListSchema } from "@/lib/breadcrumb-schema";
import {
  Shield,
  Zap,
  Globe,
  Cpu,
  BarChart3,
  Database,
  Snowflake,
  MapPin,
  Bell,
  FileText,
  ShieldCheck,
  ExternalLink,
  type LucideIcon,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About SnowSense — How We Predict Snow Days",
  description:
    "How SnowSense™ predicts snow days: live Open-Meteo forecast data (aggregating NOAA HRRR/GFS and ECMWF models), regional closure thresholds, and forecasts refreshed every 30 minutes.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    type: "website",
    title: "About SnowSense — How We Predict Snow Days",
    description:
      "The team, data sources, and methodology behind SnowSense™ snow day predictions.",
    url: "https://www.snowdaycalculate.com/about",
    siteName: "SnowSense™",
    locale: "en_US",
    images: [
      {
        url: "/api/og?loc=About%20SnowSense",
        width: 1200,
        height: 630,
        alt: "About SnowSense — How We Predict Snow Days",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "About SnowSense — How We Predict Snow Days",
    description:
      "The team, data sources, and methodology behind SnowSense™ snow day predictions.",
    images: ["/api/og?loc=About%20SnowSense"],
  },
};

function PillarCard({ icon: Icon, title, description }: { icon: LucideIcon, title: string, description: string }) {
  return (
    <div className="group relative p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-white/10 transition-all duration-500 hover:-translate-y-1">
      <div className="w-12 h-12 rounded-xl bg-blue-600/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
        <Icon className="w-6 h-6 text-blue-400" />
      </div>
      <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">{title}</h3>
      <p className="text-sm text-white/50 leading-relaxed">{description}</p>
      
      {/* Interactive accent */}
      <div className="absolute bottom-0 left-0 h-0.5 bg-blue-500/0 group-hover:bg-blue-500/40 group-hover:w-full transition-all duration-700 rounded-b-2xl" />
    </div>
  );
}

function ServiceItem({
  icon: Icon,
  title,
  description,
  accent,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  accent: string;
}) {
  return (
    <div className="group relative p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.05] hover:border-white/10 hover:-translate-y-0.5 transition-all duration-500 overflow-hidden">
      <div
        className="absolute -top-10 -right-10 w-28 h-28 rounded-full opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-700"
        style={{ background: `${accent}30` }}
      />
      <div className="relative flex items-start gap-3">
        <div
          className="p-2 rounded-lg shrink-0 group-hover:scale-110 transition-transform duration-500"
          style={{ background: `${accent}15`, color: accent }}
        >
          <Icon className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <h4 className="text-sm font-bold text-white/90 mb-1 group-hover:text-white transition-colors">
            {title}
          </h4>
          <p className="text-xs text-white/50 leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
}

function TeamMember({
  src,
  name,
  role,
}: {
  src: string;
  name: string;
  role: string;
}) {
  return (
    <div className="group flex flex-col items-center text-center p-3 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.05] hover:border-white/10 hover:-translate-y-1 transition-all duration-500">
      <div className="relative w-20 h-20 rounded-full overflow-hidden mb-3 ring-2 ring-white/10 group-hover:ring-white/30 transition-all duration-500 shadow-[0_8px_24px_-4px_rgba(0,0,0,0.4)] group-hover:scale-110">
        <Image
          src={src}
          alt={`Team member photo of ${name}, ${role}`}
          width={160}
          height={160}
          className="object-cover w-full h-full"
        />
        <div className="absolute inset-0 rounded-full bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
      </div>
      <p className="text-xs font-bold text-white/90 group-hover:text-white transition-colors">
        {name}
      </p>
      <p className="text-[10px] text-white/50 mt-0.5 leading-tight">{role}</p>
    </div>
  );
}

function PartnerLink({
  href,
  title,
  role,
  accent,
}: {
  href: string;
  title: string;
  role: string;
  accent: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.05] hover:border-white/10 transition-all duration-500 flex items-center gap-3 overflow-hidden"
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
        style={{
          background: `linear-gradient(135deg, ${accent}10 0%, transparent 60%)`,
        }}
      />
      <div
        className="relative p-2.5 rounded-lg shrink-0 group-hover:scale-110 transition-transform duration-500"
        style={{ background: `${accent}15`, color: accent }}
      >
        <ExternalLink className="w-4 h-4" />
      </div>
      <div className="relative flex-1 min-w-0">
        <h4
          className="text-sm font-bold text-white/90 truncate transition-colors duration-500"
          style={{ color: undefined }}
        >
          {title}
        </h4>
        <p className="text-xs text-white/50 truncate">{role}</p>
      </div>
      <div
        className="relative text-white/25 group-hover:translate-x-1 transition-all duration-500"
        style={{ color: undefined }}
        aria-hidden="true"
      >
        →
      </div>
    </a>
  );
}

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "SnowSense™",
  url: "https://www.snowdaycalculate.com",
  description: "Real-time snow day probability calculator for schools across the US, powered by live weather data and regional tolerance modeling.",
  parentOrganization: {
    "@type": "Organization",
    name: "SnowDayCalculate LLC",
  },
};

const breadcrumbSchema = breadcrumbListSchema([
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
]);

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    <AnimatedPageWrapper 
      title="Intelligence Behind the Storm" 
      subtitle="Fusing high-fidelity meteorological data with regional decision logic."
    >
      <AnimatedSection title="Our Story & Mission" delay={0.1}>
        <p className="text-lg text-white/90 leading-relaxed italic">
          &ldquo;Will school be cancelled tomorrow?&rdquo;
        </p>
        <p>
          It&apos;s a question of safety, logistics, and anticipation. SnowSense™ was engineered to replace anecdotal guesswork with a high-performance prediction system that models the complex interplay of atmospheric conditions and local infrastructure.
        </p>
      </AnimatedSection>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
        <PillarCard 
          icon={Zap} 
          title="Real-Time Analysis" 
          description="We ingest live Open-Meteo forecast updates throughout the day — drawing on NOAA and ECMWF models — to capture rapid atmospheric shifts."
        />
        <PillarCard 
          icon={Cpu} 
          title="Dynamic Logic" 
          description="Our algorithm adjusts probability based on regional infrastructure—6 inches in Maine is a Tuesday; in Texas, it's a shutdown."
        />
        <PillarCard 
          icon={Shield} 
          title="Safety First" 
          description="We prioritize ice risk and wind chill factors, which are often more dangerous for bus routes than pure snowfall."
        />
        <PillarCard 
          icon={BarChart3} 
          title="Probability Engine" 
          description="We use cumulative distribution modeling to provide a nuanced percentage, not just a binary yes or no."
        />
      </div>

      <AnimatedSection title="Our Data Strategy" delay={0.3}>
        <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center p-6 rounded-2xl bg-blue-600/5 border border-blue-500/10">
          <Database className="w-10 h-10 text-blue-400 shrink-0" />
          <div>
            <h4 className="font-bold text-white mb-1">Open Source, Open Data</h4>
            <p className="text-sm text-white/60 leading-relaxed">
              We leverage public meteorological datasets to ensure transparency. Our history is rooted in providing accessible intelligence for students, parents, and educators.
            </p>
          </div>
        </div>
      </AnimatedSection>

      {/* ── What We Do ─────────────────────────────────────────────────── */}
      <AnimatedSection title="What We Do" delay={0.35}>
        <p>
          SnowSense™ delivers four core services for parents, students, and
          school administrators &mdash; engineered as a single, fast, free-to-use platform:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
          <ServiceItem
            icon={Snowflake}
            title="Real-Time Predictions"
            description="Live probability scores updated every 30 minutes from Open-Meteo, which aggregates NOAA (HRRR/GFS) and ECMWF forecast models."
            accent="#60a5fa"
          />
          <ServiceItem
            icon={MapPin}
            title="City-Specific Modeling"
            description="City and district forecast pages with regional tolerance calibration — no one-size-fits-all forecasts."
            accent="#22d3ee"
          />
          <ServiceItem
            icon={Bell}
            title="Forecast Updates"
            description="Fresh prediction pages and forecast context designed to help families check conditions quickly."
            accent="#f59e0b"
          />
          <ServiceItem
            icon={FileText}
            title="Educational Content"
            description="Deep-dive guides explaining the weather science and decision frameworks behind every closure."
            accent="#a78bfa"
          />
        </div>
      </AnimatedSection>

      {/* ── Trusted Source Statement ───────────────────────────────────── */}
      <AnimatedSection title="Trusted Sources" delay={0.4}>
        <div className="group relative p-6 rounded-2xl bg-gradient-to-br from-emerald-500/[0.06] to-blue-500/[0.04] border border-emerald-500/15 hover:border-emerald-500/30 transition-all duration-500 overflow-hidden">
          <div className="absolute -top-16 -right-16 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700" />
          <div className="relative flex flex-col sm:flex-row gap-4 items-start">
            <div className="p-3 rounded-xl bg-emerald-500/10 shrink-0 group-hover:scale-110 transition-transform duration-500">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <div className="space-y-3">
              <h4 className="font-bold text-white text-base">
                Publicly Sourced, Methodology Driven
              </h4>
              <p className="text-sm text-white/60 leading-relaxed">
                SnowSense™ uses public weather data and explains the major signals
                behind each forecast. We focus on transparent inputs and regional
                context rather than promising perfect accuracy or official closure authority.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  Public Weather Data
                </span>
                <span className="text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20">
                  Regional Thresholds
                </span>
                <span className="text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/20">
                  District Forecast Pages
                </span>
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* ── Our Team in Workspace ──────────────────────────────────────── */}
      <AnimatedSection title="Our Team" delay={0.45}>
        <p>
          A small, distributed engineering team working remotely across North America
          and the EU. Atmospheric science, edge infrastructure, and product all under
          one roof &mdash; just a virtual one.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          <TeamMember
            src="/team/team-1.svg"
            name="A. Khan"
            role="Lead Engineer"
          />
          <TeamMember
            src="/team/team-2.svg"
            name="M. Chen"
            role="Atmospheric Scientist"
          />
          <TeamMember
            src="/team/team-3.svg"
            name="J. Rivera"
            role="Edge Infrastructure"
          />
          <TeamMember
            src="/team/team-4.svg"
            name="S. Patel"
            role="Frontend Lead"
          />
        </div>
        <div className="mt-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center gap-3">
          <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
          <p className="text-xs text-white/50">
            Working remotely across <strong className="text-white/70">4 time zones</strong>{" "}
            — North America &amp; EU. Office hours overlap 09:00&ndash;13:00 UTC.
          </p>
        </div>
      </AnimatedSection>

      {/* ── Featured Websites / Partners ───────────────────────────────── */}
      <AnimatedSection title="Featured Partners" delay={0.5}>
        <p>
          SnowSense™ aggregates from open public meteorological services. We link
          directly to every upstream source so you can verify our inputs:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
          <PartnerLink
            href="https://www.weather.gov/"
            title="National Weather Service"
            role="Hourly forecast grids · United States"
            accent="#60a5fa"
          />
          <PartnerLink
            href="https://open-meteo.com/"
            title="Open-Meteo"
            role="ECMWF & high-res European models"
            accent="#22d3ee"
          />
          <PartnerLink
            href="https://www.noaa.gov/"
            title="NOAA"
            role="HRRR rapid refresh · short-range storms"
            accent="#a78bfa"
          />
          <PartnerLink
            href="https://www.openstreetmap.org/"
            title="OpenStreetMap"
            role="Geocoding · district & city lookup"
            accent="#f59e0b"
          />
        </div>
      </AnimatedSection>

      <AnimatedSection title="Global Reach" delay={0.55}>
        <div className="flex items-center gap-3 text-white/50 text-sm">
          <Globe className="w-4 h-4" />
          <span>Processing predictions across hundreds of US cities and linked district forecast pages.</span>
        </div>
      </AnimatedSection>

      <AnimatedSection title="Parent Company" delay={0.6}>
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] text-sm text-white/50">
          <p>
            SnowSense™ is operated and maintained by <strong className="text-white/70">SnowDayCalculate LLC</strong>, our legal parent entity dedicated to meteorological accessibility and educational data services.
          </p>
        </div>
      </AnimatedSection>

      <AnimatedSection title="Explore SnowSense™" delay={0.65}>
        <div className="grid sm:grid-cols-2 gap-4">
          <Link
            href="/"
            className="group p-5 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-blue-500/30 transition-all"
          >
            <p className="text-sm font-bold text-white mb-1 group-hover:text-blue-300 transition-colors">Snow Day Calculator</p>
            <p className="text-xs text-white/50">Check your real-time snow day probability by ZIP code or city.</p>
          </Link>
          <Link
            href="/weather"
            className="group p-5 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-blue-500/30 transition-all"
          >
            <p className="text-sm font-bold text-white mb-1 group-hover:text-blue-300 transition-colors">Weather Outlook</p>
            <p className="text-xs text-white/50">Full weather dashboard with hourly, 10-day, and air quality data.</p>
          </Link>
          <Link
            href="/blog"
            className="group p-5 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-blue-500/30 transition-all"
          >
            <p className="text-sm font-bold text-white mb-1 group-hover:text-blue-300 transition-colors">Blog &amp; Guides</p>
            <p className="text-xs text-white/50">Expert articles on snow day science, closure thresholds, and regional analysis.</p>
          </Link>
          <Link
            href="/team"
            className="group p-5 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-blue-500/30 transition-all"
          >
            <p className="text-sm font-bold text-white mb-1 group-hover:text-blue-300 transition-colors">Our Team</p>
            <p className="text-xs text-white/50">Meet the people behind SnowSense™ predictions.</p>
          </Link>
        </div>
      </AnimatedSection>
    </AnimatedPageWrapper>
    </>
  );
}
