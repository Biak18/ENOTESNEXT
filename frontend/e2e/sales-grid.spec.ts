import { expect, test, type Page } from "@playwright/test";

const columns = {
  itemCode: "itemCode",
  quantity: "quantity",
  amount: "amount",
} as const;

const grid = (page: Page) =>
  page.locator(".screen-instance:not([hidden]) .enotes-ag-grid");

async function openSales(page: Page) {
  await page.goto("/");
  await page.getByPlaceholder("Search menu").fill("sales");
  await page
    .locator("#menu-group-sales")
    .getByRole("button", { name: "Registration" })
    .dblclick();
  await grid(page).waitFor();
  await page
    .locator(".screen-instance:not([hidden]) .enotes-ag-grid .ag-cell")
    .first()
    .waitFor();
  await page.waitForTimeout(300);
}

function cell(page: Page, rowIndex: number, colId: string) {
  return grid(page).locator(
    `.ag-center-cols-container [row-index="${rowIndex}"] [col-id="${colId}"]`,
  );
}

test.describe("sales grid", () => {
  test("renders the invoice lines with a derived line total", async ({
    page,
  }) => {
    await openSales(page);
    await expect(cell(page, 0, columns.itemCode)).toHaveText("ITM-1001");
    await expect(cell(page, 0, columns.amount)).toHaveText("$224.00");
    await expect(cell(page, 0, columns.itemCode)).toHaveClass(
      /enotes-readonly-cell/,
    );
  });

  test("rejects a non-positive quantity and keeps the previous value", async ({
    page,
  }) => {
    await openSales(page);
    await expect(cell(page, 0, columns.quantity)).toHaveText("40");

    await cell(page, 0, columns.quantity).dblclick();
    const editor = grid(page).locator(
      ".ag-cell-inline-editing input, .ag-cell-editor input",
    );
    await editor.first().waitFor();
    await page.keyboard.press("Control+a");
    await page.keyboard.type("0");
    await page.keyboard.press("Enter");
    await page.waitForTimeout(400);

    await expect(page.locator(".po-validation")).toBeVisible();
    await expect(page.locator(".po-validation")).toContainText("Quantity");
    await expect(cell(page, 0, columns.quantity)).toHaveText("40");
  });
});
