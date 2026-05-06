import type { Page } from "@playwright/test";
import { test, expect } from "./electron.fixture";

/**
 * Returns the distance between the preview viewport center and layout center.
 */
const getPreviewCenterOffset = async (
  appWindow: Page
): Promise<{ x: number; y: number }> =>
  await appWindow.locator(".preview-container").evaluate((container) => {
    const preview = container.querySelector<HTMLElement>(
      "[data-testid='layout-preview']"
    );

    if (!preview) {
      throw new Error("layout preview was not found");
    }

    const viewportCenterX =
      container.scrollLeft + container.clientWidth / 2;
    const viewportCenterY =
      container.scrollTop + container.clientHeight / 2;
    const previewCenterX = preview.offsetLeft + preview.offsetWidth / 2;
    const previewCenterY = preview.offsetTop + preview.offsetHeight / 2;

    return {
      x: viewportCenterX - previewCenterX,
      y: viewportCenterY - previewCenterY
    };
  });

/**
 * Asserts that the selected layout is centered in the scrollable preview area.
 */
const expectPreviewCentered = async (appWindow: Page): Promise<void> => {
  await expect(async () => {
    const offset = await getPreviewCenterOffset(appWindow);
    expect(Math.abs(offset.x)).toBeLessThanOrEqual(1);
    expect(Math.abs(offset.y)).toBeLessThanOrEqual(1);
  }).toPass();
};

test.describe("KeMoSika editor", () => {
  test("renders the default editor screen", async ({
    appWindow,
    rendererConsole
  }) => {
    await expect(appWindow).toHaveTitle("KeMoSika");
    await expect(appWindow.locator("#app")).toBeVisible();
    await expect(appWindow.getByText("新しいレイアウト").first()).toBeVisible();
    await expect(
      appWindow.getByRole("button", { name: "新規作成" })
    ).toBeVisible();
    await expect(appWindow.locator(".preview")).toHaveCSS("width", "800px");
    await expectPreviewCentered(appWindow);

    await appWindow.getByText("ANSI US 60%", { exact: true }).click();
    await expect(appWindow).toHaveURL(/layoutId=builtin-ansi-us-60/);
    await expectPreviewCentered(appWindow);

    expect(
      rendererConsole.filter((message) => message.startsWith("[pageerror]"))
    ).toEqual([]);
  });
});
