/**
 * BreadcrumbList JSON-LD helpers.
 *
 * Why: Google uses BreadcrumbList structured data to render breadcrumb trails
 * directly in search results — substantial CTR boost on mobile, where the
 * URL line otherwise appears as a long ugly path.
 *
 * Spec: https://schema.org/BreadcrumbList
 */

const SITE = "https://www.snowdaycalculate.com";

export interface Crumb {
  /** Visible label, e.g., "Boston, MA". */
  name: string;
  /** Path relative to site root, e.g., "/snow-day-calculator/boston-ma". */
  path: string;
}

/**
 * Build a BreadcrumbList schema. The final crumb is the current page; it
 * still needs an `item` URL per Google's guidance.
 */
export function breadcrumbListSchema(crumbs: Crumb[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: `${SITE}${c.path}`,
    })),
  };
}
