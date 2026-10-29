import { Resizable } from "re-resizable";
import type { ReactNode } from "react";

export interface EnResizableProps {
  children: ReactNode;
  width?: number | string;
  height?: number | string;
  minWidth?: number | string;
  minHeight?: number | string;
  maxWidth?: number | string;
  maxHeight?: number | string;
  direction?: "horizontal" | "vertical";
  onResizeStop?: (width: number, height: number) => void;
}

export default function EnResizable({
  children,
  width = "100%",
  height = "100%",
  minWidth = 0,
  minHeight = 0,
  maxWidth,
  maxHeight,
  direction = "horizontal",
  onResizeStop,
}: EnResizableProps) {
  const edge = direction === "horizontal" ? "right" : "bottom";

  return (
    <Resizable
      size={{ width, height }}
      minWidth={minWidth}
      minHeight={minHeight}
      maxWidth={maxWidth}
      maxHeight={maxHeight}
      enable={{
        top: false,
        right: edge === "right",
        bottom: edge === "bottom",
        left: false,
        topRight: false,
        bottomRight: false,
        bottomLeft: false,
        topLeft: false,
      }}
      onResizeStop={(_event, _direction, ref) => {
        onResizeStop?.(ref.offsetWidth, ref.offsetHeight);
      }}
      handleStyles={{
        [edge]: { width: 5, background: "var(--sky-blue, #dbeafe)" },
      }}
      handleClasses={{
        [edge]: "focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600",
      }}
    >
      {children}
    </Resizable>
  );
}
