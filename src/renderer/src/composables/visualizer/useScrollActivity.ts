import { onScopeDispose, readonly, ref } from "vue";
import type { ScrollDirection } from "@shared/types";

export const SCROLL_ACTIVITY_HOLD_MS = 120;

type ScrollAxis = "vertical" | "horizontal";
type CancelScheduledCallback = () => void;

/** Schedules an expiry callback and returns its cancellation function. */
export type ScrollActivityScheduler = (
  callback: () => void,
  delay: number
) => CancelScheduledCallback;

type ScrollActivityTrackerOptions = {
  holdMs?: number;
  schedule?: ScrollActivityScheduler;
  onChange?: (directions: readonly ScrollDirection[]) => void;
};

const getAxis = (direction: ScrollDirection): ScrollAxis =>
  direction === "up" || direction === "down"
    ? "vertical"
    : "horizontal";

const scheduleTimeout: ScrollActivityScheduler = (callback, delay) => {
  const timeout = window.setTimeout(callback, delay);
  return () => window.clearTimeout(timeout);
};

/**
 * Tracks one active direction per axis. Registering another event refreshes
 * that axis without affecting a simultaneously active orthogonal direction.
 */
export const createScrollActivityTracker = ({
  holdMs = SCROLL_ACTIVITY_HOLD_MS,
  schedule = scheduleTimeout,
  onChange = () => undefined
}: ScrollActivityTrackerOptions = {}) => {
  const active: Record<ScrollAxis, ScrollDirection | null> = {
    vertical: null,
    horizontal: null
  };
  const cancelExpiry: Record<ScrollAxis, CancelScheduledCallback | null> = {
    vertical: null,
    horizontal: null
  };

  const snapshot = (): ScrollDirection[] =>
    [active.vertical, active.horizontal].filter(
      (direction): direction is ScrollDirection => direction !== null
    );

  const notify = (): void => onChange(snapshot());

  const register = (direction: ScrollDirection): void => {
    const axis = getAxis(direction);
    cancelExpiry[axis]?.();
    active[axis] = direction;
    notify();

    cancelExpiry[axis] = schedule(() => {
      cancelExpiry[axis] = null;
      active[axis] = null;
      notify();
    }, holdMs);
  };

  const reset = (): void => {
    const hadActivity = active.vertical !== null || active.horizontal !== null;
    cancelExpiry.vertical?.();
    cancelExpiry.horizontal?.();
    cancelExpiry.vertical = null;
    cancelExpiry.horizontal = null;
    active.vertical = null;
    active.horizontal = null;
    if (hadActivity) notify();
  };

  return { register, reset, snapshot };
};

/** Provides scope-bound reactive scroll activity for the visualizer. */
export const useScrollActivity = () => {
  const directions = ref<ScrollDirection[]>([]);
  const tracker = createScrollActivityTracker({
    onChange: (nextDirections) => {
      directions.value = [...nextDirections];
    }
  });

  onScopeDispose(tracker.reset);

  return {
    directions: readonly(directions),
    registerDirection: tracker.register
  };
};
