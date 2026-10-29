import { Resizable } from "re-resizable";
import { MenuTree } from "../MenuTree";
import type { MenuNode } from "../../types";

export function Sidebar({
  activeMenuId,
  openMenu,
  collapsed,
  width,
  onWidthChange,
  query,
  menuItems,
  loading = false,
  apiOnline = true,
}: {
  activeMenuId?: string;
  openMenu: (node: MenuNode) => void;
  collapsed: boolean;
  width: number;
  onWidthChange: (width: number) => void;
  query: string;
  menuItems: MenuNode[];
  loading?: boolean;
  apiOnline?: boolean;
}) {
  return (
    <Resizable
      size={{ width: collapsed ? 0 : width, height: "100%" }}
      maxWidth={420}
      minWidth={collapsed ? 0 : 190}
      enable={collapsed ? {} : { right: true }}
      onResize={(_e, _dir, elementRef) => onWidthChange(elementRef.offsetWidth)}
      className="sidebar-resizable"
      handleStyles={{ right: { width: "5px", cursor: "ew-resize", right: 0 } }}
    >
      <aside
        id="main-menu-panel"
        className={`bg-(--navy) sidebar flex min-h-0 flex-col${collapsed ? " hidden" : ""}`}
      >
        <nav
          className="menu-tree min-h-0 flex-1 overflow-y-auto px-2 py-3"
          aria-label="Main menu"
        >
          {!apiOnline && (
            <p className="mx-1 mb-2 rounded-md border border-amber-300/40 bg-amber-400/10 px-3 py-2 text-[10px] text-amber-200">
              Menu offline — showing nothing until the API responds.
            </p>
          )}
          {loading ? (
            <p className="mx-1 my-6 px-3 py-5 text-center text-[11px] text-[#aebdd0]">
              Loading menus…
            </p>
          ) : (
            <MenuTree
              items={menuItems}
              activeId={activeMenuId}
              query={query}
              openScreen={openMenu}
            />
          )}
        </nav>
      </aside>
    </Resizable>
  );
}
