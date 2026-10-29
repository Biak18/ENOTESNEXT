import { IconButton, InputAdornment, TextField } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import type { ChangeEvent, MutableRefObject, ReactNode, Ref } from "react";

interface SearchBoxProps {
  label?: string;
  value?: string;
  defaultValue?: string;
  onValueChanged?: (value: string) => void;
  inputRef?: Ref<HTMLInputElement>;
  placeholder?: string;
  color?: string;
  disabled?: boolean;
  className?: string;
  /** Show a leading search icon. Opt-in so existing usages don't change. */
  showSearchIcon?: boolean;
  /** Show a clear (x) button while there is text. Opt-in for the same reason. */
  clearable?: boolean;
  /** Rendered at the end while the box is empty (e.g. a "Ctrl K" hint). */
  hint?: ReactNode;
  /** Color of the search / clear icons. Defaults to `color`. */
  iconColor?: string;
  placeholderColor?: string;
  /**
   * true  = outlined field with its own border (previous behaviour).
   * false = no border or background, for embedding in a container that
   *         draws its own surface (e.g. the sidebar search shell).
   */
  bordered?: boolean;
}

const SearchBox = memo(
  ({
    label,
    value,
    defaultValue = "",
    onValueChanged,
    inputRef,
    placeholder = "Search",
    color = "#111827",
    disabled = false,
    className = "",
    showSearchIcon = false,
    clearable = false,
    hint,
    iconColor,
    placeholderColor,
    bordered = true,
  }: SearchBoxProps) => {
    const [internalValue, setInternalValue] = useState(defaultValue);
    const effectiveValue = value !== undefined ? value : internalValue;
    const localRef = useRef<HTMLInputElement | null>(null);
    const icon = iconColor ?? color;

    useEffect(() => {
      if (onValueChanged) onValueChanged(effectiveValue);
    }, [effectiveValue, onValueChanged]);

    // Keep our own ref (to refocus after clear) while still honouring the caller's.
    const setRefs = useCallback(
      (node: HTMLInputElement | null) => {
        localRef.current = node;
        if (typeof inputRef === "function") inputRef(node);
        else if (inputRef)
          (inputRef as MutableRefObject<HTMLInputElement | null>).current =
            node;
      },
      [inputRef],
    );

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      const next = event.target.value;
      if (value === undefined) setInternalValue(next);
      if (onValueChanged) onValueChanged(next);
    };

    const handleClear = () => {
      if (value === undefined) setInternalValue("");
      if (onValueChanged) onValueChanged("");
      localRef.current?.focus();
    };

    const hasText = effectiveValue.length > 0;

    return (
      <div className={`py-0 sm:py-2 ${className}`.trim()}>
        {label && (
          <label className="mb-1 block text-xs font-semibold text-[#6b7280] leading-none">
            {label}
          </label>
        )}
        <TextField
          inputRef={setRefs}
          value={effectiveValue}
          placeholder={placeholder}
          disabled={disabled}
          slotProps={{
            input: {
              autoComplete: "off",
              style: {
                height: 30,
                fontSize: 13,
                color,
              },
              startAdornment: showSearchIcon ? (
                <InputAdornment position="start" sx={{ mr: 0.5, color: icon }}>
                  <SearchIcon sx={{ fontSize: 18 }} aria-hidden="true" />
                </InputAdornment>
              ) : undefined,
              endAdornment:
                clearable && hasText ? (
                  <InputAdornment position="end" sx={{ ml: 0 }}>
                    <IconButton
                      size="small"
                      edge="end"
                      aria-label="Clear search"
                      onClick={handleClear}
                      disabled={disabled}
                      sx={{
                        color: icon,
                        padding: "3px",
                        "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
                      }}
                    >
                      <CloseIcon sx={{ fontSize: 16 }} aria-hidden="true" />
                    </IconButton>
                  </InputAdornment>
                ) : hint && !hasText ? (
                  <InputAdornment position="end" sx={{ ml: 0 }}>
                    {hint}
                  </InputAdornment>
                ) : undefined,
            },
          }}
          onChange={handleChange}
          variant="outlined"
          size="small"
          fullWidth
          sx={{
            backgroundColor: "transparent",
            color,
            "& .MuiOutlinedInput-root": bordered
              ? {
                  "& fieldset": { borderWidth: "1px" },
                  "&:hover fieldset": { borderWidth: 0 },
                  "&.Mui-focused fieldset": { borderWidth: 0 },
                }
              : {
                  paddingLeft: 0,
                  paddingRight: 0,
                  // MUI sets the outline via `.Mui-focused .MuiOutlinedInput-notchedOutline`
                  // (higher specificity than a bare `fieldset`), so target it in every state.
                  "& .MuiOutlinedInput-notchedOutline, &:hover .MuiOutlinedInput-notchedOutline, &.Mui-focused .MuiOutlinedInput-notchedOutline, &.Mui-disabled .MuiOutlinedInput-notchedOutline":
                    { border: "none" },
                },
            "& .MuiInputBase-root": {
              paddingRight: 0,
              "&.Mui-disabled": {
                backgroundColor: "#f5f5f5",
              },
            },
            "& .MuiInputBase-input": {
              color,
              ...(bordered ? {} : { paddingLeft: "4px", paddingRight: "4px" }),
              ...(placeholderColor
                ? {
                    "&::placeholder": { color: placeholderColor, opacity: 1 },
                  }
                : {}),
            },
          }}
        />
      </div>
    );
  },
);

export default SearchBox;
