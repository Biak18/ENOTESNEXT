import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import EnCommonSpinner from "./EnCommonSpinner";

/**
 * Global busy overlay (EnCommonSpinner) driven by the transport layer.
 *
 * Reference-counted: every in-flight API request pushes, every settle pops —
 * the overlay shows once (after `SHOW_DELAY_MS` so fast queries never flash)
 * and hides `MIN_VISIBLE_MS` after the last request completes, success or
 * error. Mounted imperatively like EnDialogService so non-React callers
 * (apiRequest in http.ts) can drive it.
 */

const SHOW_DELAY_MS = 250;
const MIN_VISIBLE_MS = 400;

let root: Root | null = null;
let container: HTMLDivElement | null = null;
let pending = 0;
let visible = false;
let shownAt = 0;
let showTimer: number | null = null;
let hideTimer: number | null = null;
let label = "Loading…";

function mount() {
  if (root) return;
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  render();
}

function render() {
  root?.render(<EnCommonSpinner isLoading={visible} label={label} />);
}

/** Register one more in-flight request; shows the overlay after a beat. */
export function pushSpinner(nextLabel?: string) {
  pending += 1;
  if (nextLabel) label = nextLabel;
  if (hideTimer !== null) clearTimeout(hideTimer);
  if (pending === 1) {
    showTimer = setTimeout(() => {
      visible = true;
      shownAt = Date.now();
      mount();
      render();
    }, SHOW_DELAY_MS);
  }
}

/** Request settled; hides the overlay once the last one finishes. */
export function popSpinner() {
  pending = Math.max(0, pending - 1);
  if (pending > 0) return;
  if (showTimer) {
    clearTimeout(showTimer);
    showTimer = null;
  }
  if (!visible) return;
  const elapsed = Date.now() - shownAt;
  hideTimer = setTimeout(
    () => {
      visible = false;
      render();
    },
    Math.max(0, MIN_VISIBLE_MS - elapsed) || 0,
  );
}

/** Wrap any async work with the global spinner (labels optional). */
export async function withSpinner<T>(
  ariaLabel: string,
  fn: () => Promise<T>,
): Promise<T> {
  pushSpinner(ariaLabel);
  try {
    return await fn();
  } finally {
    popSpinner();
  }
}
