import "./EnFormSkeleton.css";

export interface EnSkeletonListProps {
  /** Number of placeholder rows to draw. Default 6. */
  rows?: number;
}

/**
 * Layout-only placeholder for panels whose data is a list/tree instead of a
 * form (EnTreeView panels). Rows are drawn with a slight deterministic
 * variation so the block reads like content rather than a flat bar.
 */
export default function EnSkeletonList({ rows = 6 }: EnSkeletonListProps) {
  const items = Array.from({ length: Math.max(1, rows) }, (_, i) => i);
  return (
    <div className="min-w-0 p-2" aria-busy="true" aria-live="polite">
      {items.map((i) => (
        <div
          key={i}
          style={{ display: "flex", padding: "6px 0", paddingLeft: (i % 3) * 14 }}
        >
          <span
            className="en-skel-bar en-skel-control"
            style={{ width: `${72 - (i % 3) * 7}%`, height: 12 }}
            aria-hidden="true"
          />
        </div>
      ))}
    </div>
  );
}
