import { Metadata } from "next";
import Link from "next/link";
import { breadcrumbListSchema } from "@/lib/breadcrumb-schema";

export const metadata: Metadata = {
  title: "Sitemap",
  description: "Directory of all SnowSense™ pages.",
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
        <h1 className="text-4xl font-black font-display mb-8">Sitemap</h1>
        
        <ul className="space-y-4 text-white/80">
          <li>
            <Link href="/" className="hover:text-blue-400 transition-colors">Home</Link>
          </li>
          <li>
            <Link href="/snow-day-calculator" className="hover:text-blue-400 transition-colors">Snow Day Calculator (By City)</Link>
          </li>
          <li>
            <Link href="/about" className="hover:text-blue-400 transition-colors">About Us</Link>
          </li>
          <li>
            <Link href="/blog" className="hover:text-blue-400 transition-colors">Blog &amp; Guides</Link>
          </li>
          <li>
            <Link href="/contact" className="hover:text-blue-400 transition-colors">Contact</Link>
          </li>
          <li>
            <Link href="/legal/privacy" className="hover:text-blue-400 transition-colors">Privacy Policy</Link>
          </li>
          <li>
            <Link href="/legal/terms" className="hover:text-blue-400 transition-colors">Terms of Service</Link>
          </li>
          <li>
            <Link href="/legal/editorial-guidelines" className="hover:text-blue-400 transition-colors">Editorial Guidelines</Link>
          </li>
          <li>
            <Link href="/weather" className="hover:text-blue-400 transition-colors">Weather Outlook</Link>
          </li>
          <li>
            <Link href="/weather-guide" className="hover:text-blue-400 transition-colors">Weather Guide</Link>
          </li>
          <li>
            <Link href="/weather-terms" className="hover:text-blue-400 transition-colors">Weather Glossary</Link>
          </li>
          <li>
            <Link href="/team" className="hover:text-blue-400 transition-colors">Our Team</Link>
          </li>
        </ul>
      </div>
    </main>
    </>
  );
}
