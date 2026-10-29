import { useEffect, useMemo, useRef } from "react";
import { EnTreeView, type EnTreeViewHandle } from "./tree";
import { filterMenuTree } from "../navigation/menu";
import type { MenuNode } from "../types";

/**
 * Sidebar navigation tree — a thin wrapper around the global EnTreeView with
 * the "sidebar" variant. Filtering, search highlighting, active-branch
 * auto-expansion and screen opening live here; row rendering, keyboard nav and
 * expansion state live in the shared component.
 */

function Highlight({ text, query }: { text: string; query: string }) {
  const q = query.trim();
  if (!q) return <>{text}</>;
  const index = text.toLowerCase().indexOf(q.toLowerCase());
  if (index < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, index)}
      <mark className="rounded-sm bg-[#ffd166]/35 px-0.5 text-inherit">
        {text.slice(index, index + q.length)}
      </mark>
      {text.slice(index + q.length)}
    </>
  );
}

export function MenuTree({
  items,
  activeId,
  query,
  openScreen,
}: {
  items: MenuNode[];
  activeId?: string;
  query: string;
  openScreen: (node: MenuNode) => void;
}) {
  const treeRef = useRef<EnTreeViewHandle>(null);
  const filteredItems = useMemo(
    () => filterMenuTree(items, query),
    [items, query],
  );
  const searching = Boolean(query.trim());

  // Auto-open the branch containing the active screen as tabs change.
  useEffect(() => {
    if (activeId) treeRef.current?.expandTo(activeId);
  }, [activeId]);

  // While searching, show every folder so matches are all visible.
  useEffect(() => {
    if (searching) treeRef.current?.expandAll(true);
  }, [searching, filteredItems]);

  if (!filteredItems.length) {
    return (
      <p className="mx-1 my-6 rounded-md border border-white/10 bg-white/5 px-3 py-5 text-center text-[12px] leading-5 text-[#aebdd0]">
        No screens match "{query.trim()}".
      </p>
    );
  }

  return (
    <EnTreeView<MenuNode>
      ref={treeRef}
      nodes={filteredItems}
      variant="sidebar"
      rowHeight={29}
      childIndent={18}
      defaultExpandedDepth={1}
      selectedId={activeId ?? null}
      onLeafActivate={(node) => openScreen(node as MenuNode)}
      highlight={(label) => <Highlight text={label} query={query} />}
      ariaLabel="Main menu"
    />
  );
}
