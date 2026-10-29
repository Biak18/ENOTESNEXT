import AttachFileIcon from "@mui/icons-material/AttachFile";
import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";
import { Alert, IconButton, Link, Tooltip } from "@mui/material";
import { useId, useRef, useState } from "react";

export type EnAttachedFile = File & {
  id?: string;
  displayName?: string;
};

export interface EnFileUploadProps {
  id?: string;
  files: EnAttachedFile[];
  onFilesChanged: (files: EnAttachedFile[]) => void;
  onDownload?: (file: EnAttachedFile) => void | Promise<void>;
  onDelete?: (file: EnAttachedFile) => void | Promise<void>;
  attachFlag?: boolean;
  readOnly?: boolean;
  multiple?: boolean;
}

export default function EnFileUpload({
  id,
  files,
  onFilesChanged,
  onDownload,
  onDelete,
  attachFlag = true,
  readOnly = false,
  multiple = true,
}: EnFileUploadProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");

  const removeFile = async (file: EnAttachedFile) => {
    try {
      await onDelete?.(file);
      onFilesChanged(files.filter((item) => item !== file));
      setError("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not remove file.");
    }
  };

  const downloadFile = async (file: EnAttachedFile) => {
    try {
      await onDownload?.(file);
      setError("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not download file.");
    }
  };

  return (
    <div className="flex min-h-9 min-w-0 flex-wrap items-start gap-2">
      {attachFlag && !readOnly && (
        <>
          <input
            id={inputId}
            ref={inputRef}
            type="file"
            multiple={multiple}
            className="sr-only"
            onChange={(event) => {
              const selected = Array.from(event.target.files ?? []);
              onFilesChanged([...files, ...selected]);
              event.target.value = "";
            }}
          />
          <label
            htmlFor={inputId}
            className="inline-flex h-8 shrink-0 cursor-pointer items-center gap-1 rounded border border-slate-300 bg-white px-2 text-sm hover:bg-slate-50 focus-within:outline-2 focus-within:outline-sky-600"
          >
            <AttachFileIcon fontSize="small" />
            Attach
          </label>
        </>
      )}
      <ul className="flex min-w-0 flex-wrap gap-1 p-1">
        {files.map((file, index) => {
          const fileLabel = file.displayName ?? file.name;
          const key = file.id ?? `${file.name}-${file.lastModified}-${index}`;
          return (
            <li
              key={key}
              className="flex max-w-full items-center gap-1 rounded border border-slate-300 bg-white px-1.5 text-sm"
            >
              {onDownload ? (
                <Link
                  component="button"
                  type="button"
                  underline="hover"
                  onClick={() => void downloadFile(file)}
                  className="max-w-48 truncate"
                >
                  {fileLabel}
                </Link>
              ) : (
                <span className="max-w-48 truncate" title={fileLabel}>
                  {fileLabel}
                </span>
              )}
              {onDownload && (
                <Tooltip title="Download">
                  <IconButton
                    size="small"
                    aria-label={`Download ${fileLabel}`}
                    onClick={() => void downloadFile(file)}
                  >
                    <DownloadIcon fontSize="inherit" />
                  </IconButton>
                </Tooltip>
              )}
              {!readOnly && (
                <IconButton
                  size="small"
                  aria-label={`Remove ${fileLabel}`}
                  onClick={() => void removeFile(file)}
                >
                  <CloseIcon fontSize="inherit" />
                </IconButton>
              )}
            </li>
          );
        })}
      </ul>
      {error && (
        <Alert
          severity="error"
          onClose={() => setError("")}
          className="basis-full"
        >
          {error}
        </Alert>
      )}
    </div>
  );
}
