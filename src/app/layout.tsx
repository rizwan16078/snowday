import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BackToTop } from "@/components/layout/BackToTop";
import { SystemUIProvider } from "@/components/providers/SystemUIProvider";

// Self-hosted variable fonts via next/font. Automatically:
//  - Applies font-display: swap (prevents FOIT, fixes audit warning)
//  - Subsets to latin only (keeps payload small)
//  - Serves from same-origin (no external runtime preconnect needed)
//  - Exposes CSS variables for use in globals.css and Tailwind theme
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});


export const metadata: Metadata = {
  metadataBase: new URL("https://www.snowdaycalculate.com"),
  title: {
    default: "Snow Day Calculator | SnowSense™",
    template: "%s | SnowSense™",
  },
  description:
    "Will school be cancelled tomorrow? Check your real-time snow day probability with live weather data, ice risk, and regional analysis.",
  openGraph: {
    type: "website",
    title: "SnowSense™ — Snow Day Calculator",
    description: "Real-time snow day probability for your location. Updated every 30 minutes.",
    siteName: "SnowSense™",
    images: [
      {
        url: "/og-default.svg",
        width: 1200,
        height: 630,
        alt: "SnowSense™ — Real-Time Snow Day Calculator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SnowSense™ — Snow Day Calculator",
    description: "What's the chance school is cancelled tomorrow? Check now →",
    images: ["/og-default.svg"],
  },
  alternates: {
    types: {
      "application/rss+xml": "/feed.xml",
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  verification: {
    google: "3PvIcRMWQ1_8FpO11Tk6IZVbSSCwM6EIctAF-3WQDWc",
    yandex: "68fc3e33cc627447",
    other: {
      "msvalidate.01": "2B1BC6D0939A71E8F71442B1F50A9065",
    },
  },
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "SnowSense™",
  url: "https://www.snowdaycalculate.com",
  description:
    "Real-time snow day probability calculator for schools across the US. Powered by live weather data, ice risk analysis, and regional tolerance modeling.",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://www.snowdaycalculate.com/snow-day-calculator/{search_term_string}",
    },
    "query-input": "required name=search_term_string",
  },
};

const webAppSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "SnowSense™ Snow Day Calculator",
  url: "https://www.snowdaycalculate.com",
  applicationCategory: "WeatherApplication",
  operatingSystem: "Web Browser",
  browserRequirements: "Requires JavaScript",
  description:
    "Free snow day probability calculator. Enter your city to get a real-time prediction of whether school will be cancelled tomorrow, updated every 30 minutes.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  featureList: [
    "Real-time snow day probability",
    "Ice risk analysis",
    "Storm timing factor",
    "Regional tolerance calibration",
    "30-minute data refresh",
  ],
  author: {
    "@type": "Organization",
    name: "SnowSense™",
    url: "https://www.snowdaycalculate.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body
        className="antialiased bg-[#050a14] text-white flex flex-col min-h-screen overflow-x-hidden font-sans"
        data-offline="false"
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
        />
        <SystemUIProvider>
          <Navbar />
          <div className="flex-grow">{children}</div>
          <Footer />
          <BackToTop />
        </SystemUIProvider>
      </body>
    </html>
  );
}
