export const THEME_COOKIE = "rmp_theme";
export const THEME_STORAGE_KEY = "rmp_theme";

export type AppTheme = "dark" | "light";

export const DEFAULT_THEME: AppTheme = "dark";

export function getTheme(value?: string | null): AppTheme {
  return value === "light" ? "light" : DEFAULT_THEME;
}
