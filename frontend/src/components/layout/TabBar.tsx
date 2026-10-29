import AddIcon from "@mui/icons-material/Add";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import SearchIcon from "@mui/icons-material/Search";
import type { ReactNode } from "react";
import type { Action, Tab } from "../../types";

const actions: Action[] = ["search", "insert", "delete", "save", "print", "excel"];
const labels: Record<Action, string> = {
  search: "Search",
  insert: "Insert",
  delete: "Delete",
  save: "Save",
  print: "Print",
  excel: "Excel",
};
const icons: Record<Action, ReactNode> = {
  search: <SearchIcon fontSize="small" />,
  insert: <AddIcon fontSize="small" />,
  delete: <DeleteOutlinedIcon fontSize="small" />,
  save: <SaveOutlinedIcon fontSize="small" />,
  print: <PrintOutlinedIcon fontSize="small" />,
  excel: <FileDownloadOutlinedIcon fontSize="small" />,
};

export function TabBar({
  tabs,
  activeTabId,
  supportedActions,
  onAction,
  onSelect,
  onClose,
}: {
  tabs: Tab[];
  activeTabId: string;
  supportedActions: Action[];
  onAction: (action: Action) => void;
  onSelect: (id: string) => void;
  onClose: (id: string) => void;
}) {
  return (
    <div className="tab-strip">
      <div className="tab-strip-tabs" role="tablist" aria-label="Open screens">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`tab ${activeTabId === tab.id ? "is-active" : ""}`}
            role="presentation"
          >
            <button
              className="tab-title"
              role="tab"
              aria-selected={activeTabId === tab.id}
              onClick={() => onSelect(tab.id)}
            >
              {tab.title}
            </button>
            <button
              className="tab-close"
              aria-label={`Close ${tab.title}`}
              onClick={() => onClose(tab.id)}
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <div className="tab-action-toolbar" role="toolbar" aria-label="Active screen actions">
        {actions
          .filter((action) => supportedActions.includes(action))
          .map((action) => (
            <button
              key={action}
              type="button"
              className="tab-action-button"
              title={labels[action]}
              aria-label={labels[action]}
              onClick={() => onAction(action)}
            >
              {icons[action]}
            </button>
          ))}
      </div>
    </div>
  );
}
