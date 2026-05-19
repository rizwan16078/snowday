import { Metadata } from "next";
import { AnimatedPageWrapper, AnimatedSection } from "@/components/layout/AnimatedPageWrapper";
import { breadcrumbListSchema, webPageSchema } from "@/lib/breadcrumb-schema";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for SnowSense™.",
  alternates: {
    canonical: "/legal/privacy",
  },
};

const breadcrumbSchema = breadcrumbListSchema([
  { name: "Home", path: "/" },
  { name: "Privacy Policy", path: "/legal/privacy" },
]);

const pageSchema = webPageSchema({
  path: "/legal/privacy",
  name: "Privacy Policy",
  description: "Privacy Policy for SnowSense™ — how we collect, use, and protect your data.",
});

export default function PrivacyPolicyPage() {
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
      title="Privacy Policy" 
      subtitle={`Protocol v2.1 — Last updated: ${new Date().toLocaleDateString()}`}
    >
      <div className="space-y-12">
        <AnimatedSection title="01. Information Intelligence" delay={0.1}>
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
            <p>
              <strong className="text-white">Spatial Data:</strong> To provide high-fidelity snow day predictions, SnowSense™ approximates your location via IP resolution or explicit user input. Precise GPS telemetry is only accessed with explicit browser-level consent and is never persisted on our servers.
            </p>
            <p>
              <strong className="text-white">Telemetry:</strong> We collect anonymized behavioral signals and error logs to optimize the performance of the prediction engine.
            </p>
          </div>
        </AnimatedSection>

        <AnimatedSection title="02. Data Processing" delay={0.15}>
          <p>
            Spatial coordinates are processed exclusively to interface with the National Weather Service (NWS) and Open-Meteo clusters. This data is utilized to calculate the regional closure probability based on historical atmospheric thresholds.
          </p>
        </AnimatedSection>

        <AnimatedSection title="03. External Integrations" delay={0.2}>
          <p>
            Our intelligence layer integrates with NWS, Open-Meteo, and OpenStreetMap. During a prediction request, sanitized spatial data is transmitted to these providers to retrieve the necessary atmospheric payloads.
          </p>
        </AnimatedSection>

        <AnimatedSection title="04. Persistence Layer" delay={0.25}>
          <p>
            SnowSense™ does not maintain permanent user identities. All preference data and recent location history are stored within your browser's <code className="text-blue-400">localStorage</code>. This ensures zero-knowledge persistence where you maintain full control over your data.
          </p>
        </AnimatedSection>

        <AnimatedSection title="05. Security & Contact" delay={0.3}>
          <div className="flex items-center gap-4 p-4 rounded-xl bg-blue-600/5 border border-blue-500/10">
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <p className="text-sm">
              Inquiries regarding data sovereignty: <a href="mailto:privacy@snowsense.app" className="text-white hover:text-blue-300 underline underline-offset-4 transition-colors">privacy@snowsense.app</a>
            </p>
          </div>
        </AnimatedSection>
      </div>
    </AnimatedPageWrapper>
    </>
  );
}
