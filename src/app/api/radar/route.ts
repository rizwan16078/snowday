import { NextRequest } from "next/server";

export const runtime = "edge";
export const revalidate = 300;

function buildLayer(seed: number, hue: number, alpha: number): string {
  const x = 18 + ((seed * 19) % 64);
  const y = 20 + ((seed * 13) % 54);
  const rx = 16 + ((seed * 7) % 18);
  const ry = 10 + ((seed * 5) % 16);

  return `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="hsla(${hue}, 84%, 56%, ${alpha})" />`;
}

export async function GET(request: NextRequest) {
  const lat = Number.parseFloat(request.nextUrl.searchParams.get("lat") || "34.33");
  const lon = Number.parseFloat(request.nextUrl.searchParams.get("lon") || "73.20");
  const bucket = Math.floor(Date.now() / 300_000);
  const seed = Math.round(Math.abs(lat * 100) + Math.abs(lon * 100) + bucket);

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 70" role="img" aria-label="Cached radar tile">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#06101f" />
          <stop offset="100%" stop-color="#0d1b2e" />
        </linearGradient>
      </defs>
      <rect width="100" height="70" fill="url(#bg)" rx="6" />
      <g opacity="0.18">
        <path d="M0 14 H100 M0 28 H100 M0 42 H100 M0 56 H100" stroke="#dbeafe" stroke-width="0.25" />
        <path d="M20 0 V70 M40 0 V70 M60 0 V70 M80 0 V70" stroke="#dbeafe" stroke-width="0.25" />
      </g>
      <g filter="url(#none)">
        ${buildLayer(seed + 1, 135, 0.24)}
        ${buildLayer(seed + 2, 198, 0.22)}
        ${buildLayer(seed + 3, 268, 0.18)}
        ${buildLayer(seed + 4, 135, 0.16)}
      </g>
      <circle cx="50" cy="35" r="22" fill="none" stroke="rgba(147,197,253,0.16)" stroke-width="0.4" />
      <circle cx="50" cy="35" r="12" fill="none" stroke="rgba(147,197,253,0.14)" stroke-width="0.4" />
      <path d="M50 35 L79 17" stroke="rgba(74,222,128,0.6)" stroke-width="0.9" />
      <circle cx="50" cy="35" r="1.4" fill="#e0f2fe" />
      <text x="6" y="10" fill="rgba(220,235,255,0.58)" font-size="4" font-family="system-ui, sans-serif">EDGE RADAR TILE</text>
      <text x="64" y="65" fill="rgba(220,235,255,0.32)" font-size="3.6" font-family="system-ui, sans-serif">SWR 300</text>
    </svg>
  `.trim();

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=300",
    },
  });
}
