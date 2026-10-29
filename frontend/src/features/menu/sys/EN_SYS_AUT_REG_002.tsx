import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  EnTreeView,
  type TreeNode,
  type TreeColumn,
} from "../../../components/tree";
import { EnTreeCheck } from "../../../components/controls";
import {
  SearchPanel,
  SearchPanelField,
} from "../../../components/search-panel";
import type { ScreenHandle, ScreenProps } from "../../screen-contract";
import { fnGetDataSet, fnSave } from "../../../api/endpoints";
import type { RoleMenuDto, RoleMenuItem, SaveResponse } from "../../../api/contracts";
import { ApiError } from "../../../api/http";
import { showEnConfirm, showEnDialog } from "../../../widgets/EnDialogService";

const ROLES = [
  { key: "employee", fg: "0", label: "Employee" },
  { key: "teamLead", fg: "1", label: "Team Lead" },
  { key: "manager", fg: "2", label: "Manager" },
  { key: "boss", fg: "3", label: "Boss" },
] as const;

type MenuRow = RoleMenuDto & { cdMenuParent?: string | null };

function buildTree(rows: MenuRow[]): TreeNode<MenuRow>[] {
  const byId = new Map<string, TreeNode<MenuRow>>();
  const roots: TreeNode<MenuRow>[] = [];
  for (const r of rows)
    byId.set(r.cdMenu, { id: r.cdMenu, label: r.nmMenu, children: [], data: r });
  for (const r of rows) {
    const node = byId.get(r.cdMenu)!;
    const parent = r.cdMenuParent ? byId.get(r.cdMenuParent) : undefined;
    if (parent) parent.children!.push(node);
    else roots.push(node);
  }
  const sortRec = (ns: TreeNode<MenuRow>[]) => {
    ns.sort((a, b) => (a.data?.noPos ?? "").localeCompare(b.data?.noPos ?? ""));
    ns.forEach((n) => sortRec(n.children ?? []));
  };
  sortRec(roots);
  return roots;
}

/**
 * Role ↔ menu matrix (sys_rolemenu) — mirrors M_SYS_AUT_REG_002.
 * Menu tree rows × role checkboxes; toggles write RoleMenuItem rows on save.
 */
export const RoleMenuRegister = forwardRef<ScreenHandle, ScreenProps>(
  function RoleMenuRegister(_props, ref) {
    const [rows, setRows] = useState<MenuRow[]>([]);
    const [dirty, setDirty] = useState(false);
    const changed = useRef<Map<string, RoleMenuItem>>(new Map());

    const load = useCallback(async () => {
      try {
        const data = await fnGetDataSet<RoleMenuDto[]>("RoleMenus");
        setRows(data);
        changed.current.clear();
        setDirty(false);
      } catch (e) {
        await showEnDialog("error", e instanceof ApiError ? e.message : "Failed to load role menus.");
      }
    }, []);

    
/** Menu codes below rootCdMenu (excluding itself), following
 * cd_menu_parent; cycle-safe so malformed data cannot loop. */
function collectDescendantIds(rows: MenuRow[], rootCdMenu: string): string[] {
  const byParent = new Map<string, string[]>();
  for (const r of rows) {
    const parent = r.cdMenuParent;
    if (!parent || parent === r.cdMenu) continue;
    const list = byParent.get(parent);
    if (list) list.push(r.cdMenu);
    else byParent.set(parent, [r.cdMenu]);
  }
  const out: string[] = [];
  const seen = new Set<string>([rootCdMenu]);
  const stack = [...(byParent.get(rootCdMenu) ?? [])];
  while (stack.length) {
    const id = stack.pop()!;
    if (seen.has(id)) continue;
    seen.add(id);
    out.push(id);
    const kids = byParent.get(id);
    if (kids) stack.push(...kids);
  }
  return out;
}

const tree = useMemo(() => buildTree(rows), [rows]);

    const toggle = useCallback(
      (cdMenu: string, role: (typeof ROLES)[number], checked: boolean) => {
        // Folder ticks cascade visually over the whole subtree. The backend
        // mirrors this on save (cascade-on-write), so `changed` keeps only
        // the toggled row - the backend writes the descendant rows.
        const isFolder =
          rows.find((r) => r.cdMenu === cdMenu)?.fgType === "F";
        const ids = new Set(
          isFolder
            ? [cdMenu, ...collectDescendantIds(rows, cdMenu)]
            : [cdMenu],
        );
        setRows((current) =>
          current.map((r) =>
            ids.has(r.cdMenu) ? { ...r, [role.key]: checked } : r,
          ),
        );
        changed.current.set(`${role.fg}:${cdMenu}`, {
          cdMenu,
          fgRole: role.fg,
          isAssigned: checked,
        });
        setDirty(true);
      },
      [rows],
    );

    const columns = useMemo<TreeColumn<MenuRow>[]>(
      () =>
        ROLES.map((role) => ({
          header: role.label,
          width: 78,
          render: (node) =>
            node.data ? (
              <EnTreeCheck
                checked={Boolean(node.data[role.key])}
                ariaLabel={`${role.label} — ${node.data.nmMenu}`}
                onChange={(c) => toggle(node.data!.cdMenu, role, c)}
              />
            ) : null,
        })),
      [toggle],
    );

    const save = useCallback(async () => {
      if (!changed.current.size) {
        await showEnDialog("info", "There are no changes to save.");
        return;
      }
      try {
        const items: RoleMenuItem[] = [...changed.current.values()];
        const res = await fnSave<SaveResponse>("RoleMenus", items);
        setDirty(false);
        changed.current.clear();
        await showEnDialog("success", `Successfully saved ${res.savedCount ?? items.length} role assignment${res.savedCount === 1 ? "" : "s"}.`);
        await load();
      } catch (e) {
        await showEnDialog("error", e instanceof ApiError ? e.message : "Save failed.");
      }
    }, [load]);

    useImperativeHandle(
      ref,
      () => ({
        search: () => void load(),
        save: () => {
          void save();
        },
        canClose: async () =>
          !dirty || (await showEnConfirm("Discard unsaved role-menu changes?")) === true,
      }),
      [dirty, load, save],
    );

    return (
      <div className="feature-screen po-prototype">
        <SearchPanel ariaLabel="Role menu">
          <SearchPanelField title="Role" htmlFor="rolemenu-note">
            <span className="px-1 text-xs text-[#8a97a5]">
              Tick a role to grant that menu
            </span>
          </SearchPanelField>
        </SearchPanel>

        <div className="po-detail-panel" style={{ marginTop: 12 }}>
          <div className="form-section-title" style={{ padding: "10px 12px" }}>
            <div>
              <h2>Role ↔ menu access</h2>
              <p>Check which roles can open each menu.</p>
            </div>
            <span className="draft-state">{dirty ? "Unsaved" : "Saved"}</span>
          </div>
          <div className="flex-1 min-h-0 overflow-auto">
            <EnTreeView<MenuRow>
              nodes={tree}
              columns={columns}
              className="en-treeview--matrix"
              defaultExpandedDepth={2}
              ariaLabel="Menu role matrix"
            />
          </div>
        </div>
      </div>
    );
  },
);



