/**
 * SnowSense™ Calibration Engine
 *
 * Applies calibration modifiers to the base prediction:
 * - daysUsed: Historical snow day usage (0-10)
 * - type: School type (public vs private)
 *
 * These are "intelligence tuning" inputs, not preferences.
 * They affect the final probability deterministically.
 *
 * All state lives in the URL. No persistence layer.
 */

import type { SchoolType } from "@/types/snow";

/** Default calibration values */
export const CALIBRATION_DEFAULTS: { daysUsed: number; type: SchoolType } = {
  daysUsed: 2,
  type: "public",
};

/** Valid ranges */
export const DAYS_USED_MIN = 0;
export const DAYS_USED_MAX = 10;

/**
 * Calculate the calibration modifier for snow days used.
 *
 * Logic: If a district has already used many snow days,
 * they're MORE likely to cancel (protecting remaining days)
 * at low usage, and LESS likely at high usage (they're "strict" now).
 *
 * - 0 days used → +8 (trigger-happy)
 * - 2 days used → +4 (baseline)
 * - 5 days used → 0 (neutral)
 * - 8 days used → -6 (conservative)
 * - 10 days used → -10 (very strict, almost out of days)
 */
export function getDaysUsedModifier(daysUsed: number): number {
  const clamped = Math.max(DAYS_USED_MIN, Math.min(DAYS_USED_MAX, daysUsed));
  // Linear interpolation: 0 → +8, 5 → 0, 10 → -10
  if (clamped <= 5) {
    return Math.round(8 - (clamped / 5) * 8);
  }
  return Math.round(-((clamped - 5) / 5) * 10);
}

/**
 * Calculate the school type modifier.
 *
 * Private schools typically close more easily (smaller bus fleets,
 * fewer resources for snow management, parent-driven decisions).
 * Public schools have district-wide protocols and higher thresholds.
 */
export function getSchoolTypeModifier(type: SchoolType): number {
  switch (type) {
    case "private":
      return +8; // More likely to close
    case "public":
      return 0;  // Baseline
  }
}

/**
 * Apply all calibration modifiers to a base probability.
 * Returns clamped 0-100.
 */
export function applyCalibration(
  baseProbability: number,
  daysUsed: number,
  type: SchoolType
): number {
  const daysModifier = getDaysUsedModifier(daysUsed);
  const typeModifier = getSchoolTypeModifier(type);
  const calibrated = baseProbability + daysModifier + typeModifier;
  return Math.max(0, Math.min(100, Math.round(calibrated)));
}

/**
 * Parse and validate calibration params from URL searchParams
 */
export function parseCalibrationFromURL(searchParams: {
  get: (key: string) => string | null;
}): { daysUsed: number; type: SchoolType } {
  // Parse daysUsed
  const rawDays = searchParams.get("daysUsed");
  let daysUsed = CALIBRATION_DEFAULTS.daysUsed;
  if (rawDays !== null) {
    const parsed = parseInt(rawDays, 10);
    if (!isNaN(parsed) && parsed >= DAYS_USED_MIN && parsed <= DAYS_USED_MAX) {
      daysUsed = parsed;
    }
  }

  // Parse type
  const rawType = searchParams.get("type");
  let type: SchoolType = CALIBRATION_DEFAULTS.type;
  if (rawType === "public" || rawType === "private") {
    type = rawType;
  }

  return { daysUsed, type };
}
