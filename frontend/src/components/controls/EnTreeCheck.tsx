import Checkbox from "@mui/material/Checkbox";

/** A small MUI checkbox used inside permission-tree cells (matrix columns). */
export default function EnTreeCheck({
  checked,
  indeterminate,
  onChange,
  ariaLabel,
}: {
  checked: boolean;
  indeterminate?: boolean;
  onChange: (checked: boolean) => void;
  ariaLabel?: string;
}) {
  return (
    <Checkbox
      checked={checked}
      indeterminate={indeterminate}
      onChange={(e) => onChange(e.target.checked)}
      onClick={(e) => e.stopPropagation()}
      size="small"
      slotProps={{ input: { "aria-label": ariaLabel } }}
      sx={{ padding: "1px" }}
    />
  );
}
