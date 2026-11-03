import type { QueryClient } from "@tanstack/react-query";
import { fnGetDataSet } from "./endpoints";

/**
 * TanStack-backed screen searches (SNOTES fnGetDataSet caching).
 *
 * A local API answers a search in tens of milliseconds, so repeated Search
 * clicks each pay a full round-trip to the API/Postgres for unchanged data.
 * Every fnGetDataSet-style search goes through `fetchDataset`:
 *
 * - repeat searches inside SEARCH_STALE_TIME_MS resolve from cache (no API call)
 * - concurrent identical searches share one in-flight request
 * - saves MUST call `invalidateDataset` so a save -> Search never shows
 *   pre-save rows (the 5s window would otherwise serve stale data)
 */
export const SEARCH_STALE_TIME_MS = 5_000;

type QueryMap = Record<string, string | number | boolean | undefined | null>;

function datasetKey(controller: string, query?: QueryMap) {
  return ["dataset", controller, query ?? {}] as const;
}

export function fetchDataset<T = unknown>(
  queryClient: QueryClient,
  controller: string,
  query?: QueryMap,
  staleTime: number = SEARCH_STALE_TIME_MS,
): Promise<T> {
  return queryClient.fetchQuery<T>({
    queryKey: datasetKey(controller, query),
    queryFn: () => fnGetDataSet<T>(controller, query),
    staleTime,
  });
}

/** Drop every cached search for a controller (all param variants). */
export function invalidateDataset(
  queryClient: QueryClient,
  controller: string,
): void {
  queryClient.removeQueries({ queryKey: ["dataset", controller] });
}
