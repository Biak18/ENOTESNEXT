import { TextField } from "@mui/material";
import EnCodeBox from "./EnCodeBox";
import type { EnCodeBoxProps } from "./EnCodeBox";
import useEnSyncedState from "./useEnSyncedState";

export interface EnCodeNTextBoxProps extends EnCodeBoxProps {
  defaultText?: string;
  onTextChanged?: (value: string) => void;
}

export default function EnCodeNTextBox({
  defaultText = "",
  onTextChanged,
  ...codeProps
}: EnCodeNTextBoxProps) {
  const [text, setText] = useEnSyncedState(defaultText, defaultText);

  return (
    <div className="flex min-w-0 gap-1">
      <div className="w-2/5 min-w-[100px]">
        <EnCodeBox {...codeProps} />
      </div>
      <TextField
        value={text}
        onChange={(event) => {
          setText(event.target.value);
          onTextChanged?.(event.target.value);
        }}
        disabled={codeProps.isReadOnly}
        slotProps={{ input: { readOnly: codeProps.isEditable === false } }}
        fullWidth
        size="small"
        aria-label="Description"
      />
    </div>
  );
}
