import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";
import { useMemo } from "react";
import type { ReactNode } from "react";
import useEnSyncedState from "../../components/controls/useEnSyncedState";

export interface EnPopupColumn {
  field: string;
  label: string;
}

export type EnPopupRow = Record<string, string | number | boolean | null | undefined>;

export interface EnSelectionDialogProps<Row extends EnPopupRow> {
  open: boolean;
  title: string;
  rows: Row[];
  columns: EnPopupColumn[];
  multiple?: boolean;
  keyField?: keyof Row;
  searchLabel?: string;
  children?: ReactNode;
  onClose: () => void;
  onConfirm: (rows: Row[]) => void;
}

export default function EnSelectionDialog<Row extends EnPopupRow>({
  open,
  title,
  rows,
  columns,
  multiple = false,
  keyField,
  searchLabel = "Filter rows",
  children,
  onClose,
  onConfirm,
}: EnSelectionDialogProps<Row>) {
  const [query, setQuery] = useEnSyncedState("", open);
  const [selected, setSelected] = useEnSyncedState<Row[]>([], open);
  const filteredRows = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    if (!normalized) return rows;
    return rows.filter((row) =>
      columns.some((column) =>
        String(row[column.field] ?? "").toLocaleLowerCase().includes(normalized),
      ),
    );
  }, [columns, query, rows]);

  const rowKey = (row: Row, index: number) =>
    String((keyField ? row[keyField] : row.id) ?? columns.map(({ field }) => row[field]).join("|") ?? index);
  const toggleRow = (row: Row) => {
    const key = rowKey(row, rows.indexOf(row));
    setSelected((current) => {
      const exists = current.some((item, index) => rowKey(item, index) === key);
      if (exists) return current.filter((item, index) => rowKey(item, index) !== key);
      return multiple ? [...current, row] : [row];
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      aria-labelledby="en-selection-title"
    >
      <DialogTitle id="en-selection-title">{title}</DialogTitle>
      <DialogContent dividers>
        {children}
        <TextField
          label={searchLabel}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          fullWidth
          size="small"
          sx={{ mb: 1 }}
        />
        <div className="max-h-[55vh] overflow-auto">
          <Table size="small" stickyHeader aria-label={title}>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox" />
                {columns.map((column) => (
                  <TableCell key={column.field}>{column.label}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRows.map((row, index) => {
                const selectedRow = selected.some(
                  (item, selectedIndex) => rowKey(item, selectedIndex) === rowKey(row, index),
                );
                return (
                  <TableRow
                    hover
                    selected={selectedRow}
                    key={rowKey(row, index)}
                    onClick={() => toggleRow(row)}
                    onDoubleClick={() => {
                      if (!multiple) onConfirm([row]);
                    }}
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        toggleRow(row);
                      }
                    }}
                    sx={{ cursor: "pointer" }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox checked={selectedRow} tabIndex={-1} />
                    </TableCell>
                    {columns.map((column) => (
                      <TableCell key={column.field}>
                        {String(row[column.field] ?? "")}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })}
              {filteredRows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={columns.length + 1} align="center">
                    No matching records
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          disabled={selected.length === 0}
          onClick={() => onConfirm(selected)}
        >
          Select{multiple ? ` (${selected.length})` : ""}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
