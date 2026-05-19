import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center text-center px-4">
      <div className="max-w-md">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30 mb-4">
          SnowSense™
        </p>
        <h1 className="text-7xl font-display font-black text-white/90 mb-2">404</h1>
        <p className="text-lg font-semibold text-white/60 mb-2">
          This page melted away
        </p>
        <p className="text-sm text-white/40 mb-8">
          The page you&apos;re looking for doesn&apos;t exist. It may have been moved or the URL might be mistyped.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-500 transition-colors text-sm"
          >
            Back to Home
          </Link>
          <Link
            href="/snow-day-calculator"
            className="px-6 py-2.5 border border-white/10 text-white/60 font-semibold rounded-full hover:bg-white/5 hover:text-white transition-colors text-sm"
          >
            Find Your City
          </Link>
        </div>
      </div>
    </main>
  );
}
