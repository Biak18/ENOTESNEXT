import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import { AgGridReact } from "ag-grid-react";
import type {
  ColDef,
  GetContextMenuItemsParams,
  GridApi,
  MenuItemDef,
  RowSelectionOptions,
} from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import type {
  AgColDef,
  AgDataGridHandle,
  AgDataGridProps,
  AgRow,
} from "./agDataGridTypes";
import EnDateCellEditor, { formatYmd } from "./EnDateCellEditor";
import "./AgDataGrid.css";

const defaultColDef: ColDef = {
  sortable: true,
  resizable: true,
  suppressHeaderMenuButton: true,
  headerClass: "ag-header-center",
};

const numberFmt = (precision: number) =>
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  });

/** Class-merge helper that keeps a screen-supplied cellClass. */
function mergeClass(
  existing: ColDef["cellClass"],
  extra: string,
): ColDef["cellClass"] {
  return (params: { data?: unknown; node?: { rowPinned?: unknown } }) => {
    const base =
      typeof existing === "function"
        ? (existing as (p: unknown) => string)(params)
        : Array.isArray(existing)
          ? existing.join(" ")
          : (existing ?? "");
    return `${base} ${extra}`.trim();
  };
}

/**
 * Map a feature `AgColDef` (`type` + options) to a full AG-Grid ColDef,
 * mirroring SNOTES's per-type getColumnTypeConfig. Explicit screen props
 * (cellRenderer / cellEditor / valueFormatter / cellClass) take precedence.
 */
function toColDef(col: AgColDef): ColDef {
  const {
    colType,
    lookupOptions = [],
    precision = 2,
    showFooterSum,
    cellClass,
    ...rest
  } = col;

  switch (colType) {
    case "numeric": {
      const fmt = numberFmt(precision);
      return {
        cellEditor: "agNumberCellEditor",
        filter: "agNumberColumnFilter",
        cellEditorParams: {
          preventStepping: true,
          suppressKeyboardEvent: (p: { event: KeyboardEvent }) =>
            p.event.key === "ArrowUp" || p.event.key === "ArrowDown",
        },
        valueFormatter: (p) =>
          p.value == null || Number.isNaN(Number(p.value))
            ? ""
            : fmt.format(Number(p.value)),
        ...rest,
        // Merge the screen's cellClass so the type's alignment always applies.
        cellClass: mergeClass(cellClass, "enotes-number-cell"),
      };
    }
    case "lookup": {
      return {
        cellEditor: "agSelectCellEditor",
        cellEditorParams: {
          values: lookupOptions.map((o) => o.code),
          formatValue: (code: string) =>
            lookupOptions.find((o) => o.code === code)?.name ?? code,
        },
        cellRenderer:
          rest.cellRenderer ??
          ((p: { value: string }) =>
            lookupOptions.find((o) => o.code === p.value)?.name ?? p.value),
        ...rest,
        cellClass: mergeClass(cellClass, ""),
      };
    }
    case "date":
    case "datetime": {
      return {
        cellEditor: EnDateCellEditor,
        filter: "agDateColumnFilter",
        ...rest,
        // Display stored values (YYYYMMDD / ISO / Date) as YYYY/MM/DD by default.
        valueFormatter: rest.valueFormatter ?? ((p) => formatYmd(p.value)),
        cellClass: mergeClass(cellClass, "enotes-center-cell"),
      };
    }
    case "checkbox": {
      return {
        cellRendererSelector: (params: { node?: { rowPinned?: unknown } }) =>
          params.node?.rowPinned
            ? { component: () => null }
            : { component: "agCheckboxCellRenderer" },
        cellEditor: "agCheckboxCellEditor",
        ...rest,
        cellClass: mergeClass(cellClass, "enotes-center-cell"),
      };
    }
    case "text":
    default:
      return { ...rest, cellClass };
  }
}

/**
 * SNOTES "No." fixIndicator column: a left-pinned, non-navigable row counter
 * that displays the displayed row index + 1 (and the total on pinned footers).
 */
const rowNumberColDef: ColDef = {
  colId: "fixIndicator",
  headerName: "No.",
  width: 64,
  pinned: "left",
  cellClass: "row-number-cell",
  suppressMovable: true,
  suppressNavigable: true,
  sortable: false,
  filter: false,
  editable: false,
  valueGetter: (params) => {
    if (params.node?.rowPinned) {
      return params.api?.getDisplayedRowCount() ?? "";
    }
    return (params.node?.rowIndex ?? 0) + 1;
  },
};

/**
 * Shared ENOTES grid built on AG-Grid Community (MIT).
 * Feature screens own their column defs, row data, validation, and callbacks;
 * this wrapper owns common setup, the alpine theme, and reusable behavior.
 */
export const AgDataGrid = forwardRef<AgDataGridHandle, AgDataGridProps>(
  function AgDataGrid(
    {
      columnDefs,
      rowData,
      rowSelection = "single",
      isEditable = true,
      ariaLabel,
      showRowNumber = true,
      suppressDefaultContextMenu = false,
      onAddRow,
      onDeleteRows,
      onSave,
      onExport,
      showFooter = false,
      getRowId,
      onCellValueChanged,
      onFocusedRowChanged,
      onRowDoubleClicked,
      onCellDoubleClicked,
      emptyMessage = "No rows to display.",
    },
    ref,
  ) {
    const gridRef = useRef<AgGridReact<AgRow>>(null);
    // Persist user-resized column widths so a re-render (e.g. focusing a row)
    // doesn't snap columns back to their declared widths. Mirrors SNOTES's
    // onColumnResized -> getColumnState -> colDef.width merge.
    const resizedWidths = useRef<Map<string, number>>(new Map());
    // Track row IDs that have been edited via cell value changes.
    const dirtyRowIds = useRef<Set<string>>(new Set());
    // Render popups/context menus on <body> so they aren't clipped inside the grid.
    const popupParent = useMemo<HTMLElement | null>(
      () => (typeof document !== "undefined" ? document.body : null),
      [],
    );

    const selection = useMemo<RowSelectionOptions | "single" | "multiple">(
      () =>
        rowSelection === "multiple"
          ? {
              mode: "multiRow",
              checkboxes: false,
              headerCheckbox: false,
              enableClickSelection: true,
            }
          : {
              mode: "singleRow",
              checkboxes: false,
              headerCheckbox: false,
              enableClickSelection: true,
            },
      [rowSelection],
    );

    // Stable defaultColDef: a fresh object each render would make AG-Grid
    // re-sync columns and drop user-resized widths.
    const resolvedDefaultColDef = useMemo<ColDef>(
      () => ({ ...defaultColDef, editable: isEditable }),
      [isEditable],
    );

    const resolvedColumnDefs = useMemo<ColDef[]>(() => {
      const mapped = columnDefs.map((col) => {
        const def = toColDef(col);
        // Re-apply a user-resized width so re-renders don't reset it.
        const saved = def.field
          ? resizedWidths.current.get(String(def.colId ?? def.field))
          : undefined;
        return saved != null ? { ...def, width: saved } : def;
      });
      return showRowNumber ? [rowNumberColDef, ...mapped] : mapped;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [columnDefs, showRowNumber]);

    // Global pinned footer (SNOTES pinnedBottomRowData): sums columns flagged
    // `showFooterSum` over the currently-displayed rows and shows the count.
    const sumFields = useMemo(
      () =>
        columnDefs
          .filter((col) => col.showFooterSum && col.field)
          .map((col) => col.field as string),
      [columnDefs],
    );
    const pinnedBottomRowData = useMemo<AgRow[]>(() => {
      if (!showFooter) return [];
      const totals: AgRow = { cnt_row: rowData.length };
      for (const field of sumFields) {
        totals[field] = rowData.reduce(
          (sum, row) => sum + (Number(row[field]) || 0),
          0,
        );
      }
      return [totals];
    }, [showFooter, rowData, sumFields]);

    // Keep latest screen callbacks in a ref so getContextMenuItems (and other
    // grid handlers) can stay referentially stable across renders. Passing a
    // fresh function prop to AgGridReact triggers a grid options re-diff that
    // re-syncs columns and drops user-resized widths.
    const actionRef = useRef({ onAddRow, onDeleteRows, onSave, onExport });
    actionRef.current = { onAddRow, onDeleteRows, onSave, onExport };
    const suppressDefaultRef = useRef(suppressDefaultContextMenu);
    suppressDefaultRef.current = suppressDefaultContextMenu;

    // Global right-click menu (cells and column headers), mirroring SNOTES's
    // shared popmenu. Screen actions are supplied through the onAddRow /
    // onDeleteRows / onSave / onExport props; items for unused hooks are hidden.
    const getContextMenuItems = useCallback(
      (params: GetContextMenuItemsParams): (MenuItemDef | string)[] => {
        const api = params.api;
        const {
          onAddRow: onAdd,
          onDeleteRows: onDel,
          onSave: onSv,
          onExport: onEx,
        } = actionRef.current;
        const onHeader = Boolean(params.column) && !params.node;
        const items: (MenuItemDef | string)[] = [];

        if (onHeader) {
          items.push({
            name: "Reset columns",
            action: () => api.resetColumnState(),
          });
        }
        if (!onHeader && onAdd) {
          items.push({ name: "Add row", action: () => onAdd() });
        }
        if (!onHeader && onDel) {
          items.push({
            name: "Delete selected row",
            disabled: (api.getSelectedRows() ?? []).length === 0,
            action: () => onDel(),
          });
        }
        const globalItems: (MenuItemDef | string)[] = [];
        if (onSv) globalItems.push({ name: "Save", action: () => onSv() });
        if (onEx)
          globalItems.push({ name: "Export to Excel", action: () => onEx() });
        if (globalItems.length) items.push("separator", ...globalItems);

        const baseItems = suppressDefaultRef.current
          ? []
          : (params.defaultItems ?? []);
        if (items.length && baseItems.length)
          return [...items, "separator", ...baseItems];
        return items.length ? items : baseItems;
      },
      [],
    );

    const handleGetRowId = useCallback(
      (params: { data: AgRow }) =>
        getRowId ? getRowId(params.data) : String(params.data.id),
      [getRowId],
    );
    const getRowHeightStable = useCallback(() => 30, []);
    const handleColumnResized = useCallback(
      (event: { finished?: boolean; api: GridApi }) => {
        if (!event.finished) return;
        for (const col of event.api.getColumnState()) {
          if (col.width != null)
            resizedWidths.current.set(col.colId, col.width);
        }
      },
      [],
    );
    const handleCellValueChanged = useCallback(
      (event: {
        data: AgRow;
        column: { getColId: () => string };
        newValue: unknown;
        oldValue: unknown;
      }) => {
        const rowId = handleGetRowId({ data: event.data });
        dirtyRowIds.current.add(rowId);
        onCellValueChanged?.({
          data: event.data,
          colId: event.column.getColId(),
          newValue: event.newValue,
          oldValue: event.oldValue,
        });
      },
      [onCellValueChanged, handleGetRowId],
    );
    const handleSelectionChanged = useCallback(() => {
      const selected = gridRef.current?.api.getSelectedRows() ?? [];
      onFocusedRowChanged?.((selected[0] as AgRow | undefined) ?? null);
    }, [onFocusedRowChanged]);
    const handleRowDoubleClicked = useCallback(
      (event: { data?: AgRow }) => {
        if (event.data) onRowDoubleClicked?.(event.data);
      },
      [onRowDoubleClicked],
    );
    const handleCellDoubleClicked = useCallback(
      (event: { colDef?: { field?: string }; data?: AgRow }) => {
        if (!event.data) return;
        onCellDoubleClicked?.({
          colDef: { field: event.colDef?.field },
          data: event.data,
        });
      },
      [onCellDoubleClicked],
    );

    useImperativeHandle(ref, () => ({
      api: () => gridRef.current?.api ?? null,
      selectAndFocusRow: (index: number) => {
        const api = gridRef.current?.api;
        if (!api) return;
        api.forEachNode((node) => node.setSelected(false));
        const node = api.getDisplayedRowAtIndex(index);
        node?.setSelected(true);
        api.ensureIndexVisible(index);
      },
      addRow: (row: AgRow) => {
        gridRef.current?.api.applyTransaction({ add: [row] });
      },
      deleteFocusedRow: () => {
        const api = gridRef.current?.api;
        const selected = api?.getSelectedRows() ?? [];
        if (selected.length) {
          api?.applyTransaction({ remove: selected });
        }
      },
      getFocusedRow: () => {
        const api = gridRef.current?.api;
        const selected = api?.getSelectedRows() ?? [];
        return (selected[0] as AgRow | undefined) ?? null;
      },
      focusRow: (index: number) => {
        const api = gridRef.current?.api;
        if (!api || index < 0) return;
        const node = api.getDisplayedRowAtIndex(index);
        if (!node) return;
        api.ensureIndexVisible(index);
        node.setSelected(true);
        const firstEditable = resolvedColumnDefs.find(
          (col) => col.editable !== false && col.colId !== "fixIndicator",
        )?.field;
        if (firstEditable) api.setFocusedCell(index, firstEditable);
      },
      focusLastRow: () => {
        const api = gridRef.current?.api;
        if (!api) return;
        const lastIndex = api.getDisplayedRowCount() - 1;
        if (lastIndex < 0) return;
        const node = api.getDisplayedRowAtIndex(lastIndex);
        if (!node) return;
        api.ensureIndexVisible(lastIndex);
        node.setSelected(true);
        const firstEditable = resolvedColumnDefs.find(
          (col) => col.editable !== false && col.colId !== "fixIndicator",
        )?.field;
        if (firstEditable) api.setFocusedCell(lastIndex, firstEditable);
      },
      focusAfterDelete: (deletedIndex: number) => {
        const api = gridRef.current?.api;
        if (!api) return;
        const remaining = api.getDisplayedRowCount();
        if (remaining === 0) return;
        // SNOTES: move to the row above the deleted one, else the first row.
        let target = deletedIndex - 1;
        if (target < 0) target = 0;
        if (!api.getDisplayedRowAtIndex(target)) {
          target = Math.min(deletedIndex, remaining - 1); // next row / last row
        }
        const node = api.getDisplayedRowAtIndex(target);
        if (!node) return;
        node.setSelected(true);
        api.ensureIndexVisible(target);
        const firstEditable = resolvedColumnDefs.find(
          (col) => col.editable !== false && col.colId !== "fixIndicator",
        )?.field;
        if (firstEditable) api.setFocusedCell(target, firstEditable);
      },
      /** Returns the row objects that have been cell-edited (since last clear). */
      getChanges: () => {
        const api = gridRef.current?.api;
        if (!api) return [];
        const changed: AgRow[] = [];
        dirtyRowIds.current.forEach((rowId) => {
          const node = api.getRowNode(rowId);
          if (node?.data) changed.push(node.data);
        });
        return changed;
      },
      /** Returns true if the given row ID has been edited. */
      isRowDirty: (rowId: string) => dirtyRowIds.current.has(rowId),
      /** Clear the dirty row tracking (call after a successful save). */
      clearDirtyRows: () => dirtyRowIds.current.clear(),
    }));

    return (
      <div
        className="enotes-ag-grid ag-theme-alpine"
        role="region"
        aria-label={ariaLabel}
      >
        <AgGridReact<AgRow>
          ref={gridRef}
          columnDefs={resolvedColumnDefs}
          rowData={rowData}
          pinnedBottomRowData={pinnedBottomRowData}
          defaultColDef={resolvedDefaultColDef}
          getRowId={handleGetRowId}
          rowSelection={selection}
          enableCellTextSelection
          headerHeight={30}
          getRowHeight={getRowHeightStable}
          animateRows={false}
          domLayout="normal"
          suppressCellFocus={false}
          suppressColumnVirtualisation={true}
          getContextMenuItems={getContextMenuItems}
          popupParent={popupParent}
          onColumnResized={handleColumnResized}
          noRowsOverlayComponent={() => (
            <div className="ag-empty-overlay">{emptyMessage}</div>
          )}
          onCellValueChanged={handleCellValueChanged}
          onSelectionChanged={handleSelectionChanged}
          onRowDoubleClicked={handleRowDoubleClicked}
          onCellDoubleClicked={handleCellDoubleClicked}
        />
      </div>
    );
  },
);

export default AgDataGrid;
