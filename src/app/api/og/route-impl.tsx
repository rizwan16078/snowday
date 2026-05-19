import { ImageResponse } from "next/og";

export const runtime = "edge";

function statusFor(p: number, override?: string | null) {
  if (override) return override;
  if (p >= 66) return "Very Likely";
  if (p >= 36) return "Possible";
  return "Unlikely";
}

function colorFor(p: number): string {
  if (p >= 66) return "#22c55e";
  if (p >= 36) return "#f59e0b";
  return "#ef4444";
}

function emojiFor(p: number): string {
  if (p >= 66) return "☃️";
  if (p >= 36) return "🌨️";
  return "❄️";
}

function messageFor(status: string): string {
  if (status === "Very Likely") return "Snow day conditions are lining up for tomorrow.";
  if (status === "Possible") return "Tomorrow is in the watch zone for a closure call.";
  return "A closure looks less likely, but conditions can still shift overnight.";
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
  const message = messageFor(status);
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
        <div
          style={{
            position: "absolute",
            top: -120,
            right: -120,
            width: 460,
            height: 460,
            borderRadius: 9999,
            background:
              "radial-gradient(circle, rgba(59,130,246,0.35) 0%, rgba(59,130,246,0) 70%)",
            display: "flex",
          }}
        />

        <div
          style={{
            position: "absolute",
            bottom: -180,
            left: -140,
            width: 520,
            height: 520,
            borderRadius: 9999,
            background: `radial-gradient(circle, ${color}18 0%, rgba(0,0,0,0) 72%)`,
            display: "flex",
          }}
        />

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
              alignItems: "center",
              gap: 12,
              padding: "14px 20px",
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.05)",
              color: "rgba(255,255,255,0.7)",
              fontSize: 18,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: 2,
            }}
          >
            Tomorrow&apos;s Forecast
          </div>
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            zIndex: 2,
            marginTop: 28,
            gap: 44,
          }}
        >
          {showProbability ? (
            <>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  width: 610,
                  gap: 18,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    color: "rgba(255,255,255,0.52)",
                    fontSize: 18,
                    fontWeight: 700,
                    letterSpacing: 2,
                    textTransform: "uppercase",
                  }}
                >
                  Live Snow Day Outlook
                </div>
                <div
                  style={{
                    display: "flex",
                    color: "white",
                    fontSize: 74,
                    fontWeight: 900,
                    lineHeight: 1.02,
                    letterSpacing: -2,
                  }}
                >
                  {loc}
                </div>
                <div
                  style={{
                    display: "flex",
                    color: "rgba(255,255,255,0.62)",
                    fontSize: 26,
                    lineHeight: 1.35,
                    maxWidth: 560,
                  }}
                >
                  {message}
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    marginTop: 6,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      padding: "10px 18px",
                      borderRadius: 999,
                      background: "rgba(255,255,255,0.07)",
                      border: "1px solid rgba(255,255,255,0.10)",
                      color: "rgba(255,255,255,0.82)",
                      fontSize: 18,
                      fontWeight: 700,
                    }}
                  >
                    Updated live
                  </div>
                  <div
                    style={{
                      display: "flex",
                      padding: "10px 18px",
                      borderRadius: 999,
                      background: `${color}20`,
                      border: `1px solid ${color}44`,
                      color,
                      fontSize: 18,
                      fontWeight: 800,
                    }}
                  >
                    {emoji} {status}
                  </div>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  width: 300,
                  height: 300,
                  borderRadius: 36,
                  border: `1px solid ${color}44`,
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 35%, transparent 100%)",
                  boxShadow: `inset 0 1px 0 rgba(255,255,255,0.08), 0 24px 120px ${color}22`,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    color: "rgba(255,255,255,0.48)",
                    fontSize: 16,
                    fontWeight: 700,
                    letterSpacing: 2,
                    textTransform: "uppercase",
                    marginBottom: 18,
                  }}
                >
                  Probability
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    color,
                    fontWeight: 900,
                    fontSize: 150,
                    lineHeight: 0.9,
                    letterSpacing: -8,
                    textShadow: `0 0 90px ${color}50`,
                  }}
                >
                  {p}
                  <span style={{ fontSize: 64, marginLeft: 6, marginTop: 10 }}>%</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    marginTop: 20,
                    color,
                    fontSize: 24,
                    fontWeight: 800,
                    letterSpacing: 3,
                    textTransform: "uppercase",
                  }}
                >
                  {status}
                </div>
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

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
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
              fontSize: 26,
              fontWeight: 700,
              letterSpacing: -0.5,
            }}
          >
            <span style={{ fontSize: 32 }}>📍</span>
            <span>{showProbability ? "Real-time forecast card" : loc}</span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              color: "rgba(255,255,255,0.55)",
              fontSize: 20,
              fontWeight: 700,
            }}
          >
            <span>snowdaycalculate.com</span>
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
