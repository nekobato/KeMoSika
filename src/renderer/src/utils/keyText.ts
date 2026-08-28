import type { KeyboardKeyTextData } from "@shared/types";

export type KeyboardModifierState = {
  shiftPressed: boolean;
  capsLockActive: boolean;
};

/**
 * Creates the initial Shift character from the normal character.
 * Only one lowercase ASCII letter is converted; other labels are preserved.
 */
export const getDefaultShiftCharacter = (normalCharacter: string): string =>
  /^[a-z]$/.test(normalCharacter)
    ? normalCharacter.toUpperCase()
    : normalCharacter;

/** Resolves the text shown for a key from its per-key modifier settings. */
export const resolveKeyboardKeyCharacter = (
  text: KeyboardKeyTextData,
  modifiers: KeyboardModifierState
): string => {
  const normalCharacter = text.character ?? text.normalCharacter ?? "";
  if (!text.shift?.isEnabled) return normalCharacter;

  const capsLockChangesCharacter =
    text.shift.changeOnCapsLock && modifiers.capsLockActive;
  const useShiftCharacter =
    modifiers.shiftPressed !== capsLockChangesCharacter;

  return useShiftCharacter
    ? text.shift.character
    : normalCharacter;
};
