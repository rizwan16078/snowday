"use client";

/**
 * global-error.tsx replaces the root layout when a top-level unhandled error occurs.
 * It MUST include <html> and <body> because it bypasses layout.tsx entirely.
 * Keep this component minimal — no context providers, no framer-motion — so it
 * prerenders cleanly during `next build`.
 */
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          background: "#050a14",
          color: "#fff",
          fontFamily: "system-ui, -apple-system, sans-serif",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <p
            style={{
              fontSize: "0.7rem",
              fontWeight: 700,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.35)",
              marginBottom: "1rem",
            }}
          >
            SnowSense™
          </p>
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: 800,
              marginBottom: "0.5rem",
            }}
          >
            Something went wrong
          </h1>
          <p
            style={{
              fontSize: "0.9rem",
              color: "rgba(255,255,255,0.5)",
              marginBottom: "1.5rem",
            }}
          >
            An unexpected error occurred. Please try again.
          </p>
          <button
            onClick={() => reset()}
            style={{
              padding: "0.6rem 1.5rem",
              background: "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: "9999px",
              cursor: "pointer",
              fontSize: "0.875rem",
              fontWeight: 600,
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
