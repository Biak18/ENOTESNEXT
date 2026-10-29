import { TextField } from "@mui/material";

export interface EnEditorProps {
  body: string;
  setBody: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  minRows?: number;
}

export default function EnEditor({
  body,
  setBody,
  placeholder = "Enter text",
  disabled = false,
  minRows = 8,
}: EnEditorProps) {
  return (
    <TextField
      value={body}
      onChange={(event) => setBody(event.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      multiline
      minRows={minRows}
      fullWidth
      aria-label="Plain text editor (rich-text formatting is not available)"
      helperText="Plain text only; rich-text formatting and image insertion are not available."
      sx={{ "& .MuiInputBase-root": { alignItems: "flex-start" } }}
    />
  );
}
