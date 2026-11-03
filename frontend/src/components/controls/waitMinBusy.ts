/**
 * Loading-state companion for search/load flows.
 *
 * A local API answers in tens of milliseconds - faster than a busy state can
 * paint - so skeletons and busy overlays would flash by invisibly (the removed
 * global spinner handled this with its own MIN_VISIBLE_MS). Screens keep their
 * busy window honest: `waitMinBusy` returns once the load has taken at least
 * MIN_BUSY_MS, and the screen then clears its busy flag.
 */
export const MIN_BUSY_MS = 400;

export async function waitMinBusy(startedAt: number): Promise<void> {
  const remaining = MIN_BUSY_MS - (Date.now() - startedAt);
  if (remaining > 0) {
    await new Promise<void>((resolve) => setTimeout(resolve, remaining));
  }
}
