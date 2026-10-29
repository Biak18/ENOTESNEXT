import { Autocomplete, TextField } from "@mui/material";
import useEnSyncedState from "./useEnSyncedState";
import type { EnOption } from "./EnControlTypes";

export interface EnComboTextBoxProps {
  defaultValue?: string;
  options?: EnOption[];
  onValueChanged?: (value: string) => void;
  onTextChanged?: (value: string) => void;
  isReadOnly?: boolean;
  isEditable?: boolean;
}

export default function EnComboTextBox({
  defaultValue = "",
  options = [],
  onValueChanged,
  onTextChanged,
  isReadOnly = false,
  isEditable = true,
}: EnComboTextBoxProps) {
  const initialText = options.find((option) => option.code === defaultValue)?.name ?? "";
  const [code, setCode] = useEnSyncedState(defaultValue, defaultValue);
  const [text, setText] = useEnSyncedState(
    initialText,
    `${defaultValue}:${initialText}`,
  );

  return (
    <div className="flex min-w-0 gap-1">
      <Autocomplete
        options={options}
        value={options.find((option) => option.code === code) ?? null}
        onChange={(_event, option) => {
          const nextCode = option?.code ?? "";
          const nextText = option?.name ?? "";
          setCode(nextCode);
          setText(nextText);
          onValueChanged?.(nextCode);
          onTextChanged?.(nextText);
        }}
        getOptionLabel={(option) => option.code}
        isOptionEqualToValue={(option, selected) => option.code === selected.code}
        disabled={isReadOnly}
        sx={{ flex: "0 0 35%", minWidth: 90 }}
        size="small"
        renderInput={(params) => <TextField {...params} aria-label="Code" />}
      />
      <TextField
        value={text}
        onChange={(event) => {
          setText(event.target.value);
          onTextChanged?.(event.target.value);
        }}
        disabled={isReadOnly}
        slotProps={{ input: { readOnly: !isEditable } }}
        size="small"
        fullWidth
        aria-label="Description"
      />
    </div>
  );
}
