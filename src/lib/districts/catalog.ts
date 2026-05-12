/**
 * U.S. school district catalog.
 *
 * Curated list of ~80 districts targeting the "[district name] snow day"
 * query family. Selection priorities:
 *   1. Top ~30 districts by enrollment (large search volume regardless of climate)
 *   2. Snow-belt districts (Northeast, Midwest, Mountain West) where the
 *      "snow day" query intent is strong
 *   3. State capitals + culturally-known districts
 *
 * Field design:
 *   We deliberately exclude *volatile* fields like superintendent names
 *   and social handles. Districts rebrand, superintendents turn over every
 *   2-4 years, and Twitter→X migrations broke many official handles. Static
 *   pages with stale leadership data look stale to Google. Stick to facts
 *   that change slowly.
 *
 * Tuple format (compact, easy to maintain):
 *   [slug, name, state, primaryCitySlug, enrollment, type, websiteDomain]
 *
 *   - slug:           URL slug (kebab-case-state-suffix)
 *   - name:           full official name as commonly written
 *   - state:          2-letter USPS code
 *   - primaryCitySlug: link into the cities catalog ("boston-ma") — used
 *                     to inherit weather coordinates and prediction data
 *   - enrollment:     approximate enrollment, rounded to nearest 1,000
 *   - type:           district structure (informs editorial content)
 *   - websiteDomain:  canonical web hostname; we display + link out
 */

export type DistrictType =
  | "city"        // single municipal district (e.g., Boston Public Schools)
  | "county"      // county-wide district (e.g., Fairfax County PS)
  | "unified"     // unified school district (e.g., LAUSD, common in CA)
  | "metro"       // metro/regional (e.g., Nashville-Davidson)
  | "isd"         // Independent School District (TX naming)
  | "state"       // statewide (e.g., Hawaii DOE)
  | "consolidated"; // consolidated multi-municipality

export type DistrictTuple = [
  slug: string,
  name: string,
  state: string,
  primaryCitySlug: string,
  enrollment: number,
  type: DistrictType,
  websiteDomain: string,
];

export const DISTRICTS: DistrictTuple[] = [
  // ─── TIER 1: Top 30 by enrollment (regardless of snow climate) ─────────────
  ["nyc-doe-ny", "New York City Department of Education", "NY", "new-york-ny", 915000, "city", "schools.nyc.gov"],
  ["lausd-ca", "Los Angeles Unified School District", "CA", "los-angeles-ca", 430000, "unified", "lausd.org"],
  ["miami-dade-fl", "Miami-Dade County Public Schools", "FL", "miami-fl", 334000, "county", "dadeschools.net"],
  ["cps-il", "Chicago Public Schools", "IL", "chicago-il", 322000, "city", "cps.edu"],
  ["clark-county-nv", "Clark County School District", "NV", "las-vegas-nv", 302000, "county", "ccsd.net"],
  ["broward-county-fl", "Broward County Public Schools", "FL", "fort-lauderdale-fl", 257000, "county", "browardschools.com"],
  ["hillsborough-county-fl", "Hillsborough County Public Schools", "FL", "tampa-fl", 220000, "county", "hillsboroughschools.org"],
  ["orange-county-fl", "Orange County Public Schools", "FL", "orlando-fl", 206000, "county", "ocps.net"],
  ["palm-beach-fl", "Palm Beach County Public Schools", "FL", "west-palm-beach-fl", 191000, "county", "palmbeachschools.org"],
  ["houston-isd-tx", "Houston Independent School District", "TX", "houston-tx", 189000, "isd", "houstonisd.org"],
  ["fairfax-county-va", "Fairfax County Public Schools", "VA", "fairfax-va", 178000, "county", "fcps.edu"],
  ["gwinnett-county-ga", "Gwinnett County Public Schools", "GA", "lawrenceville-ga", 177000, "county", "gcpsk12.org"],
  ["hawaii-doe-hi", "Hawaii Department of Education", "HI", "honolulu-hi", 167000, "state", "hawaiipublicschools.org"],
  ["wake-county-nc", "Wake County Public School System", "NC", "raleigh-nc", 159000, "county", "wcpss.net"],
  ["montgomery-county-md", "Montgomery County Public Schools", "MD", "rockville-md", 159000, "county", "montgomeryschoolsmd.org"],
  ["dallas-isd-tx", "Dallas Independent School District", "TX", "dallas-tx", 145000, "isd", "dallasisd.org"],
  ["charlotte-mecklenburg-nc", "Charlotte-Mecklenburg Schools", "NC", "charlotte-nc", 141000, "consolidated", "cms.k12.nc.us"],
  ["prince-georges-md", "Prince George's County Public Schools", "MD", "upper-marlboro-md", 133000, "county", "pgcps.org"],
  ["duval-county-fl", "Duval County Public Schools", "FL", "jacksonville-fl", 129000, "county", "dcps.duvalschools.org"],
  ["philadelphia-pa", "School District of Philadelphia", "PA", "philadelphia-pa", 117000, "city", "philasd.org"],
  ["cypress-fairbanks-tx", "Cypress-Fairbanks Independent School District", "TX", "houston-tx", 117000, "isd", "cfisd.net"],
  ["baltimore-county-md", "Baltimore County Public Schools", "MD", "towson-md", 111000, "county", "bcps.org"],
  ["cobb-county-ga", "Cobb County School District", "GA", "marietta-ga", 110000, "county", "cobbk12.org"],
  ["polk-county-fl", "Polk County Public Schools", "FL", "lakeland-fl", 108000, "county", "polkschoolsfl.com"],
  ["northside-isd-tx", "Northside Independent School District", "TX", "san-antonio-tx", 104000, "isd", "nisd.net"],
  ["pinellas-county-fl", "Pinellas County Schools", "FL", "largo-fl", 99000, "county", "pcsb.org"],
  ["dekalb-county-ga", "DeKalb County School District", "GA", "decatur-ga", 93000, "county", "dekalbschoolsga.org"],
  ["jefferson-county-co", "Jefferson County Public Schools", "CO", "golden-co", 84000, "county", "jeffcopublicschools.org"],
  ["jefferson-county-ky", "Jefferson County Public Schools", "KY", "louisville-ky", 96000, "county", "jefferson.kyschools.us"],
  ["fulton-county-ga", "Fulton County Schools", "GA", "atlanta-ga", 92000, "county", "fultonschools.org"],

  // ─── TIER 2: Snow-belt — Northeast (highest snow-day search density) ──────
  ["boston-public-ma", "Boston Public Schools", "MA", "boston-ma", 49000, "city", "bostonpublicschools.org"],
  ["worcester-public-ma", "Worcester Public Schools", "MA", "worcester-ma", 25000, "city", "worcesterschools.org"],
  ["springfield-public-ma", "Springfield Public Schools", "MA", "springfield-ma", 24000, "city", "springfieldpublicschools.com"],
  ["newton-public-ma", "Newton Public Schools", "MA", "newton-ma", 12000, "city", "newton.k12.ma.us"],
  ["cambridge-public-ma", "Cambridge Public Schools", "MA", "cambridge-ma", 7000, "city", "cpsd.us"],
  ["buffalo-public-ny", "Buffalo Public Schools", "NY", "buffalo-ny", 31000, "city", "buffaloschools.org"],
  ["rochester-public-ny", "Rochester City School District", "NY", "rochester-ny", 23000, "city", "rcsdk12.org"],
  ["syracuse-public-ny", "Syracuse City School District", "NY", "syracuse-ny", 19000, "city", "syracusecityschools.com"],
  ["albany-public-ny", "City School District of Albany", "NY", "albany-ny", 9000, "city", "albanyschools.org"],
  ["yonkers-public-ny", "Yonkers Public Schools", "NY", "yonkers-ny", 26000, "city", "yonkerspublicschools.org"],
  ["newark-public-nj", "Newark Public Schools", "NJ", "newark-nj", 39000, "city", "nps.k12.nj.us"],
  ["jersey-city-public-nj", "Jersey City Public Schools", "NJ", "jersey-city-nj", 27000, "city", "jcboe.org"],
  ["paterson-public-nj", "Paterson Public Schools", "NJ", "paterson-nj", 24000, "city", "paterson.k12.nj.us"],
  ["hartford-public-ct", "Hartford Public Schools", "CT", "hartford-ct", 17000, "city", "hartfordschools.org"],
  ["new-haven-public-ct", "New Haven Public Schools", "CT", "new-haven-ct", 19000, "city", "nhps.net"],
  ["bridgeport-public-ct", "Bridgeport Public Schools", "CT", "bridgeport-ct", 19000, "city", "bridgeportedu.net"],
  ["stamford-public-ct", "Stamford Public Schools", "CT", "stamford-ct", 16000, "city", "stamfordpublicschools.org"],
  ["providence-public-ri", "Providence Public Schools", "RI", "providence-ri", 21000, "city", "providenceschools.org"],
  ["portland-public-me", "Portland Public Schools", "ME", "portland-me", 7000, "city", "portlandschools.org"],
  ["manchester-public-nh", "Manchester School District", "NH", "manchester-nh", 13000, "city", "mansd.org"],
  ["burlington-public-vt", "Burlington School District", "VT", "burlington-vt", 4000, "city", "bsdvt.org"],
  ["pittsburgh-public-pa", "Pittsburgh Public Schools", "PA", "pittsburgh-pa", 19000, "city", "pghschools.org"],
  ["allentown-public-pa", "Allentown School District", "PA", "allentown-pa", 17000, "city", "allentownsd.org"],
  ["reading-public-pa", "Reading School District", "PA", "reading-pa", 18000, "city", "readingsd.org"],
  ["scranton-public-pa", "Scranton School District", "PA", "scranton-pa", 10000, "city", "scrsd.org"],
  ["erie-public-pa", "Erie's Public Schools", "PA", "erie-pa", 11000, "city", "eriesd.org"],

  // ─── TIER 3: Snow-belt — Midwest ───────────────────────────────────────────
  ["detroit-public-mi", "Detroit Public Schools Community District", "MI", "detroit-mi", 49000, "city", "detroitk12.org"],
  ["grand-rapids-public-mi", "Grand Rapids Public Schools", "MI", "grand-rapids-mi", 14000, "city", "grps.org"],
  ["ann-arbor-public-mi", "Ann Arbor Public Schools", "MI", "ann-arbor-mi", 17000, "city", "a2schools.org"],
  ["lansing-public-mi", "Lansing Public Schools", "MI", "lansing-mi", 10000, "city", "lansingschools.net"],
  ["minneapolis-public-mn", "Minneapolis Public Schools", "MN", "minneapolis-mn", 28000, "city", "mpls.k12.mn.us"],
  ["saint-paul-public-mn", "Saint Paul Public Schools", "MN", "saint-paul-mn", 33000, "city", "spps.org"],
  ["duluth-public-mn", "Duluth Public Schools", "MN", "duluth-mn", 8000, "city", "isd709.org"],
  ["milwaukee-public-wi", "Milwaukee Public Schools", "WI", "milwaukee-wi", 67000, "city", "milwaukee.k12.wi.us"],
  ["madison-public-wi", "Madison Metropolitan School District", "WI", "madison-wi", 26000, "metro", "madison.k12.wi.us"],
  ["green-bay-public-wi", "Green Bay Area Public School District", "WI", "green-bay-wi", 19000, "city", "gbaps.org"],
  ["cleveland-metro-oh", "Cleveland Metropolitan School District", "OH", "cleveland-oh", 36000, "metro", "clevelandmetroschools.org"],
  ["columbus-public-oh", "Columbus City Schools", "OH", "columbus-oh", 47000, "city", "ccsoh.us"],
  ["cincinnati-public-oh", "Cincinnati Public Schools", "OH", "cincinnati-oh", 35000, "city", "cps-k12.org"],
  ["toledo-public-oh", "Toledo Public Schools", "OH", "toledo-oh", 21000, "city", "tps.org"],
  ["indianapolis-public-in", "Indianapolis Public Schools", "IN", "indianapolis-in", 21000, "city", "myips.org"],
  ["fort-wayne-public-in", "Fort Wayne Community Schools", "IN", "fort-wayne-in", 28000, "city", "fortwayneschools.org"],
  ["des-moines-public-ia", "Des Moines Public Schools", "IA", "des-moines-ia", 31000, "city", "dmschools.org"],
  ["omaha-public-ne", "Omaha Public Schools", "NE", "omaha-ne", 51000, "city", "ops.org"],
  ["kansas-city-public-mo", "Kansas City Public Schools", "MO", "kansas-city-mo", 14000, "city", "kcpublicschools.org"],
  ["st-louis-public-mo", "St. Louis Public Schools", "MO", "saint-louis-mo", 19000, "city", "slps.org"],

  // ─── TIER 4: Snow-belt — Mountain West + Pacific NW ────────────────────────
  ["denver-public-co", "Denver Public Schools", "CO", "denver-co", 88000, "city", "dpsk12.org"],
  ["colorado-springs-co", "Colorado Springs School District 11", "CO", "colorado-springs-co", 23000, "city", "d11.org"],
  ["aurora-public-co", "Aurora Public Schools", "CO", "aurora-co", 38000, "city", "aurorak12.org"],
  ["salt-lake-city-ut", "Salt Lake City School District", "UT", "salt-lake-city-ut", 21000, "city", "slcschools.org"],
  ["seattle-public-wa", "Seattle Public Schools", "WA", "seattle-wa", 49000, "city", "seattleschools.org"],
  ["portland-public-or", "Portland Public Schools", "OR", "portland-or", 45000, "city", "pps.net"],
  ["spokane-public-wa", "Spokane Public Schools", "WA", "spokane-wa", 30000, "city", "spokaneschools.org"],
  ["boise-public-id", "Boise School District", "ID", "boise-id", 24000, "city", "boiseschools.org"],
  ["anchorage-ak", "Anchorage School District", "AK", "anchorage-ak", 44000, "city", "asdk12.org"],

  // ─── TIER 5: Mid-Atlantic + DC ─────────────────────────────────────────────
  ["dc-public-dc", "District of Columbia Public Schools", "DC", "washington-dc", 49000, "city", "dcps.dc.gov"],
  ["baltimore-city-md", "Baltimore City Public Schools", "MD", "baltimore-md", 76000, "city", "baltimorecityschools.org"],
  ["anne-arundel-md", "Anne Arundel County Public Schools", "MD", "annapolis-md", 83000, "county", "aacps.org"],
  ["howard-county-md", "Howard County Public School System", "MD", "ellicott-city-md", 58000, "county", "hcpss.org"],
  ["arlington-public-va", "Arlington Public Schools", "VA", "arlington-va", 28000, "city", "apsva.us"],
  ["loudoun-county-va", "Loudoun County Public Schools", "VA", "leesburg-va", 81000, "county", "lcps.org"],
  ["prince-william-va", "Prince William County Public Schools", "VA", "manassas-va", 90000, "county", "pwcs.edu"],
  ["richmond-public-va", "Richmond Public Schools", "VA", "richmond-va", 22000, "city", "rvaschools.net"],
  ["nashville-davidson-tn", "Metro Nashville Public Schools", "TN", "nashville-tn", 81000, "metro", "mnps.org"],
  ["memphis-tn", "Memphis-Shelby County Schools", "TN", "memphis-tn", 110000, "consolidated", "scsk12.org"],
];
