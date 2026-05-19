/**
 * State hub page content generator.
 *
 * State hubs (e.g. /snow-day-calculator/state/massachusetts) target the
 * "[state] snow day" query set, which has genuine search volume and is
 * currently uncovered by the site. Each hub shows:
 *   - State-specific H1 + lede
 *   - List of all covered cities in the state (linked)
 *   - 2-3 paragraphs of state-level winter context
 *
 * Content is generated deterministically from the cities catalog, so adding
 * cities to the catalog automatically enriches the relevant state hub.
 */

import { getCitiesInState, STATE_NAMES, type CityRecord } from "./helpers";

export interface StateContent {
  stateSlug: string;
  stateName: string;
  stateCode: string;
  cities: CityRecord[];
  /** Unique meta description. */
  metaDescription: string;
  /** Visible H1. */
  h1: string;
  /** Lede shown under the H1. */
  lede: string;
  /** 2-3 paragraphs of state-level context. */
  paragraphs: string[];
  /** Avg snowfall across covered cities in this state. */
  avgSnowfall: number;
  /** Totals for the data block. */
  stats: {
    cityCount: number;
    totalPopulation: number;
    highestSnowfallCity: CityRecord | null;
  };
}

function regionalParagraphs(stateCode: string, cities: CityRecord[]): string[] {
  const stateName = STATE_NAMES[stateCode] ?? stateCode;
  const avg = cities.length ? cities.reduce((s, c) => s + c.snowInches, 0) / cities.length : 0;
  const highest = cities.reduce<CityRecord | null>(
    (acc, c) => (!acc || c.snowInches > acc.snowInches ? c : acc),
    null,
  );
  const lowest = cities.reduce<CityRecord | null>(
    (acc, c) => (!acc || c.snowInches < acc.snowInches ? c : acc),
    null,
  );

  // Deep-south and desert states get a "rare events" framing
  if (avg < 3) {
    return [
      `${stateName} rarely sees school-closing winter weather. Across the ${cities.length} ${stateName} cities tracked by SnowSense™, average annual snowfall is only ${avg.toFixed(1)} inches — and most of those inches fall in high-elevation areas or extreme-outlier events. For most ${stateName} families, a snow day is a once-a-decade local story rather than an annual possibility.`,
      `When winter weather does arrive in ${stateName}, districts close schools quickly and for longer than northern districts would. The reason is infrastructure: ${stateName} doesn't stockpile salt, maintain plow fleets, or drill bus drivers on ice-route protocols — none of which is economically justified for events this rare. So when an ice event or hard freeze hits, closures extend for multiple days while conditions thaw naturally.`,
      `Use the city links above to see live snow day probability for your specific ${stateName} location. On days without active winter weather, the probability will show as near-zero; on days when an event is developing, the number refreshes every 30 minutes as the forecast updates.`,
    ];
  }

  // Upper-midwest + heavy-snow states: "winter-hardened" framing
  if (avg >= 40) {
    return [
      `${stateName} has one of the most snow-hardened school cultures in the country. Across the ${cities.length} ${stateName} cities covered by SnowSense™, average annual snowfall is ${avg.toFixed(0)} inches, with ${highest?.name ?? "the top city"} receiving up to ${highest?.snowInches ?? 0} inches in a typical winter. Despite that volume, ${stateName} districts close school less often than mid-Atlantic districts do — kids, buses, and roads here are built for winter.`,
      `What closes ${stateName} schools isn't snow accumulation — it's wind chill, ice, or infrastructure failure. Sustained wind chills below −30°F trigger safety-driven cold-day cancellations under most ${stateName} districts' protocols. A foot of powder, by contrast, is usually just Tuesday.`,
      `The city links above show live snow day probability for every covered ${stateName} city. SnowSense™ weighs wind-chill risk separately from accumulation for ${stateName}, so a frigid-but-clear day can still register a probability spike when accumulation-only models would show zero.`,
    ];
  }

  // Mid-atlantic / moderate snow states
  if (avg >= 15 && avg < 40) {
    return [
      `${stateName} sits in the classic mid-latitude winter belt — enough snow to regularly close schools, not enough to build infrastructure for it. Across the ${cities.length} ${stateName} cities covered by SnowSense™, average annual snowfall is ${avg.toFixed(0)} inches. ${highest?.name ?? "Top cities"} receive up to ${highest?.snowInches ?? 0} inches in a typical winter; lower-latitude cities like ${lowest?.name ?? "the southern ones"} see closer to ${lowest?.snowInches ?? 0}.`,
      `School-closure decisions in ${stateName} often hinge on precipitation type as much as accumulation. Storms that cross the region frequently transition from snow to sleet to freezing rain and back, and the difference between a four-inch snow event and a one-inch ice-glaze event is invisible until the storm arrives. Districts tend to close preemptively when ice risk is in the forecast.`,
      `Pick a city above to see live snow day probability for your specific ${stateName} location. SnowSense™ refreshes every 30 minutes with live NWS forecast data, ice-risk modeling, and ${stateName}-calibrated closure thresholds.`,
    ];
  }

  // Generic fallback
  return [
    `${stateName} winter weather varies dramatically across the state. Across the ${cities.length} ${stateName} cities covered by SnowSense™, average annual snowfall is ${avg.toFixed(0)} inches, ranging from ${lowest?.snowInches ?? 0} inches in ${lowest?.name ?? "southern areas"} to ${highest?.snowInches ?? 0} inches in ${highest?.name ?? "northern areas"}.`,
    `School-closure thresholds track the regional snowfall climatology: districts in high-snowfall areas close only for major events, while low-snowfall districts close for smaller events that would be unremarkable elsewhere. ${stateName}'s district-level autonomy means nearby towns sometimes make different closure calls for the same storm.`,
    `Pick a city above for a live snow day probability specific to that location. Each ${stateName} city's probability refreshes every 30 minutes with the latest forecast data.`,
  ];
}

export function generateStateContent(stateSlug: string): StateContent | null {
  const cities = getCitiesInState(stateSlug);
  if (cities.length === 0) return null;

  const stateCode = cities[0].state;
  const stateName = STATE_NAMES[stateCode] ?? stateCode;
  const avg = cities.reduce((s, c) => s + c.snowInches, 0) / cities.length;
  const highest = cities.reduce<CityRecord | null>(
    (acc, c) => (!acc || c.snowInches > acc.snowInches ? c : acc),
    null,
  );
  const totalPop = cities.reduce((s, c) => s + c.population, 0);

  const h1 = `Will Schools Close in ${stateName}?`;
  const lede =
    avg < 3
      ? `Snow days are rare in ${stateName}, but when they happen SnowSense™ is here. Live probability for ${cities.length} ${stateName} cities, updated every 30 minutes.`
      : avg >= 40
      ? `${stateName} gets ${avg.toFixed(0)} inches of snow per year — but not every storm closes school. Live snow day probability for ${cities.length} ${stateName} cities, calibrated to local closure thresholds.`
      : `Will schools close in ${stateName} tomorrow? Live snow day probability for ${cities.length} ${stateName} cities, updated every 30 minutes.`;

  const metaDescription =
    avg < 3
      ? `Snow day probability for ${cities.length} ${stateName} cities. Rare winter weather but we track it live — SnowSense™ forecast updated every 30 minutes.`
      : `Snow day probability for ${cities.length} ${stateName} cities. ${stateName} averages ${avg.toFixed(0)} inches of snow per year. Real-time forecast calibrated to local closure thresholds, updated every 30 minutes.`;

  return {
    stateSlug,
    stateName,
    stateCode,
    cities,
    metaDescription,
    h1,
    lede,
    paragraphs: regionalParagraphs(stateCode, cities),
    avgSnowfall: avg,
    stats: {
      cityCount: cities.length,
      totalPopulation: totalPop,
      highestSnowfallCity: highest,
    },
  };
}
