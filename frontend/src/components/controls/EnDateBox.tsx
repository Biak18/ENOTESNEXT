import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { type Dayjs } from "dayjs";
import type { EnValueControlProps } from "./EnControlTypes";
import { controlHeight } from "./EnControlTypes";
import useEnSyncedState from "./useEnSyncedState";

export interface EnDateBoxProps extends EnValueControlProps {
  format?: string;
  views?: ("year" | "month" | "day")[];
}

export default function EnDateBox({
  defaultValue = "",
  onValueChanged,
  isReadOnly = false,
  isEditable = true,
  isRequired = false,
  inputRef,
  onFocus,
  format = "YYYY/MM/DD",
  views = ["year", "month", "day"],
}: EnDateBoxProps) {
  const [value, setValue] = useEnSyncedState<Dayjs | null>(
    defaultValue ? dayjs(defaultValue) : null,
    defaultValue,
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        value={value}
        format={format}
        views={views}
        onChange={(next) => {
          setValue(next);
          onValueChanged?.(next?.isValid() ? next.format("YYYYMMDD") : "");
        }}
        disabled={isReadOnly}
        readOnly={!isEditable}
        inputRef={inputRef}
        slotProps={{
          textField: {
            fullWidth: true,
            required: isRequired,
            size: "small",
            onKeyDown: (event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                onFocus?.("next");
              }
            },
            sx: { backgroundColor: isEditable ? "white" : "#f5f5f5" },
          },
          openPickerButton: { "aria-label": "Choose date" },
        }}
        sx={{ width: "100%", "& .MuiInputBase-root": { minHeight: controlHeight } }}
      />
    </LocalizationProvider>
  );
}
