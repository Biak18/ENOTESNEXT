import { useEffect, useMemo } from "react";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import { filterMenuTree } from "../navigation/menu";
import type { MenuNode } from "../types";

/** Ids of every ancestor of `targetId` (outermost first), or [] if none / not found. */
function findAncestors(items: MenuNode[], targetId?: string): string[] {
  if (!targetId) return [];
  const walk = (nodes: MenuNode[]): string[] | null => {
    for (const node of nodes) {
      if (node.id === targetId) return [];
      if (node.children?.length) {
        const nested = walk(node.children);
        if (nested) return [node.id, ...nested];
      }
    }
    return null;
  };
  return walk(items) ?? [];
}

function containsId(node: MenuNode, id?: string): boolean {
  if (!id) return false;
  return Boolean(node.children?.some((c) => c.id === id || containsId(c, id)));
}

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

function MenuNodes({
  items,
  expanded,
  activeId,
  query,
  openScreen,
  toggleFolder,
  depth,
}: {
  items: MenuNode[];
  expanded: string[];
  activeId?: string;
  query: string;
  openScreen: (node: MenuNode) => void;
  toggleFolder: (id: string) => void;
  depth: number;
}) {
  const searching = Boolean(query.trim());

  return (
    <ul className="menu-tree-nodes m-0 list-none p-0">
      {items.map((node) => {
        const hasChildren = Boolean(node.children?.length);
        const isExpanded =
          hasChildren && (searching || expanded.includes(node.id));
        const isActive = node.id === activeId;
        const hasActiveChild = hasChildren && containsId(node, activeId);

        return (
          <li key={node.id}>
            <button
              type="button"
              onClick={() => {
                if (hasChildren) {
                  toggleFolder(node.id);
                } else {
                  openScreen(node);
                }
              }}
              title={node.label}
              aria-expanded={hasChildren ? isExpanded : undefined}
              aria-controls={hasChildren ? `menu-group-${node.id}` : undefined}
              aria-current={isActive ? "page" : undefined}
              style={{ ["--indent" as string]: `${depth * 18 + 8}px` }}
              className={[
                "menu-tree-row group flex w-full appearance-none items-center rounded-none border-0 bg-transparent text-left font-normal text-white shadow-none",
                "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#a9c3ff]",
                hasChildren ? "menu-tree-folder-row" : "menu-tree-screen-row",
                isActive || hasActiveChild ? "menu-tree-current" : "",
              ].join(" ")}
            >
              {hasChildren ? (
                <img
                  src="/images/opened_folder.svg"
                  className="menu-tree-folder"
                  alt=""
                  aria-hidden="true"
                />
              ) : (
                <ArticleOutlinedIcon
                  sx={{ fontSize: 16 }}
                  className="menu-tree-leaf shrink-0"
                  aria-hidden="true"
                />
              )}
              <span className="menu-tree-label min-w-0 flex-1 truncate">
                <Highlight text={node.label} query={query} />
              </span>
              {hasChildren && (
                <ChevronRightIcon
                  sx={{ fontSize: 18 }}
                  className={`menu-tree-caret shrink-0${isExpanded ? " is-expanded" : ""}`}
                  aria-hidden="true"
                />
              )}
              {isActive && <span className="sr-only">Current screen</span>}
            </button>

            {hasChildren && (
              <div
                id={`menu-group-${node.id}`}
                aria-hidden={!isExpanded}
                className="menu-tree-children"
                hidden={!isExpanded}
                style={{ ["--guide" as string]: `${depth * 18 + 15}px` }}
              >
                <MenuNodes
                  items={node.children ?? []}
                  expanded={expanded}
                  activeId={activeId}
                  query={query}
                  openScreen={openScreen}
                  toggleFolder={toggleFolder}
                  depth={depth + 1}
                />
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export function MenuTree({
  items,
  expanded,
  setExpanded,
  activeId,
  query,
  openScreen,
}: {
  items: MenuNode[];
  expanded: string[];
  setExpanded: (value: string[] | ((previous: string[]) => string[])) => void;
  activeId?: string;
  query: string;
  openScreen: (node: MenuNode) => void;
}) {
  const filteredItems = useMemo(
    () => filterMenuTree(items, query),
    [items, query],
  );
  const activeAncestors = useMemo(
    () => findAncestors(items, activeId),
    [items, activeId],
  );

  // Auto-open the branch containing the active screen; return `previous` when nothing
  // changes so React skips a redundant render.
  useEffect(() => {
    if (!activeAncestors.length) return;
    setExpanded((previous) =>
      activeAncestors.every((id) => previous.includes(id))
        ? previous
        : [...new Set([...previous, ...activeAncestors])],
    );
  }, [activeAncestors, setExpanded]);

  const toggleFolder = (id: string) => {
    setExpanded((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id],
    );
  };

  if (!filteredItems.length) {
    return (
      <p className="mx-1 my-6 rounded-md border border-white/10 bg-white/5 px-3 py-5 text-center text-[12px] leading-5 text-[#aebdd0]">
        No screens match “{query.trim()}”.
      </p>
    );
  }

  return (
    <MenuNodes
      items={filteredItems}
      expanded={expanded}
      activeId={activeId}
      query={query}
      openScreen={openScreen}
      toggleFolder={toggleFolder}
      depth={0}
    />
  );
}
