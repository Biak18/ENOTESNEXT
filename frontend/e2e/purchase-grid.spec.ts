import { readFileSync } from "node:fs";
import { strFromU8, unzipSync } from "fflate";
import { expect, test, type Page } from "@playwright/test";

const columns = {
  itemCode: "itemCode",
  description: "description",
  category: "category",
  location: "location",
  unit: "unit",
  quantity: "quantity",
  unitPrice: "unitPrice",
  amount: "amount",
} as const;

const grid = (page: Page) => page.locator(".enotes-ag-grid");

async function openPurchase(page: Page) {
  await page.goto("/");
  await page.getByPlaceholder("Search menu").fill("registration");
  await page
    .locator("#menu-group-purchase")
    .getByRole("button", { name: "Registration" })
    .dblclick();
  await grid(page).waitFor();
  await page
    .locator('.enotes-ag-grid [role="gridcell"], .enotes-ag-grid .ag-cell')
    .first()
    .waitFor();
  await page.waitForTimeout(300);
}

function cell(page: Page, rowIndex: number, colId: string) {
  return grid(page).locator(
    `.ag-center-cols-container [row-index="${rowIndex}"] [col-id="${colId}"]`,
  );
}

const editor = (page: Page) =>
  grid(page).locator(".ag-cell-inline-editing input, .ag-cell-editor input");

async function editCell(
  page: Page,
  rowIndex: number,
  colId: string,
  value: string,
) {
  await cell(page, rowIndex, colId).dblclick();
  await editor(page).first().waitFor();
  await page.keyboard.press("Control+a");
  await page.keyboard.type(value);
  await page.keyboard.press("Enter");
  await page.waitForTimeout(400);
}

test.describe("purchase grid", () => {
  test("renders the ENOTES columns and marks identifiers as read-only", async ({ page }) => {
    await openPurchase(page);

    const headers = await grid(page).locator(".ag-header-cell-text").allInnerTexts();
    expect(headers.join("|")).toContain("ITEM CODE");
    expect(headers.join("|")).toContain("LINE TOTAL");

    await expect(cell(page, 0, columns.itemCode)).toHaveClass(/enotes-readonly-cell/);
    await expect(cell(page, 0, columns.unit)).toHaveClass(/enotes-readonly-cell/);
    await expect(cell(page, 0, columns.amount)).toHaveClass(/enotes-readonly-cell/);
    await expect(cell(page, 0, columns.description)).not.toHaveClass(/enotes-readonly-cell/);
  });

  test("rejects an invalid quantity and keeps the previous value", async ({ page }) => {
    await openPurchase(page);
    await expect(cell(page, 0, columns.quantity)).toHaveText("24");

    await editCell(page, 0, columns.quantity, "0");

    await expect(page.locator(".po-validation")).toBeVisible();
    await expect(page.locator(".po-validation")).toContainText("Quantity");
    await expect(cell(page, 0, columns.quantity)).toHaveText("24");
  });

  test("accepts a valid quantity and recalculates the line total", async ({ page }) => {
    await openPurchase(page);

    await editCell(page, 0, columns.quantity, "30");

    await expect(cell(page, 0, columns.quantity)).toHaveText("30");
    await expect(cell(page, 0, columns.amount)).toHaveText("$144.00");
    await expect(page.locator(".po-validation")).toHaveCount(0);
  });

  test("does not open an editor for a read-only column", async ({ page }) => {
    await openPurchase(page);

    await cell(page, 0, columns.itemCode).dblclick();
    await page.waitForTimeout(500);

    await expect(editor(page)).toHaveCount(0);
    await expect(cell(page, 0, columns.itemCode)).toHaveText("ITM-1001");
  });

  test("supports keyboard navigation, edit start, and cancel", async ({ page }) => {
    await openPurchase(page);

    await cell(page, 0, columns.quantity).click();
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(300);
    await page.keyboard.press("Enter");
    await expect(editor(page).first()).toBeVisible();
    await page.keyboard.press("Control+a");
    await page.keyboard.type("99");
    await page.keyboard.press("Escape");
    await page.waitForTimeout(400);

    await expect(editor(page)).toHaveCount(0);
    await expect(cell(page, 0, columns.quantity)).toHaveText("24");
  });

  test("groups lines with feature-owned totals", async ({ page }) => {
    await openPurchase(page);

    await page.locator('[aria-label="Group purchase lines by"]').click();
    await page.getByRole("option", { name: "Category" }).click();

    await expect(page.locator(".po-group-summary").first()).toBeVisible();
    await expect(page.locator(".po-group-summary")).toHaveCount(5);
    await expect(page.locator(".po-group-summary").first()).toContainText("Filing");
  });

  test("adds and removes detail rows from the screen controls", async ({ page }) => {
    await openPurchase(page);

    const footer = page.locator(".po-total-row span").first();
    const initialCount = await footer.evaluate((node) =>
      (node.textContent ?? "").match(/(\d+) line items/)?.[1],
    );
    expect(initialCount).toBeTruthy();

    await page.getByRole("button", { name: "Add purchase line" }).click();
    await page.waitForTimeout(400);
    const afterAdd = await footer.evaluate((node) =>
      (node.textContent ?? "").match(/(\d+) line items/)?.[1],
    );
    expect(Number(afterAdd)).toBe(Number(initialCount) + 1);

    await page.getByRole("button", { name: "Delete focused purchase line" }).click();
    await page.waitForTimeout(400);
    const afterDelete = await footer.evaluate((node) =>
      (node.textContent ?? "").match(/(\d+) line items/)?.[1],
    );
    expect(Number(afterDelete)).toBe(Number(initialCount));
  });

  test("exports a genuine .xlsx workbook with numeric cells", async ({ page }) => {
    await openPurchase(page);

    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: "Excel" }).click(),
    ]);

    expect(download.suggestedFilename()).toBe("PO-2026-0184.xlsx");
    const path = await download.path();
    expect(path).toBeTruthy();
    const bytes = new Uint8Array(readFileSync(path!));
    expect(Array.from(bytes.slice(0, 2))).toEqual([0x50, 0x4b]);

    const files = unzipSync(bytes);
    expect(Object.keys(files)).toContain("xl/workbook.xml");
    const sheetName = Object.keys(files).find((name) => name.startsWith("xl/worksheets/sheet"));
    expect(sheetName).toBeTruthy();
    const sheet = strFromU8(files[sheetName!]);
    const shared = Object.keys(files).includes("xl/sharedStrings.xml")
      ? strFromU8(files["xl/sharedStrings.xml"])
      : "";
    expect(shared).toContain("ITM-1001");
    expect(shared).toContain("A4 Copy Paper, 80 gsm");
    expect(sheet).toContain("<v>24</v>");
    expect(sheet).toContain("<v>115.2</v>");
    expect(shared).not.toContain("po-line-1");
    expect(sheet).not.toContain("po-line-1");
  });

  test("keeps screen state when another tab is activated", async ({ page }) => {
    await openPurchase(page);

    await editCell(page, 0, columns.quantity, "42");
    await expect(cell(page, 0, columns.quantity)).toHaveText("42");

    await page.getByPlaceholder("Search menu").fill("products");
    await page
      .locator("#menu-group-inventory")
      .getByRole("button", { name: "Products" })
      .dblclick();
    await page.waitForTimeout(500);

    await page.getByRole("tab", { name: "Purchase registration" }).click();
    await page.waitForTimeout(500);
    await expect(
      page.locator(
        '.screen-instance:not([hidden]) .enotes-ag-grid [row-index="0"] [col-id="quantity"]',
      ),
    ).toHaveText("42");
  });
});
