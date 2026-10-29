import ClearIcon from "@mui/icons-material/Close";
import { IconButton, InputAdornment, TextField } from "@mui/material";
import type { KeyboardEvent, Ref } from "react";
import type { EnValueControlProps } from "./EnControlTypes";
import { controlHeight } from "./EnControlTypes";
import useEnSyncedState from "./useEnSyncedState";

export interface EnTextBoxProps extends EnValueControlProps {
  format?: string;
  popupRef?: Ref<HTMLElement>;
  placeHolderText?: string;
}

function formatText(value: string, format?: string) {
  if (!format) return value;
  const digits = value.replace(/\D/g, "");
  let digitIndex = 0;
  let result = "";
  for (const char of format) {
    if (char !== "#") result += char;
    else if (digitIndex < digits.length) result += digits[digitIndex++];
  }
  return result;
}

export default function EnTextBox({
  defaultValue = "",
  onValueChanged,
  format,
  isReadOnly = false,
  isEditable = true,
  isRequired = false,
  inputRef,
  isSearchPanel = false,
  onFocus,
  placeHolderText,
}: EnTextBoxProps) {
  const [value, setValue] = useEnSyncedState(
    formatText(defaultValue, format),
    `${defaultValue}:${format ?? ""}`,
  );

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      onFocus?.(isSearchPanel ? "current" : "next");
    }
  };

  return (
    <TextField
      inputRef={inputRef}
      value={value}
      placeholder={placeHolderText}
      onChange={(event) => {
        const next = formatText(event.target.value, format);
        setValue(next);
        onValueChanged?.(next);
      }}
      onKeyDown={handleKeyDown}
      disabled={isReadOnly}
      required={isRequired}
      fullWidth
      size="small"
      variant="outlined"
      slotProps={{
        input: {
          readOnly: !isEditable,
          autoComplete: "off",
          endAdornment: value ? (
            <InputAdornment position="end">
              <IconButton
                size="small"
                aria-label="Clear text"
                onClick={() => {
                  setValue("");
                  onValueChanged?.("");
                }}
                disabled={isReadOnly || !isEditable}
              >
                <ClearIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ) : undefined,
        },
      }}
      sx={{
        backgroundColor: isEditable ? "white" : "#f5f5f5",
        "& .MuiInputBase-root": { minHeight: controlHeight },
      }}
    />
  );
}
