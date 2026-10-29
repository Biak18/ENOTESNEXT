import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import useEnSyncedState from "./useEnSyncedState";
import type { EnOption } from "./EnControlTypes";

export interface EnCodeBoxProps {
  defaultValue?: string;
  options?: EnOption[];
  onValueChanged?: (value: string) => void;
  onLookup?: (query: string) => void;
  isReadOnly?: boolean;
  isEditable?: boolean;
  isRequired?: boolean;
  label?: string;
}

export default function EnCodeBox({
  defaultValue = "",
  options = [],
  onValueChanged,
  onLookup,
  isReadOnly = false,
  isEditable = true,
  isRequired = false,
  label = "Code",
}: EnCodeBoxProps) {
  const [value, setValue] = useEnSyncedState(defaultValue, defaultValue);

  return (
    <Autocomplete
      freeSolo
      options={options}
      value={value}
      inputValue={value}
      onInputChange={(_event, next, reason) => {
        setValue(next);
        if (reason === "input") {
          onValueChanged?.(next);
          onLookup?.(next);
        }
      }}
      onChange={(_event, next) => {
        const code = typeof next === "string" ? next : next?.code ?? "";
        setValue(code);
        onValueChanged?.(code);
      }}
      getOptionLabel={(option) => typeof option === "string" ? option : option.code}
      isOptionEqualToValue={(option, selected) => option.code === selected}
      disabled={isReadOnly}
      fullWidth
      size="small"
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          required={isRequired}
          slotProps={{
            ...params.slotProps,
            input: { ...params.slotProps.input, readOnly: !isEditable },
          }}
        />
      )}
    />
  );
}
