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

/**
 * The workspace itself. `SessionRoot` gives it a key that changes on every
 * login, so open tabs, screen refresh handles, or notices belonging to a
 * previous session never leak into the next one — even for the same account.
 */
function Workspace() {
  const { user, menuItems, screenTitles, loadingMenu, apiOnline, logout } = useApp();
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

  const close = async (tabId: string) => {
    // canClose may await the showEnConfirm question dialog.
    if (!(await canClose(tabId))) return;
    closeTab(tabId, () => true);
    unregister(tabId);
  };

  if (!user) return null; // SessionRoot guarantees a user here

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

/** Swap to the login screen when signed out; remount a workspace per login. */
function SessionRoot() {
  const { user, session } = useApp();
  if (!user) return <LoginScreen />;
  return <Workspace key={session} />;
}

export default function App() {
  return (
    <AppProvider>
      <SessionRoot />
    </AppProvider>
  );
}
