import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import EnSharedForm from "../../../widgets/EnSharedForm";
import type {
  EnFormField,
  EnFormHandle,
  EnFormValue,
} from "../../../widgets/EnFormTypes";
import type { ColDef } from "ag-grid-community";
import { AgDataGrid } from "../../../components/data-grid/AgDataGrid";
import type {
  AgColDef,
  AgDataGridHandle,
  AgRow,
} from "../../../components/data-grid/agDataGridTypes";
import { EnComboBox, EnTextBox } from "../../../components/controls";
import {
  SearchPanel,
  SearchPanelField,
} from "../../../components/search-panel";
import type { ScreenHandle, ScreenProps } from "../../screen-contract";
import { showEnConfirm, showEnDialog } from "../../../widgets/EnDialogService";
import {
  cdBizOptions,
  cdIoOptions,
  emptyPoType,
  fgMoneyOptions,
  filterPoTypes,
  initialPoTypes,
  poTypeFilters0,
  tpPurOptions,
  tpUmVatOptions,
  trnsOptions,
  validatePoType,
  validatePoTypeField,
  ynOptions,
  type PoType,
  type PoTypeFilters,
} from "./enPurBasReg001Data";

const editableFields = new Set<keyof PoType>([
  "cd_po",
  "nm_po",
  "cd_io",
  "fg_trns",
  "yn_app",
  "yn_trade",
  "yn_autoreq",
  "yn_autorcv",
  "yn_autopur",
  "fg_money",
  "tp_pur",
  "yn_use",
  "dc_rmk",
  "tp_um_vat",
]);

const baseColumnDefs: AgColDef[] = [
  { field: "cd_po", headerName: "TYPE", width: 90 },
  { field: "nm_po", headerName: "TYPE NAME", flex: 1, minWidth: 160 },
  { field: "cd_io", headerName: "I/O", width: 70 },
  {
    field: "yn_use",
    headerName: "USE",
    width: 66,
    colType: "lookup",
    lookupOptions: ynOptions,
  },
];

/**
 * Purchase Order Type register вЂ” SearchPanel + master grid + focused-row
 * detail form, mirroring SNOTES SN_PUR_BAS_REG_001 (mas_potype). Mock/local.
 */
export const PurchaseOrderTypeRegister = forwardRef<ScreenHandle, ScreenProps>(
  function PurchaseOrderTypeRegister({ searchRef }, ref) {
    const [rows, setRows] = useState<PoType[]>(initialPoTypes);
    const [filters, setFilters] = useState<PoTypeFilters>(poTypeFilters0);
    // Track the focused row by its index into `rows` so inline edits to cd_po
    // don't lose the selection; a fresh object each render keeps the detail
    // form in sync with the grid.
    const [focusedIdx, setFocusedIdx] = useState<number | null>(null);
    const [dirty, setDirty] = useState(false);
    const [invalidCell, setInvalidCell] = useState<{
      rowId: string;
      prop: string;
      message: string;
    } | null>(null);
    const gridRef = useRef<AgDataGridHandle>(null);
    const nextSeq = useRef(initialPoTypes.length + 1);

    const focused = focusedIdx == null ? null : (rows[focusedIdx] ?? null);

    const visible = useMemo(
      () => filterPoTypes(rows, filters),
      [rows, filters],
    );

    const columns = useMemo<ColDef[]>(
      () =>
        baseColumnDefs.map((col) => {
          const field = String(col.field);
          return {
            ...col,
            cellClass: (params) =>
              [
                typeof col.cellClass === "string" ? col.cellClass : "",
                invalidCell?.rowId === String(params.data?.cd_po) &&
                invalidCell.prop === field
                  ? "enotes-invalid-cell"
                  : "",
              ]
                .filter(Boolean)
                .join(" "),
            valueSetter: editableFields.has(field as keyof PoType)
              ? (params) => {
                  const result = validatePoTypeField(
                    field as keyof PoType,
                    params.newValue,
                  );
                  if (!result.ok) {
                    setInvalidCell({
                      rowId: String(params.data.cd_po),
                      prop: field,
                      message: result.message,
                    });
                    showEnDialog("error", result.message);
                    return false;
                  }
                  setInvalidCell((current) =>
                    current?.rowId === String(params.data.cd_po) &&
                    current.prop === field
                      ? null
                      : current,
                  );
                  params.data[field] = result.value;
                  return true;
                }
              : undefined,
          };
        }),
      [invalidCell],
    );

    const focusSearch = useCallback(() => {
      searchRef.current?.focus();
      showEnDialog("info", "Search order types by code or name.");
    }, [searchRef]);

    const addRow = useCallback(() => {
      const cd = `PO-${String(nextSeq.current).padStart(2, "0")}`;
      nextSeq.current += 1;
      const row = emptyPoType(cd);
      setRows((current) => {
        setFocusedIdx(current.length);
        return [...current, row];
      });
      setDirty(true);
      window.setTimeout(() => gridRef.current?.focusLastRow(), 0);
      showEnDialog("info", "A new purchase order type row was added.");
    }, []);

    const deleteFocused = useCallback(() => {
      if (!rows.length) {
        showEnDialog("error", "There are no order types to remove.");
        return;
      }
      const idx =
        focusedIdx != null && rows[focusedIdx] ? focusedIdx : rows.length - 1;
      const target = rows[idx];
      if (!target) return;
      const deletedIndex = Math.max(
        0,
        visible.findIndex((r) => r.cd_po === target.cd_po),
      );
      setRows((current) => current.filter((_, i) => i !== idx));
      setFocusedIdx(null);
      setDirty(true);
      window.setTimeout(
        () => gridRef.current?.focusAfterDelete(deletedIndex),
        0,
      );
      showEnDialog("success", `Order type ${target.cd_po} was removed locally.`);
    }, [focusedIdx, rows, visible]);

    const save = useCallback(() => {
      for (const row of rows) {
        const problem = validatePoType(row);
        if (problem) {
          showEnDialog("error", problem);
          return;
        }
      }
      setDirty(false);
      showEnDialog("success", "Order types saved in this local demo. No server was contacted.");
    }, [rows]);

    const updateField = useCallback(
      (field: keyof PoType, value: string) => {
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
        const idx = row?.cd_po
          ? rows.findIndex((r) => r.cd_po === row.cd_po)
          : -1;
        setFocusedIdx(idx >= 0 ? idx : null);
      },
      [rows],
    );

    // Keep `rows` in sync with inline grid edits so the detail form and save
    // see the latest values. Match by object identity (event.data is the same
    // rowData object) since cd_po itself is editable.
    const handleCellValueChanged = useCallback(
      ({ data }: { data: AgRow; colId: string }) => {
        setRows((current) =>
          current.map((r) => (Object.is(r, data) ? (data as PoType) : r)),
        );
        setDirty(true);
      },
      [],
    );

    // --- Shared-form binding (SNOTES SharedForm pattern) ----------------------
    const formFields = useMemo<EnFormField[]>(
      () => [
        { id: "cd_po", label: "Type code", required: true },
        { id: "nm_po", label: "Type name", required: true },
        { id: "cd_io", label: "In/out type", type: "select", options: cdIoOptions },
        { id: "fg_trns", label: "Transaction", type: "select", options: trnsOptions },
        { id: "fg_money", label: "Currency flag", type: "select", options: fgMoneyOptions },
        { id: "tp_pur", label: "Purchase type", type: "select", options: tpPurOptions },
        { id: "tp_um_vat", label: "UM-VAT", type: "select", options: tpUmVatOptions },
        { id: "yn_app", label: "Approval", type: "select", options: ynOptions },
        { id: "yn_trade", label: "Trade", type: "select", options: ynOptions },
        { id: "yn_autoreq", label: "Auto requisition", type: "select", options: ynOptions },
        { id: "yn_autorcv", label: "Auto receive", type: "select", options: ynOptions },
        { id: "yn_autopur", label: "Auto purchase", type: "select", options: ynOptions },
        { id: "yn_use", label: "In use", type: "select", options: ynOptions },
        { id: "dc_rmk", label: "Remark" },
      ],
      [],
    );
    const formRef = useRef<EnFormHandle>(null);

    // Push the focused row into the shared form whenever it changes.
    useEffect(() => {
      if (focused) {
        formRef.current?.setFormData(focused as unknown as Record<string, EnFormValue>);
      }
    }, [focused]);

    const handleFormValueChanged = useCallback(
      (_fieldId: string, value: EnFormValue) => {
        updateField(_fieldId as keyof PoType, String(value ?? ""));
      },
      [updateField],
    );

    useImperativeHandle(
      ref,
      () => ({
        search: focusSearch,
        insert: addRow,
        delete: deleteFocused,
        save,
        canClose: async () =>
          !dirty || (await showEnConfirm("Discard unsaved order type changes?")) === true,
      }),
      [addRow, deleteFocused, dirty, focusSearch, save],
    );

    return (
      <div className="feature-screen po-prototype">
        <SearchPanel ariaLabel="Order type search conditions">
          <SearchPanelField title="Business" htmlFor="potype-biz">
            <EnComboBox
              defaultValue={filters.cdBiz}
              options={cdBizOptions}
              onValueChanged={(cdBiz) => setFilters((f) => ({ ...f, cdBiz }))}
              isSearchPanel
            />
          </SearchPanelField>
          <SearchPanelField title="Search" htmlFor="potype-search">
            <EnTextBox
              defaultValue={filters.strSearch}
              onValueChanged={(strSearch) =>
                setFilters((f) => ({ ...f, strSearch }))
              }
              placeHolderText="Type code or name"
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
                ariaLabel="Purchase order types"
                columnDefs={columns}
                rowData={visible as unknown as AgRow[]}
                getRowId={(data) => String((data as PoType).cd_po)}
                onAddRow={addRow}
                onDeleteRows={deleteFocused}
                onSave={save}
                onCellValueChanged={handleCellValueChanged}
                onFocusedRowChanged={handleFocusedRow}
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
            aria-label="Order type detail"
            style={{ width: "70%" }}
          >
            <div className="form-section-title">
              <div>
                <h2>Order type detail</h2>
                <p>
                  {focused
                    ? `Editing ${focused.cd_po}`
                    : "Select a type in the grid to edit its flags."}
                </p>
              </div>
              <span className="draft-state">Local</span>
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
                <strong>No type selected</strong>
                <p>Pick a row on the left to view and edit this order type.</p>
              </div>
            )}
          </section>
        </div>
      </div>
    );
  },
);



