import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import FolderOpenOutlinedIcon from "@mui/icons-material/FolderOpenOutlined";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import "./EnTreeView.css";

/**
 * Generic tree node. Structural shape shared by MenuNode (sidebar) and the
 * per-screen row types (e.g. MenuRow in EN_SYS_MENU_REG_001) via `data`.
 */
export type TreeNode<T = unknown> = {
  id: string;
  label: string;
  children?: TreeNode<T>[];
  data?: T;
};

/** Column rendered after the label, right-aligned (form/grid variant). */
export type TreeColumn<T = unknown> = {
  header: string;
  render: (node: TreeNode<T>) => React.ReactNode;
  width?: number;
};

export type EnTreeViewVariant = "form" | "sidebar";

export type EnTreeViewProps<T> = {
  nodes: TreeNode<T>[];
  columns?: TreeColumn<T>[];
  /** Row height in px. Default 26 ("form"); the sidebar passes 29. */
  rowHeight?: number;
  /** Horizontal px per depth level. Default 16; the sidebar passes 18. */
  childIndent?: number;
  variant?: EnTreeViewVariant;
  /** Seed expansion for every folder (legacy all-or-none seed). */
  defaultExpanded?: boolean;
  /**
   * Auto-expand folders down to this depth (0-based). 1 = root folders open
   * (one level of children visible), 2 = grandchildren too. Takes precedence
   * over `defaultExpanded`. Once the user expands/collapses anything, their
   * expansion wins until the next data reload.
   */
  defaultExpandedDepth?: number;
  className?: string;
  ariaLabel?: string;
  /**
   * Controlled selected/mark id (SNOTES focused row). Selection styling keys
   * off this; when `onSelect` is supplied the row also becomes keyboard
   * roving selectable.
   */
  selectedId?: string | null;
  /** Called when the user selects (clicks or keyboard-focuses) a node. */
  onSelect?: (node: TreeNode<T>) => void;
  /**
   * Called when a leaf is "opened" — leaf click or Enter/Space. The sidebar
   * binds openScreen here; folders toggle on click instead. When both
   * `onSelect` and this are given, leaf activation still fires.
   */
  onLeafActivate?: (node: TreeNode<T>) => void;
  /** Custom label renderer (e.g. search-term highlight in the sidebar). */
  highlight?: (label: string) => React.ReactNode;
};

/** Imperative helpers (SNOTES selectAndFocusRow / expand). */
export type EnTreeViewHandle = {
  /** Expand every ancestor of `id` so the node becomes visible. */
  expandTo: (id: string) => void;
  /** Expand/collapse all nodes. */
  expandAll: (open: boolean) => void;
  /** Select + DOM-focus a node by id (expanding ancestors first). */
  selectAndFocus: (id: string) => void;
};

type FlatRow<T> = { node: TreeNode<T>; depth: number };

/** Flatten the visible tree (expanded nodes only) for keyboard navigation. */
function flattenVisible<T>(
  nodes: TreeNode<T>[],
  expanded: Record<string, boolean>,
  depth = 0,
  out: FlatRow<T>[] = [],
): FlatRow<T>[] {
  for (const node of nodes) {
    out.push({ node, depth });
    const isOpen = expanded[node.id] ?? false;
    if (isOpen && node.children?.length) {
      flattenVisible(node.children, expanded, depth + 1, out);
    }
  }
  return out;
}

/**
 * One tree implementation for the whole app (SNOTES SnAgTree on Community —
 * there is no enterprise tree-data grid, so hierarchy is rendered by
 * indentation here). `variant` restyles it:
 *  - "form":    light tree grid with column slots (EN_SYS_MENU_REG_001 et al.)
 *  - "sidebar": navy navigation tree (transparent bg, active pill)
 */
function EnTreeViewInner<T>(
  {
    nodes,
    columns,
    rowHeight = 26,
    childIndent = 16,
    variant = "form",
    defaultExpanded = true,
    defaultExpandedDepth,
    className = "",
    ariaLabel = "Tree",
    selectedId = null,
    onSelect,
    onLeafActivate,
    highlight,
  }: EnTreeViewProps<T>,
  ref: React.ForwardedRef<EnTreeViewHandle>,
) {
  // Expansion state lives at the root so keyboard nav can see the whole tree.
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const touched = useRef(false);
  const listRef = useRef<HTMLDivElement>(null);
  // Local fallback selection when the parent doesn't control selectedId.
  const [internalSelected, setInternalSelected] = useState<string | null>(null);
  const selectable = Boolean(onSelect);
  const isControlled = selectedId !== undefined;
  const activeId = selectable
    ? isControlled
      ? selectedId
      : internalSelected
    : (selectedId ?? null);

  // Seed expansion from defaultExpandedDepth / defaultExpanded. The user's
  // own toggles win — once they expand/collapse anything the seeding stops.
  // Re-seeds on every data change while untouched (data arrives async, so a
  // once-only seed would collide with the empty first render).
  useEffect(() => {
    if (touched.current) return;
    const seed: Record<string, boolean> = {};
    if (defaultExpandedDepth !== undefined) {
      const walk = (ns: TreeNode<T>[], depth: number) => {
        for (const n of ns) {
          if (n.children?.length) {
            seed[n.id] = depth < defaultExpandedDepth;
            walk(n.children, depth + 1);
          }
        }
      };
      walk(nodes, 0);
    } else {
      const walk = (ns: TreeNode<T>[]) => {
        for (const n of ns) {
          if (n.children?.length) {
            seed[n.id] = defaultExpanded;
            walk(n.children);
          }
        }
      };
      walk(nodes);
    }
    setExpanded(seed);
  }, [nodes, defaultExpanded, defaultExpandedDepth]);

  const flat = useMemo(
    () => flattenVisible(nodes, expanded),
    [nodes, expanded],
  );
  const indexById = useMemo(() => {
    const m = new Map<string, number>();
    flat.forEach((r, i) => m.set(r.node.id, i));
    return m;
  }, [flat]);

  /** Ids of the ancestors of `selectedId` — the open branch is emphasized. */
  const branchIds = useMemo(() => {
    const walkPath = (
      ns: TreeNode<T>[],
      id: string,
      trail: string[] = [],
    ): string[] | null => {
      for (const n of ns) {
        if (n.id === id) return trail;
        if (n.children?.length) {
          const p = walkPath(n.children, id, [...trail, n.id]);
          if (p) return p;
        }
      }
      return null;
    };
    return selectedId ? (walkPath(nodes, selectedId) ?? []) : [];
  }, [nodes, selectedId]);

  const setOpen = (id: string, open: boolean) => {
    touched.current = true;
    setExpanded((e) => ({ ...e, [id]: open }));
  };

  const selectNode = (node: TreeNode<T>, focusDom = true) => {
    if (!selectable) return;
    if (!isControlled) setInternalSelected(node.id);
    onSelect?.(node);
    if (focusDom) {
      listRef.current
        ?.querySelector<HTMLElement>(`[data-node-id="${CSS.escape(node.id)}"]`)
        ?.focus();
    }
  };

  const activateRow = (node: TreeNode<T>) => {
    if (selectable) {
      selectNode(node);
      // SNOTES behavior: Enter/Space on a leaf with onLeafActivate opens it.
      if (!node.children?.length) onLeafActivate?.(node);
      return;
    }
    // Navigation variant: folders toggle, leaves activate.
    if (node.children?.length) {
      setOpen(node.id, !(expanded[node.id] ?? false));
    } else {
      onLeafActivate?.(node);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent, node: TreeNode<T>) => {
    if (!selectable) {
      // Non-roving variant: every row is tabbable; Enter/Space activates.
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        activateRow(node);
      }
      return;
    }
    const idx = indexById.get(node.id) ?? 0;
    const hasChildren = Boolean(node.children?.length);
    const isOpen = expanded[node.id] ?? false;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (idx < flat.length - 1) selectNode(flat[idx + 1].node);
        break;
      case "ArrowUp":
        e.preventDefault();
        if (idx > 0) selectNode(flat[idx - 1].node);
        break;
      case "ArrowRight":
        e.preventDefault();
        if (hasChildren && !isOpen) setOpen(node.id, true);
        else if (hasChildren && idx < flat.length - 1)
          selectNode(flat[idx + 1].node);
        break;
      case "ArrowLeft":
        e.preventDefault();
        if (hasChildren && isOpen) {
          setOpen(node.id, false);
        } else {
          // Collapsed folder or leaf: move focus up to the parent node.
          const parent = findParent(nodes, node.id);
          if (parent) selectNode(parent);
        }
        break;
      case "Home":
        e.preventDefault();
        if (flat.length) selectNode(flat[0].node);
        break;
      case "End":
        e.preventDefault();
        if (flat.length) selectNode(flat[flat.length - 1].node);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        activateRow(node);
        break;
    }
  };

  function findParent(ns: TreeNode<T>[], id: string): TreeNode<T> | null {
    for (const n of ns) {
      if (n.children?.some((c) => c.id === id)) return n;
      const p = n.children ? findParent(n.children, id) : null;
      if (p) return p;
    }
    return null;
  }

  /** Find a node anywhere in the (full) tree by id. */
  function findNode(ns: TreeNode<T>[], id: string): TreeNode<T> | null {
    for (const n of ns) {
      if (n.id === id) return n;
      const c = n.children ? findNode(n.children, id) : null;
      if (c) return c;
    }
    return null;
  }

  /** Path of ancestor ids (excluding the node itself), for expansion. */
  function findPath(
    ns: TreeNode<T>[],
    id: string,
    trail: string[] = [],
  ): string[] | null {
    for (const n of ns) {
      if (n.id === id) return trail;
      if (n.children?.length) {
        const p = findPath(n.children, id, [...trail, n.id]);
        if (p) return p;
      }
    }
    return null;
  }

  useImperativeHandle(ref, () => ({
    expandTo: (id) => {
      touched.current = true;
      const path = findPath(nodes, id) ?? [];
      if (path.length)
        setExpanded((e) => {
          const next = { ...e };
          path.forEach((a) => (next[a] = true));
          return next;
        });
    },
    expandAll: (open) => {
      touched.current = true;
      const next: Record<string, boolean> = {};
      const walk = (ns: TreeNode<T>[]) =>
        ns.forEach((n) => {
          if (n.children?.length) {
            next[n.id] = open;
            walk(n.children);
          }
        });
      walk(nodes);
      setExpanded(next);
    },
    selectAndFocus: (id) => {
      const path = findPath(nodes, id);
      if (path === null) return;
      touched.current = true;
      if (path.length)
        setExpanded((e) => {
          const next = { ...e };
          path.forEach((a) => (next[a] = true));
          return next;
        });
      // Look the node up in the full tree — it may be inside a folder that was
      // collapsed until now, so it isn't in `flat` yet.
      const node = findNode(nodes, id);
      if (node) {
        // Wait a tick so expansion renders before focusing.
        requestAnimationFrame(() => selectNode(node, true));
      }
    },
  }));

  const renderRows = (list: FlatRow<T>[]) =>
    list.map(({ node, depth: d }) => {
      const hasChildren = Boolean(node.children?.length);
      const open = expanded[node.id] ?? false;
      const isSelected = node.id === activeId;
      const isOnBranch = branchIds.includes(node.id);
      return (
        <div
          key={node.id}
          role="treeitem"
          data-node-id={node.id}
          aria-expanded={hasChildren ? open : undefined}
          aria-selected={selectable ? isSelected : undefined}
          aria-current={!selectable && isSelected ? "page" : undefined}
          aria-level={d + 1}
          tabIndex={
            selectable
              ? isSelected ||
                (activeId === null && indexById.get(node.id) === 0)
                ? 0
                : -1
              : 0
          }
          className={[
            "en-treeview-row",
            hasChildren ? "en-treeview-folder" : "en-treeview-leaf",
            isSelected ? "is-selected" : "",
            isOnBranch ? "is-branch" : "",
            d > 0 ? "en-treeview-child" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          style={
            variant === "sidebar"
              ? ({
                  height: rowHeight,
                  paddingLeft: hasChildren
                    ? d * childIndent + 8
                    : d * childIndent + 14,
                  ["--depth" as string]: String(d),
                } as React.CSSProperties)
              : { height: rowHeight, paddingLeft: d * childIndent + 6 }
          }
          onClick={() => activateRow(node)}
          onKeyDown={(e) => onKeyDown(e, node)}
        >
          {variant === "sidebar" ? (
            hasChildren ? (
              <img
                src="/images/opened_folder.svg"
                className="en-treeview-folder"
                alt=""
                aria-hidden="true"
              />
            ) : (
              <ArticleOutlinedIcon
                className="en-treeview-icon en-treeview-icon-leaf"
                sx={{ fontSize: 16 }}
              />
            )
          ) : (
            <>
              {hasChildren ? (
                <button
                  type="button"
                  className="en-treeview-toggle"
                  tabIndex={-1}
                  aria-label={open ? "Collapse" : "Expand"}
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpen(node.id, !open);
                  }}
                >
                  <ChevronRightIcon
                    className={`en-treeview-caret${open ? " is-open" : ""}`}
                    sx={{ fontSize: 15 }}
                  />
                </button>
              ) : (
                <span
                  className="en-treeview-toggle is-leaf"
                  aria-hidden="true"
                />
              )}
              {hasChildren ? (
                open ? (
                  <FolderOpenOutlinedIcon
                    className="en-treeview-icon"
                    sx={{ fontSize: 15 }}
                  />
                ) : (
                  <FolderOutlinedIcon
                    className="en-treeview-icon"
                    sx={{ fontSize: 15 }}
                  />
                )
              ) : (
                <ArticleOutlinedIcon
                  className="en-treeview-icon en-treeview-icon-leaf"
                  sx={{ fontSize: 14 }}
                />
              )}
            </>
          )}
          <span className="en-treeview-label" title={node.label}>
            {highlight ? highlight(node.label) : node.label}
          </span>
          {columns?.map((col, i) => (
            <span
              key={i}
              className="en-treeview-cell"
              style={col.width ? { width: col.width, flex: "none" } : undefined}
            >
              {col.render(node)}
            </span>
          ))}
          {variant === "sidebar" && hasChildren ? (
            <ChevronRightIcon
              className={`en-treeview-caret${open ? " is-open" : ""}`}
              sx={{ fontSize: 18 }}
            />
          ) : null}
        </div>
      );
    });

  return (
    <div
      className={`en-treeview en-treeview--${variant}${
        selectable ? " en-treeview-selectable" : ""
      } ${className}`.trim()}
      ref={listRef}
    >
      {columns?.length ? (
        <div className="en-treeview-head" role="row">
          <span className="en-treeview-toggle is-leaf" aria-hidden="true" />
          <span className="en-treeview-icon is-hidden" aria-hidden="true" />
          <span className="en-treeview-label en-treeview-head-label">Menu</span>
          {columns.map((col, i) => (
            <span
              key={i}
              className="en-treeview-cell en-treeview-head-cell"
              style={col.width ? { width: col.width, flex: "none" } : undefined}
            >
              {col.header}
            </span>
          ))}
        </div>
      ) : null}
      <div role="tree" aria-label={ariaLabel} className="en-treeview-list">
        {renderRows(flat)}
      </div>
    </div>
  );
}

// forwardRef with generics: cast keeps <EnTreeView<T>> usable at call sites.
const EnTreeView = forwardRef(EnTreeViewInner) as <T>(
  props: EnTreeViewProps<T> & { ref?: React.ForwardedRef<EnTreeViewHandle> },
) => React.ReactElement;
export default EnTreeView;
