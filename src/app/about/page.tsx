import { Metadata } from "next";
import { AnimatedPageWrapper, AnimatedSection } from "@/components/layout/AnimatedPageWrapper";
import { Shield, Zap, Globe, Cpu, BarChart3, Database } from "lucide-react";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "About",
  description: "Learn more about SnowSense™, the intelligent snow day prediction engine.",
};

function PillarCard({ icon: Icon, title, description, delay = 0 }: { icon: any, title: string, description: string, delay?: number }) {
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

export default function AboutPage() {
  return (
    <AnimatedPageWrapper 
      title="Intelligence Behind the Storm" 
      subtitle="Fusing high-fidelity meteorological data with regional decision logic."
    >
      <AnimatedSection title="The Mission" delay={0.1}>
        <p className="text-lg text-white/90 leading-relaxed italic">
          "Will school be cancelled tomorrow?" 
        </p>
        <p>
          It's a question of safety, logistics, and anticipation. SnowSense™ was engineered to replace anecdotal guesswork with a high-performance prediction system that models the complex interplay of atmospheric conditions and local infrastructure.
        </p>
      </AnimatedSection>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
        <PillarCard 
          icon={Zap} 
          title="Real-Time Analysis" 
          description="We ingest live updates from NWS and Open-Meteo every 15 minutes to capture rapid atmospheric shifts."
          delay={0.1}
        />
        <PillarCard 
          icon={Cpu} 
          title="Dynamic Logic" 
          description="Our algorithm adjusts probability based on regional infrastructure—6 inches in Maine is a Tuesday; in Texas, it's a shutdown."
          delay={0.2}
        />
        <PillarCard 
          icon={Shield} 
          title="Safety First" 
          description="We prioritize ice risk and wind chill factors, which are often more dangerous for bus routes than pure snowfall."
          delay={0.3}
        />
        <PillarCard 
          icon={BarChart3} 
          title="Probability Engine" 
          description="We use cumulative distribution modeling to provide a nuanced percentage, not just a binary yes or no."
          delay={0.4}
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

      <AnimatedSection title="Global Reach" delay={0.4}>
        <div className="flex items-center gap-3 text-white/50 text-sm">
          <Globe className="w-4 h-4" />
          <span>Processing predictions for 14,000+ school districts across North America.</span>
        </div>
      </AnimatedSection>
    </AnimatedPageWrapper>
  );
}
