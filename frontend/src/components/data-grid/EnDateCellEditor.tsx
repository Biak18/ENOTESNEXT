import {
  forwardRef,
  useImperativeHandle,
  useState,
} from "react";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { type Dayjs } from "dayjs";
import type { ICellEditorParams } from "ag-grid-community";

/** Normalise a stored value (YYYYMMDD / ISO / Date / dayjs) to a Dayjs. */
function toDayjs(value: unknown): Dayjs | null {
  if (value == null || value === "") return null;
  if (value instanceof Date) return dayjs(value);
  if (dayjs.isDayjs(value)) return value;
  const s = String(value);
  if (/^\d{8}$/.test(s)) return dayjs(s, "YYYYMMDD");
  const d = dayjs(s);
  return d.isValid() ? d : null;
}

/** Format a cell's stored value for display as YYYY/MM/DD. */
export function formatYmd(value: unknown): string {
  const d = toDayjs(value);
  return d && d.isValid() ? d.format("YYYY/MM/DD") : "";
}

/**
 * AG-Grid cell editor that opens the MUI X DatePicker (the same component the
 * EnDateBox control uses). Stores the result back as a YYYYMMDD string so the
 * underlying row keeps the ENOTES date format.
 */
export const EnDateCellEditor = forwardRef<
  { getValue: () => string },
  ICellEditorParams
>(function EnDateCellEditor({ value, api }, ref) {
  const [date, setDate] = useState<Dayjs | null>(toDayjs(value));

  useImperativeHandle(ref, () => ({
    getValue: () => (date && date.isValid() ? date.format("YYYYMMDD") : ""),
  }));

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        open
        value={date}
        format="YYYY/MM/DD"
        onChange={(next) => setDate(next)}
        onAccept={() => api.stopEditing()}
        onClose={() => api.stopEditing()}
        slotProps={{
          textField: {
            size: "small",
            autoFocus: true,
            fullWidth: true,
            sx: { minWidth: 130 },
          },
        }}
      />
    </LocalizationProvider>
  );
});

export default EnDateCellEditor;
