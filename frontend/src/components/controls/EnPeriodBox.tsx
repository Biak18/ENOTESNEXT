import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { type Dayjs } from "dayjs";
import useEnSyncedState from "./useEnSyncedState";

export interface EnPeriodBoxProps {
  startValue?: string;
  endValue?: string;
  onStartValueChanged?: (value: string) => void;
  onEndValueChanged?: (value: string) => void;
  isReadOnly?: boolean;
  isEditable?: boolean;
  isRequired?: boolean;
  monthOnly?: boolean;
}

export default function EnPeriodBox({
  startValue = "",
  endValue = "",
  onStartValueChanged,
  onEndValueChanged,
  isReadOnly = false,
  isEditable = true,
  isRequired = false,
  monthOnly = false,
}: EnPeriodBoxProps) {
  const [start, setStart] = useEnSyncedState<Dayjs | null>(
    startValue ? dayjs(startValue) : null,
    startValue,
  );
  const [end, setEnd] = useEnSyncedState<Dayjs | null>(
    endValue ? dayjs(endValue) : null,
    endValue,
  );
  const views = monthOnly ? (["year", "month"] as const) : (["year", "month", "day"] as const);
  const format = monthOnly ? "YYYY/MM" : "YYYY/MM/DD";

  const renderPicker = (
    value: Dayjs | null,
    setValue: (value: Dayjs | null) => void,
    onChange?: (value: string) => void,
    label?: string,
  ) => (
    <DatePicker
      value={value}
      views={[...views]}
      format={format}
      onChange={(next) => {
        setValue(next);
        onChange?.(next?.isValid() ? next.format(monthOnly ? "YYYYMM" : "YYYYMMDD") : "");
      }}
      disabled={isReadOnly}
      readOnly={!isEditable}
      slotProps={{
        textField: {
          fullWidth: true,
          required: isRequired,
          size: "small",
          slotProps: { htmlInput: { "aria-label": label } },
          sx: { backgroundColor: isEditable ? "white" : "#f5f5f5" },
        },
      }}
    />
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className="flex w-full min-w-0 items-center gap-2">
        {renderPicker(start, setStart, onStartValueChanged, "Period start")}
        <span aria-hidden="true">~</span>
        {renderPicker(end, setEnd, onEndValueChanged, "Period end")}
      </div>
    </LocalizationProvider>
  );
}
