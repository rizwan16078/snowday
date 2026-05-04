import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center text-center px-4">
      <div className="max-w-md">
        <div className="text-6xl mb-4">🌨️</div>
        <h1 className="text-3xl font-black text-white mb-3">Page Not Found</h1>
        <p className="text-white/50 text-sm mb-8">
          Looks like this page got lost in a snowstorm.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl font-bold text-sm text-white"
          style={{
            background: "linear-gradient(135deg,#1d4ed8,#3b82f6)",
            boxShadow: "0 4px 20px rgba(59,130,246,0.3)",
          }}
        >
          ← Back to Snow Day Calculator
        </Link>
      </div>
    </main>
  );
}
