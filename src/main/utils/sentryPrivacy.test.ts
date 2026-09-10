import assert from "node:assert/strict";
import { test } from "node:test";
import { redactLocalPaths, sanitizeSentryEvent } from "./sentryPrivacy.ts";

test("redacts local paths on all supported platforms, including spaces and file URLs", () => {
  for (const path of [
    "/Users/private-user/My Layout/private.png",
    "/home/private-user/private.png",
    "/Volumes/Private Disk/private.png",
    "C:\\Users\\private-user\\My Layout\\private.png",
    "C:/Users/private-user/private.png",
    "\\\\private-server\\share\\private.png",
    "file:///Users/private-user/My%20Layout/private.png",
    "file:///C:/Users/private-user/private.png",
    "~/private.png",
    "/Users/private-user/My (private) Layout/private.png",
  ]) {
    assert.equal(
      redactLocalPaths(`ENOENT: open '${path}'`),
      "ENOENT: open '[local-path]'",
    );
  }
  assert.equal(
    redactLocalPaths("app:///out/main/index.js"),
    "app:///out/main/index.js",
  );
  assert.equal(redactLocalPaths("TypeError: failed"), "TypeError: failed");
});

test("keeps useful stack coordinates and OS while excluding arbitrary payloads", () => {
  const result = sanitizeSentryEvent({
    type: undefined,
    release: "0.0.1",
    exception: {
      values: [{
        type: "Error",
        value: "open '/Users/private-user/private.png'",
        stacktrace: {
          frames: [{
            filename: "/Users/private-user/private.js",
            function: "loadLayout",
            lineno: 42,
            colno: 8,
            vars: { input: "private" },
            context_line: "private",
          }],
        },
      }],
    },
    contexts: {
      os: { name: "macOS", version: "15", private: "private" },
      vue: { propsData: "private" },
      device: { name: "private" },
    },
    extra: { layout: "private" },
    user: { username: "private" },
    request: { url: "file:///Users/private-user/private.png" },
    breadcrumbs: [{ message: "private" }],
    tags: { "event.process": "renderer", layout: "private" },
  });
  assert.equal(JSON.stringify(result).includes("private"), false);
  const frame = result.exception?.values?.[0].stacktrace?.frames?.[0];
  assert.equal(frame?.function, "loadLayout");
  assert.equal(frame?.lineno, 42);
  assert.equal(result.contexts?.os?.version, "15");
  assert.equal(result.tags?.["event.process"], "renderer");
  assert.equal(result.release, "0.0.1");
  assert.deepEqual(sanitizeSentryEvent(result), result);
});
