import { Backdrop, CircularProgress, IconButton, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

export interface EnCommonSpinnerProps {
  isLoading: boolean;
  label?: string;
  onCancel?: () => void;
}

export default function EnCommonSpinner({
  isLoading,
  label = "Loading",
  onCancel,
}: EnCommonSpinnerProps) {
  return (
    <Backdrop
      open={isLoading}
      aria-label={label}
      sx={{ zIndex: (theme) => theme.zIndex.modal + 1, flexDirection: "column", gap: 2 }}
    >
      {onCancel && (
        <IconButton
          aria-label="Cancel loading"
          onClick={onCancel}
          sx={{ position: "absolute", right: 16, top: 16, color: "white" }}
        >
          <CloseIcon />
        </IconButton>
      )}
      <CircularProgress color="inherit" />
      <Typography color="white" role="status">{label}</Typography>
    </Backdrop>
  );
}
