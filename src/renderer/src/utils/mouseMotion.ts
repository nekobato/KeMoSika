import {
  DEFAULT_MOUSE_SPEED_SENSITIVITY,
  MOUSE_FULL_SCALE_SPEED,
  MOUSE_SPEED_SENSITIVITY_RANGE
} from "../constants/mouseMotion.ts";

const INPUT_SMOOTHING_MS = 40;
const OUTWARD_SMOOTHING_MS = 45;
const RETURN_SMOOTHING_MS = 120;
const ANGLE_SMOOTHING_MS = 45;
const IDLE_AFTER_MS = 50;
const SAMPLE_RESET_AFTER_MS = 150;
const MAX_FRAME_DELTA_MS = 64;
const TRAIL_HISTORY_MS = 80;

/** Speeds below this value are visually indistinguishable from rest. */
export const MOUSE_MOTION_SETTLED_SPEED = 20;

export const MOUSE_TRAIL_LAYERS = [
  { delay: 24, opacity: 0.08 },
  { delay: 48, opacity: 0.04 }
] as const;

type Vector = Readonly<{
  x: number;
  y: number;
}>;

export type MousePositionSample = Readonly<{
  x: number;
  y: number;
  timestamp: number;
}>;

export type MouseMotionPose = Readonly<{
  angle: number;
  speed: number;
}>;

type TimedMouseMotionPose = MouseMotionPose &
  Readonly<{
    timestamp: number;
  }>;

export type MouseMotionVisualState = Readonly<{
  current: MouseMotionPose;
  trail: readonly MouseMotionPose[];
}>;

export type MouseMotionState = Readonly<{
  previousSample: MousePositionSample | null;
  targetVelocity: Vector;
  displayedSpeed: number;
  displayedAngle: number;
  lastInputAt: number | null;
  poseHistory: readonly TimedMouseMotionPose[];
}>;

type MouseMotionRegistration = Readonly<{
  state: MouseMotionState;
  hasMotion: boolean;
}>;

type MouseMotionStepOptions = Readonly<{
  timestamp: number;
  delta: number;
  reducedMotion: boolean;
}>;

type MouseMotionStep = Readonly<{
  state: MouseMotionState;
  visualState: MouseMotionVisualState;
  isSettled: boolean;
}>;

export const RESTING_MOUSE_MOTION: MouseMotionVisualState = {
  current: { angle: 0, speed: 0 },
  trail: []
};

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const vectorLength = ({ x, y }: Vector): number => Math.hypot(x, y);

const smoothingFactor = (delta: number, timeConstant: number): number =>
  1 - Math.exp(-clamp(delta, 0, MAX_FRAME_DELTA_MS) / timeConstant);

const normalizeAngle = (angle: number): number => {
  const fullTurn = Math.PI * 2;
  return ((((angle + Math.PI) % fullTurn) + fullTurn) % fullTurn) - Math.PI;
};

/** Interpolates two radians values along the shortest circular route. */
export const interpolateAngle = (
  from: number,
  to: number,
  progress: number
): number =>
  normalizeAngle(from + normalizeAngle(to - from) * clamp(progress, 0, 1));

/** Converts cursor speed into the radial 0–1 display range. */
export const speedToProgress = (
  speed: number,
  sensitivity = DEFAULT_MOUSE_SPEED_SENSITIVITY
): number => {
  const safeSensitivity = clamp(
    sensitivity,
    MOUSE_SPEED_SENSITIVITY_RANGE.min,
    MOUSE_SPEED_SENSITIVITY_RANGE.max
  );
  return clamp(
    (Math.max(0, speed) / MOUSE_FULL_SCALE_SPEED) *
      (safeSensitivity / DEFAULT_MOUSE_SPEED_SENSITIVITY),
    0,
    1
  );
};

/** Creates a stationary motion model ready to accept absolute cursor samples. */
export const createMouseMotionState = (): MouseMotionState => ({
  previousSample: null,
  targetVelocity: { x: 0, y: 0 },
  displayedSpeed: 0,
  displayedAngle: 0,
  lastInputAt: null,
  poseHistory: []
});

/** Registers an absolute cursor position without mutating the prior model. */
export const registerMousePosition = (
  state: MouseMotionState,
  sample: MousePositionSample
): MouseMotionRegistration => {
  const previousSample = state.previousSample;
  if (!previousSample) {
    return {
      state: { ...state, previousSample: sample },
      hasMotion: false
    };
  }

  const elapsed = sample.timestamp - previousSample.timestamp;
  if (elapsed <= 0 || elapsed > SAMPLE_RESET_AFTER_MS) {
    return {
      state: {
        ...state,
        previousSample: sample,
        targetVelocity: { x: 0, y: 0 }
      },
      hasMotion: false
    };
  }

  const distance = {
    x: sample.x - previousSample.x,
    y: sample.y - previousSample.y
  };
  if (distance.x === 0 && distance.y === 0) {
    return {
      state: { ...state, previousSample: sample },
      hasMotion: false
    };
  }

  const instantaneousVelocity = {
    x: (distance.x / elapsed) * 1000,
    y: (distance.y / elapsed) * 1000
  };
  const isRestarting =
    state.lastInputAt === null ||
    sample.timestamp - state.lastInputAt > SAMPLE_RESET_AFTER_MS;
  const inputBlend = isRestarting
    ? 1
    : smoothingFactor(elapsed, INPUT_SMOOTHING_MS);
  const targetVelocity = {
    x:
      state.targetVelocity.x +
      (instantaneousVelocity.x - state.targetVelocity.x) * inputBlend,
    y:
      state.targetVelocity.y +
      (instantaneousVelocity.y - state.targetVelocity.y) * inputBlend
  };

  return {
    state: {
      ...state,
      previousSample: sample,
      targetVelocity,
      lastInputAt: sample.timestamp
    },
    hasMotion: true
  };
};

const getPoseAt = (
  history: readonly TimedMouseMotionPose[],
  timestamp: number
): MouseMotionPose => {
  if (history.length === 0) return RESTING_MOUSE_MOTION.current;

  const nextIndex = history.findIndex((pose) => pose.timestamp >= timestamp);
  if (nextIndex === -1) return history[history.length - 1];
  if (nextIndex === 0) return history[0];

  const previous = history[nextIndex - 1];
  const next = history[nextIndex];
  const duration = next.timestamp - previous.timestamp;
  const progress = duration > 0 ? (timestamp - previous.timestamp) / duration : 1;
  return {
    angle: interpolateAngle(previous.angle, next.angle, progress),
    speed: previous.speed + (next.speed - previous.speed) * progress
  };
};

/** Advances the visual model by one animation frame. */
export const stepMouseMotion = (
  state: MouseMotionState,
  { timestamp, delta, reducedMotion }: MouseMotionStepOptions
): MouseMotionStep => {
  const targetSpeed = vectorLength(state.targetVelocity);
  const isIdle =
    state.lastInputAt === null || timestamp - state.lastInputAt >= IDLE_AFTER_MS;
  const desiredSpeed = isIdle ? 0 : targetSpeed;
  const speedTimeConstant =
    desiredSpeed > state.displayedSpeed
      ? OUTWARD_SMOOTHING_MS
      : RETURN_SMOOTHING_MS;
  const speedBlend = reducedMotion
    ? 1
    : smoothingFactor(delta, speedTimeConstant);
  const nextSpeed =
    state.displayedSpeed + (desiredSpeed - state.displayedSpeed) * speedBlend;
  const displayedSpeed =
    isIdle && nextSpeed < MOUSE_MOTION_SETTLED_SPEED
      ? 0
      : Math.max(0, nextSpeed);

  const hasDirection = !isIdle && targetSpeed > 0;
  const targetAngle = hasDirection
    ? Math.atan2(state.targetVelocity.y, state.targetVelocity.x)
    : state.displayedAngle;
  const displayedAngle = hasDirection
    ? interpolateAngle(
        state.displayedAngle,
        targetAngle,
        reducedMotion ? 1 : smoothingFactor(delta, ANGLE_SMOOTHING_MS)
      )
    : state.displayedAngle;
  const current = { angle: displayedAngle, speed: displayedSpeed };

  const poseHistory = reducedMotion
    ? []
    : [
        ...state.poseHistory.filter(
          (pose) => timestamp - pose.timestamp <= TRAIL_HISTORY_MS
        ),
        { ...current, timestamp }
      ];
  const trail = reducedMotion
    ? []
    : MOUSE_TRAIL_LAYERS.map(({ delay }) =>
        getPoseAt(poseHistory, timestamp - delay)
      );
  const isSettled =
    isIdle &&
    displayedSpeed === 0 &&
    trail.every((pose) => pose.speed < MOUSE_MOTION_SETTLED_SPEED);

  return {
    state: {
      ...state,
      displayedSpeed,
      displayedAngle,
      poseHistory
    },
    visualState: { current, trail },
    isSettled
  };
};
