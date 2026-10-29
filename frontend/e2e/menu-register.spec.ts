import { expect, test, type Page } from "@playwright/test";

async function openMenuItem(page: Page, name: string) {
  const item = page
    .getByRole("navigation", { name: "Main menu" })
    .getByRole("button")
    .filter({ hasText: name })
    .first();
  await item.waitFor();
  await item.click();
}

async function openMenuRegister(page: Page) {
  await page.goto("/");
  await openMenuItem(page, "Settings");
  await openMenuItem(page, "Menu register");
  await page.locator(".register-split").waitFor();
}

test.describe("menu register", () => {
  test("opens a split tree/detail layout and edits a menu", async ({ page }) => {
    await openMenuRegister(page);

    await expect(page.locator(".register-list")).toBeVisible();
    await expect(page.locator(".register-details")).toBeVisible();

    // Select an entry; the detail form reflects it in its field values.
    await page.getByRole("option", { name: /Products/ }).click();
    await expect(page.getByLabel("Menu Code")).toHaveValue("MN-021");
    await expect(page.getByLabel("Menu Name")).toHaveValue("Products");

    // Local filter narrows the list.
    await page.getByPlaceholder("Search menu name").fill("stock");
    await expect(page.getByRole("option")).toHaveCount(1);
    await expect(page.getByRole("option")).toContainText("Stock Balance");
  });

  test("toolbar search focuses this screen's own search field", async ({
    page,
  }) => {
    await openMenuRegister(page);
    await page.getByRole("button", { name: "Search" }).click();
    await expect(page.getByPlaceholder("Search menu name")).toBeFocused();
  });
});
