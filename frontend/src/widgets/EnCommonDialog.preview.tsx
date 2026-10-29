import {
  CheckCircleOutlined,
  ErrorOutlined,
  InfoOutlined,
} from "@mui/icons-material";
import { Button, CircularProgress } from "@mui/material";
import "./EnCommonDialog.css";

const previewStates = [
  {
    label: "Default",
    message: "Information message",
    icon: InfoOutlined,
    buttonClass: "",
  },
  {
    label: "Hover",
    message: "Information message",
    icon: InfoOutlined,
    buttonClass: "is-hover",
  },
  {
    label: "Focus",
    message: "Information message",
    icon: InfoOutlined,
    buttonClass: "is-focus",
  },
  {
    label: "Active",
    message: "Information message",
    icon: InfoOutlined,
    buttonClass: "is-active",
  },
  {
    label: "Disabled",
    message: "Information message",
    icon: InfoOutlined,
    buttonClass: "is-disabled",
    disabled: true,
  },
  {
    label: "Loading",
    message: "Working…",
    icon: InfoOutlined,
    buttonClass: "is-loading",
    disabled: true,
    loading: true,
  },
  {
    label: "Error",
    message: "Example error message.",
    icon: ErrorOutlined,
    buttonClass: "",
    status: "error",
    role: "alert",
  },
  {
    label: "Success",
    message: "Example success message.",
    icon: CheckCircleOutlined,
    buttonClass: "",
    status: "success",
    role: "status",
  },
] as const;

export function EnCommonDialogPreview() {
  return (
    <section
      className="en-common-dialog-preview"
      aria-labelledby="dialog-preview-title"
    >
      <h2 id="dialog-preview-title">Dialog states</h2>
      <p>
        Visual reference only. Loading and message outcomes are shown as
        examples; the dialog does not run asynchronous actions.
      </p>
      {previewStates.map((state) => {
        const StatusIcon = state.icon;
        const status = "status" in state ? state.status : "info";
        const role = "role" in state ? state.role : "status";
        const loading = "loading" in state && state.loading;
        const disabled = "disabled" in state && state.disabled;

        return (
          <div
            className="en-common-dialog-preview__row"
            key={state.label}
            data-status={status}
          >
            <p className="en-common-dialog-preview__label">{state.label}</p>
            <div className="en-common-dialog-preview__message" role={role}>
              <StatusIcon
                className="en-common-dialog__icon"
                aria-hidden="true"
                focusable="false"
              />
              <span>{state.message}</span>
            </div>
            <Button
              className={`en-common-dialog__action en-common-dialog-preview__action ${state.buttonClass}`}
              type="button"
              variant="contained"
              disabled={disabled}
              aria-busy={loading || undefined}
              startIcon={
                loading ? (
                  <CircularProgress size={14} color="inherit" />
                ) : undefined
              }
            >
              {loading ? "Working…" : "OK"}
            </Button>
          </div>
        );
      })}
    </section>
  );
}
