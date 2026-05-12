import { ImageResponse } from "next/og";

/**
 * Dynamic Open Graph card generator.
 *
 * Accepts query params:
 *   loc — display string for the location (e.g., "Boston, MA")
 *   p   — probability (0–100)
 *   s   — status label ("Unlikely" | "Possible" | "Very Likely")
 *   d   — optional details string (e.g., "Snow Day Coming")
 *
 * Returns a 1200×630 PNG (the OG / Twitter card standard size).
 * Edge-runtime, cached for 5 minutes at the CDN.
 */

export const runtime = "edge";

function statusFor(p: number, override?: string | null) {
  if (override) return override;
  if (p >= 66) return "Very Likely";
  if (p >= 36) return "Possible";
  return "Unlikely";
}

function colorFor(p: number): string {
  if (p >= 66) return "#22c55e"; // green
  if (p >= 36) return "#f59e0b"; // amber
  return "#ef4444"; // red
}

function emojiFor(p: number): string {
  if (p >= 66) return "☃️";
  if (p >= 36) return "🌨️";
  return "❄️";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const loc = (searchParams.get("loc") ?? "Your Location").slice(0, 60);
  const pRaw = Number.parseInt(searchParams.get("p") ?? "", 10);
  const p = Number.isFinite(pRaw) ? Math.max(0, Math.min(100, pRaw)) : -1;
  const sParam = searchParams.get("s");
  const status = statusFor(p >= 0 ? p : 0, sParam);
  const color = p >= 0 ? colorFor(p) : "#60a5fa";
  const emoji = p >= 0 ? emojiFor(p) : "❄️";

  // Untyped to keep `next/og`'s style restrictions happy (it accepts only a subset of CSS).
  const showProbability = p >= 0;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: 72,
          background:
            "linear-gradient(135deg, #050a14 0%, #0a1530 45%, #0e2a5c 100%)",
          color: "white",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, Segoe UI, Inter, sans-serif",
          position: "relative",
        }}
      >
        {/* Soft brand glow in top-right corner */}
        <div
          style={{
            position: "absolute",
            top: -120,
            right: -120,
            width: 460,
            height: 460,
            borderRadius: 9999,
            background: "radial-gradient(circle, rgba(59,130,246,0.35) 0%, rgba(59,130,246,0) 70%)",
            display: "flex",
          }}
        />

        {/* Soft status glow behind the percentage */}
        {showProbability && (
          <div
            style={{
              position: "absolute",
              top: 180,
              left: 0,
              right: 0,
              height: 320,
              background: `radial-gradient(ellipse at center, ${color}33 0%, transparent 65%)`,
              display: "flex",
            }}
          />
        )}

        {/* Top row: brand left, domain right */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            zIndex: 2,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              fontSize: 30,
              fontWeight: 800,
              color: "white",
              letterSpacing: -0.5,
            }}
          >
            <span style={{ fontSize: 42 }}>❄</span>
            <span>SnowSense™</span>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 22,
              fontWeight: 600,
              color: "rgba(255,255,255,0.45)",
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            }}
          >
            snowdaycalculate.com
          </div>
        </div>

        {/* Center stack: probability + status + location */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2,
            marginTop: 12,
          }}
        >
          {showProbability ? (
            <>
              <div
                style={{
                  display: "flex",
                  fontSize: 30,
                  color: "rgba(255,255,255,0.55)",
                  fontWeight: 600,
                  letterSpacing: 6,
                  textTransform: "uppercase",
                  marginBottom: 8,
                }}
              >
                Snow Day Probability
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  color,
                  fontWeight: 900,
                  fontSize: 260,
                  lineHeight: 1,
                  letterSpacing: -10,
                  textShadow: `0 0 100px ${color}55`,
                }}
              >
                {p}
                <span style={{ fontSize: 130, marginLeft: 8 }}>%</span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  marginTop: 24,
                  padding: "16px 32px",
                  borderRadius: 999,
                  background: `${color}1f`,
                  border: `2px solid ${color}66`,
                  color,
                  fontSize: 32,
                  fontWeight: 800,
                  letterSpacing: 5,
                  textTransform: "uppercase",
                }}
              >
                <span style={{ fontSize: 36 }}>{emoji}</span>
                <span>{status}</span>
              </div>
            </>
          ) : (
            <>
              <div
                style={{
                  display: "flex",
                  color: "white",
                  fontSize: 92,
                  fontWeight: 900,
                  letterSpacing: -3,
                  textAlign: "center",
                  lineHeight: 1.05,
                }}
              >
                Will School Be
              </div>
              <div
                style={{
                  display: "flex",
                  color,
                  fontSize: 92,
                  fontWeight: 900,
                  letterSpacing: -3,
                  textAlign: "center",
                  lineHeight: 1.05,
                }}
              >
                Cancelled Tomorrow?
              </div>
              <div
                style={{
                  display: "flex",
                  marginTop: 28,
                  fontSize: 28,
                  color: "rgba(255,255,255,0.6)",
                  fontWeight: 500,
                }}
              >
                Real-time snow day prediction
              </div>
            </>
          )}
        </div>

        {/* Bottom row: location pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "14px 28px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.14)",
              color: "white",
              fontSize: 32,
              fontWeight: 700,
              letterSpacing: -0.5,
            }}
          >
            <span style={{ fontSize: 32 }}>📍</span>
            <span>{loc}</span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=86400",
      },
    }
  );
}
