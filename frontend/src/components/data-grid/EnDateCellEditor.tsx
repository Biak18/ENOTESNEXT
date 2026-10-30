import { memo, useEffect, useRef, useState } from "react";
import type { CustomCellEditorProps } from "ag-grid-react";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import type { Dayjs } from "dayjs";
import { toDayjs } from "./dateFormat";

/**
 * SNOTES DateBoxCellEditor port (shared/components/Grid/DateBoxCellEditor.tsx
 * of the reference app): an inline, borderless MUI DatePicker whose calendar
 * opens on focus, with no visible picker chrome. The selected date streams
 * back through onValueChange as the ENOTES "YYYYMMDD" string; AG-Grid commits
 * it when editing ends, exactly like the WinForms date cell.
 */
function EnDateCellEditor({ value, onValueChange }: CustomCellEditorProps) {
  const [date, setDate] = useState<Dayjs | null>(() => toDayjs(value));
  const [open, setOpen] = useState(true); // calendar open from the start (SNOTES)
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Focus the field (DOM side effect only; the calendar opens via state above).
  useEffect(() => {
    const input = wrapperRef.current?.querySelector("input");
    input?.focus();
  }, []);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div ref={wrapperRef} className="en-date-editor">
        <DatePicker
          format="YYYY/MM/DD"
          value={date}
          open={open}
          onClose={() => setOpen(false)}
          onChange={(next) => {
            setDate(next);
            onValueChange(
              next && next.isValid() ? next.format("YYYYMMDD") : "",
            );
          }}
          slotProps={{
            inputAdornment: { sx: { display: "none" } },
            openPickerButton: { sx: { display: "none" } },
            textField: {
              size: "small",
              autoFocus: true,
              fullWidth: true,
              sx: {
                height: "100%",
                // Every wrapper layer: no padding at all
                "& .MuiInputBase-root, & .MuiOutlinedInput-root, & .MuiPickersInputBase-root, & .MuiPickersOutlinedInput-root":
                  {
                    height: "100%",
                    padding: 0,
                    borderRadius: 0,
                    font: "inherit",
                    letterSpacing: "inherit",
                  },
                // The part that holds the visible YYYY/MM/DD text
                "& .MuiPickersInputBase-sectionsContainer, & .MuiPickersSectionList-root":
                  {
                    padding: 0,
                    margin: 0,
                    width: "100%",
                    justifyContent: "center",
                    whiteSpace: "nowrap",
                  },
                // Older (v6) input element
                "& .MuiInputBase-input": {
                  padding: 0,
                  textAlign: "center",
                },
                "& fieldset": { border: "none" },
              },
            },
          }}
        />
      </div>
    </LocalizationProvider>
  );
}

export default memo(EnDateCellEditor);
