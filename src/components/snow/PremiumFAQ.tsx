"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

/**
 * PremiumFAQ — Location-aware FAQ system
 * Accordion with CSS-only animations (no framer-motion).
 * Ready for schema markup (JSON-LD).
 */

interface PremiumFAQProps {
  location?: string;
}

function buildFaqs(location: string) {
  const city = location.split(",")[0]?.trim() || "your city";
  return [
    {
      q: `How many inches of snow cancel school in ${city}?`,
      a: `School closures in ${city} depend on multiple factors including accumulation rate, timing, ice risk, and the district's historical tolerance. Our SnowSense™ engine weighs all of these — not just total inches — to predict closures. Generally, 4-6 inches triggers closures in most Northeast cities, while 1-2 inches can shut down Southern cities.`,
    },
    {
      q: "How accurate is the Snow Day Calculator?",
      a: "Treat SnowSense as a forecast aid, not an official closure notice. We weigh snowfall, ice risk, temperature, storm timing, and local tolerance, but districts can still make different calls based on road crews, bus routes, and superintendent judgment.",
    },
    {
      q: "How often do you update the predictions?",
      a: "Weather data is re-fetched and cached at the edge every 30 minutes. The prediction is computed server-side on every page load using the latest cached data, ensuring you always get current results without API overload.",
    },
    {
      q: "Why does a 2-inch forecast give different probabilities in different cities?",
      a: "Regional infrastructure plays a massive role. A city like Boston is equipped to handle 6 inches of snow with minimal disruption, whereas 2 inches in Atlanta could paralyze the road network due to a lack of plows and salt trucks.",
    },
    {
      q: "What is the SnowSense™ Calibration Layer?",
      a: "The Calibration Layer lets you tune the prediction model with two signals: (1) Snow days already used this year — districts that have used most of their snow days tend to be more conservative, and (2) School type — private schools typically close more easily than public schools due to smaller bus fleets and parent-driven decisions.",
    },
    {
      q: "Why are snow days announced at night?",
      a: `Superintendents typically make closure decisions between 4-6 AM based on overnight accumulation and morning road conditions. In ${city}, this decision often involves coordination with city plowing operations and weather service updates.`,
    },
    {
      q: "Does this work for delayed openings?",
      a: "While our core probability focuses on full closures, a high 'Timing' score (snow falling between 4 AM and 8 AM) combined with a moderate overall probability often strongly indicates a 2-hour delay.",
    },
    {
      q: "Can I share my prediction with friends?",
      a: "Yes! Every prediction is encoded in the URL. When you share a link, anyone who opens it sees the exact same prediction with the same calibration settings. No account needed, no sign-up required.",
    },
  ];
}

export function PremiumFAQ({ location = "your city" }: PremiumFAQProps) {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const faqs = buildFaqs(location);

  return (
    <section className="w-full max-w-5xl mx-auto px-5" aria-label="Frequently asked questions">
      <div className="text-center mb-10">
        <p className="text-[10px] text-zinc-400 uppercase tracking-[0.3em] font-bold mb-2">
          Common Questions
        </p>
        <h3 className="text-2xl sm:text-3xl font-display font-black text-white/90">
          Frequently Asked Questions
        </h3>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, i) => {
          const isOpen = openIdx === i;
          return (
            <div
              key={i}
              className={`rounded-2xl transition-all duration-300 ${
                isOpen
                  ? "bg-white/[0.04] border border-white/10"
                  : "bg-white/[0.02] border border-white/[0.02] hover:bg-white/[0.03]"
              }`}
            >
              <button
                onClick={() => setOpenIdx(isOpen ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left"
                aria-expanded={isOpen}
              >
                <span className="text-sm font-semibold text-white/90 pr-8">{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-white/50 shrink-0 transition-transform duration-300 ${
                    isOpen ? "rotate-180 text-white/80" : ""
                  }`}
                />
              </button>

              {/* CSS-only accordion — max-height transition replaces AnimatePresence */}
              <div
                className="overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out"
                style={{ maxHeight: isOpen ? "400px" : "0px", opacity: isOpen ? 1 : 0 }}
              >
                <div className="p-5 pt-0 text-sm text-white/50 leading-relaxed border-t border-white/5">
                  {faq.a}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((faq) => ({
              "@type": "Question",
              name: faq.q,
              acceptedAnswer: { "@type": "Answer", text: faq.a },
            })),
          }),
        }}
      />
    </section>
  );
}
