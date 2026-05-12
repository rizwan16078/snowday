"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

// ── Social icons (inline SVG — no extra deps) ──────────────────────────────

const IconTwitterX = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L2.25 2.25h6.988l4.26 5.63 4.746-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
  </svg>
);

const IconInstagram = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
  </svg>
);

const IconYouTube = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
    <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const IconTikTok = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.17 8.17 0 004.79 1.54V6.78a4.85 4.85 0 01-1.02-.09z" />
  </svg>
);

const IconPinterest = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
    <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
  </svg>
);

const IconLinkedIn = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const IconFacebook = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const IconMail = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
  </svg>
);

// ── Social links config — swap handles when real accounts exist ────────────

const SOCIAL_LINKS = [
  { label: "Twitter / X",  href: "https://twitter.com/snowdaycalculate",            Icon: IconTwitterX  },
  { label: "Instagram",    href: "https://instagram.com/snowdaycalculate",          Icon: IconInstagram },
  { label: "YouTube",      href: "https://youtube.com/@snowdaycalculate",           Icon: IconYouTube   },
  { label: "TikTok",       href: "https://tiktok.com/@snowdaycalculate",            Icon: IconTikTok    },
  { label: "Pinterest",    href: "https://pinterest.com/snowdaycalculate",          Icon: IconPinterest },
  { label: "Facebook",     href: "https://facebook.com/snowdaycalculate",           Icon: IconFacebook  },
  { label: "LinkedIn",     href: "https://linkedin.com/company/snowdaycalculate",  Icon: IconLinkedIn  },
];

const CONTACT_EMAIL = "hello@snowdaycalculate.com";

// ────────────────────────────────────────────────────────────────────────────

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const pathname = usePathname();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setTimeout(() => setSubscribed(false), 3000);
    setEmail("");
  };

  return (
    <footer className="w-full relative z-10 border-t border-white/[0.04] bg-[#050a14] pt-16 pb-8 text-white">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 sm:gap-8 mb-16">

        {/* Col 1: Brand, tagline, social icons */}
        <div className="col-span-1 flex flex-col items-start space-y-6">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="rounded-xl bg-gradient-to-br from-blue-600 to-blue-400 p-2 shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-transform group-hover:scale-105">
              <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L9.09 8.26L2 9.27L7 14.14L5.82 21.02L12 17.77L18.18 21.02L17 14.14L22 9.27L14.91 8.26L12 2Z" />
              </svg>
            </div>
            <span className="font-display text-xl font-black italic tracking-wide text-white">
              SnowSense™
            </span>
          </Link>

          <p className="text-sm text-zinc-500 font-medium leading-relaxed max-w-[240px]">
            The most accurate snow day prediction engine, powered by real-time weather data.
          </p>

          {/* Contact email */}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="flex items-center gap-2 text-xs text-zinc-500 hover:text-blue-400 transition-colors"
          >
            <IconMail />
            <span>{CONTACT_EMAIL}</span>
          </a>

          {/* Social icons */}
          <div className="flex items-center flex-wrap gap-3">
            {SOCIAL_LINKS.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="text-zinc-500 hover:text-white transition-colors duration-200"
              >
                <Icon />
              </a>
            ))}
          </div>
        </div>

        {/* Col 2: Predictions */}
        <div className="col-span-1 flex flex-col space-y-5">
          <h4 className="font-display font-bold uppercase tracking-widest text-zinc-300 text-sm">
            Predictions
          </h4>
          <nav className="flex flex-col space-y-3">
            <Link href="/snow-day-calculator/new-york-ny"  className="text-sm text-zinc-400 hover:text-white transition-colors duration-200">New York, NY</Link>
            <Link href="/snow-day-calculator/boston-ma"    className="text-sm text-zinc-400 hover:text-white transition-colors duration-200">Boston, MA</Link>
            <Link href="/snow-day-calculator/chicago-il"   className="text-sm text-zinc-400 hover:text-white transition-colors duration-200">Chicago, IL</Link>
            <Link href="/snow-day-calculator/denver-co"    className="text-sm text-zinc-400 hover:text-white transition-colors duration-200">Denver, CO</Link>
            <Link href="/snow-day-calculator"              className="text-sm font-bold text-blue-400 hover:text-white transition-colors duration-200">All Cities →</Link>
          </nav>
        </div>

        {/* Col 3: Resources */}
        <div className="col-span-1 flex flex-col space-y-5">
          <h4 className="font-display font-bold uppercase tracking-widest text-zinc-300 text-sm">
            Resources
          </h4>
          <nav className="flex flex-col space-y-3">
            <Link href="/blog"           className="text-sm text-zinc-400 hover:text-white transition-colors duration-200">Blog &amp; Guides</Link>
            <Link href="/#how-it-works"  className="text-sm text-zinc-400 hover:text-white transition-colors duration-200">How it Works</Link>
            <Link href="/about"          className="text-sm text-zinc-400 hover:text-white transition-colors duration-200">About Us</Link>
            <Link href="/contact"        className="text-sm text-zinc-400 hover:text-white transition-colors duration-200">Contact</Link>
            <Link href="/sitemap"        className="text-sm text-zinc-400 hover:text-white transition-colors duration-200">Sitemap</Link>
            <Link href="/legal/privacy"  className="text-sm text-zinc-400 hover:text-white transition-colors duration-200">Privacy Policy</Link>
            <a    href="/feed.xml"        className="text-sm text-zinc-400 hover:text-white transition-colors duration-200 flex items-center gap-1">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5 text-orange-400">
                <path d="M6.18 15.64a2.18 2.18 0 012.18 2.18C8.36 19.01 7.38 20 6.18 20C4.98 20 4 19.01 4 17.82a2.18 2.18 0 012.18-2.18M4 4.44A15.56 15.56 0 0119.56 20h-2.83A12.73 12.73 0 004 7.27V4.44m0 5.66a9.9 9.9 0 019.9 9.9h-2.83A7.07 7.07 0 004 12.93V10.1z" />
              </svg>
              RSS Feed
            </a>
          </nav>
        </div>

        {/* Col 4: Newsletter */}
        <div className="col-span-1 flex flex-col space-y-5">
          <h4 className="font-display font-bold uppercase tracking-widest text-zinc-300 text-sm">
            Snow Alerts
          </h4>
          <p className="text-xs text-zinc-500 font-medium">Get notified when a snow storm is approaching your area.</p>
          <form onSubmit={handleSubscribe} className="relative flex items-center">
            <div className="absolute left-3 text-zinc-500">
              <IconMail />
            </div>
            <input
              type="email"
              placeholder="Enter your email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-10 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
            />
            <button
              type="submit"
              className="absolute right-2 p-1 text-zinc-400 hover:text-blue-400 transition-colors disabled:opacity-50"
              disabled={subscribed}
            >
              {subscribed ? (
                <span className="text-xs text-green-400 font-bold">✓</span>
              ) : (
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              )}
            </button>
          </form>
        </div>

      </div>

      {/* Bottom Row */}
      <div className="border-t border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-6">

          <div className="flex flex-col items-center sm:items-start gap-1">
            <p className="text-xs text-zinc-600">
              © {new Date().getFullYear()} SnowSense™. All rights reserved.
            </p>
            <p className="text-[10px] text-zinc-700 uppercase tracking-widest font-medium">
              Powered by Advanced Meteorology
            </p>
          </div>

          <div className="flex items-center gap-6 flex-wrap justify-center">
            {/* Legal links */}
            <div className="flex items-center gap-x-6 text-xs text-zinc-500">
              <Link href="/legal/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="/legal/terms"   className="hover:text-white transition-colors">Terms</Link>
            </div>

            {/* DMCA Badge */}
            <a
              href="https://www.dmca.com/Protection/Status.aspx?ID=placeholder"
              target="_blank"
              rel="noopener noreferrer"
              title="DMCA Protected"
              className="flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-zinc-500 hover:text-white hover:border-white/20 transition-all"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3 text-blue-400">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
              </svg>
              DMCA Protected
            </a>
          </div>

        </div>
      </div>
    </footer>
  );
}
