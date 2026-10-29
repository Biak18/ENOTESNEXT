import { useCallback, useRef } from "react";
import { ScreenContent } from "../../features/ScreenContent";
import { screenRegistry } from "../../features/screenRegistry";
import type { ScreenHandle } from "../../features/screen-contract";
import type { Tab } from "../../types";

export function ActiveTabHost({
  tabs,
  activeTabId,
  notify,
  registerHandle,
}: {
  tabs: Tab[];
  activeTabId: string;
  notify: (message: string) => void;
  registerHandle: (tabId: string, handle: ScreenHandle | null) => void;
}) {
  return (
    <div className="screen-host">
      {tabs.map((tab) => (
        <TabScreen
          key={tab.id}
          tab={tab}
          active={tab.id === activeTabId}
          notify={notify}
          registerHandle={registerHandle}
        />
      ))}
    </div>
  );
}

function TabScreen({
  tab,
  active,
  notify,
  registerHandle,
}: {
  tab: Tab;
  active: boolean;
  notify: (message: string) => void;
  registerHandle: (tabId: string, handle: ScreenHandle | null) => void;
}) {
  const ScreenComponent = screenRegistry[tab.screen] ?? ScreenContent;
  const handleRef = useCallback(
    (handle: ScreenHandle | null) => registerHandle(tab.id, handle),
    [registerHandle, tab.id],
  );
  const searchRef = useRef<HTMLInputElement>(null);

  return (
    <div className="screen-instance" hidden={!active} aria-hidden={!active}>
      <ScreenComponent
        ref={handleRef}
        screen={tab.screen}
        tabTitle={tab.title}
        notify={notify}
        searchRef={searchRef}
      />
    </div>
  );
}
