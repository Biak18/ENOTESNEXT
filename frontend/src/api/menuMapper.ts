import type { MenuDto } from "./contracts";
import type { MenuNode, ScreenKey } from "../types";

/**
 * Maps flat sys_menu rows (MenuDto, keyed by cdMenuParent) into the nested
 * MenuNode tree the sidebar/tab model uses. Mirrors the WinForms LoadNavTree:
 * fgType "F" → folder, "M" → a screen. Orphans become roots.
 *
 * Screen resolution: nm_netwindow holds the WinForms "Module.Class" name, so a
 * menu screen's React ScreenKey is derived from cd_module/cd_menu unless an
 * explicit alias is registered. The same alias table feeds screenTitles.
 */
export const screenAliases: Record<string, ScreenKey> = {
  // sys_menu.cd_menu (or nm_netwindow) → registered React screen key.
  // Update as real screens come online; falls back to the raw cd_menu.
  M_PUR_REG_001: "purchase",
  M_SALE_REG_001: "sales",
  M_INV_PROD_001: "products",
  M_SYS_MENU_001: "menus",
  EN_PUR_BAS_REG_001: "EN_PUR_BAS_REG_001",
  M_PUR_BAS_REG_001: "EN_PUR_BAS_REG_001",
  SN_PUR_BAS_REG_001: "EN_PUR_BAS_REG_001",

  // MAS / SYS master + authority screens
  EN_MAS_ORG_REG_001: "EN_MAS_ORG_REG_001",
  M_MAS_ORG_REG_001: "EN_MAS_ORG_REG_001",
  EN_SYS_BAS_REG_001: "EN_SYS_BAS_REG_001",
  M_SYS_BAS_REG_001: "EN_SYS_BAS_REG_001",
  SN_SYS_BAS_REG_001: "EN_SYS_BAS_REG_001",
  EN_SYS_MENU_REG_001: "EN_SYS_MENU_REG_001",
  M_SYS_MENU_REG_001: "EN_SYS_MENU_REG_001",
  EN_SYS_AUT_REG_001: "EN_SYS_AUT_REG_001",
  M_SYS_AUT_REG_001: "EN_SYS_AUT_REG_001",
  EN_SYS_AUT_REG_002: "EN_SYS_AUT_REG_002",
  M_SYS_AUT_REG_002: "EN_SYS_AUT_REG_002",
  EN_SYS_AUT_REG_003: "EN_SYS_AUT_REG_003",
  M_SYS_AUT_REG_003: "EN_SYS_AUT_REG_003",
};

function resolveScreen(node: MenuDto): ScreenKey {
  const candidates = [node.cdMenu, node.nmNetwindow ?? "", node.cdModule ?? ""];
  for (const candidate of candidates) {
    if (candidate && screenAliases[candidate]) return screenAliases[candidate];
  }
  // Fall back to cd_menu so each menu gets a stable, unique screen key.
  return node.cdMenu;
}

export function mapMenuDtoToNodes(rows: MenuDto[]): MenuNode[] {
  const byId = new Map<string, MenuNode>();
  const roots: MenuNode[] = [];

  for (const row of rows) {
    const isScreen = row.fgType === "M" || row.fgType == null;
    byId.set(row.cdMenu, {
      id: row.cdMenu,
      label: row.nmMenu,
      kind: isScreen ? "screen" : "folder",
      screen: isScreen ? resolveScreen(row) : undefined,
      children: [],
    });
  }
  for (const row of rows) {
    const node = byId.get(row.cdMenu)!;
    const parent = row.cdMenuParent ? byId.get(row.cdMenuParent) : undefined;
    if (parent) parent.children!.push(node);
    else roots.push(node);
  }
  const prune = (nodes: MenuNode[]): MenuNode[] =>
    nodes.filter((n) => (n.kind === "folder" ? (n.children!.length ? true : false) : true))
      .map((n) =>
        n.kind === "folder" ? { ...n, children: prune(n.children!) } : n,
      );
  return prune(roots);
}

/** Build screenTitles for the real menu (cd_menu → nm_menu), merged with any
 *  registered React screen keys so tab titles stay friendly. */
export function mapMenuTitles(rows: MenuDto[]): Record<string, string> {
  const titles: Record<string, string> = {};
  for (const row of rows) titles[row.cdMenu] = row.nmMenu;
  return titles;
}
