import type { ReactNode } from "react";
import Paper from "@mui/material/Paper";

type SearchPanelProps = {
  children: ReactNode;
  actions?: ReactNode;
  ariaLabel?: string;
};

export function SearchPanel({
  children,
  actions,
  ariaLabel = "Search conditions",
}: SearchPanelProps) {
  return (
    <Paper
      component="section"
      elevation={0}
      className="enotes-search-panel [&_.Mui-focused_.MuiOutlinedInput-notchedOutline]:border-[var(--primary)]! [&_.MuiAutocomplete-inputRoot]:pt-0! [&_.MuiAutocomplete-inputRoot]:pb-0!"
      aria-label={ariaLabel}
    >
      <div className="enotes-search-fields">{children}</div>
      {actions && (
        <div
          className="enotes-search-actions"
          role="group"
          aria-label="Search actions"
        >
          {actions}
        </div>
      )}
    </Paper>
  );
}
