export type MenuEntry = {
  code: string;
  name: string;
  type: string;
  module: string;
  parent: string;
  dll: string;
};

export const menuTypeOptions = ["Screen", "Report", "Folder"];

export const moduleOptions = [
  "General",
  "Purchase",
  "Sales",
  "Inventory",
  "Contacts",
  "Finance",
  "Reports",
  "Settings",
];

export const initialMenus: MenuEntry[] = [
  { code: "MN-001", name: "Dashboard", type: "Screen", module: "General", parent: "—", dll: "DashboardView" },
  { code: "MN-014", name: "Purchase Registration", type: "Screen", module: "Purchase", parent: "Purchase", dll: "PurchaseEntry" },
  { code: "MN-018", name: "Purchase History", type: "Screen", module: "Purchase", parent: "Purchase", dll: "PurchaseHistory" },
  { code: "MN-021", name: "Products", type: "Screen", module: "Inventory", parent: "Inventory", dll: "ProductList" },
  { code: "MN-025", name: "Stock Balance", type: "Report", module: "Inventory", parent: "Inventory", dll: "StockBalance" },
  { code: "MN-031", name: "Sales Registration", type: "Screen", module: "Sales", parent: "Sales", dll: "SalesEntry" },
  { code: "MN-041", name: "Customers", type: "Screen", module: "Contacts", parent: "Contacts", dll: "CustomerList" },
];

export function filterMenus(menus: MenuEntry[], query: string) {
  const needle = query.trim().toLowerCase();
  if (!needle) return menus;
  return menus.filter((menu) =>
    `${menu.code} ${menu.name} ${menu.module}`.toLowerCase().includes(needle),
  );
}

export function validateMenu(draft: MenuEntry): string | null {
  if (!draft.code.trim()) return "Menu code is required.";
  if (!draft.name.trim()) return "Menu name is required.";
  return null;
}
