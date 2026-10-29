import { Alert, Button, IconButton } from "@mui/material";
import { forwardRef, useImperativeHandle, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import EnDynamicForm from "./EnDynamicForm";
import useEnSyncedState from "../components/controls/useEnSyncedState";
import { isEnFormValid } from "./EnFormTypes";
import type { EnFormData, EnFormField, EnFormHandle, EnFormValue } from "./EnFormTypes";

const EMPTY_FORM_DATA: EnFormData = {};

export interface EnSearchPanelProps {
  fields: EnFormField[];
  defaultValues?: EnFormData;
  onSearch?: (values: EnFormData) => void | Promise<void>;
  onValueChanged?: (fieldId: string, value: EnFormValue, values: EnFormData) => void;
  initiallyExpanded?: boolean;
}

const EnSearchPanel = forwardRef<EnFormHandle, EnSearchPanelProps>(
  (
    {
      fields,
      defaultValues = EMPTY_FORM_DATA,
      onSearch,
      onValueChanged,
      initiallyExpanded = true,
    },
    ref,
  ) => {
  const [values, setValues] = useEnSyncedState<EnFormData>(
    { ...defaultValues },
    defaultValues,
  );
  const [expanded, setExpanded] = useState(initiallyExpanded);
  const [searchError, setSearchError] = useState("");

  useImperativeHandle(ref, () => ({
    getFormData: () => values,
    setFormData: (data) => setValues({ ...data }),
    validate: () => isEnFormValid(fields, values),
  }), [fields, setValues, values]);

  const updateValue = (fieldId: string, value: EnFormValue) => {
    const next = { ...values, [fieldId]: value };
    setValues(next);
    onValueChanged?.(fieldId, value, next);
  };

  const handleSearch = async () => {
    if (!onSearch) return;
    setSearchError("");
    try {
      await onSearch(values);
    } catch (cause) {
      setSearchError(cause instanceof Error ? cause.message : "Search failed.");
    }
  };

  return (
    <section className="border-b border-[var(--line)] bg-[var(--lavender-light)] px-3 pt-2" aria-label="Search filters">
      {searchError && <Alert severity="error" className="mb-2">{searchError}</Alert>}
      {expanded && (
        <EnDynamicForm
          fields={fields}
          values={values}
          onChange={updateValue}
          columns={3}
        />
      )}
      <div className="flex items-center justify-center gap-1 py-1">
        {onSearch && (
          <Button
            type="button"
            size="small"
            variant="contained"
            startIcon={<SearchIcon />}
            onClick={() => void handleSearch()}
          >
            Search
          </Button>
        )}
        <IconButton
          type="button"
          size="small"
          aria-label={expanded ? "Collapse search filters" : "Expand search filters"}
          aria-expanded={expanded}
          onClick={() => setExpanded((current) => !current)}
        >
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </div>
    </section>
  );
});

export default EnSearchPanel;
