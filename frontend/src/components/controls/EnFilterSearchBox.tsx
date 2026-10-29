import SearchIcon from "@mui/icons-material/Search";
import { IconButton, InputAdornment, TextField } from "@mui/material";
import {
  forwardRef,
  useImperativeHandle,
  useState,
} from "react";

export interface EnFilterSearchBoxHandle {
  openFilterBox: () => void;
  closeFilterBox: () => void;
}

export interface EnFilterSearchBoxProps {
  onFind: (query: string) => void;
  placeholder?: string;
  defaultValue?: string;
}

const EnFilterSearchBox = forwardRef<
  EnFilterSearchBoxHandle,
  EnFilterSearchBoxProps
>(function EnFilterSearchBox(
  { onFind, placeholder = "Search", defaultValue = "" },
  ref,
) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(defaultValue);

  useImperativeHandle(ref, () => ({
    openFilterBox: () => setOpen(true),
    closeFilterBox: () => setOpen(false),
  }));

  if (!open) {
    return (
      <IconButton
        aria-label="Open filter search"
        onClick={() => setOpen(true)}
        size="small"
      >
        <SearchIcon fontSize="small" />
      </IconButton>
    );
  }

  return (
    <TextField
      autoFocus
      value={query}
      placeholder={placeholder}
      onChange={(event) => setQuery(event.target.value)}
      onKeyDown={(event) => {
        if (event.key === "Enter") onFind(query);
        if (event.key === "Escape") setOpen(false);
      }}
      size="small"
      aria-label={placeholder}
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="Apply filter search"
                size="small"
                onClick={() => onFind(query)}
              >
                <SearchIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  );
});

export default EnFilterSearchBox;
