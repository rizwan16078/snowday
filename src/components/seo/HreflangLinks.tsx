import { headers } from "next/headers";

/**
 * HreflangLinks — emits `<link rel="alternate" hreflang="...">` tags for the
 * current page. SnowSense is a single-language site (English, US-targeted),
 * so we emit `en` and `x-default` both pointing at the canonical URL.
 *
 * The current path is read from the `x-pathname` header set by the proxy in
 * `src/proxy.ts`. If unavailable (e.g. local dev without proxy), the
 * component falls back to the homepage URL — still valid hreflang.
 */
const SITE_URL = "https://www.snowdaycalculate.com";

export async function HreflangLinks() {
  const headerBag = await headers();
  const pathname = headerBag.get("x-pathname") ?? "/";

  // Strip query params and trailing slashes (except for the root path)
  // so hreflang URLs match the canonical URLs Next.js emits.
  const cleanPath = pathname.split("?")[0].split("#")[0];
  const normalized =
    cleanPath !== "/" && cleanPath.endsWith("/")
      ? cleanPath.slice(0, -1)
      : cleanPath;
  const href = `${SITE_URL}${normalized}`;

  return (
    <>
      <link rel="alternate" hrefLang="en" href={href} />
      <link rel="alternate" hrefLang="x-default" href={href} />
    </>
  );
}
