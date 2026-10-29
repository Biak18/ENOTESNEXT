import { describe, expect, it } from "vitest";
import { filterMenuTree, flattenMenu, menuItems } from "./menu";

describe("filterMenuTree", () => {
  it("returns the full tree for an empty query", () => {
    expect(filterMenuTree(menuItems, "")).toBe(menuItems);
    expect(filterMenuTree(menuItems, "   ").length).toBe(menuItems.length);
  });

  it("keeps the parent of a matching child", () => {
    const filtered = filterMenuTree(menuItems, "registration");
    const purchase = filtered.find((node) => node.id === "purchase");
    expect(purchase).toBeDefined();
    expect(purchase?.children?.length).toBeGreaterThan(0);
    expect(purchase?.children?.every((child) => child.label.toLowerCase().includes("registration"))).toBe(true);
  });

  it("drops branches that do not match", () => {
    const filtered = filterMenuTree(menuItems, "supplier");
    expect(filtered.map((node) => node.id)).toContain("contacts");
    expect(filtered.map((node) => node.id)).not.toContain("finance");
  });

  it("matches a parent label and keeps all of its children", () => {
    const filtered = filterMenuTree(menuItems, "inventory");
    const inventory = filtered.find((node) => node.id === "inventory");
    expect(inventory?.children?.length).toBe(3);
  });
});

describe("flattenMenu", () => {
  it("returns parents and descendants", () => {
    const flat = flattenMenu(menuItems);
    expect(flat.length).toBeGreaterThan(menuItems.length);
    expect(flat.map((node) => node.id)).toContain("purchase-register");
  });
});
