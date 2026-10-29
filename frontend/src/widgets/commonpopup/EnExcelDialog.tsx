import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, Radio, RadioGroup } from "@mui/material";
import { useState } from "react";

export type EnExcelAction = "download" | "upload";

export interface EnExcelDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (action: EnExcelAction) => void;
}

export default function EnExcelDialog({ open, onClose, onConfirm }: EnExcelDialogProps) {
  const [action, setAction] = useState<EnExcelAction>("download");
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Spreadsheet action</DialogTitle>
      <DialogContent>
        <RadioGroup value={action} onChange={(event) => setAction(event.target.value as EnExcelAction)}>
          <FormControlLabel value="download" control={<Radio />} label="Download template" />
          <FormControlLabel value="upload" control={<Radio />} label="Select a file to upload" />
        </RadioGroup>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={() => onConfirm(action)}>Continue</Button>
      </DialogActions>
    </Dialog>
  );
}
