import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";

export interface EnMenuInfo {
  id?: string;
  name?: string;
  [key: string]: unknown;
}

export interface EnMenuInfoPopupProps {
  open: boolean;
  info?: EnMenuInfo | null;
  onClose: () => void;
}

export default function EnMenuInfoPopup({ open, info, onClose }: EnMenuInfoPopupProps) {
  return (
    <Dialog open={open && Boolean(info)} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Menu information</DialogTitle>
      <DialogContent dividers>
        <dl className="grid grid-cols-[max-content_1fr] gap-x-3 gap-y-2 text-sm">
          {Object.entries(info ?? {}).map(([key, value]) => (
            <div key={key} className="contents">
              <dt className="font-semibold">{key}</dt>
              <dd className="m-0 break-words">{String(value ?? "")}</dd>
            </div>
          ))}
        </dl>
      </DialogContent>
      <DialogActions><Button onClick={onClose}>Close</Button></DialogActions>
    </Dialog>
  );
}
