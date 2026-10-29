export interface EnLabelProps {
  text: string;
  type?: "SearchPanel" | "SharedForm" | "FreeForm" | string;
  color?: string;
}

const labelWidths: Record<string, string> = {
  SearchPanel: "min-w-[120px] max-w-[120px]",
  SharedForm: "min-w-[130px] max-w-[130px]",
  FreeForm: "min-w-[95px] max-w-[95px]",
};

export default function EnLabel({
  text,
  type = "SearchPanel",
  color = "inherit",
}: EnLabelProps) {
  return (
    <div
      className={`flex h-full items-center ${labelWidths[type] ?? labelWidths.SearchPanel}`}
      style={{ color }}
    >
      {text}
    </div>
  );
}
