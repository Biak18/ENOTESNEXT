import DownloadIcon from "@mui/icons-material/Download";
import { Alert, IconButton, Tooltip } from "@mui/material";
import { useState } from "react";

export interface EnFileHelperProps {
  fileName: string;
  onDownload: () => void | Promise<void>;
  disabled?: boolean;
}

export default function EnFileHelper({
  fileName,
  onDownload,
  disabled = false,
}: EnFileHelperProps) {
  return (
    <EnFileDownloadButton
      fileName={fileName}
      onDownload={onDownload}
      disabled={disabled}
    />
  );
}

function EnFileDownloadButton({
  fileName,
  onDownload,
  disabled,
}: EnFileHelperProps) {
  const [error, setError] = useState("");
  const handleDownload = async () => {
    try {
      await onDownload();
      setError("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not download file.");
    }
  };

  return (
    <span className="inline-flex items-center gap-1">
      <Tooltip title={`Download ${fileName}`}>
        <span>
          <IconButton
            aria-label={`Download ${fileName}`}
            onClick={() => void handleDownload()}
            disabled={disabled}
            size="small"
          >
            <DownloadIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
      {error && <Alert severity="error">{error}</Alert>}
    </span>
  );
}
