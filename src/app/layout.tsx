import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SystemUIProvider } from "@/components/providers/SystemUIProvider";


export const metadata: Metadata = {
  metadataBase: new URL("https://www.snowsense.app"),
  title: {
    default: "Snow Day Calculator | SnowSense™ — Real-Time Predictions",
    template: "%s | SnowSense™ Snow Day Calculator",
  },
  description:
    "Will school be cancelled tomorrow? SnowSense™ gives you real-time snow day probability using live weather data, ice risk, and regional tolerance. Updated every 30 minutes.",
  keywords: [
    "snow day calculator",
    "snow day predictor",
    "will school be cancelled",
    "school closure prediction",
    "snow day probability",
    "winter storm school",
    "snowfall calculator",
  ],
  openGraph: {
    type: "website",
    title: "SnowSense™ — Snow Day Calculator",
    description: "Real-time snow day probability for your location. Updated every 30 minutes.",
    siteName: "SnowSense",
  },
  twitter: {
    card: "summary_large_image",
    title: "SnowSense™ — Snow Day Calculator",
    description: "What's the chance school is cancelled tomorrow? Check now →",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        {/* Google Fonts — non-blocking, fails gracefully in restricted networks */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Outfit:wght@400;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="antialiased bg-[#050a14] text-white flex flex-col min-h-screen overflow-x-hidden"
        data-offline="false"
      >
        <SystemUIProvider>
          <Navbar />
          <div className="flex-grow">{children}</div>
          <Footer />
        </SystemUIProvider>
      </body>
    </html>
  );
}
