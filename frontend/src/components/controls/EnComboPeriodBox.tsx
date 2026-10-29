import { Autocomplete, TextField } from "@mui/material";
import useEnSyncedState from "./useEnSyncedState";
import type { EnOption } from "./EnControlTypes";
import EnPeriodBox from "./EnPeriodBox";
import type { EnPeriodBoxProps } from "./EnPeriodBox";

export interface EnComboPeriodBoxProps extends EnPeriodBoxProps {
  options?: EnOption[];
  defaultCode?: string;
  onCodeChanged?: (value: string) => void;
}

export default function EnComboPeriodBox({
  options = [],
  defaultCode = "",
  onCodeChanged,
  ...periodProps
}: EnComboPeriodBoxProps) {
  const [code, setCode] = useEnSyncedState(defaultCode, defaultCode);

  return (
    <div className="flex min-w-0 items-center gap-2">
      <Autocomplete
        options={options}
        value={options.find((option) => option.code === code) ?? null}
        onChange={(_event, option) => {
          const next = option?.code ?? "";
          setCode(next);
          onCodeChanged?.(next);
        }}
        getOptionLabel={(option) => option.name}
        isOptionEqualToValue={(option, value) => option.code === value.code}
        disabled={periodProps.isReadOnly}
        size="small"
        sx={{ minWidth: 150 }}
        renderInput={(params) => (
          <TextField
            {...params}
            aria-label="Period type"
            slotProps={{
              ...params.slotProps,
              input: { ...params.slotProps.input, readOnly: periodProps.isEditable === false },
            }}
          />
        )}
      />
      <EnPeriodBox {...periodProps} />
    </div>
  );
}
