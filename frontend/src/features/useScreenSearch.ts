import { useCallback, useEffect, useRef } from "react";
import type { RefObject } from "react";
import type { AgDataGridHandle } from "../components/data-grid/agDataGridTypes";
import type { EnTreeViewHandle } from "../components/tree/EnTreeView";

/** Any widget exposing the global post-Search focus contract. */
type FocusFirstHandle = AgDataGridHandle | EnTreeViewHandle;
type FocusFirstRef = RefObject<FocusFirstHandle | null>;

/**
 * GLOBAL Search behavior (WinForms onSearch parity): run the screen's loader,
 * then move focus to the first row of every attached grid and the first node
 * of every attached tree. Defined once here - screens only attach the handles.
 * Referenced widgets must expose `focusFirst()`.
 */
export function useScreenSearch(
  load: () => Promise<void>,
  ...targets: FocusFirstRef[]
): () => void {
  // Refs are stable; keep them out of the dependency list via a latest-ref.
  // Synced in an effect - refs must not be touched during render.
  const targetsRef = useRef<FocusFirstRef[]>(targets);
  useEffect(() => {
    targetsRef.current = targets;
  });

  return useCallback(() => {
    void (async () => {
      await load();
      // Wait for the loaded rows/nodes to commit, then move focus.
      window.setTimeout(() => {
        targetsRef.current.forEach((target) => target.current?.focusFirst());
      }, 0);
    })();
  }, [load]);
}
