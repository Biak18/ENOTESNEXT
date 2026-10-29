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
  CompanyDto,
  CompanyMenuDto,
  CompanyMenuItem,
  MenuDto,
  SaveResponse,
  UserDto,
} from "../../../api/contracts";
import { ApiError } from "../../../api/http";
import { showEnConfirm, showEnDialog } from "../../../widgets/EnDialogService";

const companyColDefs: AgColDef[] = [
  { field: "cdCompany", headerName: "COMPANY", width: 100 },
  { field: "nmCompany", headerName: "COMPANY NAME", flex: 1, minWidth: 140 },
];
const userColDefs: AgColDef[] = [
  { field: "cdUser", headerName: "USER", width: 90 },
  { field: "nmUser", headerName: "NAME", flex: 1, minWidth: 120 },
];

type NodeData = { cdMenu: string; fgType?: string | null; cdMenuParent?: string | null };

function buildMenuTree(menus: MenuDto[]): TreeNode<NodeData>[] {
  const byId = new Map<string, TreeNode<NodeData>>();
  const roots: TreeNode<NodeData>[] = [];
  for (const m of menus)
    byId.set(m.cdMenu, {
      id: m.cdMenu,
      label: m.nmMenu,
      children: [],
      data: { cdMenu: m.cdMenu, fgType: m.fgType, cdMenuParent: m.cdMenuParent },
    });
  for (const m of menus) {
    const node = byId.get(m.cdMenu)!;
    const parent = m.cdMenuParent ? byId.get(m.cdMenuParent) : undefined;
    if (parent) parent.children!.push(node);
    else roots.push(node);
  }
  const sortRec = (ns: TreeNode<NodeData>[]) => {
    ns.sort((a, b) => a.id.localeCompare(b.id));
    ns.forEach((n) => sortRec(n.children ?? []));
  };
  sortRec(roots);
  return roots;
}

/**
 * Company в†” menu grant (sys_companymenu) вЂ” mirrors M_SYS_AUT_REG_001.
 * Company grid + user grid + two menu trees (Available в†’ Assigned). Tick a
 * menu in Assigned to grant it to the focused company.
 */
export const CompanyMenuRegister = forwardRef<ScreenHandle, ScreenProps>(
  function CompanyMenuRegister(_props, ref) {
    const [companies, setCompanies] = useState<CompanyDto[]>([]);
    const [users, setUsers] = useState<UserDto[]>([]);
    const [menuTree, setMenuTree] = useState<TreeNode<NodeData>[]>([]);
    const [assigned, setAssigned] = useState<Set<string>>(new Set());
    const [focusedCompany, setFocusedCompany] = useState<string | null>(null);
    const [dirty, setDirty] = useState(false);
    const [busy, setBusy] = useState(false);
    const changed = useRef<Map<string, boolean>>(new Map());
    const companyGridRef = useRef<AgDataGridHandle>(null);
    const userGridRef = useRef<AgDataGridHandle>(null);

    const load = useCallback(async () => {
      setBusy(true);
      try {
        const [companyList, userList, menus] = await Promise.all([
          fnGetDataSet<CompanyDto[]>("Companies"),
          fnGetDataSet<UserDto[]>("Users"),
          fnGetDataSet<MenuDto[]>("Menus"),
        ]);
        setCompanies(companyList);
        setUsers(userList);
        setMenuTree(buildMenuTree(menus));
        setAssigned(new Set());
        changed.current.clear();
        setDirty(false);
      } catch (e) {
        await showEnDialog("error", e instanceof ApiError ? e.message : "Failed to load data.");
      } finally {
        setBusy(false);
      }
    }, []);

    useEffect(() => {
      void load();
    }, [load]);

    // Load the focused company's assigned menus.
    const loadAssigned = useCallback(
      async (cdCompany: string) => {
        setBusy(true);
        try {
          const rows = await fnGetDataSet<CompanyMenuDto[]>(
            `CompanyMenus/${encodeURIComponent(cdCompany)}`,
          );
          setAssigned(new Set(rows.filter((r) => r.isAssigned).map((r) => r.cdMenu)));
          changed.current.clear();
          setDirty(false);
        } catch (e) {
          await showEnDialog("error", e instanceof ApiError ? e.message : "Failed to load assigned menus.");
        } finally {
          setBusy(false);
        }
      },
      []
    );

    const handleCompanyFocus = useCallback(
      (row: AgRow | null) => {
        const cd = row?.cdCompany ? String(row.cdCompany) : null;
        setFocusedCompany(cd);
        if (cd) void loadAssigned(cd);
        else setAssigned(new Set());
      },
      [loadAssigned],
    );

    const toggle = useCallback(
      async (cdMenu: string, checked: boolean) => {
        if (!focusedCompany) {
          await showEnDialog("error", "Select a company first.");
          return;
        }
        setAssigned((current) => {
          const next = new Set(current);
          if (checked) next.add(cdMenu);
          else next.delete(cdMenu);
          return next;
        });
        changed.current.set(cdMenu, checked);
        setDirty(true);
      },
      [focusedCompany],
    );

    const columns = useMemo<TreeColumn<NodeData>[]>(
      () => [
        {
          header: "Assigned",
          width: 80,
          render: (node) => (
            <EnTreeCheck
              checked={assigned.has(node.id)}
              ariaLabel={`Assign ${node.label}`}
              onChange={(c) => toggle(node.id, c)}
            />
          ),
        },
      ],
      [assigned, toggle],
    );

    const save = useCallback(async () => {
      if (!focusedCompany) {
        await showEnDialog("error", "Select a company first.");
        return;
      }
      if (!changed.current.size) {
        await showEnDialog("info", "There are no changes to save.");
        return;
      }
      setBusy(true);
      try {
        const items: CompanyMenuItem[] = [...changed.current.entries()].map(
          ([cdMenu, isAssigned]) => ({ cdMenu, isAssigned }),
        );
        const res = await callApi<SaveResponse>("CompanyMenus/save", {
          method: "POST",
          body: { cdCompany: focusedCompany, items },
        });
        setDirty(false);
        changed.current.clear();
        await showEnDialog("success", `Successfully saved ${res.savedCount ?? items.length} assignment${(res.savedCount ?? items.length) === 1 ? "" : "s"}.`);
      } catch (e) {
        await showEnDialog("error", e instanceof ApiError ? e.message : "Save failed.");
      } finally {
        setBusy(false);
      }
    }, [focusedCompany]);

    useImperativeHandle(
      ref,
      () => ({
        search: () => void load(),
        save: () => {
          void save();
        },
        canClose: async () =>
          !dirty || (await showEnConfirm("Discard unsaved company-menu changes?")) === true,
      }),
      [dirty, load, save],
    );

    return (
      <div className="feature-screen po-prototype">
        <SearchPanel ariaLabel="Company menu access">
          <SearchPanelField title="Company" htmlFor="companymenu-note">
            <span className="px-1 text-xs text-[#8a97a5]">
              {busy
                ? "LoadingвЂ¦"
                : focusedCompany
                  ? `Assigning menus to ${focusedCompany}`
                  : "Select a company to assign menus"}
            </span>
          </SearchPanelField>
        </SearchPanel>

        <div className="flex min-h-0 flex-1 gap-3 pt-3">
          <div className="flex flex-col gap-3" style={{ width: "46%" }}>
            <div className="po-detail-panel" style={{ flex: 1 }}>
              <div className="form-section-title" style={{ padding: "8px 12px" }}>
                <h2 style={{ fontSize: 12 }}>Companies</h2>
              </div>
              <div className="enotes-ag-grid-wrap" style={{ flex: 1 }}>
                <AgDataGrid
                  ref={companyGridRef}
                  ariaLabel="Companies"
                  columnDefs={companyColDefs}
                  rowData={companies as unknown as AgRow[]}
                  getRowId={(data) => String((data as unknown as CompanyDto).cdCompany)}
                  onFocusedRowChanged={handleCompanyFocus}
                  isEditable={false}
                />
              </div>
            </div>
            <div className="po-detail-panel" style={{ flex: 1 }}>
              <div className="form-section-title" style={{ padding: "8px 12px" }}>
                <h2 style={{ fontSize: 12 }}>Users in company</h2>
              </div>
              <div className="enotes-ag-grid-wrap" style={{ flex: 1 }}>
                <AgDataGrid
                  ref={userGridRef}
                  ariaLabel="Users"
                  columnDefs={userColDefs}
                  rowData={users as unknown as AgRow[]}
                  getRowId={(data) => String((data as unknown as UserDto).cdUser)}
                  isEditable={false}
                />
              </div>
            </div>
          </div>

          <div className="po-detail-panel" style={{ width: "54%" }}>
            <div className="form-section-title" style={{ padding: "10px 12px" }}>
              <div>
                <h2>Assigned menus</h2>
                <p>
                  {focusedCompany
                    ? `Menus ${focusedCompany} can access`
                    : "Select a company first."}
                </p>
              </div>
              <span className="draft-state">{dirty ? "Unsaved" : "Saved"}</span>
            </div>
            <div className="flex-1 min-h-0 overflow-auto">
              <EnTree<NodeData>
                nodes={menuTree}
                columns={columns}
                ariaLabel="Company menu access"
              />
            </div>
          </div>
        </div>
      </div>
    );
  },
);







