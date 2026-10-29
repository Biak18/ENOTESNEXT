import { Autocomplete, TextField } from "@mui/material";
import { useMemo } from "react";
import type { EnOption, EnValueControlProps } from "./EnControlTypes";
import useEnSyncedState from "./useEnSyncedState";

export interface EnComboBoxProps extends Omit<EnValueControlProps, "defaultValue"> {
  defaultValue?: string;
  options?: EnOption[];
  emptyLine?: boolean;
  isRequired?: boolean;
}

export default function EnComboBox({
  defaultValue = "",
  options = [],
  emptyLine = false,
  onValueChanged,
  isReadOnly = false,
  isEditable = true,
  isRequired = false,
  inputRef,
  isSearchPanel = false,
  onFocus,
}: EnComboBoxProps) {
  const items = useMemo(
    () => (emptyLine && !options.some((option) => option.code === "") ? [{ code: "", name: "" }, ...options] : options),
    [emptyLine, options],
  );
  const [value, setValue] = useEnSyncedState(defaultValue, defaultValue);
  const selected = items.find((option) => option.code === value) ?? null;

  return (
    <Autocomplete
      options={items}
      value={selected}
      onChange={(_event, option) => {
        const next = option?.code ?? "";
        setValue(next);
        onValueChanged?.(next);
        onFocus?.(isSearchPanel ? "current" : "next");
      }}
      getOptionLabel={(option) => option.name}
      isOptionEqualToValue={(option, selectedOption) => option.code === selectedOption.code}
      disabled={isReadOnly}
      disableClearable={isRequired}
      fullWidth
      size="small"
      renderInput={(params) => (
        <TextField
          {...params}
          inputRef={inputRef}
          required={isRequired}
          slotProps={{
            ...params.slotProps,
            input: { ...params.slotProps.input, readOnly: !isEditable },
          }}
          sx={{ backgroundColor: isEditable ? "white" : "#f5f5f5" }}
        />
      )}
    />
  );
}
