import { Children, useCallback, useEffect, useRef, useState } from "react";
import type { KeyboardEvent, PointerEvent, ReactNode } from "react";
import "./EnSplitter.css";

/**
 * Global two-pane splitter used to divide any screen into resizable regions.
 *
 * `orientation="vertical"`   → panes side by side (left | right), handle is a
 *                              vertical bar, drag moves it horizontally.
 * `orientation="horizontal"` → panes stacked (top / bottom), handle is a
 *                              horizontal bar, drag moves it vertically.
 *
 * - Percent-based: the first pane occupies `percent`% of the cross size.
 * - Pointer drag on the handle; Arrow keys (and Home/End) when focused;
 *   double-click resets to 50%.
 * - Exactly the first two `children` are used as the panes.
 */
export type EnSplitterProps = {
  /** "vertical" = left/right panes, "horizontal" = top/bottom panes. */
  orientation: "vertical" | "horizontal";
  /** Initial size of the first pane in percent. Default 50. */
  initial?: number;
  /** First-pane bounds in percent (defaults 20 / 80). */
  min?: number;
  max?: number;
  /** Fired after a drag ends or a keyboard step changes the split. */
  onPercentChange?: (percent: number) => void;
  className?: string;
  children?: ReactNode;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export function EnSplitter({
  orientation,
  initial = 50,
  min = 20,
  max = 80,
  onPercentChange,
  className = "",
  children,
}: EnSplitterProps) {
  const [percent, setPercent] = useState(() => clamp(initial, min, max));
  const [dragging, setDragging] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ startX: 0, startPercent: 0, size: 0 });

  const panes = Children.toArray(children) as ReactNode[];
  const first = panes[0] ?? null;
  const second = panes[1] ?? null;

  /** The cross-axis pixel length the percent is measured against. */
  const crossSize = useCallback(
    () =>
      orientation === "vertical"
        ? rootRef.current?.clientWidth ?? 0
        : rootRef.current?.clientHeight ?? 0,
    [orientation],
  );

  const applyPercent = (next: number) => {
    const pct = clamp(next, min, max);
    setPercent(pct);
    return pct;
  };

  const onHandleMouseDown = (e: PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    const target = e.currentTarget;
    target.setPointerCapture(e.pointerId);
    dragRef.current = {
      startX: orientation === "vertical" ? e.clientX : e.clientY,
      startPercent: percent,
      size: crossSize(),
    };
    setDragging(true);
  };

  const onHandlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    const now = orientation === "vertical" ? e.clientX : e.clientY;
    const start = dragRef.current.startX;
    const size = dragRef.current.size;
    if (!size) return;
    const dir = orientation === "vertical" ? 1 : 1;
    const delta = ((now - start) * dir * 100) / size;
    applyPercent(dragRef.current.startPercent + delta);
  };

  const endDrag = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    setDragging(false);
    onPercentChange?.(percent);
  };

  const onHandleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = 2;
    const growsFirstPane =
      orientation === "vertical" ? ["ArrowLeft"] : ["ArrowUp"];
    const shrinksFirstPane =
      orientation === "vertical" ? ["ArrowRight"] : ["ArrowDown"];
    if (growsFirstPane.includes(e.key)) {
      e.preventDefault();
      onPercentChange?.(applyPercent(percent - step));
    } else if (shrinksFirstPane.includes(e.key)) {
      e.preventDefault();
      onPercentChange?.(applyPercent(percent + step));
    } else if (e.key === "Home") {
      e.preventDefault();
      onPercentChange?.(applyPercent(min));
    } else if (e.key === "End") {
      e.preventDefault();
      onPercentChange?.(applyPercent(max));
    }
  };

  // persist nothing globally; expose percent only through onPercentChange.
  useEffect(() => {
    if (!dragging) return;
    document.body.style.cursor =
      orientation === "vertical" ? "col-resize" : "row-resize";
    document.body.style.userSelect = "none";
    return () => {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [dragging, orientation]);

  const firstStyle =
    orientation === "vertical"
      ? { width: `${percent}%` }
      : { height: `${percent}%` };

  return (
    <div
      ref={rootRef}
      className={[
        "en-splitter",
        `en-splitter--${orientation}`,
        dragging ? "is-dragging" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="en-splitter-pane" style={firstStyle}>
        {first}
      </div>
      <div
        role="separator"
        aria-orientation={orientation === "vertical" ? "vertical" : "horizontal"}
        aria-valuenow={Math.round(percent)}
        aria-valuemin={min}
        aria-valuemax={max}
        tabIndex={0}
        className="en-splitter-handle"
        title="Drag to resize — double-click to reset"
        onPointerDown={onHandleMouseDown}
        onPointerMove={onHandlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={onHandleKeyDown}
        onDoubleClick={() => {
          setPercent(clamp(50, min, max));
          onPercentChange?.(clamp(50, min, max));
        }}
      />
      <div className="en-splitter-pane en-splitter-pane--flex">{second}</div>
    </div>
  );
}

export default EnSplitter;
