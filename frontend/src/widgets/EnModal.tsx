import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import type { ReactNode } from "react";

export interface EnModalProps {
  open: boolean;
  title?: string;
  body: ReactNode;
  width?: number | string;
  onOk?: () => void | Promise<void>;
  onCancel: () => void;
}

export default function EnModal({
  open,
  title,
  body,
  width = 600,
  onOk,
  onCancel,
}: EnModalProps) {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth={false} slotProps={{ paper: { sx: { width, maxWidth: "calc(100vw - 32px)" } } }}>
      {title && <DialogTitle>{title}</DialogTitle>}
      <DialogContent dividers>{body}</DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        {onOk && <Button variant="contained" onClick={() => void onOk()}>OK</Button>}
      </DialogActions>
    </Dialog>
  );
}
