import { TextField } from "@mui/material";
import useEnSyncedState from "./useEnSyncedState";
import type { EnValueControlProps } from "./EnControlTypes";

export interface EnNumberBoxProps extends Omit<EnValueControlProps, "defaultValue" | "onValueChanged"> {
  defaultValue?: number;
  onValueChanged?: (value: number) => void;
  format?: string;
  min?: number;
  max?: number;
  step?: number;
}

export default function EnNumberBox({
  defaultValue = 0,
  onValueChanged,
  isReadOnly = false,
  isEditable = true,
  isRequired = false,
  inputRef,
  min,
  max,
  step,
}: EnNumberBoxProps) {
  const [value, setValue] = useEnSyncedState(String(defaultValue), defaultValue);

  return (
    <TextField
      inputRef={inputRef}
      type="number"
      value={value}
      onChange={(event) => {
        setValue(event.target.value);
        if (event.target.value !== "") onValueChanged?.(Number(event.target.value));
      }}
      disabled={isReadOnly}
      required={isRequired}
      fullWidth
      size="small"
      slotProps={{
        htmlInput: { min, max, step },
        input: { readOnly: !isEditable },
      }}
      sx={{ backgroundColor: isEditable ? "white" : "#f5f5f5" }}
    />
  );
}
