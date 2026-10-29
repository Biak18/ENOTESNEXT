import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import type { ReactNode } from "react";

export interface EnCommonModalProps {
  open: boolean;
  title: string;
  children?: ReactNode;
  width?: number | string;
  height?: number | string;
  confirmLabel?: string;
  cancelLabel?: string;
  showConfirm?: boolean;
  onConfirm?: () => void | Promise<void>;
  onClose: () => void;
}

export default function EnCommonModal({
  open,
  title,
  children,
  width = "min(720px, calc(100vw - 32px))",
  height,
  confirmLabel = "OK",
  cancelLabel = "Cancel",
  showConfirm = true,
  onConfirm,
  onClose,
}: EnCommonModalProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      fullWidth
      slotProps={{
        paper: {
          sx: {
            width,
            height,
            maxWidth: "calc(100vw - 32px)",
            maxHeight: "calc(100vh - 32px)",
            display: "flex",
            flexDirection: "column",
          },
        },
      }}
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers sx={{ minHeight: 0 }}>{children}</DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{cancelLabel}</Button>
        {showConfirm && (
          <Button onClick={() => void onConfirm?.()} variant="contained">
            {confirmLabel}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
