import { readonly, shallowRef } from "vue";
import { usePreferredReducedMotion, useRafFn } from "@vueuse/core";
import {
  RESTING_MOUSE_MOTION,
  createMouseMotionState,
  registerMousePosition,
  stepMouseMotion,
  type MouseMotionVisualState
} from "@/utils/mouseMotion";

/**
 * Converts absolute mouse positions into one shared, time-based visual state.
 * The animation loop only runs while movement or a visible trail remains.
 */
export const useMouseMotion = () => {
  let state = createMouseMotionState();
  const motion = shallowRef<MouseMotionVisualState>(RESTING_MOUSE_MOTION);
  const preferredMotion = usePreferredReducedMotion();
  const { isActive, pause, resume } = useRafFn(
    ({ delta, timestamp }) => {
      const frame = stepMouseMotion(state, {
        timestamp,
        delta,
        reducedMotion: preferredMotion.value === "reduce"
      });
      state = frame.state;
      motion.value = frame.visualState;
      if (frame.isSettled) pause();
    },
    { immediate: false }
  );

  const registerPosition = (
    x: number,
    y: number,
    timestamp = performance.now()
  ): void => {
    const registration = registerMousePosition(state, { x, y, timestamp });
    state = registration.state;
    if (registration.hasMotion) resume();
  };

  return {
    motion: readonly(motion),
    isActive,
    registerPosition
  };
};
