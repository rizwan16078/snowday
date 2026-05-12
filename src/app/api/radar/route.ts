import { NextRequest } from "next/server";

export const runtime = "edge";
export const revalidate = 300;

// Center of the radar canvas (200×140 viewBox)
const CX = 100;
const CY = 70;

// Doppler-style intensity gradients — low → extreme
const CELL_GRADS = ["cellLow", "cellLow", "cellMid", "cellMid", "cellHigh", "cellExtreme"];

/**
 * Generate 6 storm cells positioned by seed in a ring around the radar center.
 * Each cell is a soft-edged ellipse using one of four intensity gradients
 * (cyan → amber → red → magenta), rotated and sized for organic variety.
 */
function buildCells(seed: number): string {
  const cells: string[] = [];
  for (let i = 0; i < 6; i++) {
    const s = seed + i * 17 + 1;
    const angleDeg = (s * 37) % 360;
    const angle = (angleDeg * Math.PI) / 180;
    const dist = 10 + ((s * 11) % 36);
    const cx = CX + dist * Math.cos(angle);
    const cy = CY + dist * Math.sin(angle) * 0.7; // squash for aspect
    const rx = 6 + ((s * 7) % 14);
    const ry = 4 + ((s * 5) % 9);
    const rot = (s * 31) % 180;
    const grad = CELL_GRADS[i];
    cells.push(
      `<ellipse cx="${cx.toFixed(2)}" cy="${cy.toFixed(2)}" rx="${rx}" ry="${ry}" fill="url(#${grad})" transform="rotate(${rot} ${cx.toFixed(2)} ${cy.toFixed(2)})"/>`
    );
  }
  return cells.join("");
}

/**
 * 12 bearing tick marks every 30° on the outer ring (skipping the four cardinals
 * which get explicit letters).
 */
function buildBearingTicks(): string {
  const ticks: string[] = [];
  for (let deg = 0; deg < 360; deg += 30) {
    if (deg % 90 === 0) continue;
    const rad = ((deg - 90) * Math.PI) / 180;
    const x1 = CX + 58 * Math.cos(rad);
    const y1 = CY + 58 * Math.sin(rad);
    const x2 = CX + 62 * Math.cos(rad);
    const y2 = CY + 62 * Math.sin(rad);
    ticks.push(`<line x1="${x1.toFixed(2)}" y1="${y1.toFixed(2)}" x2="${x2.toFixed(2)}" y2="${y2.toFixed(2)}"/>`);
  }
  return ticks.join("");
}

/**
 * Format a coordinate for display in the telemetry footer (e.g., 34.33° → "34.33°N").
 */
function formatLat(lat: number): string {
  return `${Math.abs(lat).toFixed(2)}°${lat >= 0 ? "N" : "S"}`;
}
function formatLon(lon: number): string {
  return `${Math.abs(lon).toFixed(2)}°${lon >= 0 ? "E" : "W"}`;
}

export async function GET(request: NextRequest) {
  const lat = Number.parseFloat(request.nextUrl.searchParams.get("lat") || "34.33");
  const lon = Number.parseFloat(request.nextUrl.searchParams.get("lon") || "73.20");
  const bucket = Math.floor(Date.now() / 300_000);
  const seed = Math.round(Math.abs(lat * 100) + Math.abs(lon * 100) + bucket);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 140" role="img" aria-label="Live doppler radar tile">
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="75%">
      <stop offset="0%" stop-color="#0f1d33"/>
      <stop offset="55%" stop-color="#07111f"/>
      <stop offset="100%" stop-color="#020714"/>
    </radialGradient>
    <radialGradient id="centerGlow" cx="50%" cy="50%" r="35%">
      <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="#3b82f6" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="cellLow">
      <stop offset="0%" stop-color="#22d3ee" stop-opacity="0.72"/>
      <stop offset="55%" stop-color="#0ea5e9" stop-opacity="0.32"/>
      <stop offset="100%" stop-color="#0ea5e9" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="cellMid">
      <stop offset="0%" stop-color="#facc15" stop-opacity="0.7"/>
      <stop offset="55%" stop-color="#f59e0b" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="#f59e0b" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="cellHigh">
      <stop offset="0%" stop-color="#fb7185" stop-opacity="0.78"/>
      <stop offset="45%" stop-color="#ef4444" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="#ef4444" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="cellExtreme">
      <stop offset="0%" stop-color="#f0abfc" stop-opacity="0.78"/>
      <stop offset="45%" stop-color="#c026d3" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#c026d3" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="sweepGrad" x1="0%" y1="50%" x2="100%" y2="50%">
      <stop offset="0%" stop-color="#4ade80" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#4ade80" stop-opacity="0"/>
    </linearGradient>
    <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="0.7"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="200" height="140" fill="url(#bg)" rx="6"/>
  <rect width="200" height="140" fill="url(#centerGlow)" rx="6"/>

  <!-- Tactical grid overlay -->
  <g opacity="0.10" stroke="#93c5fd" stroke-width="0.22" stroke-dasharray="0.7 1.3">
    <path d="M0 28 H200 M0 56 H200 M0 84 H200 M0 112 H200"/>
    <path d="M40 0 V140 M80 0 V140 M120 0 V140 M160 0 V140"/>
  </g>

  <!-- Range rings (concentric, dashed) -->
  <g fill="none" stroke="rgba(147,197,253,0.28)" stroke-width="0.3">
    <circle cx="${CX}" cy="${CY}" r="15" stroke-dasharray="0.6 1.0"/>
    <circle cx="${CX}" cy="${CY}" r="30" stroke-dasharray="0.8 1.2"/>
    <circle cx="${CX}" cy="${CY}" r="45" stroke-dasharray="1.0 1.4"/>
    <circle cx="${CX}" cy="${CY}" r="60" stroke-dasharray="1.2 1.6"/>
  </g>

  <!-- Range labels (vertical axis) -->
  <g fill="rgba(220,235,255,0.32)" font-family="ui-monospace, monospace" font-size="2.4" font-weight="600">
    <text x="${CX}" y="56.4" text-anchor="middle">50</text>
    <text x="${CX}" y="41.4" text-anchor="middle">100</text>
    <text x="${CX}" y="26.4" text-anchor="middle">150</text>
    <text x="${CX}" y="11.4" text-anchor="middle">200KM</text>
  </g>

  <!-- Cardinal cross + bearing ticks -->
  <g stroke="rgba(147,197,253,0.24)" stroke-width="0.3">
    <line x1="40" y1="${CY}" x2="160" y2="${CY}"/>
    <line x1="${CX}" y1="10" x2="${CX}" y2="130"/>
  </g>
  <g stroke="rgba(147,197,253,0.40)" stroke-width="0.42">
    ${buildBearingTicks()}
  </g>

  <!-- Cardinal letters -->
  <g fill="rgba(220,235,255,0.55)" font-family="ui-monospace, monospace" font-size="3.6" font-weight="700">
    <text x="${CX}" y="8" text-anchor="middle">N</text>
    <text x="${CX}" y="135" text-anchor="middle">S</text>
    <text x="164" y="71.5" text-anchor="start">E</text>
    <text x="36" y="71.5" text-anchor="end">W</text>
  </g>

  <!-- Storm cells (doppler intensity) -->
  <g filter="url(#soft)">
    ${buildCells(seed)}
  </g>

  <!-- Sweep trail wedge (rotates with SMIL) -->
  <g>
    <path d="M ${CX} ${CY} L ${CX + 60} ${CY} A 60 60 0 0 0 ${(CX + 60 * Math.cos(-Math.PI / 3)).toFixed(2)} ${(CY + 60 * Math.sin(-Math.PI / 3)).toFixed(2)} Z" fill="url(#sweepGrad)" opacity="0.85">
      <animateTransform attributeName="transform" type="rotate" from="0 ${CX} ${CY}" to="360 ${CX} ${CY}" dur="6s" repeatCount="indefinite"/>
    </path>
  </g>

  <!-- Sweep ray -->
  <g>
    <line x1="${CX}" y1="${CY}" x2="${CX + 60}" y2="${CY}" stroke="#4ade80" stroke-width="0.85" stroke-linecap="round" opacity="0.9">
      <animateTransform attributeName="transform" type="rotate" from="0 ${CX} ${CY}" to="360 ${CX} ${CY}" dur="6s" repeatCount="indefinite"/>
    </line>
    <circle cx="${CX + 60}" cy="${CY}" r="0.9" fill="#86efac">
      <animateTransform attributeName="transform" type="rotate" from="0 ${CX} ${CY}" to="360 ${CX} ${CY}" dur="6s" repeatCount="indefinite"/>
    </circle>
  </g>

  <!-- Center target marker (pulsing) -->
  <g>
    <circle cx="${CX}" cy="${CY}" r="2.2" fill="none" stroke="#bae6fd" stroke-width="0.45"/>
    <circle cx="${CX}" cy="${CY}" r="0.9" fill="#e0f2fe"/>
    <circle cx="${CX}" cy="${CY}" r="3" fill="none" stroke="#4ade80" stroke-width="0.4" opacity="0.9">
      <animate attributeName="r" values="2.5;7;2.5" dur="2.4s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.85;0;0.85" dur="2.4s" repeatCount="indefinite"/>
    </circle>
  </g>

  <!-- Tactical corner brackets -->
  <g stroke="rgba(74,222,128,0.55)" stroke-width="0.6" fill="none" stroke-linecap="round">
    <path d="M 4 9 L 4 4 L 9 4"/>
    <path d="M 191 4 L 196 4 L 196 9"/>
    <path d="M 4 131 L 4 136 L 9 136"/>
    <path d="M 191 136 L 196 136 L 196 131"/>
  </g>

  <!-- Telemetry text -->
  <g fill="rgba(220,235,255,0.7)" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="3.1" font-weight="700">
    <text x="11" y="8.5">⬢ DOPPLER · LIVE</text>
    <text x="189" y="8.5" text-anchor="end" fill="rgba(34,211,238,0.85)">FRQ 5.6GHz</text>
    <text x="11" y="135">${formatLat(lat)} · ${formatLon(lon)}</text>
    <text x="189" y="135" text-anchor="end" fill="rgba(74,222,128,0.7)">RNG 200KM</text>
  </g>
</svg>`;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=300",
    },
  });
}
