/**
 * SEO meta-tag length helpers.
 *
 * Google generally truncates titles at ~60 characters and descriptions at
 * ~155 characters in SERP snippets. Length budgets:
 *   - title:       ≤ 60 chars (target 50–58)
 *   - description: ≤ 155 chars (target 140–155)
 *
 * Both helpers truncate at a word boundary and append an ellipsis only when
 * the input exceeds the limit. They never extend the string.
 */

const ELLIPSIS = "…";

function truncateAtWord(text: string, max: number): string {
  if (text.length <= max) return text;
  const sliced = text.slice(0, max - 1);
  const lastSpace = sliced.lastIndexOf(" ");
  // If there's a word boundary in the last ~25% of the slice, cut there;
  // otherwise cut at the hard limit. Avoids ugly mid-word cuts.
  const cutoff = lastSpace > max * 0.75 ? lastSpace : sliced.length;
  return sliced.slice(0, cutoff).replace(/[,;:.\s—-]+$/u, "") + ELLIPSIS;
}

/** Truncate a meta title to fit Google's ~60-char SERP budget. */
export function trimMetaTitle(title: string, max = 60): string {
  return truncateAtWord(title.trim(), max);
}

/** Truncate a meta description to fit Google's ~155-char SERP budget. */
export function trimMetaDescription(description: string, max = 155): string {
  return truncateAtWord(description.trim(), max);
}
