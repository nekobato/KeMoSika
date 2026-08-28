import { execFile } from "node:child_process";
import type { KeyboardLockState } from "@shared/app-api";

type KeyboardLockValues = Omit<KeyboardLockState, "revision">;
type LockStateKey = keyof KeyboardLockValues;

const WINDOWS_LOCK_STATE_SCRIPT = `
$signature = @'
[System.Runtime.InteropServices.DllImport("user32.dll")]
public static extern short GetKeyState(int virtualKey);
'@

Add-Type -MemberDefinition $signature -Name NativeKeyboard -Namespace KeMoSika

[pscustomobject]@{
  capsLock = (([KeMoSika.NativeKeyboard]::GetKeyState(0x14) -band 1) -ne 0)
  numLock = (([KeMoSika.NativeKeyboard]::GetKeyState(0x90) -band 1) -ne 0)
  scrollLock = (([KeMoSika.NativeKeyboard]::GetKeyState(0x91) -band 1) -ne 0)
} | ConvertTo-Json -Compress
`;

export const emptyKeyboardLockValues = (): KeyboardLockValues => ({
  capsLock: false,
  numLock: false,
  scrollLock: false
});

/** Parses the fixed JSON shape returned by the Windows lock-state probe. */
export const parseWindowsKeyboardLockState = (
  output: string
): KeyboardLockValues => {
  const value = JSON.parse(output.trim()) as unknown;

  if (
    value === null ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    !("capsLock" in value) ||
    !("numLock" in value) ||
    !("scrollLock" in value) ||
    typeof value.capsLock !== "boolean" ||
    typeof value.numLock !== "boolean" ||
    typeof value.scrollLock !== "boolean"
  ) {
    throw new Error("WindowsのLock状態を取得できませんでした。");
  }

  return {
    capsLock: value.capsLock,
    numLock: value.numLock,
    scrollLock: value.scrollLock
  };
};

const runWindowsLockStateProbe = (): Promise<string> =>
  new Promise((resolve, reject) => {
    execFile(
      "powershell.exe",
      ["-NoProfile", "-NonInteractive", "-Command", WINDOWS_LOCK_STATE_SCRIPT],
      { timeout: 3_000, windowsHide: true },
      (error, stdout) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(stdout);
      }
    );
  });

/** Reads the current persistent keyboard Lock states on Windows. */
export const readKeyboardLockState = async (): Promise<KeyboardLockValues> => {
  if (process.platform !== "win32") return emptyKeyboardLockValues();

  return parseWindowsKeyboardLockState(await runWindowsLockStateProbe());
};

/**
 * Tracks persistent Lock states while filtering auto-repeat key-down events.
 */
export const createKeyboardLockStateTracker = (
  lockKeyCodes: Readonly<Record<number, LockStateKey>>
) => {
  let state: KeyboardLockState = {
    ...emptyKeyboardLockValues(),
    revision: 0
  };
  const downKeyCodes = new Set<number>();

  const snapshot = (): KeyboardLockState => ({ ...state });

  const reset = (values: KeyboardLockValues): KeyboardLockState => {
    downKeyCodes.clear();
    state = {
      ...values,
      revision: state.revision + 1
    };
    return snapshot();
  };

  const press = (keyCode: number): KeyboardLockState | null => {
    const stateKey = lockKeyCodes[keyCode];
    if (!stateKey || downKeyCodes.has(keyCode)) return null;
    downKeyCodes.add(keyCode);

    state = {
      ...state,
      [stateKey]: !state[stateKey],
      revision: state.revision + 1
    };
    return snapshot();
  };

  const release = (keyCode: number): void => {
    downKeyCodes.delete(keyCode);
  };

  return { snapshot, reset, press, release };
};
