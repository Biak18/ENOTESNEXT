import { useState } from "react";
import { TopBar } from "./TopBar";
import { Sidebar } from "./Sidebar";
import { Workspace } from "./Workspace";
import type { ScreenHandle } from "../../features/screen-contract";
import type { Action, MenuNode, Tab } from "../../types";

export function AppShell({
  tabs,
  activeTabId,
  activeMenuId,
  supportedActions,
  notice,
  menuItems,
  menuLoading = false,
  apiOnline = true,
  userName,
  companyCode,
  onLogout,
  openMenu,
  selectTab,
  closeTab,
  dispatch,
  notify,
  registerHandle,
}: {
  tabs: Tab[];
  activeTabId: string;
  activeMenuId?: string;
  supportedActions: Action[];
  notice: string;
  menuItems: MenuNode[];
  menuLoading?: boolean;
  apiOnline?: boolean;
  userName?: string;
  companyCode?: string;
  onLogout?: () => void;
  openMenu: (node: MenuNode) => void;
  selectTab: (id: string) => void;
  closeTab: (id: string) => void;
  dispatch: (action: Action) => void;
  notify: (message: string) => void;
  registerHandle: (tabId: string, handle: ScreenHandle | null) => void;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(250);
  const [menuQuery, setMenuQuery] = useState("");
  const activeTab = tabs.find((tab) => tab.id === activeTabId);

  return (
    <main className="app-shell">
      <TopBar
        activeMenuId={activeMenuId}
        activeScreenTitle={activeTab?.title}
        sidebarCollapsed={sidebarCollapsed}
        sidebarWidth={sidebarWidth}
        menuQuery={menuQuery}
        onMenuQueryChange={setMenuQuery}
        openMenu={openMenu}
        onToggleSidebar={() => setSidebarCollapsed((collapsed) => !collapsed)}
        openDashboard={() => openMenu({ id: "dashboard", label: "Dashboard", kind: "screen", screen: "dashboard" })}
        menuItems={menuItems}
        userName={userName}
        companyCode={companyCode}
        onLogout={onLogout}
      />
      <div className="shell-body">
        <Sidebar
          activeMenuId={activeMenuId}
          openMenu={openMenu}
          collapsed={sidebarCollapsed}
          width={sidebarWidth}
          onWidthChange={setSidebarWidth}
          query={menuQuery}
          menuItems={menuItems}
          loading={menuLoading}
          apiOnline={apiOnline}
        />
        <Workspace
          tabs={tabs}
          activeTabId={activeTabId}
          supportedActions={supportedActions}
          onAction={dispatch}
          selectTab={selectTab}
          closeTab={closeTab}
          notify={notify}
          notice={notice}
          registerHandle={registerHandle}
        />
      </div>
    </main>
  );
}
