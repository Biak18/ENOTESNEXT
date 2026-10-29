import { Autocomplete, TextField } from "@mui/material";
import type { AutocompleteProps } from "@mui/material";
import { keyframes } from "@mui/material/styles";
import { useCallback, useId, useState } from "react";
import type { KeyboardEvent, Ref } from "react";

// Entrance animation for the dropdown. Popper unmounts on close, so this plays on every open.
const enterBelow = keyframes`
  from { opacity: 0; transform: translateY(-6px) scale(0.98); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
`;
const enterAbove = keyframes`
  from { opacity: 0; transform: translateY(6px) scale(0.98); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
`;

export interface ComboBoxProps<T> {
  /** Lookup data. Loading and feature-specific filtering stay in the owning screen. */
  options: readonly T[];
  /** Controlled value. When omitted the control manages its own selection. */
  value?: T | null;
  /** Initial selection for uncontrolled use. Not re-applied after mount. */
  defaultValue?: T | null;
  onValueChanged?: (value: T | null) => void;
  /** Fires as the user types, so the owner can run an async lookup. */
  onInputChanged?: (text: string) => void;
  /**
   * Key handler for the control. Runs before the built-in key handling, so calling
   * `event.preventDefault()` here is how a host (e.g. a grid cell editor) reacts to Escape.
   */
  onInputKeyDown?: (event: KeyboardEvent<HTMLElement>) => void;
  /** Defaults to the string itself, or an object's `label` field. */
  getOptionLabel?: (option: T) => string;
  isOptionEqualToValue?: (option: T, value: T) => boolean;
  getOptionDisabled?: (option: T) => boolean;
  /** Override filtering, e.g. to match on a code as well as a name. */
  filterOptions?: AutocompleteProps<T, false, false, false>["filterOptions"];
  /** DOM id of the input, so an external `<label htmlFor>` can point at it. Auto-generated if omitted. */
  id?: string;
  label?: string;
  /** Accessible name when there is no visible `label` (e.g. a toolbar control). */
  ariaLabel?: string;
  placeholder?: string;
  inputRef?: Ref<HTMLInputElement>;
  /** Focus the input on mount. Because the list opens on focus, this also opens it. */
  autoFocus?: boolean;
  className?: string;
  color?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  error?: boolean;
  loading?: boolean;
  /** Show the clear (x) button while a value is selected. Default true. */
  clearable?: boolean;
  noOptionsText?: string;
  loadingText?: string;
}

function defaultGetOptionLabel(option: unknown): string {
  if (typeof option === "string") return option;
  if (option && typeof option === "object" && "label" in option) {
    return String((option as { label: unknown }).label ?? "");
  }
  return String(option ?? "");
}

/**
 * Single-select lookup built on MUI Autocomplete. Layout is Tailwind; MUI internals are
 * styled through `sx` to match SearchBox (30px height, 13px text, 1px outline).
 */
export default function ComboBox<T>({
  options,
  value,
  defaultValue = null,
  onValueChanged,
  onInputChanged,
  onInputKeyDown,
  getOptionLabel = defaultGetOptionLabel,
  isOptionEqualToValue,
  getOptionDisabled,
  filterOptions,
  id,
  label,
  ariaLabel,
  placeholder = "Select",
  inputRef,
  autoFocus = false,
  className = "",
  color = "#111827",
  disabled = false,
  readOnly = false,
  required = false,
  error = false,
  loading = false,
  clearable = true,
  noOptionsText = "No results",
  loadingText = "Loading...",
}: ComboBoxProps<T>) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [internalValue, setInternalValue] = useState<T | null>(defaultValue);
  const effectiveValue = value !== undefined ? value : internalValue;

  // Forward the rendered input to the caller's ref. Writing `.current` is how
  // object refs receive their node; this does not reassign the prop itself.
  const setRefs = useCallback(
    (node: HTMLInputElement | null) => {
      if (typeof inputRef === "function") {
        inputRef(node);
      } else if (inputRef) {
        // eslint-disable-next-line react-hooks/immutability
        (inputRef as { current: HTMLInputElement | null }).current = node;
      }
    },
    [inputRef],
  );

  return (
    <div className={`py-0 sm:py-2 ${className}`.trim()}>
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1 block text-xs font-semibold leading-none text-[#6b7280]"
        >
          {label}
          {required && <span aria-hidden="true"> *</span>}
        </label>
      )}
      <Autocomplete<T, false, false, false>
        id={inputId}
        options={options as T[]}
        value={effectiveValue}
        onChange={(_event, next) => {
          // Not clearable: ignore attempts to empty the selection (the text snaps back on blur).
          if (next === null && !clearable) return;
          if (value === undefined) setInternalValue(next);
          onValueChanged?.(next);
        }}
        onInputChange={(_event, text, reason) => {
          // "reset" fires when the selection programmatically rewrites the text;
          // only report what the user actually typed.
          if (reason === "input") onInputChanged?.(text);
        }}
        // MUI calls this before its own key handling; `defaultMuiPrevented` skips the latter.
        onKeyDown={(event) => onInputKeyDown?.(event)}
        getOptionLabel={getOptionLabel}
        isOptionEqualToValue={isOptionEqualToValue}
        getOptionDisabled={getOptionDisabled}
        filterOptions={filterOptions}
        disabled={disabled}
        readOnly={readOnly}
        loading={loading}
        noOptionsText={noOptionsText}
        loadingText={loadingText}
        size="small"
        fullWidth
        openOnFocus
        autoHighlight
        handleHomeEndKeys
        renderInput={(params) => (
          <TextField
            {...params}
            inputRef={setRefs}
            placeholder={placeholder}
            required={required && !effectiveValue}
            error={error}
            autoFocus={autoFocus}
            variant="outlined"
            // Newer MUI hands the input wiring over via `params.slotProps` (the old
            // `inputProps` / `InputProps` params are gone). Only touch it to add the aria-label.
            slotProps={
              ariaLabel
                ? {
                    ...params.slotProps,
                    htmlInput: {
                      ...params.slotProps?.htmlInput,
                      "aria-label": ariaLabel,
                    },
                  }
                : params.slotProps
            }
          />
        )}
        slotProps={{
          clearIndicator: {
            "aria-label": "Clear selection",
            // Hide the x when the field must keep a value.
            sx: clearable ? undefined : { display: "none" },
          },
          popupIndicator: { "aria-label": "Show options" },
          paper: {
            sx: {
              transformOrigin: "top center",
              animation: `${enterBelow} 160ms cubic-bezier(0.2, 0, 0, 1)`,
              // When Popper flips the list above the field, animate from the bottom edge.
              "[data-popper-placement^='top'] &": {
                transformOrigin: "bottom center",
                animation: `${enterAbove} 160ms cubic-bezier(0.2, 0, 0, 1)`,
              },
              "@media (prefers-reduced-motion: reduce)": {
                animation: "none",
                "[data-popper-placement^='top'] &": { animation: "none" },
              },
              mt: 0.5,
              border: "1px solid var(--line, #e0e5eb)",
              borderRadius: "6px",
              boxShadow: "0 8px 24px rgba(16, 35, 79, 0.14)",
              "& .MuiAutocomplete-option": {
                minHeight: 32,
                fontSize: 13,
                paddingTop: "4px",
                paddingBottom: "4px",
              },
              "& .MuiAutocomplete-option.Mui-focused": {
                backgroundColor: "#f0f2fd",
              },
              "& .MuiAutocomplete-option[aria-selected='true']": {
                backgroundColor: "#e3e7fc",
                fontWeight: 600,
              },
              "& .MuiAutocomplete-noOptions, & .MuiAutocomplete-loading": {
                fontSize: 13,
              },
            },
          },
        }}
        sx={{
          backgroundColor: "transparent",
          color,
          // `&&` raises specificity above MUI's size="small" Autocomplete rules.
          "&& .MuiOutlinedInput-root": {
            minHeight: 30,
            paddingTop: 0,
            paddingBottom: 0,
            paddingLeft: "6px",
            fontSize: 13,
            color,
            "& fieldset": {
              borderWidth: "1px",
              borderColor: "var(--line, #d0d5dd)",
            },
            "&:hover fieldset": { borderColor: "#9aa8ba" },
            "&.Mui-focused fieldset": {
              borderWidth: "1px",
              borderColor: "var(--primary, #2277ff)",
            },
            "&.Mui-error fieldset": { borderColor: "#d92d20" },
            "&.Mui-disabled": { backgroundColor: "#f5f5f5" },
          },
          "&& .MuiAutocomplete-input": {
            height: 28,
            padding: "0 4px",
            color,
          },
          "& .MuiAutocomplete-endAdornment": { right: 4 },
          "& .MuiAutocomplete-endAdornment .MuiSvgIcon-root": { fontSize: 18 },
        }}
      />
    </div>
  );
}
