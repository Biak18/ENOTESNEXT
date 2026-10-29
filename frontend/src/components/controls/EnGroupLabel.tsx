import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import type { Ref } from "react";

export interface EnGroupLabelProps {
  text: string;
  inputRef?: Ref<HTMLDivElement>;
  onFocus?: (target: "next") => void;
}

export default function EnGroupLabel({
  text,
  inputRef,
  onFocus,
}: EnGroupLabelProps) {
  return (
    <div
      ref={inputRef}
      className="flex w-full items-center"
      tabIndex={-1}
      onFocus={() => onFocus?.("next")}
    >
      <span className="mr-2 flex shrink-0 items-center whitespace-nowrap font-semibold text-(--navy)">
        <FiberManualRecordIcon sx={{ mr: "5px", fontSize: 8 }} />
        {text}
      </span>
      <span className="flex-1 border-t border-(--navy)" aria-hidden="true" />
    </div>
  );
}
