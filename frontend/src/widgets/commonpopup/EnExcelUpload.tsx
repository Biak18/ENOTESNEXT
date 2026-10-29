import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Alert } from "@mui/material";
import { useState } from "react";
import type { ChangeEvent } from "react";

export interface EnExcelUploadProps {
  open: boolean;
  onClose: () => void;
  onFileSelected?: (file: File) => void | Promise<void>;
  acceptedTypes?: string;
}

export default function EnExcelUpload({
  open,
  onClose,
  onFileSelected,
  acceptedTypes = ".xlsx,.xls",
}: EnExcelUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const chooseFile = (event: ChangeEvent<HTMLInputElement>) => {
    setError("");
    setFile(event.target.files?.[0] ?? null);
  };
  const handleSelect = async () => {
    if (!file) {
      setError("Choose a spreadsheet file first.");
      return;
    }
    try {
      await onFileSelected?.(file);
      onClose();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The file callback failed.");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Select spreadsheet</DialogTitle>
      <DialogContent className="flex flex-col gap-3">
        <Alert severity="info">
          The file is selected locally. Importing, validating, or saving it requires an application callback.
        </Alert>
        <input aria-label="Spreadsheet file" type="file" accept={acceptedTypes} onChange={chooseFile} />
        {file && <span>{file.name} ({file.size.toLocaleString()} bytes)</span>}
        {error && <Alert severity="error">{error}</Alert>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={() => void handleSelect()}>Use file</Button>
      </DialogActions>
    </Dialog>
  );
}
