import { useEffect, useImperativeHandle, useRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { useActionDispatcher } from "../actions/useActionDispatcher";
import type { ScreenHandle } from "../features/screen-contract";
import { flattenMenu, menuItems } from "../navigation/menu";
import { useWorkspaceTabs } from "../tabs/useWorkspaceTabs";

const calls: string[] = [];

function findMenu(id: string) {
  const menu = flattenMenu(menuItems).find((node) => node.id === id);
  if (!menu) throw new Error(`missing menu ${id}`);
  return menu;
}

function ScreenHost({
  tabId,
  onRegister,
}: {
  tabId: string;
  onRegister: (tabId: string, handle: ScreenHandle | null) => void;
}) {
  const ref = useRef<ScreenHandle>(null);

  useImperativeHandle(
    ref,
    () => ({
      search: () => {
        calls.push(`${tabId}:search`);
      },
      save: () => {
        calls.push(`${tabId}:save`);
      },
      canClose: () => true,
    }),
    [tabId],
  );

  useEffect(() => {
    onRegister(tabId, ref.current);
    return () => onRegister(tabId, null);
  }, [tabId, onRegister]);

  return <div data-testid={`screen-${tabId}`}>{tabId}</div>;
}

function Harness() {
  const { tabs, activeTabId, setActiveTabId, openMenu, closeTab } =
    useWorkspaceTabs();
  const { supportedByTab, registerHandle, dispatch, canClose, unregister } =
    useActionDispatcher();
  const activeTab = tabs.find((tab) => tab.id === activeTabId);
  const supported = activeTab ? supportedByTab[activeTab.id] ?? [] : [];

  return (
    <div>
      <button
        type="button"
        onClick={() => openMenu(findMenu("purchase-register"))}
      >
        open purchase
      </button>
      <button type="button" onClick={() => openMenu(findMenu("products"))}>
        open products
      </button>
      <button
        type="button"
        onClick={() => setActiveTabId("purchase-register")}
      >
        focus purchase
      </button>
      <button
        type="button"
        onClick={() => activeTab && dispatch(activeTab.id, "search")}
      >
        run search
      </button>
      <button
        type="button"
        onClick={() => activeTab && dispatch(activeTab.id, "save")}
      >
        run save
      </button>
      <button
        type="button"
        onClick={async () => {
          if (!activeTab) return;
          if (!(await canClose(activeTab.id))) return;
          closeTab(activeTab.id, () => true);
          unregister(activeTab.id);
        }}
      >
        close active
      </button>
      <span data-testid="active-tab">{activeTabId}</span>
      <span data-testid="supported">{supported.join(",")}</span>
      <span data-testid="tab-count">{tabs.length}</span>
      {tabs.map((tab) => (
        <ScreenHost key={tab.id} tabId={tab.id} onRegister={registerHandle} />
      ))}
    </div>
  );
}

describe("workspace tabs and action dispatch", () => {
  it("activates an already open menu instead of duplicating the tab", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole("button", { name: "open purchase" }));
    await user.click(screen.getByRole("button", { name: "open products" }));
    expect(screen.getByTestId("tab-count").textContent).toBe("3");

    await user.click(screen.getByRole("button", { name: "open purchase" }));
    expect(screen.getByTestId("tab-count").textContent).toBe("3");
    expect(screen.getByTestId("active-tab").textContent).toBe("purchase-register");
  });

  it("dispatches toolbar actions to the active tab only", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole("button", { name: "open purchase" }));
    await user.click(screen.getByRole("button", { name: "open products" }));

    calls.length = 0;
    await user.click(screen.getByRole("button", { name: "run search" }));
    expect(calls).toEqual(["products:search"]);

    await user.click(screen.getByRole("button", { name: "focus purchase" }));
    calls.length = 0;
    await user.click(screen.getByRole("button", { name: "run save" }));
    expect(calls).toEqual(["purchase-register:save"]);
  });

  it("exposes only the actions a screen supports", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole("button", { name: "open purchase" }));

    const supported = screen.getByTestId("supported").textContent?.split(",");
    expect(supported).toEqual(["search", "save"]);
    expect(supported).not.toContain("excel");
    expect(supported).not.toContain("delete");
  });

  it("closes the active tab and keeps a predictable active tab", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole("button", { name: "open purchase" }));
    await user.click(screen.getByRole("button", { name: "open products" }));
    await user.click(screen.getByRole("button", { name: "close active" }));

    expect(screen.getByTestId("tab-count").textContent).toBe("2");
    expect(screen.getByTestId("active-tab").textContent).toBe("purchase-register");
  });

  it("keeps inactive screens mounted so their local state survives", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole("button", { name: "open purchase" }));
    await user.click(screen.getByRole("button", { name: "open products" }));

    expect(screen.getByTestId("screen-purchase-register")).toBeTruthy();
    expect(screen.getByTestId("screen-products")).toBeTruthy();
  });
});
