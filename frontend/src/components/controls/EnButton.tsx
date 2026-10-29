import Button from "@mui/material/Button";
import type { Ref } from "react";

export interface EnButtonProps {
  text: string;
  onClick: () => void;
  inputRef?: Ref<HTMLButtonElement>;
  disabled?: boolean;
}

export default function EnButton({
  text,
  onClick,
  inputRef,
  disabled,
}: EnButtonProps) {
  return (
    <Button
      ref={inputRef}
      variant="outlined"
      size="small"
      onClick={onClick}
      disabled={disabled}
    >
      {text}
    </Button>
  );
}
