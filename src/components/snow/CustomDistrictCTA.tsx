"use client";

import { useRouter } from "next/navigation";

interface Props {
  slug: string;
  daysUsed?: number;
  schoolType?: "public" | "private" | "charter";
}

/**
 * CustomDistrictCTA
 *
 * Client-side navigation button that opens the homepage calibration UI
 * with pre-filled state. Implemented as a <button> (not <a>) so the
 * parameterized URL is never emitted into static HTML — keeping crawlers
 * from discovering `/?loc=...&daysUsed=...&type=...` variants and
 * eliminating "Not Self-Referencing" / "Nofollow Incoming Only" audit warnings.
 */
export function CustomDistrictCTA({
  slug,
  daysUsed = 2,
  schoolType = "public",
}: Props) {
  const router = useRouter();

  const handleClick = () => {
    const target = `/?loc=${encodeURIComponent(slug)}&daysUsed=${daysUsed}&type=${schoolType}`;
    router.push(target);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="px-8 py-3 rounded-full font-bold text-sm text-white transition-all inline-block hover:scale-105 active:scale-95"
      style={{
        background: "linear-gradient(135deg,#1d4ed8,#3b82f6)",
        boxShadow: "0 4px 20px rgba(59,130,246,0.3)",
      }}
    >
      Check Custom District Settings
    </button>
  );
}
