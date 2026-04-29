import { test, expect } from "./electron.fixture";

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

    expect(
      rendererConsole.filter((message) => message.startsWith("[pageerror]"))
    ).toEqual([]);
  });
});
