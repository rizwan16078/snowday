import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { AnimatedPageWrapper, AnimatedSection } from "@/components/layout/AnimatedPageWrapper";
import { MapPin } from "lucide-react";
import { breadcrumbListSchema, webPageSchema } from "@/lib/breadcrumb-schema";

export const metadata: Metadata = {
  title: "Our Team & Authors",
  description: "Meet the meteorologists, data scientists, and developers behind SnowSense™.",
  alternates: {
    canonical: "/team",
  },
};

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
    <div className="group flex flex-col items-center text-center p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.05] hover:border-white/10 hover:-translate-y-1 transition-all duration-500">
      <div className="relative w-24 h-24 rounded-full overflow-hidden mb-4 ring-2 ring-white/10 group-hover:ring-white/30 transition-all duration-500 shadow-[0_8px_24px_-4px_rgba(0,0,0,0.4)] group-hover:scale-110">
        <Image
          src={src}
          alt={`Team member photo of ${name}, ${role}`}
          width={160}
          height={160}
          className="object-cover w-full h-full"
        />
        <div className="absolute inset-0 rounded-full bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
      </div>
      <p className="text-sm font-bold text-white/90 group-hover:text-white transition-colors">
        {name}
      </p>
      <p className="text-xs text-white/50 mt-1 leading-tight">{role}</p>
    </div>
  );
}

const breadcrumbSchema = breadcrumbListSchema([
  { name: "Home", path: "/" },
  { name: "Team", path: "/team" },
]);

const pageSchema = webPageSchema({
  path: "/team",
  name: "SnowSense™ Team",
  description: "Meet the meteorologists, data scientists, and developers behind SnowSense™.",
});

export default function TeamPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    <AnimatedPageWrapper 
      title="Authors & Team" 
      subtitle="The data scientists, meteorologists, and engineers behind the predictions."
    >
      <AnimatedSection title="Our Editorial & Prediction Team" delay={0.1}>
        <p className="text-white/80 mb-6">
          Every article, forecast, and prediction model on SnowSense™ is built, reviewed, and published by our dedicated team.
        </p>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <TeamMember
            src="/team/team-1.svg"
            name="A. Khan"
            role="Lead Engineer & Author"
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
        
        <div className="mt-8 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center gap-3">
          <MapPin className="w-5 h-5 text-blue-400 shrink-0" />
          <p className="text-sm text-white/60">
            Working remotely across <strong className="text-white/80">4 time zones</strong>{" "}
            — North America &amp; EU. Office hours overlap 09:00&ndash;13:00 UTC.
          </p>
        </div>
      </AnimatedSection>

      <AnimatedSection title="What We Build" delay={0.4}>
        <div className="grid sm:grid-cols-3 gap-4">
          <Link
            href="/"
            className="group p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-blue-500/30 transition-all"
          >
            <p className="text-sm font-bold text-white mb-1 group-hover:text-blue-300 transition-colors">Snow Day Calculator</p>
            <p className="text-xs text-white/50">Real-time prediction engine.</p>
          </Link>
          <Link
            href="/weather"
            className="group p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-blue-500/30 transition-all"
          >
            <p className="text-sm font-bold text-white mb-1 group-hover:text-blue-300 transition-colors">Weather Dashboard</p>
            <p className="text-xs text-white/50">Hourly &amp; 10-day forecasts.</p>
          </Link>
          <Link
            href="/about"
            className="group p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-blue-500/30 transition-all"
          >
            <p className="text-sm font-bold text-white mb-1 group-hover:text-blue-300 transition-colors">About SnowSense™</p>
            <p className="text-xs text-white/50">Our mission &amp; data strategy.</p>
          </Link>
        </div>
      </AnimatedSection>
    </AnimatedPageWrapper>
    </>
  );
}
