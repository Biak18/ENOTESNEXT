import { Autocomplete, Checkbox, TextField } from "@mui/material";
import type { EnOption } from "./EnControlTypes";
import useEnSyncedState from "./useEnSyncedState";

export interface EnMultiComboBoxProps {
  defaultValue?: string[];
  options?: EnOption[];
  width?: number;
  emptyLine?: boolean;
  onValueChanged?: (value: string[]) => void;
  isReadOnly?: boolean;
  isRequired?: boolean;
}

export default function EnMultiComboBox({
  defaultValue = [],
  options = [],
  width,
  emptyLine = false,
  onValueChanged,
  isReadOnly = false,
  isRequired = false,
}: EnMultiComboBoxProps) {
  const [values, setValues] = useEnSyncedState(defaultValue, defaultValue.join("\0"));
  const items = emptyLine ? [{ code: "", name: "" }, ...options] : options;
  const selected = items.filter((option) => values.includes(option.code));

  return (
    <Autocomplete
      multiple
      options={items}
      value={selected}
      onChange={(_event, next) => {
        const codes = next.map((option) => option.code);
        setValues(codes);
        onValueChanged?.(codes);
      }}
      getOptionLabel={(option) => option.name}
      isOptionEqualToValue={(option, selectedOption) => option.code === selectedOption.code}
      disableCloseOnSelect
      disabled={isReadOnly}
      fullWidth={!width}
      sx={{ width }}
      size="small"
      renderOption={(props, option, { selected: isSelected }) => (
        <li {...props} key={option.code}>
          <Checkbox checked={isSelected} size="small" sx={{ mr: 1 }} />
          {option.name} [{option.code}]
        </li>
      )}
      renderInput={(params) => <TextField {...params} required={isRequired} />}
    />
  );
}
