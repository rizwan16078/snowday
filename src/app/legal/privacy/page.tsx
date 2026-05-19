import { Metadata } from "next";
import { AnimatedPageWrapper, AnimatedSection } from "@/components/layout/AnimatedPageWrapper";
import { breadcrumbListSchema, webPageSchema } from "@/lib/breadcrumb-schema";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "SnowSense™ privacy policy: how we collect, process, and protect your location and usage data. No permanent user identities, no third-party ad tracking.",
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
              <strong className="text-white">Spatial Data:</strong> To provide high-fidelity snow day predictions, SnowSense™ approximates your location via IP resolution or explicit user input (ZIP code, city name, or school district). Precise GPS telemetry is only accessed with explicit browser-level consent and is never persisted on our servers. Your IP address is used solely to estimate your city-level location for the initial forecast and is not stored after the request completes.
            </p>
            <p>
              <strong className="text-white">Telemetry:</strong> We collect anonymized behavioral signals and error logs to optimize the performance of the prediction engine. This includes page load times, prediction latency, and client-side error stacks. No personally identifiable information is included in telemetry payloads.
            </p>
            <p>
              <strong className="text-white">Cookies:</strong> SnowSense™ uses minimal, functionally necessary cookies only. We do not employ tracking cookies, advertising pixels, or third-party analytics scripts that profile your browsing behavior across sites.
            </p>
          </div>
        </AnimatedSection>

        <AnimatedSection title="02. Data Processing" delay={0.15}>
          <p>
            Spatial coordinates are processed exclusively to interface with the National Weather Service (NWS) and Open-Meteo clusters. This data is utilized to calculate the regional closure probability based on historical atmospheric thresholds. Processing occurs in real-time at the edge — your location data is never batched, never stored in a data warehouse, and never used for purposes unrelated to weather prediction.
          </p>
          <p>
            When you search for a specific city or district, the slug you provide (e.g., &quot;boston-ma&quot;) is resolved against our local city catalog on the server. No external API calls are made with your raw input — only sanitized coordinates are sent to weather data providers.
          </p>
        </AnimatedSection>

        <AnimatedSection title="03. External Integrations" delay={0.2}>
          <p>
            Our intelligence layer integrates with NWS, Open-Meteo, and OpenStreetMap. During a prediction request, sanitized spatial data is transmitted to these providers to retrieve the necessary atmospheric payloads. Each of these providers operates under their own privacy policies, and we encourage you to review them.
          </p>
          <p>
            We do not share, sell, or transfer any user data to advertising networks, data brokers, or social media platforms. The only data transmitted externally is the minimum required to fetch weather forecasts for your location.
          </p>
        </AnimatedSection>

        <AnimatedSection title="04. Persistence Layer" delay={0.25}>
          <p>
            SnowSense™ does not maintain permanent user identities. All preference data and recent location history are stored within your browser's <code className="text-blue-400">localStorage</code>. This ensures zero-knowledge persistence where you maintain full control over your data. Clearing your browser data removes all SnowSense™ stored information entirely.
          </p>
          <p>
            We do not operate a user accounts system, require email addresses, or collect names. The service is designed to be fully functional without any personal registration.
          </p>
        </AnimatedSection>

        <AnimatedSection title="05. Security & Contact" delay={0.3}>
          <p>
            All data in transit is encrypted via TLS. Our edge infrastructure runs on Vercel's global network, which maintains SOC 2 Type II compliance. We conduct regular reviews of our data handling practices and promptly address any reported vulnerabilities.
          </p>
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
