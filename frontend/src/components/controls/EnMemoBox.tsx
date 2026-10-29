import { TextField } from "@mui/material";
import useEnSyncedState from "./useEnSyncedState";
import type { EnValueControlProps } from "./EnControlTypes";

export interface EnMemoBoxProps extends EnValueControlProps {
  minRows?: number;
}

export default function EnMemoBox({
  defaultValue = "",
  onValueChanged,
  isReadOnly = false,
  isEditable = true,
  isRequired = false,
  inputRef,
  minRows = 3,
}: EnMemoBoxProps) {
  const [value, setValue] = useEnSyncedState(defaultValue, defaultValue);

  return (
    <TextField
      inputRef={inputRef}
      value={value}
      onChange={(event) => {
        setValue(event.target.value);
        onValueChanged?.(event.target.value);
      }}
      disabled={isReadOnly}
      required={isRequired}
      multiline
      minRows={minRows}
      fullWidth
      size="small"
      slotProps={{ input: { readOnly: !isEditable } }}
      sx={{ backgroundColor: isEditable ? "white" : "#f5f5f5" }}
    />
  );
}
