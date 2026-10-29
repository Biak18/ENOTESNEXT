import { Autocomplete, TextField } from "@mui/material";
import useEnSyncedState from "./useEnSyncedState";
import type { EnOption } from "./EnControlTypes";

export interface EnItemDetailBoxProps {
  defaultValue?: string;
  options?: EnOption[];
  onValueChanged?: (value: string, option: EnOption | null) => void;
  isReadOnly?: boolean;
  label?: string;
}

export default function EnItemDetailBox({
  defaultValue = "",
  options = [],
  onValueChanged,
  isReadOnly = false,
  label = "Item",
}: EnItemDetailBoxProps) {
  const [code, setCode] = useEnSyncedState(defaultValue, defaultValue);

  return (
    <Autocomplete
      options={options}
      value={options.find((option) => option.code === code) ?? null}
      onChange={(_event, option) => {
        const next = option?.code ?? "";
        setCode(next);
        onValueChanged?.(next, option);
      }}
      getOptionLabel={(option) => `${option.code} - ${option.name}`}
      isOptionEqualToValue={(option, selected) => option.code === selected.code}
      disabled={isReadOnly}
      fullWidth
      size="small"
      renderInput={(params) => <TextField {...params} label={label} />}
    />
  );
}
