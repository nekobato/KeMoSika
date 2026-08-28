import type { KeyActivationMode } from "@shared/types";
import type { KeyboardLockState } from "@shared/app-api";

type LockStateValues = Pick<
  KeyboardLockState,
  "capsLock" | "numLock" | "scrollLock"
>;

const lockCodeEntries = [
  ["capsLock", "capslock"],
  ["numLock", "numlock"],
  ["scrollLock", "scrolllock"]
] as const satisfies readonly (readonly [keyof LockStateValues, string])[];

/** Combines physically held keys with Lock keys whose toggle state is on. */
export const getActiveKeyboardCodes = (
  downKeys: readonly string[],
  lockState: LockStateValues
): string[] => [
  ...new Set([
    ...downKeys,
    ...lockCodeEntries
      .filter(([stateKey]) => lockState[stateKey])
      .map(([, code]) => code)
  ])
];

/**
 * Returns whether a keyboard item should be active for the current pressed keys.
 * Empty key entries are ignored, and a key item without usable entries stays inactive.
 */
export const isKeyboardKeyActive = (
  codes: readonly string[],
  downKeys: readonly string[],
  mode: KeyActivationMode = "any"
): boolean => {
  const configuredCodes = codes.filter((code) => code.length > 0);
  if (configuredCodes.length === 0) return false;

  const isDown = (code: string): boolean => downKeys.includes(code);
  return mode === "all"
    ? configuredCodes.every(isDown)
    : configuredCodes.some(isDown);
};
