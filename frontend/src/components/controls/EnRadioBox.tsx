import { FormControl, FormControlLabel, Radio, RadioGroup } from "@mui/material";
import type { EnOption } from "./EnControlTypes";
import useEnSyncedState from "./useEnSyncedState";

export interface EnRadioBoxProps {
  defaultValue?: string;
  options?: EnOption[];
  onValueChanged?: (value: string) => void;
  isReadOnly?: boolean;
  row?: boolean;
}

export default function EnRadioBox({
  defaultValue = "",
  options = [],
  onValueChanged,
  isReadOnly = false,
  row = true,
}: EnRadioBoxProps) {
  const [value, setValue] = useEnSyncedState(defaultValue, defaultValue);

  return (
    <FormControl component="fieldset">
      <RadioGroup
        row={row}
        value={value}
        onChange={(event) => {
          setValue(event.target.value);
          onValueChanged?.(event.target.value);
        }}
      >
        {options.map((option) => (
          <FormControlLabel
            key={option.code}
            value={option.code}
            control={<Radio size="small" disabled={isReadOnly} />}
            label={option.name}
          />
        ))}
      </RadioGroup>
    </FormControl>
  );
}
