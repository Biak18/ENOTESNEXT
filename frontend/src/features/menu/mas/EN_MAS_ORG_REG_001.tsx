import {
  forwardRef,
  useCallback,
  useEffect,
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
import { EnTextBox } from "../../../components/controls";
import {
  SearchPanel,
  SearchPanelField,
} from "../../../components/search-panel";
import EnSharedForm from "../../../widgets/EnSharedForm";
import type {
  EnFormField,
  EnFormHandle,
  EnFormValue,
} from "../../../widgets/EnFormTypes";
import type { ScreenHandle, ScreenProps } from "../../screen-contract";
import { fnGetDataSet, fnSave } from "../../../api/endpoints";
import type { CompanyDto, CompanyItem, SaveResponse } from "../../../api/contracts";
import { ApiError } from "../../../api/http";
import { showEnConfirm, showEnDialog } from "../../../widgets/EnDialogService";

type CompanyRow = CompanyDto & { __new?: boolean; __deleted?: boolean };

// This screen's own backend controller (SNOTES: each menu owns its endpoint).
const CONTROLLER = "Companies";

const editableFields = new Set<string>([
  "cdCompany",
  "nmCompany",
  "nmShort",
  "dcAddress1",
  "dcAddress2",
  "dcCity",
  "dcState",
  "dcPostalCode",
  "dcCountry",
  "noPhone",
  "noFax",
  "dcEmail",
  "dcWebsite",
  "noTaxId",
  "noRegNo",
  "flActive",
]);

const baseColumnDefs: AgColDef[] = [
  { field: "cdCompany", headerName: "COMPANY", width: 90 },
  { field: "nmCompany", headerName: "COMPANY NAME", flex: 1, minWidth: 160 },
  { field: "nmShort", headerName: "SHORT", width: 90 },
  {
    field: "flActive",
    headerName: "ACTIVE",
    width: 70,
    colType: "checkbox",
    editable: true,
  },
];

/**
 * Company register (mas_company) вЂ” mirrors M_MAS_ORG_REG_001.
 * SearchPanel + master grid + focused-row detail form, wired to the real API.
 */
export const CompanyRegister = forwardRef<ScreenHandle, ScreenProps>(
  function CompanyRegister({ searchRef }, ref) {
    const [rows, setRows] = useState<CompanyRow[]>([]);
    const [search, setSearch] = useState("");
    const [focusedIdx, setFocusedIdx] = useState<number | null>(null);
    const [dirty, setDirty] = useState(false);
    const [invalidCell, setInvalidCell] = useState<{
      rowId: string;
      prop: string;
      message: string;
    } | null>(null);
    const [busy, setBusy] = useState(false);
    const gridRef = useRef<AgDataGridHandle>(null);

    const focused = focusedIdx == null ? null : rows[focusedIdx] ?? null;

    const load = useCallback(async () => {
      setBusy(true);
      try {
        const data = await fnGetDataSet<CompanyDto[]>(CONTROLLER, {
          search: search || undefined,
        });
        setRows(data);
        setFocusedIdx(null);
        setDirty(false);
        setInvalidCell(null);
        gridRef.current?.clearDirtyRows();
      } catch (e) {
        await showEnDialog("error", e instanceof ApiError ? e.message : "Failed to load companies.");
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
                invalidCell?.rowId === String(params.data?.cdCompany) &&
                invalidCell.prop === field
                  ? "enotes-invalid-cell"
                  : "",
              ]
                .filter(Boolean)
                .join(" "),
            valueSetter: editableFields.has(field)
              ? (params) => {
                  const value =
                    field === "flActive"
                      ? Boolean(params.newValue)
                      : String(params.newValue ?? "");
                  if (field === "cdCompany" && !value) {
                    const msg = "Company code is required.";
                    setInvalidCell({
                      rowId: String(params.data.cdCompany ?? params.node?.rowIndex),
                      prop: field,
                      message: msg,
                    });
                    showEnDialog("error", msg);
                    return false;
                  }
                  setInvalidCell((current) =>
                    current?.rowId === String(params.data.cdCompany) &&
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
        const blank: CompanyRow = {
          cdCompany: "",
          nmCompany: "",
          nmShort: "",
          dcAddress1: "",
          dcAddress2: "",
          dcCity: "",
          dcState: "",
          dcPostalCode: "",
          dcCountry: "",
          noPhone: "",
          noFax: "",
          dcEmail: "",
          dcWebsite: "",
          noTaxId: "",
          noRegNo: "",
          flActive: true,
          __new: true,
        };
        setFocusedIdx(current.length);
        return [...current, blank];
      });
      setDirty(true);
      window.setTimeout(() => gridRef.current?.focusLastRow(), 0);
      showEnDialog("info", "A new company row was added.");
    }, []);

    const deleteFocused = useCallback(async () => {
      if (!rows.length) {
        showEnDialog("error", "There are no companies to remove.");
        return;
      }
      const idx = focusedIdx != null && rows[focusedIdx] ? focusedIdx : rows.length - 1;
      const target = rows[idx];
      if (!target) return;
      if (
        !target.__new &&
        !(await showEnConfirm(`Delete company ${target.cdCompany} permanently?`))
      )
        return;
      setRows((current) => current.filter((_, i) => i !== idx));
      setFocusedIdx(null);
      setDirty(true);
      window.setTimeout(
        () => gridRef.current?.focusAfterDelete(idx),
        0,
      );
      showEnDialog("success", `Company ${target.cdCompany || "(new)"} removed.`);
    }, [focusedIdx, rows]);

    const save = useCallback(async () => {
      for (const row of rows) {
        if (!row.cdCompany?.trim()) {
          showEnDialog("error", "Every company needs a code.");
          return;
        }
        if (!row.nmCompany?.trim()) {
          showEnDialog("error", `Company ${row.cdCompany} needs a name.`);
          return;
        }
      }
      setBusy(true);
      try {
        const changes = gridRef.current?.getChanges() ?? [];
        const changedKeys = new Set(changes.map((c) => c.cdCompany));
        const items: CompanyItem[] = rows
          .filter((r) => r.__new || changedKeys.has(r.cdCompany))
          .map((row) => {
            const item: CompanyItem & { __new?: boolean; __deleted?: boolean } = {
              ...row,
              state: row.__new ? "I" : "U",
            };
            delete item.__new;
            delete item.__deleted;
            return item;
          });
        const res = await fnSave<SaveResponse>(CONTROLLER, items);
        setDirty(false);
        gridRef.current?.clearDirtyRows();
        await showEnDialog("success", `Successfully saved ${res.savedCount ?? rows.length} compan${res.savedCount === 1 ? "y" : "ies"}.`);
      } catch (e) {
        await showEnDialog("error", e instanceof ApiError ? e.message : "Save failed.");
      } finally {
        setBusy(false);
      }
    }, [rows]);

    const updateField = useCallback(
      (field: keyof CompanyDto, value: unknown) => {
        if (focusedIdx == null) return;
        setRows((current) =>
          current.map((r, i) =>
            i === focusedIdx ? { ...r, [field]: value } : r,
          ),
        );
        setDirty(true);
      },
      [focusedIdx],
    );

    const handleFocusedRow = useCallback(
      (row: AgRow | null) => {
        const idx = row?.cdCompany
          ? rows.findIndex((r) => r.cdCompany === row.cdCompany)
          : -1;
        setFocusedIdx(idx >= 0 ? idx : null);
      },
      [rows],
    );

    const handleCellValueChanged = useCallback(() => setDirty(true), []);

    // --- Shared-form binding (SNOTES SharedForm pattern) ----------------------
    const formFields = useMemo<EnFormField[]>(
      () => [
        { id: "cdCompany", label: "Company code", required: true },
        { id: "nmCompany", label: "Company name", required: true },
        { id: "nmShort", label: "Short name" },
        { id: "dcAddress1", label: "Address 1" },
        { id: "dcAddress2", label: "Address 2" },
        { id: "dcCity", label: "City" },
        { id: "dcState", label: "State" },
        { id: "dcPostalCode", label: "Postal code" },
        { id: "dcCountry", label: "Country" },
        { id: "noPhone", label: "Phone" },
        { id: "noFax", label: "Fax" },
        { id: "dcEmail", label: "Email" },
        { id: "dcWebsite", label: "Website" },
        { id: "noTaxId", label: "Tax ID" },
        { id: "noRegNo", label: "Reg no" },
        { id: "flActive", label: "Active", type: "checkbox" },
      ],
      [],
    );
    const formRef = useRef<EnFormHandle>(null);

    // Push the focused row into the shared form whenever it changes (or the row
    // object identity changes after an edit), like SNOTES's focused-row bind.
    useEffect(() => {
      if (focused) {
        const data: CompanyRow & { __new?: boolean; __deleted?: boolean } = {
          ...focused,
        };
        delete data.__new;
        delete data.__deleted;
        formRef.current?.setFormData(
          data as unknown as Record<string, EnFormValue>,
        );
      }
    }, [focused]);

    // A form edit writes straight back into the grid row state.
    const handleFormValueChanged = useCallback(
      (fieldId: string, value: EnFormValue) => {
        updateField(fieldId as keyof CompanyDto, value);
      },
      [updateField],
    );

    useImperativeHandle(
      ref,
      () => ({
        search: onSearch,
        insert: addRow,
        delete: deleteFocused,
        save: () => {
          void save();
        },
        canClose: async () =>
          !dirty || (await showEnConfirm("Discard unsaved company changes?")) === true,
      }),
      [addRow, deleteFocused, dirty, onSearch, save],
    );

    return (
      <div className="feature-screen po-prototype">
        <SearchPanel ariaLabel="Company search conditions">
          <SearchPanelField title="Search" htmlFor="company-search">
            <EnTextBox
              defaultValue={search}
              onValueChanged={setSearch}
              placeHolderText="Company code or name"
              inputRef={searchRef}
              isSearchPanel
            />
          </SearchPanelField>
        </SearchPanel>

        <div className="flex min-h-0 flex-1 gap-3 pt-3">
          <div className="po-detail-panel" style={{ width: "50%" }}>
            <div className="enotes-ag-grid-wrap">
              <AgDataGrid
                ref={gridRef}
                ariaLabel="Companies"
                columnDefs={columns}
                rowData={rows as unknown as AgRow[]}
                getRowId={(data) => {
                  const r = data as unknown as CompanyRow;
                  return r.cdCompany || `__new-${rows.indexOf(r)}`;
                }}
                onAddRow={addRow}
                onDeleteRows={deleteFocused}
                onSave={() => void save()}
                onCellValueChanged={handleCellValueChanged}
                onFocusedRowChanged={handleFocusedRow}
                emptyMessage={busy ? "LoadingвЂ¦" : "No companies."}
              />
            </div>
            {invalidCell && (
              <div className="po-validation" role="status">
                <span aria-hidden="true">!</span> {invalidCell.message}
              </div>
            )}
          </div>

          <section
            className="po-detail-panel"
            aria-label="Company detail"
            style={{ width: "70%" }}
          >
            <div className="form-section-title">
              <div>
                <h2>Company detail</h2>
                <p>
                  {focused
                    ? `Editing ${focused.cdCompany || "(new company)"}`
                    : "Select a company in the grid to edit."}
                </p>
              </div>
              <span className="draft-state">{dirty ? "Unsaved" : "Saved"}</span>
            </div>
            {focused ? (
              <EnSharedForm
                ref={formRef}
                fields={formFields}
                columns={3}
                onValueChanged={handleFormValueChanged}
              />
            ) : (
              <div className="empty-result" style={{ flex: 1 }}>
                <strong>No company selected</strong>
                <p>Pick a row on the left to view and edit this company.</p>
              </div>
            )}
          </section>
        </div>
      </div>
    );
  },
);


