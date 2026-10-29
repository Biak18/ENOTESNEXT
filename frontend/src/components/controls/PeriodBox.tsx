import React, { useEffect, useId, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import {
  DateCalendar,
  DatePicker,
  LocalizationProvider,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import { Box, Popper } from "@mui/material";

interface DateRangeBoxProps {
  defaultValue?: string;
  onValueChanged?: (start: string, end: string) => void;
  isReadOnly?: boolean;
  isRequired?: boolean;
  isEditable?: boolean;
  inputRef?: React.Ref<HTMLInputElement>;
  isSearchPanel?: boolean;
  onFocus?: (target: string) => void;
}

const parseDate = (date: string | undefined): Dayjs | null => {
  if (!date?.trim()) return null;

  const trimmedDate = date.trim();
  const dateParts = /^(\d{4})[-/]?(\d{2})[-/]?(\d{2})$/.exec(trimmedDate);
  if (!dateParts) return null;

  const parsedDate = dayjs(`${dateParts[1]}-${dateParts[2]}-${dateParts[3]}`);

  return parsedDate.isValid() &&
    parsedDate.format("YYYY-MM-DD") ===
      `${dateParts[1]}-${dateParts[2]}-${dateParts[3]}`
    ? parsedDate
    : null;
};

const parseDateRange = (
  defaultValue: string | undefined,
): [Dayjs | null, Dayjs | null] => {
  const [start = "", end = ""] = defaultValue?.split(",") ?? [];
  return [parseDate(start), parseDate(end)];
};

const formatDateRange = (startDate: Dayjs | null, endDate: Dayjs | null) => ({
  start: startDate?.format("YYYYMMDD") ?? "",
  end: endDate?.format("YYYYMMDD") ?? "",
});

const PeriodBox = React.memo(
  ({
    defaultValue,
    onValueChanged,
    isReadOnly = false,
    isRequired = false,
    isEditable = true,
    inputRef,
    isSearchPanel = false,
    onFocus,
  }: DateRangeBoxProps) => {
    const [value, setValue] = useState<[Dayjs | null, Dayjs | null]>(() =>
      parseDateRange(defaultValue),
    );
    const [isPopperOpen, setIsPopperOpen] = useState(false);
    const divRef = useRef<HTMLDivElement | null>(null);
    const secondRef = useRef<HTMLInputElement | null>(null);
    const popperId = useId();
    const isDisabled = isReadOnly || !isEditable;

    useEffect(() => {
      setValue(parseDateRange(defaultValue));
    }, [defaultValue]);

    const handleClose = () => setIsPopperOpen(false);

    const handleValueChange = (nextValue: [Dayjs | null, Dayjs | null]) => {
      setValue(nextValue);
      const dateRange = formatDateRange(nextValue[0], nextValue[1]);
      onValueChanged?.(dateRange.start, dateRange.end);
    };

    const handleStartDateChange = (newValue: Dayjs | null) => {
      if (newValue && !newValue.isValid()) return;
      handleValueChange([newValue, value[1]]);
    };

    const handleEndDateChange = (newValue: Dayjs | null) => {
      if (newValue && !newValue.isValid()) return;
      handleValueChange([value[0], newValue]);
      handleClose();
    };

    useEffect(() => {
      if (!isPopperOpen) return;

      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Node;
        if (
          divRef.current?.contains(target) ||
          document.getElementById(popperId)?.contains(target)
        ) {
          return;
        }
        handleClose();
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, [isPopperOpen, popperId]);

    const handleOpen = () => {
      if (!isDisabled) setIsPopperOpen(true);
    };

    const handleDateDoubleClick = () => handleClose();

    const handleKeyDown1 = (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        event.preventDefault();
        event.currentTarget.blur();
        if (isSearchPanel) {
          onFocus?.("current");
        } else {
          secondRef.current?.focus();
        }
      } else if (event.key === "Tab") {
        event.preventDefault();
        event.currentTarget.blur();
        secondRef.current?.focus();
      }
    };

    const handleKeyDown2 = (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter" || event.key === "Tab") {
        event.preventDefault();
        event.currentTarget.blur();
        handleClose();
        if (event.key === "Enter" && isSearchPanel) {
          secondRef.current?.focus();
        } else {
          onFocus?.("next");
        }
      }
    };

    const borderWidth = isRequired ? "2px" : "1px";
    const textFieldSx = {
      "& .MuiInputBase-root": {
        height: 30,
        fontSize: 13,
      },
      "& .MuiOutlinedInput-root": {
        "& fieldset, &:hover fieldset, &.Mui-focused fieldset": {
          borderWidth,
        },
      },
    };

    return (
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ko">
        <div
          ref={divRef}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            minWidth: 0,
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <DatePicker
              value={value[0]}
              format="YYYY/MM/DD"
              onChange={handleStartDateChange}
              open={false}
              onOpen={handleOpen}
              disabled={isDisabled}
              slotProps={{
                textField: {
                  inputRef,
                  onClick: handleOpen,
                  onKeyDown: handleKeyDown1,
                  fullWidth: true,
                  sx: textFieldSx,
                },
              }}
            />
          </div>
          <Box sx={{ flexShrink: 0 }}> – </Box>
          <div style={{ flex: 1, minWidth: 0 }}>
            <DatePicker
              value={value[1]}
              format="YYYY/MM/DD"
              onChange={handleEndDateChange}
              open={false}
              disabled={isDisabled}
              onOpen={handleOpen}
              slotProps={{
                textField: {
                  onClick: handleOpen,
                  onKeyDown: handleKeyDown2,
                  fullWidth: true,
                  inputRef: secondRef,
                  sx: textFieldSx,
                },
              }}
            />
          </div>
        </div>
        <Popper
          id={popperId}
          open={isPopperOpen}
          anchorEl={divRef.current}
          placement="bottom-start"
          modifiers={[{ name: "offset", options: { offset: [0, 0] } }]}
          sx={{
            boxShadow:
              "0px 5px 5px -3px rgba(0, 0, 0, 0.2), 0px 8px 10px 1px rgba(0, 0, 0, 0.14), 0px 3px 14px 2px rgba(0, 0, 0, 0.12)",
            borderRadius: "8px",
            backgroundColor: "white",
            zIndex: 1500,
            maxWidth: "calc(100vw - 16px)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: 2,
              p: 2,
              borderRadius: "8px",
              backgroundColor: "white",
              maxWidth: "calc(100vw - 16px)",
              overflowX: "auto",
              "& .MuiDateCalendar-root": { height: "auto" },
              "& .MuiPickersCalendarHeader-root": { marginTop: 0 },
            }}
          >
            <DateCalendar
              value={value[0]}
              onChange={handleStartDateChange}
              maxDate={value[1] ?? undefined}
              sx={{
                width: { xs: 280, sm: 300 },
                maxWidth: "100%",
                "& .MuiPickersSlideTransition-root": { minHeight: "205px" },
              }}
              slotProps={{
                day: {
                  onDoubleClickCapture: handleDateDoubleClick,
                },
              }}
            />
            <DateCalendar
              value={value[1]}
              onChange={handleEndDateChange}
              minDate={value[0] ?? undefined}
              sx={{
                width: { xs: 280, sm: 300 },
                maxWidth: "100%",
                "& .MuiPickersSlideTransition-root": { minHeight: "205px" },
              }}
            />
          </Box>
        </Popper>
      </LocalizationProvider>
    );
  },
);

export default PeriodBox;
