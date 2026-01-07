import { getFonts } from "font-list";

/**
 * Normalize font names by trimming, filtering, deduping, and sorting.
 */
const normalizeFontNames = (fonts: string[]): string[] => {
  const normalized = fonts
    .map((font) => font.trim())
    .filter((font) => font.length > 0);

  return Array.from(new Set(normalized)).sort((a, b) =>
    a.localeCompare(b)
  );
};

/**
 * Load system font families using platform-specific methods.
 */
const loadSystemFonts = async (): Promise<string[]> => {
  try {
    const fonts = await getFonts({ disableQuoting: true });
    return normalizeFontNames(fonts);
  } catch (error) {
    console.error("getFonts failed", error);
    return [];
  }
};

let cachedFonts: string[] | null = null;
let pendingFonts: Promise<string[]> | null = null;

/**
 * Get cached system font families or load them once.
 */
export const listSystemFonts = async (): Promise<string[]> => {
  if (cachedFonts) {
    return cachedFonts;
  }

  if (!pendingFonts) {
    pendingFonts = loadSystemFonts()
      .then((fonts) => {
        cachedFonts = fonts;
        return fonts;
      })
      .finally(() => {
        pendingFonts = null;
      });
  }

  return pendingFonts;
};
