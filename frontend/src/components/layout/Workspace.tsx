import { ActiveTabHost } from "./ActiveTabHost";
import { TabBar } from "./TabBar";
import type { ScreenHandle } from "../../features/screen-contract";
import type { Action, Tab } from "../../types";

export function Workspace({ tabs, activeTabId, supportedActions, onAction, selectTab, closeTab, notify, notice, registerHandle }: {
  tabs: Tab[];
  activeTabId: string;
  supportedActions: Action[];
  onAction: (action: Action) => void;
  selectTab: (id: string) => void;
  closeTab: (id: string) => void;
  notify: (message: string) => void;
  notice: string;
  registerHandle: (tabId: string, handle: ScreenHandle | null) => void;
}) {
  return (
    <section className="work-area">
      <TabBar
        tabs={tabs}
        activeTabId={activeTabId}
        supportedActions={supportedActions}
        onAction={onAction}
        onSelect={selectTab}
        onClose={closeTab}
      />
      {tabs.length ? (
        <ActiveTabHost tabs={tabs} activeTabId={activeTabId} notify={notify} registerHandle={registerHandle} />
      ) : (
        <div className="empty-workspace" aria-label="No screens open"><span className="empty-workspace-mark">E</span><strong>ENOTES</strong></div>
      )}
      {notice && <footer className="statusbar" role="status" aria-live="polite"><span className="status-light" />{notice}</footer>}
    </section>
  );
}
