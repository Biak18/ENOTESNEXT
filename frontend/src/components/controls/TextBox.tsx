import {
  IconButton,
  InputAdornment,
  TextField,
} from "@mui/material";
import { ClearIcon } from "@mui/x-date-pickers";
import { memo, useEffect, useState } from "react";
import type { ChangeEvent, Ref } from "react";

interface TextBoxProps {
  defaultValue?: string;
  onValueChanged?: (value: string) => void;
  inputRef?: Ref<HTMLInputElement>;
  placeHolderText?: string;
}
const TextBox = memo(
  ({
    defaultValue = "",
    onValueChanged,
    inputRef,
    placeHolderText = "",
  }: TextBoxProps) => {
    const [value, setValue] = useState(defaultValue);

    useEffect(() => {
      if (onValueChanged) onValueChanged(value);
    }, [value, onValueChanged]);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      setValue(e.target.value);
    };

    const handleClear = () => {
      setValue("");
    };

    return (
      <div className="py-0 sm:py-2">
        <TextField
          inputRef={inputRef}
          value={value}
          placeholder={placeHolderText}
          slotProps={{
            input: {
              autoComplete: "off",
              style: {
                height: 30,
                fontSize: 13,
              },
              endAdornment: value && (
                <InputAdornment
                  position="end"
                  sx={{ paddingRight: "5px" }}
                  tabIndex={-1}
                >
                  <IconButton
                    onClick={handleClear}
                    size="small"
                    aria-label="Clear text"
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
          onChange={handleChange}
          variant="outlined"
          size="small"
          fullWidth
          sx={{
            backgroundColor: "white",
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderWidth: "1px",
              },
              "&:hover fieldset": {
                borderWidth: "1px",
              },
              "&.Mui-focused fieldset": {
                borderWidth: "1px",
              },
            },
            "& .MuiInputBase-root": {
              paddingRight: 0,
              "&.Mui-disabled": {
                backgroundColor: "#f5f5f5",
              },
            },
          }}
        />
      </div>
    );
  },
);

export default TextBox;
