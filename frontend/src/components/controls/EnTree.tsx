import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import Checkbox from "@mui/material/Checkbox";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import FolderOpenOutlinedIcon from "@mui/icons-material/FolderOpenOutlined";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import "./EnTree.css";

export type TreeNode<T = Record<string, unknown>> = {
  id: string;
  label: string;
  children?: TreeNode<T>[];
  data?: T;
};

export type TreeColumn<T = Record<string, unknown>> = {
  /** Header label. */
  header: string;
  /** Render a cell for a leaf (or folder) node. Receives node + checked state. */
  render: (node: TreeNode<T>) => React.ReactNode;
  /** Column width hint (px). */
  width?: number;
};

type EnTreeProps<T> = {
  nodes: TreeNode<T>[];
  /** Columns rendered after the label, right-aligned. */
  columns?: TreeColumn<T>[];
  /** Render a node type icon/label prefix. */
  rowHeight?: number;
  defaultExpanded?: boolean;
  /** Extra class on the container. */
  className?: string;
  ariaLabel?: string;
  /**
   * Controlled selected/focused node id. When provided (with onSelect) the
   * tree becomes an interactive single-select list: rows are keyboard
   * focusable and clicking/arrowing selects a node (SNOTES onFocusedRowChanged).
   */
  selectedId?: string | null;
  /** Called when the user selects (clicks or keyboard-focuses) a node. */
  onSelect?: (node: TreeNode<T>) => void;
};

/** Imperative helpers (SNOTES selectAndFocusRow / expand). */
export type EnTreeHandle = {
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
 * Lightweight checkbox/permission tree for the MAS authority screens, and a
 * single-select navigable tree (SNOTES SnAgTree on Community) when `selectedId`
 * + `onSelect` are supplied. Community has no tree-data row grouping, so the
 * hierarchy is rendered by indentation; selection & keyboard focus are handled
 * here so screens can bind a detail form to the focused node.
 */
function EnTreeInner<T>(
  {
    nodes,
    columns,
    rowHeight = 26,
    defaultExpanded = true,
    className = "",
    ariaLabel = "Tree",
    selectedId = null,
    onSelect,
  }: EnTreeProps<T>,
  ref: React.ForwardedRef<EnTreeHandle>,
) {
  // Expansion state lives at the root so keyboard nav can see the whole tree.
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const initialized = useRef(false);
  const listRef = useRef<HTMLDivElement>(null);
  // Local fallback selection when the parent doesn't control selectedId.
  const [internalSelected, setInternalSelected] = useState<string | null>(null);
  const selectable = Boolean(onSelect);
  // Controlled when the caller passes selectedId; otherwise track internally.
  const isControlled = selectedId !== undefined;
  const activeId = selectable
    ? isControlled
      ? selectedId
      : internalSelected
    : null;

  // Seed expansion once from defaultExpanded (don't clobber user toggles).
  useEffect(() => {
    if (initialized.current) return;
    const seed: Record<string, boolean> = {};
    const walk = (ns: TreeNode<T>[]) => {
      for (const n of ns) {
        if (n.children?.length) {
          seed[n.id] = defaultExpanded;
          walk(n.children);
        }
      }
    };
    walk(nodes);
    setExpanded(seed);
    initialized.current = true;
  }, [nodes, defaultExpanded]);

  const flat = useMemo(
    () => flattenVisible(nodes, expanded),
    [nodes, expanded],
  );
  const indexById = useMemo(() => {
    const m = new Map<string, number>();
    flat.forEach((r, i) => m.set(r.node.id, i));
    return m;
  }, [flat]);

  const setOpen = (id: string, open: boolean) =>
    setExpanded((e) => ({ ...e, [id]: open }));

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

  const onKeyDown = (e: React.KeyboardEvent, node: TreeNode<T>) => {
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
        if (hasChildren) setOpen(node.id, !isOpen);
        else selectNode(node);
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
      const path = findPath(nodes, id) ?? [];
      if (path.length)
        setExpanded((e) => {
          const next = { ...e };
          path.forEach((a) => (next[a] = true));
          return next;
        });
    },
    expandAll: (open) => {
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
      return (
        <div
          key={node.id}
          role="treeitem"
          data-node-id={node.id}
          aria-expanded={hasChildren ? open : undefined}
          aria-selected={selectable ? isSelected : undefined}
          aria-level={d + 1}
          tabIndex={
            selectable
              ? isSelected ||
                (activeId === null && indexById.get(node.id) === 0)
                ? 0
                : -1
              : undefined
          }
          className={`en-tree-row${isSelected ? " is-selected" : ""}`}
          style={{ height: rowHeight, paddingLeft: d * 16 + 6 }}
          onClick={selectable ? () => selectNode(node) : undefined}
          onKeyDown={selectable ? (e) => onKeyDown(e, node) : undefined}
        >
          {hasChildren ? (
            <button
              type="button"
              className="en-tree-toggle"
              tabIndex={-1}
              aria-label={open ? "Collapse" : "Expand"}
              onClick={(e) => {
                e.stopPropagation();
                setOpen(node.id, !open);
              }}
            >
              {open ? (
                <ExpandMoreIcon sx={{ fontSize: 15 }} />
              ) : (
                <ChevronRightIcon sx={{ fontSize: 15 }} />
              )}
            </button>
          ) : (
            <span className="en-tree-toggle is-leaf" aria-hidden="true" />
          )}
          {hasChildren ? (
            open ? (
              <FolderOpenOutlinedIcon
                className="en-tree-icon"
                sx={{ fontSize: 15 }}
              />
            ) : (
              <FolderOutlinedIcon
                className="en-tree-icon"
                sx={{ fontSize: 15 }}
              />
            )
          ) : (
            <ArticleOutlinedIcon
              className="en-tree-icon en-tree-icon-leaf"
              sx={{ fontSize: 14 }}
            />
          )}
          <span className="en-tree-label" title={node.label}>
            {node.label}
          </span>
          {columns?.map((col, i) => (
            <span
              key={i}
              className="en-tree-cell"
              style={col.width ? { width: col.width, flex: "none" } : undefined}
            >
              {col.render(node)}
            </span>
          ))}
        </div>
      );
    });

  return (
    <div
      className={`en-tree${selectable ? " en-tree-selectable" : ""} ${className}`.trim()}
      ref={listRef}
    >
      {columns?.length ? (
        <div className="en-tree-head" role="row">
          <span className="en-tree-toggle is-leaf" aria-hidden="true" />
          <span className="en-tree-icon is-hidden" aria-hidden="true" />
          <span className="en-tree-label en-tree-head-label">Menu</span>
          {columns.map((col, i) => (
            <span
              key={i}
              className="en-tree-cell en-tree-head-cell"
              style={col.width ? { width: col.width, flex: "none" } : undefined}
            >
              {col.header}
            </span>
          ))}
        </div>
      ) : null}
      <div role="tree" aria-label={ariaLabel} className="en-tree-list">
        {renderRows(flat)}
      </div>
    </div>
  );
}

// forwardRef with generics: cast keeps <EnTree<T>> usable at call sites.
const EnTree = forwardRef(EnTreeInner) as <T>(
  props: EnTreeProps<T> & { ref?: React.ForwardedRef<EnTreeHandle> },
) => React.ReactElement;
export default EnTree;

/* Convenience: a small MUI checkbox used inside permission-tree cells. */
export function EnTreeCheck({
  checked,
  indeterminate,
  onChange,
  ariaLabel,
}: {
  checked: boolean;
  indeterminate?: boolean;
  onChange: (checked: boolean) => void;
  ariaLabel?: string;
}) {
  return (
    <Checkbox
      checked={checked}
      indeterminate={indeterminate}
      onChange={(e) => onChange(e.target.checked)}
      onClick={(e) => e.stopPropagation()}
      size="small"
      slotProps={{ input: { "aria-label": ariaLabel } }}
      sx={{ padding: "1px" }}
    />
  );
}
