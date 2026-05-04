/**
 * scripts/generate-sitemap-snapshot.mjs
 *
 * BUILD-TIME SNAPSHOT GENERATOR (Node.js https module — no external deps required)
 * Run before `next build` to generate a frozen, deterministic movie dataset.
 *
 * Usage (standalone):
 *   NEXT_PUBLIC_TMDB_API_KEY=<key> node scripts/generate-sitemap-snapshot.mjs
 *
 * Integrated via package.json (recommended):
 *   "prebuild": "node scripts/generate-sitemap-snapshot.mjs"
 */

import https from "https";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const TMDB_BASE = "api.themoviedb.org";
const TMDB_BASE_PATH = "/3";
const OUTPUT_PATH = path.resolve(__dirname, "../src/data/sitemaps/movies.snapshot.json");
const MAX_PAGES = 2; // Bounded pagination — never exceed 3

const ENDPOINTS = [
  "/trending/movie/day",
  "/trending/movie/week",
  "/movie/popular",
  "/movie/top_rated",
];

if (!API_KEY) {
  console.error("[snapshot] ERROR: NEXT_PUBLIC_TMDB_API_KEY is not set. Aborting.");
  process.exit(1);
}

/**
 * Fetch a single TMDB endpoint page using native https module
 */
function fetchPage(endpoint, page) {
  return new Promise((resolve, reject) => {
    const urlPath = `${TMDB_BASE_PATH}${endpoint}?api_key=${API_KEY}&language=en-US&page=${page}`;
    const options = {
      hostname: TMDB_BASE,
      path: urlPath,
      method: "GET",
      headers: { Accept: "application/json" },
    };

    const req = https.request(options, (res) => {
      let raw = "";
      res.on("data", (chunk) => (raw += chunk));
      res.on("end", () => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          return reject(new Error(`HTTP ${res.statusCode} for ${endpoint} page ${page}`));
        }
        try {
          const json = JSON.parse(raw);
          resolve(json.results || []);
        } catch (e) {
          reject(new Error(`JSON parse error for ${endpoint} page ${page}`));
        }
      });
    });

    req.on("error", reject);
    req.end();
  });
}

/**
 * Fetch all pages for an endpoint up to MAX_PAGES
 */
async function fetchPool(endpoint) {
  const results = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    try {
      const movies = await fetchPage(endpoint, page);
      results.push(...movies);
      console.log(`[snapshot] ${endpoint} page ${page}: ${movies.length} movies`);
    } catch (err) {
      console.warn(`[snapshot] WARN: Skipping ${endpoint} page ${page}: ${err.message}`);
    }
  }
  return results;
}

async function main() {
  console.log("[snapshot] Starting build-time TMDB snapshot generation...");

  // Collect all pools sequentially to be kind to TMDB rate limits
  const allResults = [];
  for (const endpoint of ENDPOINTS) {
    const movies = await fetchPool(endpoint);
    allResults.push(...movies);
  }

  // Deduplicate by movie ID — keep minimal fields for sitemap use only
  const movieMap = new Map();
  for (const movie of allResults) {
    if (!movieMap.has(movie.id)) {
      movieMap.set(movie.id, {
        id: movie.id,
        popularity: movie.popularity ?? 0,
        vote_average: movie.vote_average ?? 0,
        release_date: movie.release_date ?? "",
      });
    }
  }

  // Deterministic sort: popularity desc → vote_average desc → id asc
  const sorted = Array.from(movieMap.values()).sort(
    (a, b) =>
      (b.popularity - a.popularity) ||
      (b.vote_average - a.vote_average) ||
      (a.id - b.id)
  );

  // Ensure output directory exists
  const outputDir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Failsafe: do not overwrite existing valid snapshot with empty data
  if (sorted.length === 0) {
    if (fs.existsSync(OUTPUT_PATH)) {
      console.warn("[snapshot] WARN: No movies fetched. Keeping existing snapshot.");
      process.exit(0);
    }
    console.error("[snapshot] ERROR: No movies fetched and no existing snapshot. Check API key.");
    process.exit(1);
  }

  // Write frozen snapshot
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(sorted, null, 2), "utf8");
  console.log(`[snapshot] ✅ Done: ${sorted.length} movies written → ${OUTPUT_PATH}`);
}

main().catch((err) => {
  console.error("[snapshot] FATAL:", err.message);
  process.exit(1);
});
