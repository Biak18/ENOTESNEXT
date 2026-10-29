import { expect, test } from "@playwright/test";

test("header can collapse and restore the menu without losing its search", async ({
  page,
}) => {
  await page.goto("/");

  const menuSearch = page.getByRole("combobox", { name: "Search menu" });
  await menuSearch.fill("product");

  await page.getByRole("button", { name: "Collapse menu" }).click();
  await expect(page.getByRole("navigation", { name: "Main menu" })).toBeHidden();

  await page.getByRole("button", { name: "Expand menu" }).click();
  await expect(page.getByRole("navigation", { name: "Main menu" })).toBeVisible();
  await expect(menuSearch).toHaveValue("product");
});

test("header menu search opens a matching screen", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("combobox", { name: "Search menu" }).fill("Products");
  await page.getByRole("option", { name: "Inventory > Products" }).click();

  await expect(page.getByRole("tab", { name: "Products" })).toBeVisible();
  await expect(page.getByText("Inventory > Products")).toBeVisible();
});

test("toolbar appears beside the tabs and follows the active screen", async ({
  page,
}) => {
  await page.goto("/");

  const tabStrip = page.locator(".tab-strip");
  const toolbar = tabStrip.getByRole("toolbar", { name: "Active screen actions" });
  await expect(tabStrip.locator(".tab-action-toolbar")).toHaveCount(1);
  await expect(toolbar.getByRole("button")).toHaveCount(0);

  await page
    .getByRole("navigation", { name: "Main menu" })
    .getByRole("button", { name: "Registration" })
    .first()
    .click();
  await expect(page.getByRole("tab", { name: "Purchase registration" })).toBeVisible();
  await expect(toolbar.getByRole("button", { name: "Search" })).toBeVisible();
  await expect(toolbar.getByRole("button", { name: "Insert" })).toBeVisible();
  await expect(toolbar.getByRole("button", { name: "Excel" })).toBeVisible();
  await expect(toolbar.getByRole("button", { name: "Row Added" })).toHaveCount(0);

  await page.getByRole("tab", { name: "Dashboard" }).click();
  await expect(toolbar.getByRole("button")).toHaveCount(0);
});

test("inactive tab labels use a readable foreground color", async ({ page }) => {
  await page.goto("/");

  const dashboardTab = page.getByRole("tab", { name: "Dashboard" });
  await page
    .getByRole("navigation", { name: "Main menu" })
    .getByRole("button", { name: "Registration" })
    .first()
    .click();

  const purchaseTab = page.getByRole("tab", {
    name: "Purchase registration",
  });
  await expect(dashboardTab).toHaveCSS("color", "rgb(37, 52, 92)");
  await expect(purchaseTab).toHaveCSS("color", "rgb(255, 255, 255)");

  await dashboardTab.click();
  await expect(dashboardTab).toHaveCSS("color", "rgb(255, 255, 255)");
  await expect(purchaseTab).toHaveCSS("color", "rgb(37, 52, 92)");
});

test("menu tree uses the reference folder icon and plain navy rows", async ({
  page,
}) => {
  await page.goto("/");

  const menu = page.getByRole("navigation", { name: "Main menu" });
  const purchaseFolder = menu.getByRole("button", { name: "Purchase" });
  const dashboard = menu.getByRole("button", { name: /Dashboard/ });

  await expect(purchaseFolder.locator("img.menu-tree-folder")).toHaveAttribute(
    "src",
    "/images/opened_folder.svg",
  );
  await expect(purchaseFolder).toHaveCSS("height", "28px");
  await expect(purchaseFolder).toHaveCSS("color", "rgb(255, 255, 255)");
  await expect(dashboard).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
});
