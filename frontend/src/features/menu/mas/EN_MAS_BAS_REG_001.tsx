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
import { useQueryClient } from "@tanstack/react-query";
import writeXlsxFile from "write-excel-file/browser";
import { AgDataGrid } from "../../../components/data-grid/AgDataGrid";
import type {
  AgColDef,
  AgDataGridHandle,
  AgRow,
} from "../../../components/data-grid/agDataGridTypes";
import { EnComboBox, EnTextBox } from "../../../components/controls";
import { waitMinBusy } from "../../../components/controls/waitMinBusy";
import {
  SearchPanel,
  SearchPanelField,
} from "../../../components/search-panel";
import { useScreenSearch } from "../../useScreenSearch";
import { useApp } from "../../../app/AppContext";
import type { ScreenHandle, ScreenProps } from "../../screen-contract";
import { showEnConfirm, showEnDialog } from "../../../widgets/EnDialogService";
import { fetchDataset, invalidateDataset } from "../../../api/query";
import {
  filterItems,
  initialItemFilters,
  itemTypeOptions,
  itemUomOptions,
  validateItemField,
  validateItems,
  type EditableItemField,
  type ItemFilters,
  type ItemRow,
  type ItemType,
} from "./itemRegisterData";
import type { ItemDto, ItemSaveRequest } from "../../../api/contracts";
import { saveItems } from "../../../api/endpoints";
import { ApiError } from "../../../api/http";

const CONTROLLER = "EN_MAS_BAS_REG_001";

const editableFields = new Set<EditableItemField>([
  "cdItem",
  "nmItem",
  "fgType",
  "cdCategory",
  "cdUom",
  "prPx",
  "flLot",
  "flActive",
]);

function isEditableField(field: string): field is EditableItemField {
  return editableFields.has(field as EditableItemField);
}

// EnComboBox options are already EnOption-shaped ({ code, name }).
const itemTypeFilterOptions = [
  { code: "", name: "All types" },
  ...itemTypeOptions,
];

const baseColumnDefs: AgColDef[] = [
  {
    field: "cdCompany",
    headerName: "COMPANY",
    width: 100,
    editable: false,
    hide: true,
  },
  {
    field: "cdItem",
    headerName: "ITEM CODE",
    width: 120,
    editable: (params) => Boolean(params.data?.__new),
  },
  { field: "nmItem", headerName: "ITEM NAME", minWidth: 190, flex: 1 },
  {
    field: "fgType",
    headerName: "TYPE",
    width: 115,
    cellEditor: "agSelectCellEditor",
    cellEditorParams: {
      values: itemTypeOptions.map((option) => option.code),
    },
    valueFormatter: (params) =>
      itemTypeOptions.find(
        (option) => Number(option.code) === Number(params.value),
      )?.name ?? "",
  },
  { field: "cdCategory", headerName: "CATEGORY", width: 135 },
  {
    field: "cdUom",
    headerName: "UNIT",
    width: 100,
    colType: "lookup",
    lookupOptions: itemUomOptions,
  },
  {
    field: "prPx",
    headerName: "PRICE",
    width: 115,
    colType: "numeric",
    precision: 2,
  },
  {
    field: "amCost",
    headerName: "COST",
    width: 115,
    colType: "numeric",
    precision: 2,
    editable: false,
    cellClass: "enotes-readonly-cell",
  },
  {
    field: "flLot",
    headerName: "LOT",
    width: 75,
    colType: "checkbox",
  },
  {
    field: "flActive",
    headerName: "ACTIVE",
    width: 85,
    colType: "checkbox",
  },
];

export const ItemRegister = forwardRef<ScreenHandle, ScreenProps>(
  function ItemRegister({ searchRef }, ref) {
    const { user } = useApp();
    const companyCode = user?.cdCom ?? "";
    const queryClient = useQueryClient();
    const [items, setItems] = useState<ItemRow[]>([]);
    const [draftFilters, setDraftFilters] =
      useState<ItemFilters>(initialItemFilters);
    const [appliedFilters, setAppliedFilters] =
      useState<ItemFilters>(initialItemFilters);
    const [focusedRowId, setFocusedRowId] = useState<string | null>(null);
    const [invalidCell, setInvalidCell] = useState<{
      rowId: string;
      prop: string;
      message: string;
    } | null>(null);
    const [dirty, setDirty] = useState(false);
    const [busy, setBusy] = useState(false);
    const [dirtyItemIds, setDirtyItemIds] = useState<Set<string>>(
      () => new Set(),
    );
    const [deletedItems, setDeletedItems] = useState<ItemSaveRequest[]>([]);
    const nextItemNumber = useRef(1004);
    const nextRowNumber = useRef(4);
    const gridRef = useRef<AgDataGridHandle>(null);
    const activeRequest = useRef(0);

    const visibleItems = useMemo(
      () => filterItems(items, appliedFilters),
      [appliedFilters, items],
    );

    const columns = useMemo<ColDef[]>(
      () =>
        baseColumnDefs.map((column) => {
          const field = String(column.field);
          return {
            ...column,
            cellClass: (params) =>
              [
                typeof column.cellClass === "string" ? column.cellClass : "",
                column.editable === false ? "enotes-readonly-cell" : "",
                invalidCell?.rowId === String(params.data?.id) &&
                invalidCell.prop === field
                  ? "enotes-invalid-cell"
                  : "",
              ]
                .filter(Boolean)
                .join(" "),
            valueSetter: isEditableField(field)
              ? (params) => {
                  const result = validateItemField(field, params.newValue);
                  if (!result.ok) {
                    setInvalidCell({
                      rowId: String(params.data.id),
                      prop: field,
                      message: result.message,
                    });
                    showEnDialog("error", result.message);
                    return false;
                  }
                  if (
                    field === "cdItem" &&
                    items.some(
                      (item) =>
                        item.id !== String(params.data.id) &&
                        item.cdCompany === params.data.cdCompany &&
                        item.cdItem === result.value,
                    )
                  ) {
                    const message = `Duplicate item code "${String(result.value)}".`;
                    setInvalidCell({
                      rowId: String(params.data.id),
                      prop: field,
                      message,
                    });
                    showEnDialog("error", message);
                    return false;
                  }
                  setInvalidCell((current) =>
                    current?.rowId === String(params.data.id) &&
                    current.prop === field
                      ? null
                      : current,
                  );
                  Object.assign(params.data, { [field]: result.value });
                  return true;
                }
              : undefined,
          };
        }),
      [invalidCell, items],
    );

    const updateFilters = useCallback((patch: Partial<ItemFilters>) => {
      setDraftFilters((current) => ({ ...current, ...patch }));
    }, []);

    const loadItems = useCallback(async (filters: ItemFilters) => {
      const request = ++activeRequest.current;
      const startedAt = Date.now();
      setBusy(true);
      try {
        const data = await fetchDataset<ItemDto[]>(
          queryClient,
          CONTROLLER,
          {
            search: filters.item.trim() || undefined,
            fgType: filters.type || undefined,
          },
          { cacheScope: `${companyCode}:${user?.cdUser ?? ""}` },
        );
        if (activeRequest.current !== request) return false;
        const loadedItems: ItemRow[] = data.map((item: ItemDto) => ({ ...item }));
        setItems(loadedItems);
        setAppliedFilters(filters);
        setDirtyItemIds(new Set());
        setDeletedItems([]);
        setInvalidCell(null);
        setFocusedRowId(null);
        setDirty(false);
        const largestItemNumber = loadedItems.reduce((largest, item) => {
          const match = /^ITEM-(\d+)$/i.exec(item.cdItem);
          return match ? Math.max(largest, Number(match[1]) + 1) : largest;
        }, 1004);
        nextItemNumber.current = largestItemNumber;
        nextRowNumber.current += 1;
        return true;
      } catch (error) {
        if (activeRequest.current !== request) return false;
        await showEnDialog(
          "error",
          error instanceof ApiError
            ? error.message
            : "Failed to load items from the server.",
        );
        return false;
      } finally {
        if (activeRequest.current === request) {
          await waitMinBusy(startedAt);
          setBusy(false);
        }
      }
    }, [companyCode, queryClient, user?.cdUser]);

    useEffect(() => {
      return () => {
        activeRequest.current += 1;
      };
    }, []);

    const runSearch = useCallback(async () => {
      if (busy) return;
      if (dirty) {
        const discard = await showEnConfirm(
          "Discard unsaved item changes and reload from the server?",
        );
        if (discard !== true) return;
      }
      await loadItems(draftFilters);
    }, [busy, dirty, draftFilters, loadItems]);

    // GLOBAL Search: run the query, then focus the first grid row.
    const onSearch = useScreenSearch(runSearch, gridRef);

    const addRow = useCallback(() => {
      if (!companyCode) {
        showEnDialog("error", "A signed-in company is required to add items.");
        return;
      }
      let itemCode = "";
      do {
        itemCode = `ITEM-${nextItemNumber.current}`;
        nextItemNumber.current += 1;
      } while (items.some((item) => item.cdItem === itemCode));

      const row: ItemRow = {
        id: `${companyCode}-item-${nextRowNumber.current}`,
        cdCompany: companyCode,
        cdItem: itemCode,
        nmItem: "",
        fgType: appliedFilters.type || 10,
        cdCategory: null,
        cdUom: "EA",
        prPx: null,
        amCost: null,
        flLot: false,
        flActive: true,
        __new: true,
      };
      nextRowNumber.current += 1;
      setItems((current) => [...current, row]);
      setFocusedRowId(row.id);
      setDirty(true);
      window.setTimeout(() => gridRef.current?.focusLastRow(), 0);
    }, [appliedFilters.type, companyCode, items]);

    const deleteFocusedRow = useCallback(async () => {
      if (busy) return;
      const target =
        visibleItems.find((item) => item.id === focusedRowId) ??
        visibleItems[visibleItems.length - 1];
      if (!target) {
        showEnDialog("info", "There are no items to remove.");
        return;
      }
      if (
        !(await showEnConfirm(
          `Remove item ${target.cdItem}? The server deletion will be applied when you save.`,
        ))
      ) {
        return;
      }
      const targetIndex = visibleItems.findIndex(
        (item) => item.id === target.id,
      );
      setItems((current) => current.filter((item) => item.id !== target.id));
      setDirtyItemIds((current) => {
        const next = new Set(current);
        next.delete(target.id);
        return next;
      });
      if (!target.__new) {
        setDeletedItems((current) => [...current, toItemSaveRequest(target, "D")]);
      }
      setFocusedRowId(null);
      setDirty(
        !target.__new ||
          dirtyItemIds.size > 0 ||
          deletedItems.length > 0 ||
          items.some((item) => item.id !== target.id && item.__new),
      );
      window.setTimeout(
        () => gridRef.current?.focusAfterDelete(Math.max(targetIndex, 0)),
        0,
      );
    }, [busy, deletedItems.length, dirtyItemIds.size, focusedRowId, items, visibleItems]);

    const save = useCallback(async () => {
      if (busy) return;
      const problem = validateItems(items);
      if (problem) {
        showEnDialog("error", problem);
        return;
      }
      const changes: ItemSaveRequest[] = [
        ...deletedItems,
        ...items
          .filter((item) => item.__new || dirtyItemIds.has(item.id))
          .map((item) => toItemSaveRequest(item, item.__new ? "I" : "U")),
      ];
      if (!changes.length) {
        await showEnDialog("info", "There are no item changes to save.");
        return;
      }
      setBusy(true);
      try {
        const result = await saveItems(changes);
        invalidateDataset(queryClient, CONTROLLER);
        setItems((current) =>
          current.map((item) => {
            const saved = { ...item };
            delete saved.__new;
            return saved;
          }),
        );
        setDirtyItemIds(new Set());
        setDeletedItems([]);
        setInvalidCell(null);
        setDirty(false);
        gridRef.current?.clearDirtyRows();
        await showEnDialog(
          "success",
          `Successfully saved ${result.savedCount} item${result.savedCount === 1 ? "" : "s"}.`,
        );
      } catch (error) {
        await showEnDialog(
          "error",
          error instanceof ApiError ? error.message : "Failed to save items.",
        );
      } finally {
        setBusy(false);
      }
    }, [busy, deletedItems, dirtyItemIds, items, queryClient]);

    const exportExcel = useCallback(async () => {
      if (!items.length) {
        showEnDialog("error", "There are no items to export.");
        return;
      }
      try {
        const rows = [
          [
            "Company",
            "Item code",
            "Item name",
            "Type",
            "Category",
            "Unit",
            "Price",
            "Cost",
            "Lot tracked",
            "Active",
          ],
          ...items.map((item) => [
            item.cdCompany,
            item.cdItem,
            item.nmItem,
            itemTypeOptions.find(
              (option) => Number(option.code) === item.fgType,
            )?.name ?? "",
            item.cdCategory ?? "",
            item.cdUom,
            item.prPx == null
              ? ""
              : ({ value: item.prPx, type: Number, format: "0.00" } as const),
            item.amCost == null
              ? ""
              : ({ value: item.amCost, type: Number, format: "0.00" } as const),
            item.flLot ? "Yes" : "No",
            item.flActive ? "Yes" : "No",
          ]),
        ];
        const workbook = await writeXlsxFile(rows, {
          sheet: "Items",
          columns: [
            { width: 12 },
            { width: 16 },
            { width: 32 },
            { width: 14 },
            { width: 22 },
            { width: 12 },
            { width: 14 },
            { width: 14 },
            { width: 14 },
            { width: 12 },
          ],
        });
        await workbook.toFile("items.xlsx");
        showEnDialog("info", "Items exported as a real .xlsx workbook.");
      } catch (error) {
        const detail =
          error instanceof Error ? ` ${error.message}` : " Please try again.";
        showEnDialog("error", `Excel export failed.${detail}`);
      }
    }, [items]);

    const handleCellValueChanged = useCallback(({ data }: { data: AgRow }) => {
      const edited = data as ItemRow;
      setItems((current) =>
        current.map((item) =>
          item.id === edited.id ? { ...item, ...edited } : item,
        ),
      );
      if (!edited.__new) {
        setDirtyItemIds((current) => new Set(current).add(edited.id));
      }
      setDirty(true);
    }, []);

    const handleFocusedRow = useCallback((row: AgRow | null) => {
      setFocusedRowId(row?.id == null ? null : String(row.id));
    }, []);

    useImperativeHandle(
      ref,
      () => ({
        search: onSearch,
        insert: addRow,
        delete: deleteFocusedRow,
        save,
        excel: () => {
          void exportExcel();
        },
        canClose: async () =>
          !dirty ||
          (await showEnConfirm(
            "Discard unsaved item changes?",
          )) === true,
      }),
      [addRow, deleteFocusedRow, dirty, exportExcel, onSearch, save],
    );

    return (
      <div className="feature-screen po-prototype">
        <SearchPanel ariaLabel="Item search conditions">
          <SearchPanelField title="Item" htmlFor="item-search">
            <EnTextBox
              label="Item"
              defaultValue={draftFilters.item}
              onValueChanged={(value) => updateFilters({ item: value })}
              placeHolderText="Code, name, category, or unit"
              inputRef={searchRef}
              isSearchPanel
            />
          </SearchPanelField>
          <SearchPanelField title="Type" htmlFor="item-type-filter">
            <EnComboBox
              label="Type"
              defaultValue={draftFilters.type === "" ? "" : String(draftFilters.type)}
              options={itemTypeFilterOptions}
              onValueChanged={(value) =>
                updateFilters({
                  type: value === "" ? "" : (Number(value) as ItemType),
                })
              }
              isSearchPanel
            />
          </SearchPanelField>
        </SearchPanel>

        <div className="flex min-h-0 flex-1 gap-3 pt-3">
          <div className="po-detail-panel" style={{ width: "100%" }}>
            <div className="enotes-ag-grid-wrap">
              <AgDataGrid
                ref={gridRef}
                ariaLabel="Items"
                columnDefs={columns}
                rowData={visibleItems as AgRow[]}
                getRowId={(data) => String(data.id)}
                onAddRow={addRow}
                onDeleteRows={() => void deleteFocusedRow()}
                onSave={() => void save()}
                onExport={() => void exportExcel()}
                onCellValueChanged={handleCellValueChanged}
                onFocusedRowChanged={handleFocusedRow}
                loading={busy}
                emptyMessage="No items match these search conditions."
              />
            </div>
            {invalidCell && (
              <div className="po-validation" role="status">
                <span aria-hidden="true">!</span> {invalidCell.message}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  },
);

function toItemSaveRequest(
  item: ItemRow,
  state: ItemSaveRequest["state"],
): ItemSaveRequest {
  return {
    cdItem: item.cdItem,
    nmItem: item.nmItem,
    fgType: item.fgType,
    cdCategory: item.cdCategory,
    cdUom: item.cdUom,
    prPx: item.prPx,
    flLot: item.flLot,
    flActive: item.flActive,
    state,
  };
}
