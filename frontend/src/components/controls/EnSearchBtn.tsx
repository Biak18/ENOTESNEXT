import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import type { Ref } from "react";
import { useState } from "react";

export interface EnSearchBtnProps {
  text: string;
  onClick: () => void | Promise<void>;
  inputRef?: Ref<HTMLButtonElement>;
  spinner?: boolean;
  disabled?: boolean;
}

export default function EnSearchBtn({
  text,
  onClick,
  inputRef,
  spinner = false,
  disabled = false,
}: EnSearchBtnProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleClick = async () => {
    if (loading || disabled) return;
    setLoading(true);
    try {
      await onClick();
      setError("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Search failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <span className="inline-flex items-center gap-2">
      <Button
        ref={inputRef}
        variant="outlined"
        size="small"
        disabled={disabled || loading}
        onClick={handleClick}
        startIcon={spinner && loading ? <CircularProgress size={14} /> : undefined}
      >
        {text}
      </Button>
      {error && (
        <Alert severity="error" onClose={() => setError("")}>
          {error}
        </Alert>
      )}
    </span>
  );
}
