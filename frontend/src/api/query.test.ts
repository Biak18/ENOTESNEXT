import { QueryClient } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fnGetDataSet } from "./endpoints";
import { fetchDataset, invalidateDataset } from "./query";

vi.mock("./endpoints", () => ({
  fnGetDataSet: vi.fn(),
}));

const getDataSetMock = vi.mocked(fnGetDataSet);

describe("fetchDataset", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient();
    getDataSetMock.mockReset();
    getDataSetMock.mockResolvedValue([]);
  });

  it("reuses a fresh result for an identical search", async () => {
    const query = { search: "paper" };

    await fetchDataset(queryClient, "Items", query, { cacheScope: "DEMO:user1" });
    await fetchDataset(queryClient, "Items", query, { cacheScope: "DEMO:user1" });

    expect(getDataSetMock).toHaveBeenCalledTimes(1);
  });

  it("keeps authenticated scopes in separate cache entries", async () => {
    const query = { search: "paper" };

    await fetchDataset(queryClient, "Items", query, { cacheScope: "DEMO:user1" });
    await fetchDataset(queryClient, "Items", query, { cacheScope: "OTHER:user1" });

    expect(getDataSetMock).toHaveBeenCalledTimes(2);
  });

  it("fetches again after the controller cache is invalidated", async () => {
    await fetchDataset(queryClient, "Items", undefined, { cacheScope: "DEMO:user1" });
    invalidateDataset(queryClient, "Items");
    await fetchDataset(queryClient, "Items", undefined, { cacheScope: "DEMO:user1" });

    expect(getDataSetMock).toHaveBeenCalledTimes(2);
  });
});
