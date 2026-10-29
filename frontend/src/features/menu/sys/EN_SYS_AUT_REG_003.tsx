import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { AgDataGrid } from "../../../components/data-grid/AgDataGrid";
import type {
  AgColDef,
  AgDataGridHandle,
  AgRow,
} from "../../../components/data-grid/agDataGridTypes";
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
import { callApi, fnGetDataSet } from "../../../api/endpoints";
import type {
  MenuDto,
  SaveResponse,
  UserDto,
  UserMenuDto,
  UserMenuItem,
} from "../../../api/contracts";
import { ApiError } from "../../../api/http";
import { showEnConfirm, showEnDialog } from "../../../widgets/EnDialogService";
import { useApp } from "../../../app/AppContext";

const roleNames: Record<string, string> = {
  "0": "Employee",
  "1": "Team Lead",
  "2": "Manager",
  "3": "Boss",
};

const userColDefs: AgColDef[] = [
  { field: "cdUser", headerName: "USER", width: 100 },
  { field: "nmUser", headerName: "NAME", flex: 1, minWidth: 140 },
  {
    field: "fgRole",
    headerName: "ROLE",
    width: 110,
    cellRenderer: (p: { value: string }) => roleNames[p.value] ?? p.value,
  },
];

type MenuNodeData = {
  cdMenu: string;
  cdMenuParent?: string | null;
  /** per-user overrides keyed by cd_user в†’ 'A' | 'N' */
  byUser: Record<string, string>;
};

function buildTree(
  menus: MenuDto[],
  userMenus: UserMenuDto[],
): TreeNode<MenuNodeData>[] {
  const byUser: Record<string, Record<string, string>> = {};
  for (const um of userMenus) {
    byUser[um.cdUser] ??= {};
    byUser[um.cdUser][um.cdMenu] = um.fgAction ?? "";
  }
  const byId = new Map<string, TreeNode<MenuNodeData>>();
  const roots: TreeNode<MenuNodeData>[] = [];
  for (const m of menus)
    byId.set(m.cdMenu, {
      id: m.cdMenu,
      label: m.nmMenu,
      children: [],
      data: { cdMenu: m.cdMenu, cdMenuParent: m.cdMenuParent, byUser: {} },
    });
  // attach per-user overrides
  for (const m of menus) {
    const node = byId.get(m.cdMenu)!;
    node.data = { ...node.data!, byUser: Object.fromEntries(Object.entries(byUser).map(([u, map]) => [u, map[m.cdMenu] ?? ""])) };
    const parent = m.cdMenuParent ? byId.get(m.cdMenuParent) : undefined;
    if (parent) parent.children!.push(node);
    else roots.push(node);
  }
  const sortRec = (ns: TreeNode<MenuNodeData>[]) => {
    ns.sort((a, b) => a.id.localeCompare(b.id));
    ns.forEach((n) => sortRec(n.children ?? []));
  };
  sortRec(roots);
  return roots;
}

type Action = "" | "A" | "N";

/**
 * User в†” menu permission (sys_usermenu) вЂ” mirrors M_SYS_AUT_REG_003.
 * User grid + menu tree with Allow / Not-Allow checkboxes filtered to the
 * focused user. Blank = inherit (override removed on save).
 */
export const UserMenuRegister = forwardRef<ScreenHandle, ScreenProps>(
  function UserMenuRegister(_props, ref) {
    const { user } = useApp();
    const cdCom = user?.cdCom ?? "";
    const [users, setUsers] = useState<UserDto[]>([]);
    const [tree, setTree] = useState<TreeNode<MenuNodeData>[]>([]);
    const [focusedUser, setFocusedUser] = useState<string | null>(null);
    const [dirty, setDirty] = useState(false);
    const [busy, setBusy] = useState(false);
    const changed = useRef<Map<string, UserMenuItem>>(new Map());
    const gridRef = useRef<AgDataGridHandle>(null);

    const load = useCallback(async () => {
      if (!cdCom) return;
      setBusy(true);
      try {
        const [userList, menuRows, userMenus] = await Promise.all([
          fnGetDataSet<UserDto[]>("Users"),
          fnGetDataSet<MenuDto[]>("Menus"),
          fnGetDataSet<UserMenuDto[]>("UserMenus", { cdCompany: cdCom }),
        ]);
        setUsers(userList);
        setTree(buildTree(menuRows, userMenus));
        changed.current.clear();
        setDirty(false);
      } catch (e) {
        await showEnDialog("error", e instanceof ApiError ? e.message : "Failed to load user menus.");
      } finally {
        setBusy(false);
      }
    }, [cdCom]);

    useEffect(() => {
      void load();
    }, [load]);

    const setAction = useCallback(
      (cdMenu: string, action: Action) => {
        if (!focusedUser) return;
        setTree((current) => {
          const update = (ns: TreeNode<MenuNodeData>[]): TreeNode<MenuNodeData>[] =>
            ns.map((n) =>
              n.id === cdMenu
                ? {
                    ...n,
                    data: {
                      ...n.data!,
                      byUser: { ...n.data!.byUser, [focusedUser]: action },
                    },
                  }
                : { ...n, children: n.children ? update(n.children) : n.children },
            );
          return update(current);
        });
        changed.current.set(`${focusedUser}:${cdMenu}`, {
          cdUser: focusedUser,
          cdMenu,
          fgAction: action || null,
          state: action ? undefined : "D",
        });
        setDirty(true);
      },
      [focusedUser],
    );

    const columns = useMemo<TreeColumn<MenuNodeData>[]>(
      () => [
        {
          header: "Allow",
          width: 70,
          render: (node) => {
            const action = focusedUser
              ? node.data?.byUser[focusedUser]
              : undefined;
            return (
              <EnTreeCheck
                checked={action === "A"}
                ariaLabel={`Allow ${node.label}`}
                onChange={(c) => setAction(node.id, c ? "A" : "")}
              />
            );
          },
        },
        {
          header: "Not allow",
          width: 80,
          render: (node) => {
            const action = focusedUser
              ? node.data?.byUser[focusedUser]
              : undefined;
            return (
              <EnTreeCheck
                checked={action === "N"}
                ariaLabel={`Deny ${node.label}`}
                onChange={(c) => setAction(node.id, c ? "N" : "")}
              />
            );
          },
        },
      ],
      [focusedUser, setAction],
    );

    const handleFocusedRow = useCallback(
      (row: AgRow | null) => {
        setFocusedUser(row?.cdUser ? String(row.cdUser) : null);
      },
      [],
    );

    const save = useCallback(async () => {
      if (!changed.current.size) {
        await showEnDialog("info", "There are no changes to save.");
        return;
      }
      if (!cdCom) return;
      setBusy(true);
      try {
        const res = await callApi<SaveResponse>("UserMenus/save", {
          method: "POST",
          body: { cdCompany: cdCom, items: [...changed.current.values()] },
        });
        setDirty(false);
        changed.current.clear();
        await showEnDialog("success", `Successfully saved ${res.savedCount ?? 0} user-menu assignment${res.savedCount === 1 ? "" : "s"}.`);
        await load();
      } catch (e) {
        await showEnDialog("error", e instanceof ApiError ? e.message : "Save failed.");
      } finally {
        setBusy(false);
      }
    }, [cdCom, load]);

    useImperativeHandle(
      ref,
      () => ({
        search: () => void load(),
        save: () => {
          void save();
        },
        canClose: async () =>
          !dirty || (await showEnConfirm("Discard unsaved user-menu changes?")) === true,
      }),
      [dirty, load, save],
    );

    return (
      <div className="feature-screen po-prototype">
        <SearchPanel ariaLabel="User menu permission">
          <SearchPanelField title="User" htmlFor="usermenu-note">
            <span className="px-1 text-xs text-[#8a97a5]">
              {busy
                ? "LoadingвЂ¦"
                : focusedUser
                  ? `Editing ${focusedUser}`
                  : "Select a user to assign menus"}
            </span>
          </SearchPanelField>
        </SearchPanel>

        <div className="flex min-h-0 flex-1 gap-3 pt-3">
          <div className="po-detail-panel" style={{ width: "42%" }}>
            <div className="form-section-title" style={{ padding: "10px 12px" }}>
              <div>
                <h2>Users</h2>
                <p>Pick a user to set their menu access.</p>
              </div>
            </div>
            <div className="enotes-ag-grid-wrap" style={{ flex: 1 }}>
              <AgDataGrid
                ref={gridRef}
                ariaLabel="Users"
                columnDefs={userColDefs}
                rowData={users as unknown as AgRow[]}
                getRowId={(data) => String((data as unknown as UserDto).cdUser)}
                onFocusedRowChanged={handleFocusedRow}
                isEditable={false}
              />
            </div>
          </div>

          <div className="po-detail-panel" style={{ width: "58%" }}>
            <div className="form-section-title" style={{ padding: "10px 12px" }}>
              <div>
                <h2>Menu access</h2>
                <p>
                  {focusedUser
                    ? `Allow / deny menus for ${focusedUser}`
                    : "Select a user first."}
                </p>
              </div>
              <span className="draft-state">{dirty ? "Unsaved" : "Saved"}</span>
            </div>
            <div className="flex-1 min-h-0 overflow-auto">
              <EnTree<MenuNodeData>
                nodes={tree}
                columns={columns}
                ariaLabel="User menu access"
              />
            </div>
          </div>
        </div>
      </div>
    );
  },
);

