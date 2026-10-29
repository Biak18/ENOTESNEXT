import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  EnTree,
  EnTreeCheck,
} from "../../../components/controls";
import type { TreeNode, TreeColumn } from "../../../components/controls";
import {
  SearchPanel,
  SearchPanelField,
} from "../../../components/search-panel";
import type { ScreenHandle, ScreenProps } from "../../screen-contract";
import { fnGetDataSet, fnSave } from "../../../api/endpoints";
import type { RoleMenuDto, RoleMenuItem, SaveResponse } from "../../../api/contracts";
import { ApiError } from "../../../api/http";
import { showEnDialog } from "../../../widgets/EnDialogService";

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
 * Role в†” menu matrix (sys_rolemenu) вЂ” mirrors M_SYS_AUT_REG_002.
 * Menu tree rows Г— role checkboxes; toggles write RoleMenuItem rows on save.
 */
export const RoleMenuRegister = forwardRef<ScreenHandle, ScreenProps>(
  function RoleMenuRegister(_props, ref) {
    const [rows, setRows] = useState<MenuRow[]>([]);
    const [dirty, setDirty] = useState(false);
    const [busy, setBusy] = useState(false);
    const changed = useRef<Map<string, RoleMenuItem>>(new Map());

    const load = useCallback(async () => {
      setBusy(true);
      try {
        const data = await fnGetDataSet<RoleMenuDto[]>("RoleMenus");
        setRows(data);
        changed.current.clear();
        setDirty(false);
      } catch (e) {
        await showEnDialog("error", e instanceof ApiError ? e.message : "Failed to load role menus.");
      } finally {
        setBusy(false);
      }
    }, []);

    useEffect(() => {
      void load();
    }, [load]);

    const tree = useMemo(() => buildTree(rows), [rows]);

    const toggle = useCallback(
      (cdMenu: string, role: (typeof ROLES)[number], checked: boolean) => {
        setRows((current) =>
          current.map((r) =>
            r.cdMenu === cdMenu ? { ...r, [role.key]: checked } : r,
          ),
        );
        changed.current.set(`${role.fg}:${cdMenu}`, {
          cdMenu,
          fgRole: role.fg,
          isAssigned: checked,
        });
        setDirty(true);
      },
      [],
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
                ariaLabel={`${role.label} вЂ” ${node.data.nmMenu}`}
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
      setBusy(true);
      try {
        const items: RoleMenuItem[] = [...changed.current.values()];
        const res = await fnSave<SaveResponse>("RoleMenus", items);
        setDirty(false);
        changed.current.clear();
        await showEnDialog("success", `Successfully saved ${res.savedCount ?? items.length} role assignment${res.savedCount === 1 ? "" : "s"}.`);
        await load();
      } catch (e) {
        await showEnDialog("error", e instanceof ApiError ? e.message : "Save failed.");
      } finally {
        setBusy(false);
      }
    }, [load]);

    useImperativeHandle(
      ref,
      () => ({
        search: () => void load(),
        save: () => {
          void save();
        },
        canClose: () =>
          !dirty || window.confirm("Discard unsaved role-menu changes?"),
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
              <h2>Role в†” menu access</h2>
              <p>{busy ? "LoadingвЂ¦" : "Check which roles can open each menu."}</p>
            </div>
            <span className="draft-state">{dirty ? "Unsaved" : "Saved"}</span>
          </div>
          <div className="flex-1 min-h-0 overflow-auto">
            <EnTree<MenuRow>
              nodes={tree}
              columns={columns}
              ariaLabel="Menu role matrix"
            />
          </div>
        </div>
      </div>
    );
  },
);


