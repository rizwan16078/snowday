#!/usr/bin/env node
/**
 * scripts/ingest-storm-events.mjs
 *
 * One-shot ingestion of NOAA NWS Storm Events Database (winter events only)
 * joined against our city catalog. Outputs `src/data/storm-events.json` which
 * is then read at build time by `@/lib/storm-events`.
 *
 * Usage:
 *   node scripts/ingest-storm-events.mjs              # last 2 years
 *   node scripts/ingest-storm-events.mjs --years 3    # last 3 years
 *
 * What it does:
 *   1. Fetches the NCEI directory listing for the current + last N years.
 *   2. Downloads the latest `StormEvents_details-*.csv.gz` per year.
 *   3. Decompresses and parses CSVs streaming-style.
 *   4. Keeps only winter event types (snow, ice, blizzard, cold).
 *   5. Joins each event to the nearest city in our catalog using BEGIN_LAT/LON.
 *   6. Writes the top-N most-recent events per city to JSON.
 *
 * No third-party dependencies — uses Node 22 std-lib only.
 */

import { createWriteStream, existsSync, mkdirSync, readFileSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { createGunzip } from "node:zlib";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// ─── Config ──────────────────────────────────────────────────────────────────

const NCEI_DIR_URL =
  "https://www.ncei.noaa.gov/pub/data/swdi/stormevents/csvfiles/";

// Winter-relevant NWS event types (must match values in EVENT_TYPE column).
const WINTER_EVENT_TYPES = new Set([
  "Winter Storm",
  "Winter Weather",
  "Heavy Snow",
  "Blizzard",
  "Ice Storm",
  "Sleet",
  "Lake-Effect Snow",
  "Cold/Wind Chill",
  "Extreme Cold/Wind Chill",
  "Frost/Freeze",
]);

// How many events to keep per city in the output file. Bigger = better content
// but quickly bloats the bundle. 6 is a good trade-off.
const MAX_EVENTS_PER_CITY = 6;

// Max distance from event to nearest catalog city (km). Beyond this we drop
// the event — it's not local enough to be meaningful on a city page.
const MAX_JOIN_DISTANCE_KM = 80;

// ─── Args ────────────────────────────────────────────────────────────────────

function parseArgs(argv) {
  const out = { years: 2 };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === "--years" && argv[i + 1]) {
      out.years = parseInt(argv[i + 1], 10) || 2;
      i++;
    }
  }
  return out;
}

const args = parseArgs(process.argv);

// ─── Paths ───────────────────────────────────────────────────────────────────

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const OUTPUT_PATH = resolve(ROOT, "src/data/storm-events.json");
const CACHE_DIR = resolve(ROOT, ".cache/storm-events");
const CITIES_CATALOG = resolve(ROOT, "src/lib/cities/catalog.ts");

if (!existsSync(CACHE_DIR)) {
  mkdirSync(CACHE_DIR, { recursive: true });
}

// ─── Step 1: Load city catalog (parse TS tuple list) ─────────────────────────

/** Parsed shape: { slug, name, state, lat, lon } */
function loadCityCatalog() {
  const src = readFileSync(CITIES_CATALOG, "utf8");
  // Regex matches tuple rows: ["Name", "ST", lat, lon, pop, snow]
  const rowRe = /\["([^"]+)",\s*"([A-Z]{2})",\s*(-?\d+\.\d+),\s*(-?\d+\.\d+),\s*\d+,\s*\d+\]/g;
  const cities = [];
  for (const m of src.matchAll(rowRe)) {
    const name = m[1];
    const state = m[2];
    const lat = parseFloat(m[3]);
    const lon = parseFloat(m[4]);
    // Slug logic must match `@/lib/cities/helpers.ts` slugify()
    const slug =
      name
        .toLowerCase()
        .replace(/['.]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") +
      "-" +
      state.toLowerCase();
    cities.push({ slug, name, state, lat, lon });
  }
  return cities;
}

// ─── Step 2: Discover latest CSV files in NCEI dir ───────────────────────────

async function listAvailableYears(maxYearsBack) {
  const res = await fetch(NCEI_DIR_URL);
  if (!res.ok) throw new Error(`NCEI dir list failed: ${res.status}`);
  const html = await res.text();
  // File names look like: StormEvents_details-ftp_v1.0_d2024_c20250115.csv.gz
  const fileRe = /StormEvents_details-ftp_v[\d.]+_d(\d{4})_c\d{8}\.csv\.gz/g;
  const latestPerYear = new Map(); // year -> filename
  for (const m of html.matchAll(fileRe)) {
    const year = parseInt(m[1], 10);
    const filename = m[0];
    const existing = latestPerYear.get(year);
    if (!existing || filename > existing) latestPerYear.set(year, filename);
  }
  const currentYear = new Date().getFullYear();
  const yearsWanted = [];
  for (let y = currentYear; y >= currentYear - maxYearsBack; y--) {
    if (latestPerYear.has(y)) {
      yearsWanted.push({ year: y, file: latestPerYear.get(y) });
    }
  }
  return yearsWanted;
}

// ─── Step 3: Download + cache ────────────────────────────────────────────────

async function downloadIfNeeded(file) {
  const localPath = resolve(CACHE_DIR, file);
  if (existsSync(localPath)) {
    console.log(`  cached: ${file}`);
    return localPath;
  }
  console.log(`  downloading: ${file}`);
  const url = NCEI_DIR_URL + file;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed: ${res.status} ${url}`);
  await pipeline(Readable.fromWeb(res.body), createWriteStream(localPath));
  return localPath;
}

// ─── Step 4: Parse CSV streaming ─────────────────────────────────────────────
//
// We don't depend on a CSV library — the NWS schema is stable enough to parse
// directly. The trick is that some fields contain quoted strings with commas
// inside, so we use a tiny state machine instead of `.split(',')`.

function parseCsvLine(line) {
  const fields = [];
  let cur = "";
  let inQuote = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuote) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuote = false;
        }
      } else {
        cur += ch;
      }
    } else {
      if (ch === ",") {
        fields.push(cur);
        cur = "";
      } else if (ch === '"') {
        inQuote = true;
      } else {
        cur += ch;
      }
    }
  }
  fields.push(cur);
  return fields;
}

async function* readCsvRows(gzPath) {
  const fs = await import("node:fs");
  const stream = fs.createReadStream(gzPath).pipe(createGunzip());
  let buf = "";
  let header = null;
  for await (const chunk of stream) {
    buf += chunk.toString("utf8");
    const lines = buf.split(/\r?\n/);
    buf = lines.pop() ?? "";
    for (const line of lines) {
      if (!line) continue;
      const fields = parseCsvLine(line);
      if (!header) {
        header = fields.map((h) => h.trim());
        continue;
      }
      const row = {};
      for (let i = 0; i < header.length; i++) row[header[i]] = fields[i] ?? "";
      yield row;
    }
  }
  if (buf.trim()) {
    const fields = parseCsvLine(buf);
    const row = {};
    if (header) {
      for (let i = 0; i < header.length; i++) row[header[i]] = fields[i] ?? "";
      yield row;
    }
  }
}

// ─── Step 5: Geo helpers ─────────────────────────────────────────────────────

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

// Build a state -> cities index for fast nearest-city lookup
function buildStateIndex(cities) {
  const m = new Map();
  for (const c of cities) {
    const arr = m.get(c.state) ?? [];
    arr.push(c);
    m.set(c.state, arr);
  }
  return m;
}

function nearestCityInState(stateIndex, state, lat, lon) {
  const candidates = stateIndex.get(state);
  if (!candidates) return null;
  let best = null;
  let bestDist = Infinity;
  for (const c of candidates) {
    const d = haversineKm(lat, lon, c.lat, c.lon);
    if (d < bestDist) {
      bestDist = d;
      best = c;
    }
  }
  return best && bestDist <= MAX_JOIN_DISTANCE_KM
    ? { city: best, distanceKm: bestDist }
    : null;
}

// ─── Step 6: Date helpers ────────────────────────────────────────────────────
//
// NWS columns:  BEGIN_YEARMONTH (e.g., 202401), BEGIN_DAY ("3" or "03")
// Result:       "2024-01-03"

function eventDate(row) {
  const ym = row.BEGIN_YEARMONTH ?? "";
  const day = row.BEGIN_DAY ?? "";
  if (!/^\d{6}$/.test(ym) || !day) return null;
  const yyyy = ym.slice(0, 4);
  const mm = ym.slice(4, 6);
  const dd = String(day).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// ─── Step 7: Main ingestion loop ─────────────────────────────────────────────

async function main() {
  console.log("● Loading city catalog…");
  const cities = loadCityCatalog();
  const stateIndex = buildStateIndex(cities);
  console.log(`  ${cities.length} cities across ${stateIndex.size} states`);

  console.log("● Listing NCEI archive…");
  const yearFiles = await listAvailableYears(args.years - 1);
  console.log(`  Years to ingest: ${yearFiles.map((y) => y.year).join(", ")}`);

  const eventsByCity = new Map(); // slug -> StormEvent[]

  for (const { year, file } of yearFiles) {
    console.log(`● Year ${year}`);
    const path = await downloadIfNeeded(file);
    let rowCount = 0;
    let kept = 0;
    for await (const row of readCsvRows(path)) {
      rowCount++;
      const eventType = row.EVENT_TYPE;
      if (!WINTER_EVENT_TYPES.has(eventType)) continue;

      const lat = parseFloat(row.BEGIN_LAT);
      const lon = parseFloat(row.BEGIN_LON);
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;

      const state = (row.STATE_FIPS ? row.STATE : row.STATE)?.toString();
      if (!state) continue;

      // NWS reports the state name in full caps ("MASSACHUSETTS"); we use
      // 2-letter codes. Build a lookup map at startup.
      const stateAbbr = STATE_NAME_TO_ABBR.get(state.toUpperCase());
      if (!stateAbbr) continue;

      const nearest = nearestCityInState(stateIndex, stateAbbr, lat, lon);
      if (!nearest) continue;

      const date = eventDate(row);
      if (!date) continue;

      const magnitude = parseFloat(row.MAGNITUDE);
      const snowfallInches = Number.isFinite(magnitude) ? magnitude : null;

      const narrative =
        (row.EVENT_NARRATIVE || row.EPISODE_NARRATIVE || "")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 480) || null;
      if (!narrative) continue;

      const ev = {
        date,
        type: eventType,
        narrative,
        snowfallInches,
      };
      const arr = eventsByCity.get(nearest.city.slug) ?? [];
      arr.push(ev);
      eventsByCity.set(nearest.city.slug, arr);
      kept++;
    }
    console.log(`  rows scanned: ${rowCount.toLocaleString()}  kept: ${kept.toLocaleString()}`);
  }

  // Trim each city to MAX_EVENTS_PER_CITY most-recent
  const byCity = {};
  for (const [slug, list] of eventsByCity) {
    list.sort((a, b) => (a.date < b.date ? 1 : -1));
    byCity[slug] = list.slice(0, MAX_EVENTS_PER_CITY);
  }

  const output = {
    _meta: {
      generatedAt: new Date().toISOString(),
      source: NCEI_DIR_URL,
      yearsIngested: yearFiles.map((y) => y.year),
      citiesCovered: Object.keys(byCity).length,
      totalEvents: Object.values(byCity).reduce((s, a) => s + a.length, 0),
    },
    byCity,
  };

  await writeFile(OUTPUT_PATH, JSON.stringify(output, null, 2));
  console.log(`✓ Wrote ${OUTPUT_PATH}`);
  console.log(
    `  cities covered: ${output._meta.citiesCovered}  total events: ${output._meta.totalEvents}`,
  );
}

// ─── State-name lookup (NWS gives full uppercase names) ──────────────────────

const STATE_NAME_TO_ABBR = new Map([
  ["ALABAMA", "AL"], ["ALASKA", "AK"], ["ARIZONA", "AZ"], ["ARKANSAS", "AR"],
  ["CALIFORNIA", "CA"], ["COLORADO", "CO"], ["CONNECTICUT", "CT"],
  ["DELAWARE", "DE"], ["DISTRICT OF COLUMBIA", "DC"], ["FLORIDA", "FL"],
  ["GEORGIA", "GA"], ["HAWAII", "HI"], ["IDAHO", "ID"], ["ILLINOIS", "IL"],
  ["INDIANA", "IN"], ["IOWA", "IA"], ["KANSAS", "KS"], ["KENTUCKY", "KY"],
  ["LOUISIANA", "LA"], ["MAINE", "ME"], ["MARYLAND", "MD"],
  ["MASSACHUSETTS", "MA"], ["MICHIGAN", "MI"], ["MINNESOTA", "MN"],
  ["MISSISSIPPI", "MS"], ["MISSOURI", "MO"], ["MONTANA", "MT"],
  ["NEBRASKA", "NE"], ["NEVADA", "NV"], ["NEW HAMPSHIRE", "NH"],
  ["NEW JERSEY", "NJ"], ["NEW MEXICO", "NM"], ["NEW YORK", "NY"],
  ["NORTH CAROLINA", "NC"], ["NORTH DAKOTA", "ND"], ["OHIO", "OH"],
  ["OKLAHOMA", "OK"], ["OREGON", "OR"], ["PENNSYLVANIA", "PA"],
  ["RHODE ISLAND", "RI"], ["SOUTH CAROLINA", "SC"], ["SOUTH DAKOTA", "SD"],
  ["TENNESSEE", "TN"], ["TEXAS", "TX"], ["UTAH", "UT"], ["VERMONT", "VT"],
  ["VIRGINIA", "VA"], ["WASHINGTON", "WA"], ["WEST VIRGINIA", "WV"],
  ["WISCONSIN", "WI"], ["WYOMING", "WY"],
]);

main().catch((err) => {
  console.error("Ingestion failed:", err);
  process.exit(1);
});
