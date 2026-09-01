import assert from "node:assert/strict";
import test from "node:test";
import {
  SCROLL_ACTIVITY_HOLD_MS,
  createScrollActivityTracker,
  type ScrollActivityScheduler
} from "./useScrollActivity.ts";

const createScheduler = () => {
  let nextId = 0;
  const callbacks = new Map<number, () => void>();
  const delays = new Map<number, number>();

  const schedule: ScrollActivityScheduler = (callback, delay) => {
    const id = ++nextId;
    callbacks.set(id, callback);
    delays.set(id, delay);
    return () => callbacks.delete(id);
  };

  const run = (id: number): void => {
    const callback = callbacks.get(id);
    callbacks.delete(id);
    callback?.();
  };

  return { schedule, run, callbacks, delays };
};

test("shows one direction for the configured hold period", () => {
  const scheduler = createScheduler();
  const changes: string[][] = [];
  const tracker = createScrollActivityTracker({
    schedule: scheduler.schedule,
    onChange: (directions) => changes.push([...directions])
  });

  tracker.register("up");

  assert.deepEqual(changes, [["up"]]);
  assert.equal(scheduler.delays.get(1), SCROLL_ACTIVITY_HOLD_MS);
});

test("replaces the active direction on the same axis", () => {
  const scheduler = createScheduler();
  const tracker = createScrollActivityTracker({
    schedule: scheduler.schedule
  });

  tracker.register("up");
  tracker.register("down");

  assert.deepEqual(tracker.snapshot(), ["down"]);
  assert.equal(scheduler.callbacks.has(1), false);
});

test("keeps vertical and horizontal directions active independently", () => {
  const scheduler = createScheduler();
  const tracker = createScrollActivityTracker({
    schedule: scheduler.schedule
  });

  tracker.register("up");
  tracker.register("right");
  scheduler.run(1);

  assert.deepEqual(tracker.snapshot(), ["right"]);
  scheduler.run(2);
  assert.deepEqual(tracker.snapshot(), []);
});

test("refreshes a direction without allowing the stale timer to clear it", () => {
  const scheduler = createScheduler();
  const tracker = createScrollActivityTracker({
    schedule: scheduler.schedule
  });

  tracker.register("left");
  tracker.register("left");
  scheduler.run(1);

  assert.deepEqual(tracker.snapshot(), ["left"]);
  scheduler.run(2);
  assert.deepEqual(tracker.snapshot(), []);
});

test("reset clears activity and cancels pending expiry callbacks", () => {
  const scheduler = createScheduler();
  const tracker = createScrollActivityTracker({
    schedule: scheduler.schedule
  });

  tracker.register("down");
  tracker.register("left");
  tracker.reset();

  assert.deepEqual(tracker.snapshot(), []);
  assert.equal(scheduler.callbacks.size, 0);
});
