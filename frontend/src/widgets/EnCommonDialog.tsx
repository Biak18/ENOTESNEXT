import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import {
  CheckCircleOutlined,
  ErrorOutlined,
  HelpOutlined,
  InfoOutlined,
  WarningAmberOutlined,
} from "@mui/icons-material";
import { useId, useState } from "react";
import "./EnCommonDialog.css";

export type EnDialogType =
  | "success"
  | "warning"
  | "error"
  | "info"
  | "confirm"
  | "confirmCancel";

export interface EnCommonDialogProps {
  open: boolean;
  type: EnDialogType;
  message?: string;
  title?: string;
  onResolve: (value: boolean | undefined) => void;
}

const titles: Record<EnDialogType, string> = {
  success: "Success",
  warning: "Warning",
  error: "Error",
  info: "Information",
  confirm: "Confirm",
  confirmCancel: "Confirm",
};

const icons = {
  success: CheckCircleOutlined,
  warning: WarningAmberOutlined,
  error: ErrorOutlined,
  info: InfoOutlined,
  confirm: HelpOutlined,
  confirmCancel: HelpOutlined,
};

export function EnCommonDialog({
  open,
  type,
  message = "",
  title,
  onResolve,
}: EnCommonDialogProps) {
  const [resolved, setResolved] = useState(false);
  const titleId = useId();
  const messageId = useId();
  const isConfirmation = type === "confirm" || type === "confirmCancel";
  const StatusIcon = icons[type];
  const resolve = (value: boolean | undefined) => {
    if (resolved) return;
    setResolved(true);
    onResolve(value);
  };

  return (
    <Dialog
      open={open}
      className={`en-common-dialog en-common-dialog--${type}`}
      aria-labelledby={titleId}
      aria-describedby={messageId}
      onClose={() => resolve(false)}
      slotProps={{
        paper: {
          className: "en-common-dialog__paper",
        },
      }}
    >
      <DialogTitle className="en-common-dialog__title" id={titleId}>
        <StatusIcon
          className="en-common-dialog__icon"
          aria-hidden="true"
          focusable="false"
        />
        <span>{title ?? titles[type]}</span>
      </DialogTitle>
      <DialogContent className="en-common-dialog__content">
        <div
          className="en-common-dialog__message"
          id={messageId}
          role={type === "error" || type === "warning" ? "alert" : "status"}
        >
          {message}
        </div>
      </DialogContent>
      <DialogActions className="en-common-dialog__actions">
        {isConfirmation ? (
          <>
            <Button
              className="en-common-dialog__action"
              type="button"
              onClick={() => resolve(true)}
              variant="contained"
              disabled={resolved}
            >
              Yes
            </Button>
            <Button
              className="en-common-dialog__action en-common-dialog__action--quiet"
              type="button"
              onClick={() => resolve(false)}
              disabled={resolved}
            >
              No
            </Button>
            {type === "confirmCancel" && (
              <Button
                className="en-common-dialog__action en-common-dialog__action--quiet"
                type="button"
                onClick={() => resolve(undefined)}
                disabled={resolved}
              >
                Cancel
              </Button>
            )}
          </>
        ) : (
          <Button
            className="en-common-dialog__action"
            type="button"
            autoFocus
            onClick={() => resolve(undefined)}
            variant="contained"
            disabled={resolved}
          >
            OK
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
