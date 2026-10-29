import type { MenuNode, ScreenKey } from "../types";

export const menuItems: MenuNode[] = [
  { id: "dashboard", label: "Dashboard", kind: "screen", screen: "dashboard" },
  { id: "purchase", label: "Purchase", kind: "folder", children: [
    { id: "purchase-register", label: "Registration", kind: "screen", screen: "purchase" },
    { id: "en-pur-bas-reg-001", label: "Order types", kind: "screen", screen: "EN_PUR_BAS_REG_001" },
    { id: "purchase-history", label: "History", kind: "screen", screen: "purchase-history" },
  ] },
  { id: "sales", label: "Sales", kind: "folder", children: [
    { id: "sales-register", label: "Registration", kind: "screen", screen: "sales" },
    { id: "sales-history", label: "History", kind: "screen", screen: "sales-history" },
  ] },
  { id: "inventory", label: "Inventory", kind: "folder", children: [
    { id: "products", label: "Products", kind: "screen", screen: "products" },
    { id: "stock-movements", label: "Stock movements", kind: "screen", screen: "stock" },
    { id: "stock-balance", label: "Stock balance", kind: "screen", screen: "balance" },
  ] },
  { id: "master-data", label: "Master data", kind: "folder", children: [
    { id: "en-mas-org-reg-001", label: "Companies", kind: "screen", screen: "EN_MAS_ORG_REG_001" },
  ] },
  { id: "security", label: "Security", kind: "folder", children: [
    { id: "en-sys-bas-reg-001", label: "Users", kind: "screen", screen: "EN_SYS_BAS_REG_001" },
    { id: "en-sys-menu-reg-001", label: "Menus", kind: "screen", screen: "EN_SYS_MENU_REG_001" },
    { id: "en-sys-aut-reg-001", label: "Company menus", kind: "screen", screen: "EN_SYS_AUT_REG_001" },
    { id: "en-sys-aut-reg-002", label: "Role menus", kind: "screen", screen: "EN_SYS_AUT_REG_002" },
    { id: "en-sys-aut-reg-003", label: "User menus", kind: "screen", screen: "EN_SYS_AUT_REG_003" },
  ] },
  { id: "contacts", label: "Contacts", kind: "folder", children: [
    { id: "customers", label: "Customers", kind: "screen", screen: "customers" },
    { id: "suppliers", label: "Suppliers", kind: "screen", screen: "suppliers" },
  ] },
  { id: "finance", label: "Finance", kind: "folder", children: [
    { id: "accounts", label: "Accounts", kind: "screen", screen: "accounts" },
  ] },
  { id: "reports", label: "Reports", kind: "folder", children: [
    { id: "sales-report", label: "Sales summary", kind: "screen", screen: "report" },
  ] },
  { id: "settings", label: "Settings", kind: "folder", children: [
    { id: "menu-register", label: "Menu register", kind: "screen", screen: "menus" },
  ] },
];

export const screenTitles: Record<ScreenKey, string> = {
  dashboard: "Dashboard", purchase: "Purchase registration", "purchase-history": "Purchase history",
  "EN_PUR_BAS_REG_001": "Purchase order types",
  "EN_MAS_ORG_REG_001": "Company register",
  "EN_SYS_BAS_REG_001": "User register",
  "EN_SYS_MENU_REG_001": "Menu register",
  "EN_SYS_AUT_REG_001": "Company menu access",
  "EN_SYS_AUT_REG_002": "Role menu access",
  "EN_SYS_AUT_REG_003": "User menu access",
  sales: "Sales registration", "sales-history": "Sales history", products: "Products",
  stock: "Stock movements", balance: "Stock balance", customers: "Customers", suppliers: "Suppliers",
  accounts: "Accounts", report: "Sales summary", menus: "Menu register",
};

export function flattenMenu(items: MenuNode[]): MenuNode[] {
  return items.flatMap((item) => [item, ...(item.children ? flattenMenu(item.children) : [])]);
}

export function filterMenuTree(items: MenuNode[], query: string): MenuNode[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return items;
  const filterNode = (node: MenuNode): MenuNode | null => {
    const children = node.children
      ?.map(filterNode)
      .filter((child): child is MenuNode => child !== null);
    const matches = node.label.toLowerCase().includes(needle);
    if (!matches && !children?.length) return null;
    return { ...node, children: matches ? node.children : children };
  };
  return items.map(filterNode).filter((node): node is MenuNode => node !== null);
}
