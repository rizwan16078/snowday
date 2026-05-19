import { Metadata } from "next";
import { AnimatedPageWrapper, AnimatedSection } from "@/components/layout/AnimatedPageWrapper";
import { breadcrumbListSchema, webPageSchema } from "@/lib/breadcrumb-schema";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of Service for SnowSense™ — usage policies, liability limitations, and guidelines for the snow day prediction service.",
  alternates: {
    canonical: "/legal/terms",
  },
};

const breadcrumbSchema = breadcrumbListSchema([
  { name: "Home", path: "/" },
  { name: "Terms of Service", path: "/legal/terms" },
]);

const pageSchema = webPageSchema({
  path: "/legal/terms",
  name: "Terms of Service",
  description: "Terms of Service for SnowSense™ — operational guidelines and usage policies.",
});

export default function TermsOfServicePage() {
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
      title="Terms of Service" 
      subtitle={`Operational Guidelines — Last updated: ${new Date().toLocaleDateString()}`}
    >
      <div className="space-y-12">
        <AnimatedSection title="01. Binding Agreement" delay={0.1}>
          <p>
            By accessing and interacting with the SnowSense™ ecosystem (the "Service"), you acknowledge and agree to the operational protocols outlined herein. These terms apply to all pages, features, and data provided by the Service, including the snow day calculator, weather outlook, school district pages, and editorial content.
          </p>
          <p>
            If you do not agree with any part of these terms, you should discontinue use of the Service immediately. Continued use constitutes acceptance of any updates or modifications to these terms.
          </p>
        </AnimatedSection>

        <AnimatedSection title="02. Nature of Intelligence" delay={0.15}>
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 italic text-white/90">
            "SnowSense™ provides probabilistic estimates of school closures based on third-party meteorological telemetry."
          </div>
          <p className="mt-4">
            These predictions are generated through proprietary algorithmic processing and are intended for informational and entertainment purposes. We do not issue official mandates or closure notices. A 70% probability does not mean school will definitely close — it means our model assesses a 7-in-10 chance based on current forecast data and historical closure patterns for your region.
          </p>
          <p>
            Weather forecasts inherently carry uncertainty. Rapidly changing atmospheric conditions, model disagreements between data sources, and local infrastructure decisions can all cause actual outcomes to differ from our predictions.
          </p>
        </AnimatedSection>

        <AnimatedSection title="03. Limitation of Liability" delay={0.2}>
          <p>
            <strong className="text-white">The Service is provided on an "As-Is" basis.</strong> Final authority for institutional closures rests solely with local district administrations. SnowSense™ assumes no liability for educational delays, logistical failures, or reliance on algorithmic probability. Users are advised to cross-reference our data with official local government announcements.
          </p>
          <p>
            You should not make safety-critical decisions based solely on SnowSense™ predictions. If weather conditions appear dangerous, follow official guidance from your local school district, emergency management agency, or the National Weather Service.
          </p>
        </AnimatedSection>

        <AnimatedSection title="04. Algorithmic Integrity" delay={0.25}>
          <p>
            Automated scraping, high-frequency polling, or any attempt to reverse-engineer the SnowSense™ logic is strictly prohibited. We maintain a zero-tolerance policy for activities that degrade the Service experience for the global user base.
          </p>
          <p>
            This includes but is not limited to: automated scripts that request predictions more frequently than the UI permits, bulk extraction of city or district data through programmatic access, and attempts to replicate the prediction algorithm through systematic input-output analysis.
          </p>
        </AnimatedSection>

        <AnimatedSection title="05. Service Continuity" delay={0.3}>
          <p>
            The SnowSense™ team reserves the right to modify engine parameters, UI layers, or data sources at any point to maintain the high standard of prediction accuracy. We may also update these terms periodically; material changes will be reflected by the "Last updated" date shown above.
          </p>
          <p>
            The Service may experience intermittent downtime for maintenance, weather data provider outages, or infrastructure updates. We strive to minimize disruption but cannot guarantee uninterrupted availability.
          </p>
        </AnimatedSection>
      </div>
    </AnimatedPageWrapper>
    </>
  );
}
