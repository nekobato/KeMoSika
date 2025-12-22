import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const MAX_BUFFER = 1024 * 1024 * 10;

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
 * Execute a command and return stdout or null when it fails.
 */
const tryExec = async (
  command: string,
  args: string[]
): Promise<string | null> => {
  try {
    const { stdout } = await execFileAsync(command, args, {
      windowsHide: true,
      maxBuffer: MAX_BUFFER
    });
    return stdout;
  } catch {
    return null;
  }
};

/**
 * Parse output from fc-list into font family names.
 */
const parseFcListOutput = (output: string): string[] => {
  return output
    .split(/\r?\n/)
    .flatMap((line) => {
      const trimmed = line.trim();
      if (!trimmed) return [];
      const raw = trimmed.includes(":")
        ? (trimmed.split(":").pop() ?? "").trim()
        : trimmed;
      return raw
        .split(",")
        .map((font) => font.trim())
        .filter((font) => font.length > 0);
    })
    .filter((font) => font.length > 0);
};

/**
 * Parse output from system_profiler to get font family names.
 */
const parseSystemProfilerOutput = (output: string): string[] => {
  const lines = output.split(/\r?\n/).map((line) => line.trim());
  const families = lines
    .filter((line) => line.startsWith("Family:"))
    .map((line) => line.replace("Family:", "").trim())
    .filter((font) => font.length > 0);

  if (families.length > 0) {
    return families;
  }

  return lines
    .filter((line) => line.startsWith("Full Name:"))
    .map((line) => line.replace("Full Name:", "").trim())
    .filter((font) => font.length > 0);
};

/**
 * Sanitize Windows registry font names for CSS font-family usage.
 */
const sanitizeWindowsFontName = (name: string): string => {
  return name.replace(/\s*\((TrueType|OpenType|Type1)\)\s*$/i, "").trim();
};

/**
 * Parse PowerShell output from Windows font registry queries.
 */
const parseWindowsRegistryOutput = (output: string): string[] => {
  const trimmed = output.trim();
  if (!trimmed) return [];

  try {
    const parsed = JSON.parse(trimmed);
    const list = Array.isArray(parsed) ? parsed : [parsed];
    return list.map((entry) => sanitizeWindowsFontName(String(entry)));
  } catch {
    return trimmed
      .split(/\r?\n/)
      .map((line) => sanitizeWindowsFontName(line))
      .filter((line) => line.length > 0);
  }
};

/**
 * Load system font families using platform-specific methods.
 */
const loadSystemFonts = async (): Promise<string[]> => {
  if (process.platform === "win32") {
    const script = [
      "$paths = @('HKLM:\\\\SOFTWARE\\\\Microsoft\\\\Windows NT\\\\CurrentVersion\\\\Fonts','HKCU:\\\\SOFTWARE\\\\Microsoft\\\\Windows NT\\\\CurrentVersion\\\\Fonts')",
      "$names = foreach ($path in $paths) { if (Test-Path $path) { (Get-ItemProperty -Path $path).PSObject.Properties | Where-Object { $_.Name -notmatch '^PS' } | ForEach-Object { $_.Name } } }",
      "$names | ConvertTo-Json -Compress"
    ].join("; ");
    const output = await tryExec("powershell", ["-NoProfile", "-Command", script]);
    return output ? normalizeFontNames(parseWindowsRegistryOutput(output)) : [];
  }

  const fcListOutput = await tryExec("fc-list", [":", "family"]);
  if (fcListOutput) {
    return normalizeFontNames(parseFcListOutput(fcListOutput));
  }

  if (process.platform === "darwin") {
    const profilerOutput = await tryExec("system_profiler", ["SPFontsDataType"]);
    return profilerOutput
      ? normalizeFontNames(parseSystemProfilerOutput(profilerOutput))
      : [];
  }

  return [];
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
