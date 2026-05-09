import type { Metadata } from "next";
import "./globals.css";
import { ClientNavbar } from "@/components/layout/ClientNavbar";
import { ClientFooter } from "@/components/layout/ClientFooter";
import { SystemUIProvider } from "@/components/providers/SystemUIProvider";


export const metadata: Metadata = {
  metadataBase: new URL("https://www.snowsense.app"),
  title: {
    default: "Snow Day Calculator | SnowSense™",
    template: "%s | SnowSense™",
  },
  description:
    "Will school be cancelled tomorrow? Check your real-time snow day probability with live weather data, ice risk, and regional analysis.",
  alternates: {
    canonical: "https://www.snowsense.app",
    languages: { "en": "https://www.snowsense.app" },
  },
  openGraph: {
    type: "website",
    url: "https://www.snowsense.app",
    title: "SnowSense™ — Snow Day Calculator",
    description: "Real-time snow day probability for your location. Updated every 30 minutes.",
    siteName: "SnowSense™",
    images: [
      {
        url: "/og-default.png",
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
    images: ["/og-default.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "SnowSense™",
  url: "https://www.snowsense.app",
  description:
    "Real-time snow day probability calculator for schools across the US. Powered by live weather data, ice risk analysis, and regional tolerance modeling.",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://www.snowsense.app/snow-day-calculator/{search_term_string}",
    },
    "query-input": "required name=search_term_string",
  },
};

const webAppSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "SnowSense™ Snow Day Calculator",
  url: "https://www.snowsense.app",
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
    url: "https://www.snowsense.app",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className="antialiased bg-[#050a14] text-white flex flex-col min-h-screen overflow-x-hidden"
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
          <ClientNavbar />
          <div className="flex-grow">{children}</div>
          <ClientFooter />
        </SystemUIProvider>
      </body>
    </html>
  );
}
