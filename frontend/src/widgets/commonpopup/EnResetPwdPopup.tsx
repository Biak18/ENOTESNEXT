import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import useEnSyncedState from "../../components/controls/useEnSyncedState";

export interface EnResetPwdPopupProps {
  open: boolean;
  onClose: () => void;
  onReset: (newPassword: string) => void | Promise<void>;
}

export default function EnResetPwdPopup({ open, onClose, onReset }: EnResetPwdPopupProps) {
  const [password, setPassword] = useEnSyncedState("", open);
  const [confirmation, setConfirmation] = useEnSyncedState("", open);
  const matches = password.length > 0 && password === confirmation;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Set a new password</DialogTitle>
      <DialogContent className="flex flex-col gap-3">
        <TextField autoFocus type="password" label="New password" value={password} onChange={(event) => setPassword(event.target.value)} />
        <TextField type="password" label="Confirm password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} />
        <p className="text-xs text-gray-600">Mock form only; no password is sent or saved.</p>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button disabled={!matches} variant="contained" onClick={() => void onReset(password)}>
          Reset
        </Button>
      </DialogActions>
    </Dialog>
  );
}
