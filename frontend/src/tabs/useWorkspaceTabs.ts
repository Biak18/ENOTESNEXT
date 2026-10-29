import { useCallback, useState } from "react";
import type { MenuNode, Tab } from "../types";

const dashboardTab: Tab = {
  id: "dashboard",
  menuId: "dashboard",
  screen: "dashboard",
  title: "Dashboard",
};

export function useWorkspaceTabs(screenTitles: Record<string, string> = {}) {
  const [tabs, setTabs] = useState<Tab[]>([dashboardTab]);
  const [activeTabId, setActiveTabId] = useState(dashboardTab.id);

  const openMenu = useCallback(
    (node: MenuNode) => {
      if (node.kind !== "screen" || !node.screen) return;

      const existing = tabs.find((tab) => tab.menuId === node.id);
      if (existing) {
        setActiveTabId(existing.id);
        return;
      }

      const nextTab: Tab = {
        id: node.id,
        menuId: node.id,
        title: screenTitles[node.screen] ?? node.label,
        screen: node.screen,
      };
      setTabs((currentTabs) => [...currentTabs, nextTab]);
      setActiveTabId(nextTab.id);
    },
    [tabs, screenTitles],
  );

  const closeTab = useCallback(
    (id: string, canClose: () => boolean) => {
      if (!canClose()) return;

      const closingIndex = tabs.findIndex((tab) => tab.id === id);
      const remaining = tabs.filter((tab) => tab.id !== id);
      setTabs(remaining);
      if (activeTabId === id) {
        const nextTab = remaining[Math.max(0, closingIndex - 1)] ?? remaining[0];
        setActiveTabId(nextTab?.id ?? "");
      }
    },
    [activeTabId, tabs],
  );

  return { tabs, activeTabId, setActiveTabId, openMenu, closeTab };
}
