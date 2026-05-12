/**
 * District editorial content generator.
 *
 * District pages need editorial that's distinct from their parent city page
 * (otherwise Google flags them as near-duplicates). Strategy: every district
 * page focuses on *how that specific district makes the closure decision* —
 * the city page focuses on weather + climate.
 *
 * Content is templated by:
 *   - District type (city/county/unified/isd/state/consolidated/metro) —
 *     each has a different decision-making structure to explain
 *   - Enrollment tier (huge / large / mid / small) — bigger districts close
 *     less reflexively because the operational cost is higher
 *   - Parent-city climate zone (inherited from city catalog) — drives the
 *     "what kind of weather closes us" prose
 *
 * Three independent variables → 7×4×12 = 336 possible combinations, each
 * producing distinct prose. Plenty of variation across 80+ districts.
 */

import type { DistrictRecord } from "./helpers";
import { formatEnrollment } from "./helpers";
import { generateCityContent } from "../cities/content";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface DistrictContent {
  metaDescription: string;
  lede: string;
  /** "How [District] decides" — 2-3 paragraphs of decision-process prose. */
  decisionProcess: {
    heading: string;
    paragraphs: string[];
  };
  /** What weather closes this district (inherits city climate). */
  closureTriggers: {
    heading: string;
    paragraph: string;
    bullets: string[];
  };
  /** "About the district" stat panel + paragraph. */
  about: {
    heading: string;
    paragraph: string;
    stats: Array<{ label: string; value: string }>;
  };
  closing: string;
  wordCount: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

type EnrollmentTier = "huge" | "large" | "mid" | "small";

function tier(enrollment: number): EnrollmentTier {
  if (enrollment >= 200_000) return "huge";
  if (enrollment >= 75_000) return "large";
  if (enrollment >= 25_000) return "mid";
  return "small";
}

function typeLabel(type: DistrictRecord["type"]): string {
  switch (type) {
    case "isd": return "Independent School District";
    case "county": return "county-wide school district";
    case "unified": return "unified school district";
    case "state": return "statewide education department";
    case "metro": return "metropolitan school district";
    case "consolidated": return "consolidated school district";
    case "city": return "municipal school district";
  }
}

/**
 * Decision-process prose by district structure. Each structure has a
 * genuinely different governance model — that's what makes the prose
 * non-duplicative across district pages.
 */
function decisionProcessProse(d: DistrictRecord): { heading: string; paragraphs: string[] } {
  const { name, city, type } = d;
  const cityName = city.name;

  switch (type) {
    case "county":
      return {
        heading: `How ${name} makes the closure decision`,
        paragraphs: [
          `${name} operates across the entire ${city.stateName} county containing ${cityName}, which means weather conditions can vary dramatically inside a single district. A storm that drops 8 inches on the northern half can produce only 2 inches in the southern half, but the district has to make a single call for every school. Administrators typically dispatch transportation crews along sample bus routes between 3 and 5 a.m. to assess actual road conditions rather than relying solely on forecast totals.`,
          `The closure decision usually comes from the Superintendent's office in consultation with the transportation director and (for severe events) county emergency management. ${name} announces closures by 5:30 a.m. on the district website, automated phone tree, and local TV stations. Two-hour delays are more common than full closures here, because the size of the district means partial-day operations save instructional time when conditions are borderline.`,
        ],
      };

    case "isd":
      return {
        heading: `How ${name} makes the closure decision`,
        paragraphs: [
          `${name} is an Independent School District — a fiscally and administratively autonomous entity under Texas law. Closure decisions are made by the Superintendent in consultation with transportation, facilities, and (when needed) regional emergency management. Because Texas school districts have full local control, ${name}'s closure thresholds and announcement protocols are genuinely independent from neighboring districts.`,
          `Decisions are typically made between 4:30 and 5:30 a.m. after early-morning road assessments. Texas weather events that close ${name} schools are usually ice events rather than pure snow — even an eighth of an inch of freezing rain on elevated roadways is enough to ground bus routes. Announcements go out via the district's social channels, automated calls, and local news partners.`,
        ],
      };

    case "unified":
      return {
        heading: `How ${name} makes the closure decision`,
        paragraphs: [
          `${name} is a unified school district, which means it serves all grades K-12 across its geographic boundary under a single Board of Education and Superintendent. Closure decisions go through the Superintendent's office, typically informed by overnight reports from facilities and transportation staff. For the largest unified districts (LAUSD, ${name} included), the operational cost of closure is enormous — staff are paid regardless, and any food-service program that feeds students must be replaced — so closures are reserved for genuine safety risk rather than convenience.`,
          `When the district announces, it does so by 5:30 a.m. via the official site, the district's communications app, and local broadcast media. Individual schools cannot make their own calls; ${name} closes or opens as one unit.`,
        ],
      };

    case "state":
      return {
        heading: `How ${name} coordinates closures`,
        paragraphs: [
          `${name} is a statewide education system, which means weather-related closures aren't typically made at the state level. Instead, individual school complexes and area superintendents make calls based on local conditions, with the state office providing coordination and guidance. This is different from most U.S. school districts and reflects the unique geography of ${city.stateName}.`,
          `Real-time announcements come from each complex area's superintendent's office, typically by 5:30 a.m. on event days. Because weather conditions vary dramatically across the state, neighboring schools may make different calls for the same event.`,
        ],
      };

    case "metro":
      return {
        heading: `How ${name} makes the closure decision`,
        paragraphs: [
          `${name} operates across the metropolitan ${cityName} area, which combines dense urban core with suburban and outlying communities. Storm impact varies across that footprint, but the district makes a single closure call for all schools. The Superintendent's office coordinates with transportation, facilities, and (during severe events) city emergency management to gather road-condition data before announcing.`,
          `Closure decisions are typically posted by 5:30 a.m. on the district website, automated parent communication system, and local news partners. ${name} uses two-hour delays for borderline events and full closures for storms with significant ice risk or accumulation exceeding district safe-operation thresholds.`,
        ],
      };

    case "consolidated":
      return {
        heading: `How ${name} makes the closure decision`,
        paragraphs: [
          `${name} consolidates multiple municipal school systems under a single governance structure, which means closure decisions are made centrally but must account for conditions across a large and varied service area. The Superintendent's office reviews overnight transportation reports and forecast updates before issuing a single district-wide call.`,
          `Announcements go out by 5:30 a.m. via the district website, automated parent notification, and local broadcast media. Two-hour delays are used for borderline events; full closures are reserved for storms with significant ice risk or accumulation thresholds that put bus operations at risk.`,
        ],
      };

    case "city":
    default:
      return {
        heading: `How ${name} makes the closure decision`,
        paragraphs: [
          `${name} operates within ${cityName}'s municipal boundaries, which gives it a more geographically concentrated student population than a county-wide district. That tighter footprint means weather conditions across district schools are usually consistent, simplifying the closure call. The Superintendent's office reviews overnight weather data, transportation department road assessments, and (for severe events) coordinates with the city's emergency operations center.`,
          `${name} announces closures by 5:30 a.m. on the district website, social channels, automated parent calls, and local news partners. Because urban districts tend to have higher concentrations of students who depend on school meals and transportation, the operational cost of closure is real — closures here are reserved for events that genuinely threaten student safety rather than for borderline conditions.`,
        ],
      };
  }
}

/**
 * "What closes this district" — inherits the city's climate zone via the
 * city-content generator's threshold text, then layers a district-tier
 * paragraph on top.
 */
function closureTriggersBlock(d: DistrictRecord): DistrictContent["closureTriggers"] {
  const cityContent = generateCityContent(d.city);
  const t = tier(d.enrollment);

  const tierLine = (() => {
    switch (t) {
      case "huge":
        return `As one of the largest districts in the country with ${formatEnrollment(d.enrollment)}, ${d.name} faces enormous operational pressure to stay open — closures cost millions in disrupted programming, missed meals, and rescheduled instruction. The closure threshold here is meaningfully higher than at a smaller district facing the same forecast.`;
      case "large":
        return `${d.name} serves ${formatEnrollment(d.enrollment)} across ${d.stateName}, which makes closure decisions consequential — but the district's scale also gives it the resources (plow contracts, transportation depth, communication infrastructure) to keep schools open through events that would close smaller districts.`;
      case "mid":
        return `${d.name} serves ${formatEnrollment(d.enrollment)} — a mid-size district where closure decisions are made by a centralized administration but operational impact is felt at every school. The closure threshold here is roughly aligned with the regional climate baseline for ${d.city.name}.`;
      case "small":
        return `${d.name} serves ${formatEnrollment(d.enrollment)}, which means closure decisions can be made quickly and operational impact is contained. Small districts in the snow belt tend to have lower closure thresholds than larger districts — when forecast conditions are borderline, smaller districts more often choose closure.`;
    }
  })();

  return {
    heading: `What closes ${d.name}`,
    paragraph: `${cityContent.closureThreshold.paragraph} ${tierLine}`,
    bullets: cityContent.typicalWinter.bullets,
  };
}

function aboutBlock(d: DistrictRecord): DistrictContent["about"] {
  const label = typeLabel(d.type);
  return {
    heading: `About ${d.name}`,
    paragraph: `${d.name} is a ${label} serving ${d.city.name}, ${d.stateName} and the surrounding community. The district operates within the broader ${d.city.name} school-closure ecosystem, where the city's climate (averaging ${d.city.snowInches} inches of snowfall per year) sets the baseline for how often weather events trigger closures.`,
    stats: [
      { label: "Enrollment", value: d.enrollment.toLocaleString("en-US") },
      { label: "District type", value: titleCase(label) },
      { label: "Primary city", value: d.city.displayName },
      { label: "Annual snowfall", value: `${d.city.snowInches}"` },
    ],
  };
}

function titleCase(s: string): string {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

// ─── Main generator ──────────────────────────────────────────────────────────

export function generateDistrictContent(d: DistrictRecord): DistrictContent {
  const decisionProcess = decisionProcessProse(d);
  const closureTriggers = closureTriggersBlock(d);
  const about = aboutBlock(d);

  const closing = `SnowSense™ tracks weather conditions in ${d.city.name} every 30 minutes and calibrates the resulting snow-day probability against ${d.stateName}'s school-closure patterns. The number on this page reflects the live forecast — check it again the morning of the storm.`;

  const metaDescription = `Live snow day probability for ${d.name} in ${d.city.displayName}. ${formatEnrollment(d.enrollment)}. Real-time forecast updated every 30 minutes, calibrated to ${d.city.stateName}'s closure thresholds.`;

  const lede = `Will ${d.name} close tomorrow? Live snow-day probability for ${d.city.name}, ${d.stateName} — updated every 30 minutes with the latest forecast.`;

  const allText = [
    ...decisionProcess.paragraphs,
    closureTriggers.paragraph,
    ...closureTriggers.bullets,
    about.paragraph,
    closing,
  ].join(" ");
  const wordCount = allText.split(/\s+/).filter(Boolean).length;

  return {
    metaDescription,
    lede,
    decisionProcess,
    closureTriggers,
    about,
    closing,
    wordCount,
  };
}
