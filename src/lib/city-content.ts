export interface CityContent {
  slug: string;
  city: string;
  state: string;
  avgSnowDaysPerYear: number;
  avgAnnualSnowfallInches: number;
  typicalDecisionTime: string;
  notificationChannels: string[];
  infrastructureRating: "Low" | "Medium" | "High" | "Very High";
  closureThresholdInches: string;
  historicalPattern: string;
  snowDayContext: string;
  districtNotes: string;
  regionalFacts: string[];
}

export const cityContentMap: Record<string, CityContent> = {
  "new-york-ny": {
    slug: "new-york-ny",
    city: "New York City",
    state: "New York",
    avgSnowDaysPerYear: 11,
    avgAnnualSnowfallInches: 28,
    typicalDecisionTime: "4:30 AM – 5:30 AM",
    notificationChannels: ["NYC Emergency Alerts", "DOE website", "NYC Schools app"],
    infrastructureRating: "Very High",
    closureThresholdInches: "6–10+",
    historicalPattern:
      "NYC public schools close rarely — the city operates over 5,000 plows and salt spreaders and has historically kept schools open through significant snowfall. The 2006 blizzard (26 inches) and 2016 blizzard (27 inches) are among the few events that forced multi-day closures.",
    snowDayContext:
      "New York City schools serve 1.1 million students across five boroughs. The DOE Chancellor makes the citywide call, which affects over 1,800 buildings. Because a NYC closure means thousands of parents cannot get to work, the threshold is deliberately high — typically 6+ inches of accumulation with poor road conditions.",
    districtNotes:
      "NYC does not have individual district decisions — it is one unified system. The Chancellor consults with the Mayor's Office of Emergency Management and DSNY (sanitation dept) before announcing. Check schools.nyc.gov or the NYC Schools app for official notices.",
    regionalFacts: [
      "NYC has 5,800+ snow removal vehicles citywide",
      "Average annual snowfall: 28 inches — most falls Nov–March",
      "Cold days (temperature-only closures) are extremely rare in NYC",
      "Staten Island and parts of Brooklyn/Queens tend to get higher accumulation than Manhattan",
      "NYC schools typically follow a 'delayed opening' before a full closure",
    ],
  },
  "boston-ma": {
    slug: "boston-ma",
    city: "Boston",
    state: "Massachusetts",
    avgSnowDaysPerYear: 14,
    avgAnnualSnowfallInches: 44,
    typicalDecisionTime: "4:00 AM – 5:30 AM",
    notificationChannels: ["BPS website", "BPS mobile app", "Automated phone calls", "WBZ NewsRadio"],
    infrastructureRating: "Very High",
    closureThresholdInches: "8–14+",
    historicalPattern:
      "Boston is one of the most snow-hardened cities in the country. The 2014–15 winter dumped over 110 inches of snow, setting an all-time record — schools closed repeatedly as the MBTA system itself collapsed. Typically, Boston Public Schools close 3–5 times per winter, almost always for storms exceeding 8 inches.",
    snowDayContext:
      "Boston receives an average of 44 inches of snow per year, giving it one of the highest natural snowfall totals of any major US city. BPS serves roughly 50,000 students. The superintendent makes the call in coordination with the MBTA (public transit) status, since many students commute by bus or subway.",
    districtNotes:
      "BPS decision-making heavily factors MBTA service status. If the T is not running normal service, it often triggers a school closure even if roads are passable. The decision is announced by 5:30 AM and distributed via the BPS website, automated calls, and WBZ 1030 AM.",
    regionalFacts: [
      "Boston averages 44 inches of snow per year — one of the highest in any major US city",
      "The 2014–15 season produced a record 110.6 inches in the metro area",
      "Boston deploys salt brine pre-treatment before storms begin",
      "School closures are called district-wide — suburban towns (Newton, Brookline, etc.) make independent decisions",
      "Wind chill below -10°F may trigger a delay even without snow accumulation",
    ],
  },
  "chicago-il": {
    slug: "chicago-il",
    city: "Chicago",
    state: "Illinois",
    avgSnowDaysPerYear: 13,
    avgAnnualSnowfallInches: 37,
    typicalDecisionTime: "4:00 AM – 5:00 AM",
    notificationChannels: ["CPS website", "CPS family portal", "Local TV (WGN, ABC7)"],
    infrastructureRating: "High",
    closureThresholdInches: "6–12",
    historicalPattern:
      "Chicago Public Schools have a high tolerance for snow — the 2019 polar vortex event closed schools due to -50°F wind chills rather than snow accumulation. CPS typically closes 2–4 times per year, and often only for extreme events. The famous 1967 blizzard (23 inches) and 2011 blizzard (21 inches) caused extended multi-day closures.",
    snowDayContext:
      "CPS serves 330,000 students across 600+ schools. Chicago's street and sanitation department operates one of the largest urban snow removal fleets in the US. The CEO of CPS makes the closure decision, balancing school bus route safety with the impact on working families who depend on schools for childcare.",
    districtNotes:
      "Chicago often opts for 2-hour delayed starts rather than full closures, allowing morning road clearing. Cold day closures (wind chill-based) are more common than snow day closures. Announcements go out via the CPS family portal and major TV/radio stations by 5:30 AM.",
    regionalFacts: [
      "Chicago averages 37 inches of snowfall per year",
      "The city operates 280+ snow plows covering 9,400 lane-miles",
      "Wind chill below -20°F is a standalone closure trigger",
      "Lake-effect snow from Lake Michigan can cause localized heavy accumulation on the North and South sides",
      "Chicago uses GPS tracking on all snow plows — residents can track clearing progress at chicagoworks.com",
    ],
  },
  "philadelphia-pa": {
    slug: "philadelphia-pa",
    city: "Philadelphia",
    state: "Pennsylvania",
    avgSnowDaysPerYear: 10,
    avgAnnualSnowfallInches: 22,
    typicalDecisionTime: "4:30 AM – 5:30 AM",
    notificationChannels: ["SDP website", "Phone/text alerts", "6ABC Action News"],
    infrastructureRating: "Medium",
    closureThresholdInches: "4–7",
    historicalPattern:
      "Philadelphia's lower-than-expected snowfall total (22 inches/year) makes each storm feel more disruptive than in cities like Boston or Buffalo. SDP schools typically close 3–5 times per winter. The city's hilly terrain in Germantown and Chestnut Hill creates icy road conditions faster than flat areas.",
    snowDayContext:
      "The School District of Philadelphia serves 120,000+ students across 216 schools. SDP's decision considers both surface street and school bus route safety. The district has experienced significant budget pressures in recent years affecting fleet maintenance and salt stockpile levels.",
    districtNotes:
      "Philadelphia's fleet is smaller relative to its geographic area, which means pre-treatment is prioritized on arterial roads. Side streets in residential neighborhoods may remain icy for hours after main roads are clear, which weighs heavily on the bus route safety calculation.",
    regionalFacts: [
      "Philadelphia averages 22 inches of snowfall per year",
      "Hilly terrain in Northwest Philadelphia (Germantown, Mount Airy) creates localized ice risk",
      "The city borders Delaware and New Jersey — border schools sometimes have split decisions",
      "Ice storms (freezing rain) are more common than pure snow events near Philadelphia",
      "Historical average of 3–5 snow day closures per academic year",
    ],
  },
  "denver-co": {
    slug: "denver-co",
    city: "Denver",
    state: "Colorado",
    avgSnowDaysPerYear: 8,
    avgAnnualSnowfallInches: 57,
    typicalDecisionTime: "4:00 AM – 5:00 AM",
    notificationChannels: ["DPS website", "DPS app", "9News", "Denver7"],
    infrastructureRating: "High",
    closureThresholdInches: "6–12",
    historicalPattern:
      "Denver gets significant snowfall (57 inches/year) but also gets rapid clearing from warm Chinook winds. A foot of snow can fall and melt within 24–48 hours. DPS schools close approximately 3–6 times per winter, primarily when storms hit overnight and clearing hasn't kept pace by 6 AM.",
    snowDayContext:
      "Denver Public Schools serves 90,000 students across a geographically spread district. At 5,280 feet elevation, Denver's snow is characteristically dry and powdery — easier to plow but prone to drifting. Ice events are actually more problematic than snowfall for DPS bus routes.",
    districtNotes:
      "Denver's elevation means temperature swings can be dramatic — a storm arriving at 32°F can produce wet snow that freezes overnight into black ice as temperatures drop to 5°F. The melting/freezing cycle is the primary closure driver, not total accumulation.",
    regionalFacts: [
      "Denver averages 57 inches of snowfall per year but benefits from frequent Chinook wind events",
      "At 5,280 feet elevation, snow is typically dry and low-density — easier to plow",
      "Neighboring mountain districts (Jefferson County, Douglas County) see significantly more snow",
      "Temperature swings of 40–60°F in a single day are common in Colorado",
      "The I-70 mountain corridor closure affects school staffing when teachers can't commute from the foothills",
    ],
  },
  "washington-dc": {
    slug: "washington-dc",
    city: "Washington",
    state: "DC",
    avgSnowDaysPerYear: 6,
    avgAnnualSnowfallInches: 15,
    typicalDecisionTime: "5:00 AM – 6:00 AM",
    notificationChannels: ["DCPS website", "DC Alert", "WTOP News radio"],
    infrastructureRating: "Low",
    closureThresholdInches: "2–4",
    historicalPattern:
      "Washington DC has one of the lowest snow tolerance thresholds of any major US city. DCPS regularly closes for 2–3 inches of snow — not due to incompetence but because the city has very limited winter infrastructure (fewer than 100 plows for a city of 700,000), a heavily-used public transit system (Metro) that struggles in ice, and a high proportion of bus-dependent students.",
    snowDayContext:
      "DCPS serves 50,000 students across a city where even minor snow events cause widespread road icing. The region's position at the Mason-Dixon line puts it squarely in the rain/snow/freezing rain battleground zone — storms that are pure snow in Baltimore often arrive as freezing rain in DC, making conditions more dangerous than accumulation totals suggest.",
    districtNotes:
      "DCPS decisions are closely tied to federal government operating status (OPM announcements), Metro service levels, and Virginia/Maryland school district decisions, since many DCPS families and staff live across the border. When OPM announces a 2-hour federal delay, DCPS often follows.",
    regionalFacts: [
      "DC averages only 15 inches of snowfall per year — every inch feels more significant",
      "The city has fewer than 100 dedicated plow vehicles",
      "Freezing rain is more common than snow due to the mid-Atlantic latitude",
      "DC schools use 'Code Blue' (early dismissal) and 'Code Red' (full closure) weather protocols",
      "Suburban districts (Fairfax, Montgomery, Prince George's) make independent decisions but often align with DCPS",
    ],
  },
  "minneapolis-mn": {
    slug: "minneapolis-mn",
    city: "Minneapolis",
    state: "Minnesota",
    avgSnowDaysPerYear: 5,
    avgAnnualSnowfallInches: 54,
    typicalDecisionTime: "3:30 AM – 4:30 AM",
    notificationChannels: ["MPS website", "SchoolMessenger automated calls", "WCCO radio"],
    infrastructureRating: "Very High",
    closureThresholdInches: "10–18 (or wind chill below -35°F)",
    historicalPattern:
      "Minneapolis schools almost never close for snow alone — the city has exceptional winter infrastructure and Minnesotans are culturally adapted to extreme winter. Closures happen primarily for polar vortex events (wind chill below -35°F) or storm intensity that overwhelms even the city's substantial plowing capacity. MPS typically closes 1–3 times per winter.",
    snowDayContext:
      "Minneapolis Public Schools serves 30,000 students in a city that averages 54 inches of snow per year. The school district's bus fleet has block heaters on every vehicle, and diesel fuel is blended for cold weather. Sub-zero temperatures are considered normal — cold day closures require sustained wind chills in the -30°F to -40°F range.",
    districtNotes:
      "Minnesota has a state law requiring schools to monitor dangerous cold conditions. The National Weather Service issues 'dangerous wind chill' advisories that trigger district-level reviews. When sustained wind chills are forecast below -35°F, MPS will typically cancel. Snow alone — even 12–15 inches — rarely closes schools.",
    regionalFacts: [
      "Minneapolis averages 54 inches of snow per year across a 6-month winter season",
      "Minnesota requires schools to have policies for cold-weather closures",
      "Wind chill below -35°F is the primary cold-day trigger",
      "The city has 200+ lane-miles of heated pavement on key routes",
      "School buses operate at temperatures as low as -30°F with proper diesel blend and engine heaters",
    ],
  },
  "boston-ma-hartford-ct": {
    slug: "hartford-ct",
    city: "Hartford",
    state: "Connecticut",
    avgSnowDaysPerYear: 12,
    avgAnnualSnowfallInches: 39,
    typicalDecisionTime: "4:00 AM – 5:00 AM",
    notificationChannels: ["Hartford Public Schools website", "One-Call Now automated system", "WTIC NewsRadio 1080"],
    infrastructureRating: "Medium",
    closureThresholdInches: "4–8",
    historicalPattern:
      "Hartford sits at the intersection of Nor'easter track paths, making it one of the more snow-prone cities in the I-95 corridor. The city receives about 39 inches per year and has well-established winter operations. Schools typically close 4–6 times per winter, with closures triggered at lower thresholds than Boston due to the city's limited urban plow fleet.",
    snowDayContext:
      "Hartford Public Schools serves approximately 20,000 students in a compact urban district. Many students walk or use city buses, meaning icy sidewalks are as important as road conditions in the closure decision. The superintendent works closely with the Hartford Department of Public Works and CT Transit on closure calls.",
    districtNotes:
      "Connecticut is notable for having one of the strictest school day requirements in the country — schools must complete a minimum number of instructional hours. This creates pressure to minimize closures and use delayed openings instead. Hartford often follows surrounding suburban districts (West Hartford, Glastonbury) which have better resources.",
    regionalFacts: [
      "Connecticut law requires schools to meet minimum instructional hours — excess snow days must be made up",
      "Hartford is in a Nor'easter 'sweet spot' receiving 35–45 inches per year on average",
      "The Connecticut River valley can channel and amplify wind speeds during storms",
      "Suburban districts often have higher closure thresholds than Hartford due to better infrastructure",
      "CT has recently moved toward instructional 'Snow Days' — remote learning on closure days",
    ],
  },
};

export function getCityContent(slug: string): CityContent | undefined {
  return cityContentMap[slug];
}
