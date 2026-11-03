import type { EnFormField } from "./EnFormTypes";
import "./EnFormSkeleton.css";

export interface EnFormSkeletonProps {
  /** Same field config the real EnSharedForm uses - the placeholder mirrors
   * its layout exactly, so swapping over never shifts the screen. */
  fields: EnFormField[];
  /** Same column count as the real form (default 2). */
  columns?: number;
}

/**
 * Layout-only placeholder for a loading SharedForm (SNOTES busy state).
 * Pure presentation: no interactivity, hidden from assistive tech via the
 * aria attributes set by the caller (EnSharedForm sets aria-busy).
 */
export default function EnFormSkeleton({ fields, columns = 2 }: EnFormSkeletonProps) {
  return (
    <div
      className="grid min-w-0 gap-x-3 gap-y-2"
      style={{ gridTemplateColumns: `repeat(${Math.max(1, columns)}, minmax(0, 1fr))` }}
    >
      {fields.map((field) => {
        const isWide = field.type === "group" || field.type === "textarea";
        const barHeight =
          field.type === "checkbox" || field.type === "button"
            ? "en-skel-checkbox"
            : field.type === "group"
              ? "en-skel-group"
              : field.type === "textarea"
                ? "en-skel-control en-skel-textarea"
                : "en-skel-control";
        return (
          <div
            key={field.id}
            className={isWide ? "col-span-full min-w-0" : "min-w-0"}
          >
            {field.type !== "checkbox" && field.type !== "button" ? (
              <span className={`en-skel-bar en-skel-label`} aria-hidden="true" />
            ) : null}
            <div>
              <span className={`en-skel-bar ${barHeight}`} aria-hidden="true" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
