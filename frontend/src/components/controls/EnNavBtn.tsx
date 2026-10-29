import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import Button from "@mui/material/Button";
import type { Ref } from "react";

export interface EnNavBtnProps {
  text: string;
  onClick: () => void;
  inputRef?: Ref<HTMLButtonElement>;
  disabled?: boolean;
}

export default function EnNavBtn({
  text,
  onClick,
  inputRef,
  disabled,
}: EnNavBtnProps) {
  return (
    <Button
      ref={inputRef}
      variant="outlined"
      size="small"
      startIcon={<ArrowDropDownIcon />}
      onClick={onClick}
      disabled={disabled}
    >
      {text}
    </Button>
  );
}
