import { expect, test } from "@playwright/test";

test("purchase rows can be added and deleted", async ({ page }) => {
  await page.goto("/");
  await page.getByPlaceholder("Search menu").fill("registration");
  await page
    .locator("#menu-group-purchase")
    .getByRole("button", { name: "Registration" })
    .dblclick();
  await page.locator(".enotes-ag-grid").waitFor();
  await page.waitForTimeout(800);

  const footer = page.locator(".po-total-row span").first();
  const initialCount = await footer.evaluate((node) =>
    (node.textContent ?? "").match(/(\d+) line items/)?.[1],
  );

  await page.getByRole("button", { name: "Add purchase line" }).click();
  await page.waitForTimeout(600);

  const afterAdd = await footer.evaluate((node) =>
    (node.textContent ?? "").match(/(\d+) line items/)?.[1],
  );
  await page.getByRole("button", { name: "Delete focused purchase line" }).click();
  await page.waitForTimeout(600);

  const afterDelete = await footer.evaluate((node) =>
    (node.textContent ?? "").match(/(\d+) line items/)?.[1],
  );
  expect(afterAdd).toBe(String(Number(initialCount) + 1));
  expect(afterDelete).toBe(initialCount);
});
