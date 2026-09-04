import assert from "node:assert/strict";
import test from "node:test";
import {
  createLayoutBackgroundStyle,
  DEFAULT_LAYOUT_BACKGROUND_COLOR,
} from "./layoutBackground.ts";

test("uses the default color and no image for a missing background", () => {
  assert.deepEqual(createLayoutBackgroundStyle(), {
    "--layout-background-color": DEFAULT_LAYOUT_BACKGROUND_COLOR,
    "--layout-background-image": "none",
  });
});

test("creates background CSS variables from layout settings", () => {
  assert.deepEqual(
    createLayoutBackgroundStyle({
      color: "#123456",
      image: "background-image",
    }),
    {
      "--layout-background-color": "#123456",
      "--layout-background-image":
        'url("media://images/background-image.png")',
    },
  );
});

test("rejects an invalid image reference instead of emitting raw CSS syntax", () => {
  assert.equal(
    createLayoutBackgroundStyle({ color: "#ffffff", image: 'bad\")' })[
      "--layout-background-image"
    ],
    "none",
  );
});
