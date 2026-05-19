import { Metadata } from "next";
import Link from "next/link";
import { breadcrumbListSchema } from "@/lib/breadcrumb-schema";
import { ALL_CITIES } from "@/lib/cities/helpers";

export const metadata: Metadata = {
  title: "Sitemap",
  description: "Complete directory of all SnowSense™ pages — snow day calculator, weather outlook, school district predictions, blog guides, and legal pages.",
  alternates: {
    canonical: "/sitemap",
  },
};

const breadcrumbSchema = breadcrumbListSchema([
  { name: "Home", path: "/" },
  { name: "Sitemap", path: "/sitemap" },
]);

export default function SitemapPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    <main className="max-w-2xl mx-auto px-6 py-20 text-white">
      <div className="glass-card rounded-3xl p-10 space-y-6">
        <h1 className="text-4xl font-black font-display mb-4">Sitemap</h1>
        <p className="text-white/50 mb-8 leading-relaxed">
          Every page on SnowSense™ in one place. Use this directory to find snow day predictions
          for your city or school district, browse our weather guides and glossary, or access
          legal and policy documents. We cover {ALL_CITIES.length}+ US cities across all 50 states.
        </p>
        
        <h2 className="text-xs font-bold uppercase tracking-widest text-white/50 mb-3">Calculators & Predictions</h2>
        <ul className="space-y-3 text-white/80 mb-8">
          <li>
            <Link href="/" className="hover:text-blue-400 transition-colors">Snow Day Calculator</Link>
            <span className="block text-xs text-white/50">Auto-detected location prediction with live NWS data</span>
          </li>
          <li>
            <Link href="/snow-day-calculator" className="hover:text-blue-400 transition-colors">Browse by City</Link>
            <span className="block text-xs text-white/50">All covered US cities with per-city snow day probability</span>
          </li>
        </ul>

        <h2 className="text-xs font-bold uppercase tracking-widest text-white/50 mb-3">Weather & Education</h2>
        <ul className="space-y-3 text-white/80 mb-8">
          <li>
            <Link href="/weather" className="hover:text-blue-400 transition-colors">Weather Outlook</Link>
            <span className="block text-xs text-white/50">Live local forecast with hourly, 10-day, and air quality data</span>
          </li>
          <li>
            <Link href="/weather-guide" className="hover:text-blue-400 transition-colors">Weather Guide</Link>
            <span className="block text-xs text-white/50">Complete guide to storms, cold-weather safety, and outdoor prep</span>
          </li>
          <li>
            <Link href="/weather-terms" className="hover:text-blue-400 transition-colors">Weather Glossary</Link>
            <span className="block text-xs text-white/50">A-Z definitions of weather and snow terms in plain English</span>
          </li>
          <li>
            <Link href="/blog" className="hover:text-blue-400 transition-colors">Blog &amp; Guides</Link>
            <span className="block text-xs text-white/50">Expert articles on school closures, prediction science, and regional analysis</span>
          </li>
        </ul>

        <h2 className="text-xs font-bold uppercase tracking-widest text-white/50 mb-3">About & Legal</h2>
        <ul className="space-y-3 text-white/80">
          <li>
            <Link href="/about" className="hover:text-blue-400 transition-colors">About Us</Link>
            <span className="block text-xs text-white/50">Methodology, data sources, and how the prediction engine works</span>
          </li>
          <li>
            <Link href="/team" className="hover:text-blue-400 transition-colors">Our Team</Link>
            <span className="block text-xs text-white/50">Meteorologists, data scientists, and engineers behind SnowSense™</span>
          </li>
          <li>
            <Link href="/contact" className="hover:text-blue-400 transition-colors">Contact</Link>
            <span className="block text-xs text-white/50">Support, feature requests, and partnership inquiries</span>
          </li>
          <li>
            <Link href="/legal/privacy" className="hover:text-blue-400 transition-colors">Privacy Policy</Link>
            <span className="block text-xs text-white/50">How we collect, process, and protect your data</span>
          </li>
          <li>
            <Link href="/legal/terms" className="hover:text-blue-400 transition-colors">Terms of Service</Link>
            <span className="block text-xs text-white/50">Usage policies and liability limitations</span>
          </li>
          <li>
            <Link href="/legal/editorial-guidelines" className="hover:text-blue-400 transition-colors">Editorial Guidelines</Link>
            <span className="block text-xs text-white/50">Our commitment to accuracy, objectivity, and transparent corrections</span>
          </li>
        </ul>
      </div>
    </main>
    </>
  );
}
