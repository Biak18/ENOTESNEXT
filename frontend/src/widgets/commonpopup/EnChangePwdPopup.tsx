import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import useEnSyncedState from "../../components/controls/useEnSyncedState";

export interface EnChangePwdPopupProps {
  open: boolean;
  onClose: () => void;
  onChangePassword: (currentPassword: string, newPassword: string) => void | Promise<void>;
}

export default function EnChangePwdPopup({
  open,
  onClose,
  onChangePassword,
}: EnChangePwdPopupProps) {
  const [currentPassword, setCurrentPassword] = useEnSyncedState("", open);
  const [newPassword, setNewPassword] = useEnSyncedState("", open);
  const [confirmation, setConfirmation] = useEnSyncedState("", open);
  const valid = Boolean(currentPassword && newPassword && newPassword === confirmation);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Change password</DialogTitle>
      <DialogContent className="flex flex-col gap-3">
        <TextField autoFocus type="password" label="Current password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} />
        <TextField type="password" label="New password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} />
        <TextField type="password" label="Confirm new password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} />
        <p className="text-xs text-gray-600">Mock form only; no password is verified or changed on a server.</p>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          disabled={!valid}
          variant="contained"
          onClick={() => void onChangePassword(currentPassword, newPassword)}
        >
          Change
        </Button>
      </DialogActions>
    </Dialog>
  );
}
