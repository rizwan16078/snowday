import {
  getTopCitiesByPopulation,
  type CityRecord,
} from "@/lib/cities/helpers";
import {
  formatEnrollment,
  getTopDistrictsByEnrollment,
  type DistrictRecord,
} from "@/lib/districts/helpers";

const HIGH_INTENT_CITY_SLUGS = new Set(
  getTopCitiesByPopulation(50).map((city) => city.slug),
);

const HIGH_INTENT_DISTRICT_SLUGS = new Set(
  getTopDistrictsByEnrollment(50).map((district) => district.slug),
);

export interface CityComparisonNote {
  slug: string;
  cityName: string;
  label: string;
  reason: string;
}

export interface DistrictComparisonNote {
  slug: string;
  districtName: string;
  label: string;
  reason: string;
}

export function isHighIntentCity(slug: string): boolean {
  return HIGH_INTENT_CITY_SLUGS.has(slug);
}

export function isHighIntentDistrict(slug: string): boolean {
  return HIGH_INTENT_DISTRICT_SLUGS.has(slug);
}

export function buildNearbyCityComparisonNotes(
  origin: CityRecord,
  nearby: Array<CityRecord & { distanceKm: number }>,
): CityComparisonNote[] {
  return nearby.slice(0, 3).map((city) => {
    const snowfallGap = origin.snowInches - city.snowInches;

    if (snowfallGap <= -12) {
      return {
        slug: city.slug,
        cityName: city.displayName,
        label: `${origin.name} usually closes sooner than ${city.name}`,
        reason: `${city.name} averages ${city.snowInches}" of snow a year versus ${origin.snowInches}" in ${origin.name}, so plows, families, and bus operations there are typically more winter-adapted before officials need to call school off.`,
      };
    }

    if (snowfallGap >= 12) {
      return {
        slug: city.slug,
        cityName: city.displayName,
        label: `${origin.name} often needs a bigger storm than ${city.name}`,
        reason: `${origin.name} sees roughly ${origin.snowInches}" of snow a year compared with ${city.snowInches}" in ${city.name}, which usually means local agencies and families in ${origin.name} are prepared to operate through heavier totals before crossing the closure line.`,
      };
    }

    if (origin.population >= city.population * 1.75) {
      return {
        slug: city.slug,
        cityName: city.displayName,
        label: `${origin.name} can wait longer on borderline calls than ${city.name}`,
        reason: `${origin.name} runs a much larger urban operation, so transit dependencies, staffing, and the downstream cost of closure all push decision-makers to hold off unless the forecast clearly threatens the morning commute.`,
      };
    }

    if (city.population >= origin.population * 1.75) {
      return {
        slug: city.slug,
        cityName: city.displayName,
        label: `${origin.name} may close sooner than ${city.name} on a marginal storm`,
        reason: `${city.name}'s larger school system can justify staying open deeper into a borderline event, while ${origin.name} can react more quickly when untreated secondary roads or neighborhood bus routes become the deciding factor.`,
      };
    }

    if (origin.state !== city.state) {
      return {
        slug: city.slug,
        cityName: city.displayName,
        label: `${origin.name} and ${city.name} can split on the same storm track`,
        reason: `Even when totals look similar, district policies, state operating norms, and how aggressively crews pre-treat neighborhood streets differ enough that nearby cities on opposite sides of a state line often make different school calls.`,
      };
    }

    return {
      slug: city.slug,
      cityName: city.displayName,
      label: `${origin.name} and ${city.name} often diverge on marginal storms`,
      reason: `That usually comes down to bus-route exposure, local hilliness, and how quickly each district can clear secondary roads rather than to headline snowfall totals alone.`,
    };
  });
}

export function buildDistrictComparisonNotes(
  origin: DistrictRecord,
  related: DistrictRecord[],
): DistrictComparisonNote[] {
  return related.slice(0, 3).map((district) => {
    const enrollmentGap = origin.enrollment - district.enrollment;
    const snowfallGap = origin.city.snowInches - district.city.snowInches;

    if (enrollmentGap >= district.enrollment * 0.8) {
      return {
        slug: district.slug,
        districtName: district.name,
        label: `${origin.name} usually needs a stronger trigger than ${district.name}`,
        reason: `${origin.name} serves ${formatEnrollment(origin.enrollment)} versus ${formatEnrollment(district.enrollment)} for ${district.name}, so the operational cost of closing is higher and officials tend to demand clearer safety risk before shutting the system down.`,
      };
    }

    if (-enrollmentGap >= origin.enrollment * 0.8) {
      return {
        slug: district.slug,
        districtName: district.name,
        label: `${origin.name} may close sooner than ${district.name}`,
        reason: `${district.name} is a much larger system, which usually makes leaders more reluctant to close for borderline events that a smaller district like ${origin.name} can call off more quickly.`,
      };
    }

    if (snowfallGap <= -10) {
      return {
        slug: district.slug,
        districtName: district.name,
        label: `${origin.name} is more sensitive to modest winter events than ${district.name}`,
        reason: `${district.city.name} averages ${district.city.snowInches}" of snow each year compared with ${origin.city.snowInches}" around ${origin.name}, so that district is usually more winter-hardened before it has to close buses and buildings.`,
      };
    }

    if (snowfallGap >= 10) {
      return {
        slug: district.slug,
        districtName: district.name,
        label: `${origin.name} usually needs a more substantial storm than ${district.name}`,
        reason: `${origin.city.name} averages ${origin.city.snowInches}" of snowfall a year compared with ${district.city.snowInches}" around ${district.name}, so officials in ${origin.name} are generally operating in a more winter-adapted environment.`,
      };
    }

    return {
      slug: district.slug,
      districtName: district.name,
      label: `${origin.name} and ${district.name} can still make different calls on the same forecast`,
      reason: `Independent leadership, different first-bell times, and neighborhood-level route exposure can make one district close while another nearby district stays open through the same winter event.`,
    };
  });
}
