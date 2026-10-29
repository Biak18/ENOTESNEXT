import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ColDef } from "ag-grid-community";
import { AgDataGrid } from "../../../components/data-grid/AgDataGrid";
import type {
  AgColDef,
  AgDataGridHandle,
  AgRow,
} from "../../../components/data-grid/agDataGridTypes";
import { EnComboBox, EnTextBox } from "../../../components/controls";
import TextField from "@mui/material/TextField";
import {
  SearchPanel,
  SearchPanelField,
} from "../../../components/search-panel";
import type { ScreenHandle, ScreenProps } from "../../screen-contract";
import { fnGetDataSet, fnSave } from "../../../api/endpoints";
import type { SaveResponse, UserDto, UserItem } from "../../../api/contracts";
import { ApiError } from "../../../api/http";
import { showEnConfirm, showEnDialog } from "../../../widgets/EnDialogService";
import EnCommonModal from "../../../widgets/EnCommonModal";
import { useApp } from "../../../app/AppContext";

// This screen's own backend controller (SNOTES: each menu owns its endpoint).
const CONTROLLER = "Users";

type UserRow = UserDto & {
  dcPassword?: string;
  __new?: boolean;
  _key?: string;
};

const roleOptions = [
  { code: "0", name: "Employee" },
  { code: "1", name: "Team Lead" },
  { code: "2", name: "Manager" },
  { code: "3", name: "Boss" },
  { code: "SUPER_ADMIN", name: "Super Admin" },
];
const ynOptions = [
  { code: "Y", name: "Yes" },
  { code: "N", name: "No" },
];

const editableFields = new Set<string>([
  "cdUser",
  "nmUser",
  "dtReg",
  "dcEmail",
  "dcAddress1",
  "dcAddress2",
  "noTel",
  "ynActive",
  "fgRole",
]);

const baseColumnDefs: AgColDef[] = [
  { field: "cdUser", headerName: "USER", width: 100 },
  { field: "nmUser", headerName: "NAME", flex: 1, minWidth: 150 },
  { field: "dtReg", headerName: "REG DATE", width: 120, colType: "date" },
  { field: "dcEmail", headerName: "EMAIL", width: 170 },
  { field: "noTel", headerName: "TEL", width: 110 },
  {
    field: "dcPassword",
    headerName: "PASSWORD",
    width: 120,
    cellRenderer: PasswordCell,
    editable: false,
  },
  {
    field: "ynActive",
    headerName: "ACTIVE",
    width: 78,
    colType: "lookup",
    lookupOptions: ynOptions,
  },
  {
    field: "fgRole",
    headerName: "ROLE",
    width: 120,
    colType: "lookup",
    lookupOptions: roleOptions,
  },
];

/**
 * User register (sys_user) вЂ” mirrors SN_SYS_BAS_REG_001.
 * SearchPanel + editable grid, saved via POST /api/v1/Users/save. Real API.
 */
function PasswordCell() {
  // Backend does not return dcPassword in list response (security).
  // Always show mask indicator so users know a password exists / can be set.
  return (
    <span title="Double-click to change password">{"\u2022\u2022\u2022\u2022\u2022\u2022"}</span>
  );
}

export const UserRegister = forwardRef<ScreenHandle, ScreenProps>(
  function UserRegister({ searchRef }, ref) {
    const { user } = useApp();
    const [rows, setRows] = useState<UserRow[]>([]);
    const [search, setSearch] = useState("");
    const [focusedIdx, setFocusedIdx] = useState<number | null>(null);
    const [dirty, setDirty] = useState(false);
    const [pwdModal, setPwdModal] = useState<{ cdUser: string; nmUser: string } | null>(null);
    const [newPassword, setNewPassword] = useState("");
    const [oldPassword, setOldPassword] = useState("");
    const [invalidCell, setInvalidCell] = useState<{
      rowId: string;
      prop: string;
      message: string;
    } | null>(null);
    const [busy, setBusy] = useState(false);
    const gridRef = useRef<AgDataGridHandle>(null);

    const load = useCallback(async () => {
      setBusy(true);
      try {
        const data = await fnGetDataSet<UserDto[]>(CONTROLLER, {
          search: search || undefined,
        });
        // Stamp a stable unique key on every row so AG-Grid's getRowId is
        // deterministic across re-renders (prevents blank/duplicated rows).
        setRows(data.map((r) => ({ ...r, _key: `u-${r.cdCom}:${r.cdUser}` })));
        setFocusedIdx(null);
        setDirty(false);
        setInvalidCell(null);
        gridRef.current?.clearDirtyRows();
      } catch (e) {
        await showEnDialog(
          "error",
          e instanceof ApiError ? e.message : "Failed to load users.",
        );
      } finally {
        setBusy(false);
      }
    }, [search]);

    const columns = useMemo<ColDef[]>(
      () =>
        baseColumnDefs.map((col) => {
          const field = String(col.field);
          return {
            ...col,
            cellClass: (params) =>
              [
                typeof col.cellClass === "string" ? col.cellClass : "",
                invalidCell?.rowId === String(params.data?.cdUser) &&
                invalidCell.prop === field
                  ? "enotes-invalid-cell"
                  : "",
              ]
                .filter(Boolean)
                .join(" "),
            valueSetter: editableFields.has(field)
              ? (params) => {
                  const value = String(params.newValue ?? "").trim();
                  if (field === "cdUser" && !value) {
                    const msg = "User code is required.";
                    setInvalidCell({
                      rowId: String(
                        params.data.cdUser ?? params.node?.rowIndex,
                      ),
                      prop: field,
                      message: msg,
                    });
                    showEnDialog("error", msg);
                    return false;
                  }
                  if (
                    field === "ynActive" &&
                    value &&
                    !ynOptions.some((o) => o.code === value)
                  ) {
                    const msg = "Active must be Y or N.";
                    showEnDialog("error", msg);
                    return false;
                  }
                  setInvalidCell((current) =>
                    current?.rowId === String(params.data.cdUser) &&
                    current.prop === field
                      ? null
                      : current,
                  );
                  (params.data as Record<string, unknown>)[field] = value;
                  return true;
                }
              : undefined,
          };
        }),
      [invalidCell],
    );

    // Toolbar Search re-runs the query (SNOTES onSearch), not just focus.
    const onSearch = useCallback(() => {
      void load();
    }, [load]);

    const addRow = useCallback(() => {
      setRows((current) => {
        const blank: UserRow = {
          cdCom: user?.cdCom ?? "",
          cdUser: "",
          nmUser: "",
          dcPassword: "",
          dtReg: new Date().toISOString().slice(0, 10).replace(/-/g, ""),
          ynActive: "Y",
          fgRole: "0",
          __new: true,
          _key: `__new-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        };
        setFocusedIdx(current.length);
        return [...current, blank];
      });
      setDirty(true);
      window.setTimeout(() => gridRef.current?.focusLastRow(), 0);
      // showEnDialog("info", "A new user row was added (set a password before saving).");
    }, [user]);

    const deleteFocused = useCallback(() => {
      if (!rows.length) {
        showEnDialog("error", "There are no users to remove.");
        return;
      }
      const idx =
        focusedIdx != null && rows[focusedIdx] ? focusedIdx : rows.length - 1;
      const target = rows[idx];
      if (!target) return;
      setRows((current) => current.filter((_, i) => i !== idx));
      setFocusedIdx(null);
      setDirty(true);
      window.setTimeout(() => gridRef.current?.focusAfterDelete(idx), 0);
      // showEnDialog(
      //   "success",
      //   `User ${target.cdUser || "(new)"} removed locally.`,
      // );
    }, [focusedIdx, rows]);

    const save = useCallback(async () => {
      for (const row of rows) {
        if (!row.cdUser?.trim()) {
          showEnDialog("error", "Every user needs a code.");
          return;
        }
        if (!row.nmUser?.trim()) {
          showEnDialog("error", `User ${row.cdUser} needs a name.`);
          return;
        }
        // Password validation is handled by the backend API.
        // The dcPassword field is not exposed in the grid UI.
      }
      setBusy(true);
      try {
        const changes = gridRef.current?.getChanges() ?? [];
        const changedKeys = new Set(changes.map((c) => c._key).filter(Boolean));
        const items: UserItem[] = rows
          .filter((r) => r.__new || (r._key && changedKeys.has(r._key)))
          .map(({ __new, dcPassword, ...r }) => ({
            ...r,
            dcPassword: dcPassword ?? "",
            state: __new ? "I" : "U",
          }));
        const res = await fnSave<SaveResponse>(CONTROLLER, items);
        setDirty(false);
        gridRef.current?.clearDirtyRows();
        showEnDialog(
          "success",
          `Saved ${res.savedCount ?? rows.length} user${res.savedCount === 1 ? "" : "s"}.`,
        );
      } catch (e) {
        await showEnDialog(
          "error",
          e instanceof ApiError ? e.message : "Save failed.",
        );
      } finally {
        setBusy(false);
      }
    }, [rows]);

    const handleFocusedRow = useCallback(
      (row: AgRow | null) => {
        const idx = row?.cdUser
          ? rows.findIndex((r) => r.cdUser === row.cdUser)
          : -1;
        setFocusedIdx(idx >= 0 ? idx : null);
      },
      [rows],
    );

    const handleCellValueChanged = useCallback(() => {
      setDirty(true);
    }, []);

    const handleCellDoubleClicked = useCallback(
      (event: { colDef: { field?: string }; data: AgRow }) => {
        if (event.colDef.field !== "dcPassword" || !event.data.cdUser) return;
        setNewPassword("");
        setPwdModal({
          cdUser: String(event.data.cdUser),
          nmUser: String(event.data.nmUser ?? ""),
        });
      },
      [],
    );

    // Admin password reset: send the full existing user row (state "U") with a
    // new dcPassword so SaveUser's update doesn't blank the other columns.
    const handlePasswordConfirm = useCallback(async () => {
      if (!pwdModal || !newPassword.trim() || !oldPassword.trim()) return;
      const existing = rows.find((r) => r.cdUser === pwdModal.cdUser);
      if (!existing) return;
      try {
        setBusy(true);
        const item: UserItem = {
          cdCom: existing.cdCom,
          cdUser: existing.cdUser,
          nmUser: existing.nmUser,
          dcPassword: newPassword.trim(),
          dcOldPassword: oldPassword.trim(),
          dtReg: existing.dtReg,
          dcEmail: existing.dcEmail,
          dcAddress1: existing.dcAddress1,
          dcAddress2: existing.dcAddress2,
          noTel: existing.noTel,
          ynActive: existing.ynActive,
          fgRole: existing.fgRole,
          state: "U",
        };
        await fnSave<SaveResponse>(CONTROLLER, [item]);
        setPwdModal(null);
        setNewPassword("");
        setOldPassword("");
        await showEnDialog(
          "success",
          `Password changed for ${pwdModal.nmUser}.`,
        );
        await load();
      } catch (e) {
        await showEnDialog(
          "error",
          e instanceof ApiError ? e.message : "Password change failed.",
        );
      } finally {
        setBusy(false);
      }
    }, [pwdModal, newPassword, oldPassword, rows, load]);

    useImperativeHandle(
      ref,
      () => ({
        search: () => void load(),
        insert: addRow,
        delete: deleteFocused,
        save: () => {
          void save();
        },
        canClose: async () =>
          !dirty || (await showEnConfirm("Discard unsaved user changes?")) === true,
      }),
      [addRow, deleteFocused, dirty, onSearch, save],
    );

    return (
      <div className="feature-screen po-prototype">
        <SearchPanel ariaLabel="User search conditions">
          <SearchPanelField title="Search" htmlFor="user-search">
            <EnTextBox
              defaultValue={search}
              onValueChanged={setSearch}
              placeHolderText="User code or name"
              inputRef={searchRef}
              isSearchPanel
            />
          </SearchPanelField>
          <SearchPanelField title="Role" htmlFor="user-role">
            <EnComboBox
              defaultValue=""
              options={[{ code: "", name: "(All)" }, ...roleOptions]}
              onValueChanged={() => {}}
              isSearchPanel
            />
          </SearchPanelField>
        </SearchPanel>

        <div className="flex min-h-0 flex-1 gap-3 pt-3">
          <div className="po-detail-panel" style={{ width: "100%" }}>
            <div className="enotes-ag-grid-wrap">
              <AgDataGrid
                ref={gridRef}
                ariaLabel="Users"
                columnDefs={columns}
                rowData={rows as unknown as AgRow[]}
                getRowId={(data) =>
                  (data as unknown as UserRow)._key ??
                  String((data as unknown as UserRow).cdUser)
                }
                onAddRow={addRow}
                onDeleteRows={deleteFocused}
                onSave={() => void save()}
                onCellValueChanged={handleCellValueChanged}
                onCellDoubleClicked={handleCellDoubleClicked}
                onFocusedRowChanged={handleFocusedRow}
                emptyMessage={busy ? "Loading…" : "No users."}
              />
            </div>
            {invalidCell && (
              <div className="po-validation" role="status">
                <span aria-hidden="true">!</span> {invalidCell.message}
              </div>
            )}
          </div>
        </div>

        {pwdModal && (
          <EnCommonModal
            open={true}
            title={`Reset password for ${pwdModal.nmUser} (${pwdModal.cdUser})`}
            onConfirm={handlePasswordConfirm}
            onClose={() => setPwdModal(null)}
            confirmLabel="Save"
            cancelLabel="Cancel"
          >
            <TextField
              autoFocus
              label="Old password"
              type="password"
              fullWidth
              value={oldPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOldPassword(e.target.value)}
              margin="dense"
            />
            <TextField
              label="New password"
              type="password"
              fullWidth
              value={newPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
              margin="dense"
            />
          </EnCommonModal>
        )}
      </div>
    );
  },
);


