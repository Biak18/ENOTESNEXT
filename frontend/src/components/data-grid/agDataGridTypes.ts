import type { ColDef, GridApi } from "ag-grid-community";

export type AgRow = Record<string, unknown>;

/** Lookup option for "lookup" grid columns (SNOTES SnComboBox). */
export type AgLookupOption = { code: string; name: string };

/** Supported grid column types (mirrors SNOTES tp_column). */
export type AgColumnType =
  | "text"
  | "numeric"
  | "lookup"
  | "date"
  | "datetime"
  | "checkbox";

/**
 * Feature-friendly column definition: an AG-Grid ColDef plus a `type` and
 * type-specific options. The shared grid converts these into the right
 * cellEditor/renderer/filter/formatter. Type-specific `cellRenderer`,
 * `cellEditor`, `valueFormatter`, `cellClass`, etc. are still honoured and
 * win over the defaults produced from `type`.
 */
export type AgColDef = ColDef & {
  /**
   * ENOTES column type (SNOTES tp_column). Omit for a plain text column.
   * Named `colType` to avoid clashing with AG-Grid's own `type` prop.
   */
  colType?: AgColumnType;
  /** Options for "lookup" columns; `code` is stored, `name` is displayed. */
  lookupOptions?: AgLookupOption[];
  /** Decimal places for "numeric" columns (default 2). */
  precision?: number;
  /**
   * Include this column's values in the global pinned footer sum row
   * (SNOTES yn_sum). Only meaningful for numeric columns.
   */
  showFooterSum?: boolean;
};

export type AgDataGridHandle = {
  api: () => GridApi | null;
  selectAndFocusRow: (index: number) => void;
  addRow: (row: AgRow) => void;
  deleteFocusedRow: () => void;
  getFocusedRow: () => AgRow | null;
  /** Select + focus a row's first editable cell (SNOTES add-row behavior). */
  focusRow: (index: number) => void;
  /** Select + focus the last row's first editable cell. */
  focusLastRow: () => void;
  /**
   * After removing a row, select + focus the row above the deleted index
   * (or the first row when deleting the top row). SNOTES handleRowFocusAfterDelete.
   */
  focusAfterDelete: (deletedIndex: number) => void;
  /** Returns the row objects that have been cell-edited (since last clear). */
  getChanges: () => AgRow[];
  /** Returns true if the given row ID has been edited. */
  isRowDirty: (rowId: string) => boolean;
  /** Clear the dirty row tracking (call after a successful save). */
  clearDirtyRows: () => void;
};

export type AgDataGridProps = {
  columnDefs: AgColDef[];
  rowData: AgRow[];
  rowSelection?: "single" | "multiple";
  isEditable?: boolean;
  ariaLabel: string;
  /** Show the left-pinned "No." row-number column (SNOTES fixIndicator). Default true. */
  showRowNumber?: boolean;
  /** Hide AG-Grid's default context-menu entries (copy/export/etc). Default false. */
  suppressDefaultContextMenu?: boolean;
  /** Screen hook for the global "Add row" context-menu item; hidden when omitted. */
  onAddRow?: () => void;
  /** Screen hook for the global "Delete selected row" context-menu item; hidden when omitted. */
  onDeleteRows?: () => void;
  /** Screen hook for the global "Save" context-menu item; hidden when omitted. */
  onSave?: () => void;
  /** Screen hook for the global "Export to Excel" context-menu item; hidden when omitted. */
  onExport?: () => void;
  /**
   * When true, pin a footer summary row (AG-Grid pinnedBottomRowData) that
   * sums every column flagged `showFooterSum` and shows the row count.
   * Global replacement for the old custom HTML footer.
   */
  showFooter?: boolean;
  /** Stable key field for row identity (defaults to "id"). */
  getRowId?: (data: AgRow) => string;
  onCellValueChanged?: (params: {
    data: AgRow;
    colId: string;
    newValue: unknown;
    oldValue: unknown;
  }) => void;
  onFocusedRowChanged?: (row: AgRow | null) => void;
  onRowDoubleClicked?: (row: AgRow) => void;
  /** Cell double-click handler with column info (used for password change etc). */
  onCellDoubleClicked?: (params: { colDef: { field?: string }; data: AgRow }) => void;
  emptyMessage?: string;
};
