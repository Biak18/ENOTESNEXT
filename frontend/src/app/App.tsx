import { useMemo, useState } from "react";
import { AppShell } from "../components/layout/AppShell";
import { useActionDispatcher } from "../actions/useActionDispatcher";
import { useWorkspaceTabs } from "../tabs/useWorkspaceTabs";
import type { Action } from "../types";
import { AppProvider, useApp } from "./AppContext";
import { LoginScreen } from "./LoginScreen";
import "../features/screens.css";
import "../features/screen-overrides.css";
import "../App.css";
import "../polish.css";

function WorkspaceApp() {
  const { user, menuItems, screenTitles, loadingMenu, apiOnline, logout } =
    useApp();
  const { tabs, activeTabId, setActiveTabId, openMenu, closeTab } =
    useWorkspaceTabs(screenTitles);
  const { supportedByTab, registerHandle, dispatch, canClose, unregister } =
    useActionDispatcher();
  const [notice, setNotice] = useState("");
  const activeTab = tabs.find((tab) => tab.id === activeTabId);
  const activeMenuId = activeTab?.menuId;
  const supportedActions = useMemo(
    () => (activeTab ? supportedByTab[activeTab.id] ?? [] : []),
    [activeTab, supportedByTab],
  );

  if (!user) {
    return <LoginScreen />;
  }

  const close = async (tabId: string) => {
    // canClose may await the showEnConfirm question dialog.
    if (!(await canClose(tabId))) return;
    closeTab(tabId, () => true);
    unregister(tabId);
  };

  return (
    <AppShell
      tabs={tabs}
      activeTabId={activeTabId}
      activeMenuId={activeMenuId}
      supportedActions={supportedActions}
      notice={notice}
      menuItems={menuItems}
      menuLoading={loadingMenu}
      apiOnline={apiOnline}
      userName={user.nmUser}
      companyCode={user.cdCom}
      onLogout={logout}
      openMenu={openMenu}
      selectTab={setActiveTabId}
      closeTab={close}
      dispatch={(action: Action) => activeTab && dispatch(activeTab.id, action)}
      notify={setNotice}
      registerHandle={registerHandle}
    />
  );
}

export default function App() {
  return (
    <AppProvider>
      <WorkspaceApp />
    </AppProvider>
  );
}
