import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import writeXlsxFile from "write-excel-file/browser";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import { AgDataGrid } from "../../../components/data-grid/AgDataGrid";
import type {
  AgDataGridHandle,
  AgRow,
} from "../../../components/data-grid/agDataGridTypes";
import ComboBox from "../../../components/controls/Combobox";
import {
  SearchPanel,
  SearchPanelField,
} from "../../../components/search-panel";
import PeriodBox from "../../../components/controls/PeriodBox";
import type { ScreenHandle, ScreenProps } from "../../screen-contract";
import { showEnConfirm, showEnDialog } from "../../../widgets/EnDialogService";
import {
  buildExportSheet,
  createLine,
  currencyOptions,
  customerOptions,
  filterSaleLines,
  initialSaleDraft,
  initialSaleFilters,
  initialSaleLines,
  saleCategoryOptions,
  summarize,
  toDate,
  validateDraft,
  validateEditValue,
  withDerivedAmount,
  type SaleDraft,
  type SaleFilters,
  type SaleLine,
} from "./salesLines";

const money = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function MoneyCell(params: ICellRendererParams) {
  return <span>${money.format(Number(params.value) || 0)}</span>;
}

const editableProps = new Set([
  "description",
  "category",
  "quantity",
  "unitPrice",
]);

const baseColumnDefs: ColDef[] = [
  { field: "itemCode", headerName: "ITEM CODE", width: 110, editable: false },
  { field: "description", headerName: "DESCRIPTION", width: 220 },
  {
    field: "category",
    headerName: "CATEGORY",
    width: 140,
    cellEditor: "agSelectCellEditor",
    cellEditorParams: { values: saleCategoryOptions },
  },
  { field: "unit", headerName: "UNIT", width: 76, editable: false },
  {
    field: "quantity",
    headerName: "QUANTITY",
    width: 96,
    cellClass: "enotes-number-cell",
  },
  {
    field: "unitPrice",
    headerName: "UNIT PRICE",
    width: 105,
    cellRenderer: MoneyCell,
    cellClass: "enotes-number-cell",
  },
  {
    field: "amount",
    headerName: "LINE TOTAL",
    width: 110,
    editable: false,
    cellRenderer: MoneyCell,
    cellClass: "enotes-number-cell",
  },
];

export const SalesRegistration = forwardRef<ScreenHandle, ScreenProps>(
  function SalesRegistration({ searchRef }, ref) {
    const [draft, setDraft] = useState<SaleDraft>(initialSaleDraft);
    const [filters, setFilters] = useState<SaleFilters>(initialSaleFilters);
    const [lines, setLines] = useState<SaleLine[]>(initialSaleLines);
    const [focusedRowId, setFocusedRowId] = useState<string | null>(null);
    const [invalidCell, setInvalidCell] = useState<{
      rowId: string;
      prop: string;
      message: string;
    } | null>(null);
    const [dirty, setDirty] = useState(false);
    const nextId = useRef(initialSaleLines.length + 1);
    const gridRef = useRef<AgDataGridHandle>(null);

    const invalidPeriod =
      Boolean(filters.periodFrom) &&
      Boolean(filters.periodTo) &&
      filters.periodFrom > filters.periodTo;
    const visibleLines = useMemo(
      () => filterSaleLines(lines, filters),
      [filters, lines],
    );
    const source = useMemo(
      () => visibleLines.map((line) => withDerivedAmount(line)),
      [visibleLines],
    );
    const totals = useMemo(() => summarize(lines), [lines]);

    const columns = useMemo<ColDef[]>(
      () =>
        baseColumnDefs.map((col) => {
          const field = String(col.field);
          return {
            ...col,
            cellClass: (params) =>
              [
                typeof col.cellClass === "string" ? col.cellClass : "",
                col.editable === false ? "enotes-readonly-cell" : "",
                invalidCell?.rowId === String(params.data?.id) &&
                invalidCell.prop === field
                  ? "enotes-invalid-cell"
                  : "",
              ]
                .filter(Boolean)
                .join(" "),
            valueSetter: editableProps.has(field)
              ? (params) => {
                  const result = validateEditValue(field, params.newValue);
                  if (!result.ok) {
                    setInvalidCell({
                      rowId: String(params.data.id),
                      prop: field,
                      message: result.message,
                    });
                    showEnDialog("error", result.message);
                    return false;
                  }
                  setInvalidCell((current) =>
                    current?.rowId === String(params.data.id) &&
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

    const updateDraft = useCallback((patch: Partial<SaleDraft>) => {
      setDraft((current) => ({ ...current, ...patch }));
      setDirty(true);
    }, []);

    const updateFilters = useCallback((patch: Partial<SaleFilters>) => {
      setFilters((current) => ({ ...current, ...patch }));
    }, []);

    const focusSearch = useCallback(() => {
      searchRef.current?.focus();
      showEnDialog("info", "Search this sales invoice by item code, description, or category.");
    }, [searchRef]);

    const addRow = useCallback(() => {
      const id = `so-line-${nextId.current}`;
      nextId.current += 1;
      setLines((current) => [...current, createLine(id, nextId.current)]);
      setFocusedRowId(id);
      setDirty(true);
      showEnDialog("info", "A sale detail row was added to this local draft.");
    }, []);

    const deleteFocusedRow = useCallback(() => {
      if (!lines.length) {
        showEnDialog("error", "This sales invoice has no detail rows to remove.");
        return;
      }
      const targetId =
        focusedRowId && lines.some((line) => line.id === focusedRowId)
          ? focusedRowId
          : lines[lines.length - 1]?.id;
      if (!targetId) return;
      setLines((current) => current.filter((line) => line.id !== targetId));
      setFocusedRowId(null);
      setDirty(true);
      showEnDialog("success", "The focused sale detail row was removed from this local draft.");
    }, [focusedRowId, lines]);

    const resetDraft = useCallback(() => {
      setDraft({
        ...initialSaleDraft,
        invoiceNumber: `SA-2026-${String(249 + nextId.current).padStart(4, "0")}`,
        customer: "",
        reference: "",
        notes: "",
      });
      setLines([]);
      setFilters(initialSaleFilters);
      setInvalidCell(null);
      setDirty(false);
      showEnDialog("info", "A new sales invoice draft is ready in this tab.");
    }, []);

    const clearDraft = useCallback(async () => {
      if (!(await showEnConfirm("Clear this sales invoice draft?"))) return;
      setLines([]);
      setDraft((current) => ({ ...current, customer: "", reference: "" }));
      setInvalidCell(null);
      setDirty(false);
      showEnDialog("info", "The sales invoice draft was cleared locally.");
    }, []);

    const save = useCallback(() => {
      const problem = validateDraft(draft, lines);
      if (problem) {
        showEnDialog("error", problem);
        return;
      }
      setDirty(false);
      showEnDialog("success", "Sales invoice saved in this local demo. No server was contacted.");
    }, [draft, lines]);

    const exportExcel = useCallback(async () => {
      if (!lines.length) {
        showEnDialog("error", "Add at least one sale line before exporting.");
        return;
      }
      const problem = validateDraft(draft, lines);
      if (problem) {
        showEnDialog("error", `${problem} Fix the highlighted cells before exporting.`);
        return;
      }
      try {
        const workbook = await writeXlsxFile(buildExportSheet(draft, lines), {
          sheet: "Sales Invoice",
          columns: [
            { width: 18 },
            { width: 32 },
            { width: 20 },
            { width: 14 },
            { width: 14 },
            { width: 16 },
            { width: 16 },
          ],
        });
        await workbook.toFile(`${draft.invoiceNumber}.xlsx`);
        showEnDialog("success", "Sales invoice exported as a real .xlsx workbook.");
      } catch {
        showEnDialog("error", "Excel export failed. Try again with fewer sale lines.");
      }
    }, [draft, lines]);

    const handleCellValueChanged = useCallback(
      ({ data }: { data: AgRow; colId: string; newValue: unknown; oldValue: unknown }) => {
        setLines((current) =>
          current.map((line) =>
            line.id === String((data as SaleLine).id)
              ? withDerivedAmount({ ...line, ...(data as SaleLine) })
              : line,
          ),
        );
        setDirty(true);
      },
      [],
    );

    const handleFocusedRow = useCallback((row: AgRow | null) => {
      if (row?.id) setFocusedRowId(String(row.id));
    }, []);

    useImperativeHandle(
      ref,
      () => ({
        search: focusSearch,
        insert: resetDraft,
        delete: clearDraft,
        save,
        excel: () => {
          void exportExcel();
        },
        canClose: async () =>
          !dirty ||
          (await showEnConfirm("Discard unsaved changes in this sales invoice draft?")) === true,
      }),
      [clearDraft, dirty, exportExcel, focusSearch, resetDraft, save],
    );

    const gridFooter = (
      <div className="po-summary-area">
        <div className="po-total-row">
          <span>
            {lines.length} line items В· {totals.quantity} total units
          </span>
          <span>
            Invoice total<strong>${money.format(totals.amount)}</strong>
          </span>
        </div>
      </div>
    );

    return (
      <div className="feature-screen po-prototype">
        <SearchPanel ariaLabel="Sales search conditions">
          <SearchPanelField title="Item" htmlFor="sales-item">
            <TextField
              id="sales-item"
              fullWidth
              size="small"
              value={filters.item}
              onChange={(event) => updateFilters({ item: event.target.value })}
              placeholder="Code or description"
              inputRef={searchRef}
            />
          </SearchPanelField>
          <SearchPanelField title="Category" htmlFor="sales-category">
            <ComboBox
              id="sales-category"
              options={saleCategoryOptions}
              value={filters.category || null}
              onValueChanged={(category) =>
                updateFilters({ category: category ?? "" })
              }
              placeholder="All categories"
              clearable
              className="!py-0"
            />
          </SearchPanelField>
          <SearchPanelField title="Sale date" htmlFor="sales-period">
            <PeriodBox
              defaultValue={`${filters.periodFrom},${filters.periodTo}`}
              onValueChanged={(start, end) => {
                const toDash = (value: string) =>
                  value
                    ? `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`
                    : "";
                updateFilters({ periodFrom: toDash(start), periodTo: toDash(end) });
              }}
              isSearchPanel
            />
          </SearchPanelField>
        </SearchPanel>
        {invalidPeriod && (
          <div
            className="mb-2 rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800"
            role="alert"
          >
            The start date must be on or before the end date.
          </div>
        )}

        <div className="po-document-strip">
          <span>
            <b>{draft.invoiceNumber}</b>
            <span className="po-strip-separator">В·</span>
            Local draft
            <span className="po-strip-separator">В·</span>
            {lines.length} line items
          </span>
          <span>{dirty ? "Unsaved changes" : "No unsaved changes"}</span>
        </div>

        <section className="po-master-panel" aria-label="Sales invoice header">
          <div className="form-section-title">
            <div>
              <h2>Sales invoice header</h2>
              <p>Customer, dates, and reference for this document.</p>
            </div>
            <span className="draft-state">Local draft</span>
          </div>
          <div className="po-form-grid">
            <label>
              Invoice number
              <TextField
                size="small"
                value={draft.invoiceNumber}
                onChange={(event) =>
                  updateDraft({ invoiceNumber: event.target.value })
                }
                slotProps={{ htmlInput: { readOnly: true } }}
              />
            </label>
            <label>
              Customer
              <ComboBox
                options={customerOptions}
                value={draft.customer || null}
                onValueChanged={(customer) =>
                  updateDraft({ customer: customer ?? "" })
                }
                placeholder="Choose a customer"
                clearable={false}
                className="!py-0"
              />
            </label>
            <label>
              Sale date
              <TextField
                size="small"
                type="date"
                value={draft.saleDate}
                onChange={(event) =>
                  updateDraft({ saleDate: event.target.value })
                }
              />
            </label>
            <label>
              Due date
              <TextField
                size="small"
                type="date"
                value={draft.dueDate}
                onChange={(event) =>
                  updateDraft({ dueDate: event.target.value })
                }
              />
            </label>
            <label>
              Currency
              <ComboBox
                options={currencyOptions}
                value={draft.currency || null}
                onValueChanged={(currency) =>
                  updateDraft({ currency: currency ?? "" })
                }
                placeholder="Choose currency"
                clearable={false}
                className="!py-0"
              />
            </label>
            <label>
              Reference
              <TextField
                size="small"
                value={draft.reference}
                onChange={(event) =>
                  updateDraft({ reference: event.target.value })
                }
                placeholder="Sales order number"
              />
            </label>
            <label>
              Notes
              <TextField
                size="small"
                value={draft.notes}
                onChange={(event) => updateDraft({ notes: event.target.value })}
                placeholder="Delivery notes"
              />
            </label>
          </div>
        </section>

        <section
          className="po-detail-panel"
          aria-label="Sales invoice detail lines"
        >
          <div className="po-grid-toolbar">
            <div>
              <h2>
                Sale lines<span>{visibleLines.length}</span>
              </h2>
              <p>
                Edit cells inline. Quantity, price, and totals recalculate as
                you type.
              </p>
            </div>
            <div className="po-grid-controls">
              <Button
                type="button"
                size="small"
                variant="outlined"
                className="button-secondary"
                onClick={addRow}
                aria-label="Add sale line"
                startIcon={<AddIcon fontSize="small" />}
              >
                Add row
              </Button>
              <Button
                type="button"
                className="button-secondary"
                size="small"
                variant="outlined"
                onClick={deleteFocusedRow}
                aria-label="Delete focused sale line"
                startIcon={<DeleteOutlinedIcon fontSize="small" />}
              >
                Delete row
              </Button>
            </div>
          </div>
          <div className="enotes-ag-grid-wrap">
            <AgDataGrid
              ref={gridRef}
              ariaLabel="Editable sales invoice lines"
              columnDefs={columns}
              rowData={source as AgRow[]}
              getRowId={(data) => String((data as SaleLine).id)}
              onCellValueChanged={handleCellValueChanged}
              onFocusedRowChanged={handleFocusedRow}
            />
          </div>
          {invalidCell && (
            <div className="po-validation" role="status">
              <span aria-hidden="true">!</span> {invalidCell.message} Correct
              the highlighted cell before saving or exporting.
            </div>
          )}
          {gridFooter}
          <div className="po-grid-footnote">
            <span>Mock data В· changes stay in this browser tab</span>
            <span>
              Sale date{" "}
              {draft.saleDate
                ? toDate(draft.saleDate).toLocaleDateString()
                : "not set"}{" "}
              В· {draft.currency}
            </span>
          </div>
        </section>
      </div>
    );
  },
);

