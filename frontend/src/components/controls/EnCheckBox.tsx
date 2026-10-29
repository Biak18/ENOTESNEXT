import { Checkbox, FormControlLabel } from "@mui/material";
import { useId } from "react";
import type { Ref } from "react";
import useEnSyncedState from "./useEnSyncedState";

export interface EnCheckBoxProps {
  defaultValue?: string;
  label?: string;
  onValueChanged?: (value: "Y" | "N") => void;
  isReadOnly?: boolean;
  inputRef?: Ref<HTMLInputElement>;
  isSearchPanel?: boolean;
  onFocus?: (target: "current" | "next") => void;
}

export default function EnCheckBox({
  defaultValue = "N",
  label,
  onValueChanged,
  isReadOnly = false,
  inputRef,
  isSearchPanel = false,
  onFocus,
}: EnCheckBoxProps) {
  const [checked, setChecked] = useEnSyncedState(defaultValue === "Y", defaultValue);
  const id = useId();

  return (
    <FormControlLabel
      htmlFor={id}
      label={label}
      control={
        <Checkbox
          id={id}
          checked={checked}
          disabled={isReadOnly}
          onChange={(event) => {
            const next = event.target.checked;
            setChecked(next);
            onValueChanged?.(next ? "Y" : "N");
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              onFocus?.(isSearchPanel ? "current" : "next");
            }
          }}
          slotProps={{ input: { ref: inputRef } }}
        />
      }
      sx={{ "& .MuiTypography-root": { fontSize: 13 } }}
    />
  );
}
