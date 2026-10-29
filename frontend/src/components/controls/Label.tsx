interface LabelProps {
  text: string;
  type: string;
  color?: string;
}

const widthByType: Record<string, string> = {
  SearchPanel: "min-w-[120px] max-w-[120px] flex items-center h-full",
  SharedForm: "min-w-[130px] max-w-[130px] flex items-center h-full",
  FreeForm: "min-w-[95px] max-w-[80px] flex items-center h-full",
};

export default function Label({ text, type, color }: LabelProps) {
  const width =
    widthByType[type] ??
    "min-w-[120px] max-w-[120px] flex items-center h-full";
  const fontSize = 13;

  return (
    <div
      className={width}
      style={{
        fontSize: fontSize,
        color: color ? color : "black",
        fontWeight: color ? (color == "black" ? "normal" : "bold") : "normal",
      }}
    >
      {text}
    </div>
  );
}
