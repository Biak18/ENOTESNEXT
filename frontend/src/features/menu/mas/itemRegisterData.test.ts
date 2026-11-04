import { describe, expect, it } from "vitest";
import {
  createSampleItems,
  filterItems,
  validateItemField,
  validateItems,
} from "./itemRegisterData";

describe("item register data", () => {
  it("filters by item text and database item type", () => {
    const items = createSampleItems("DEMO");

    expect(filterItems(items, { item: "paper", type: "" })).toHaveLength(1);
    expect(filterItems(items, { item: "", type: 30 })).toHaveLength(1);
    expect(
      filterItems(
        [{ ...items[0], __new: true }],
        { item: "no current match", type: "" },
      ),
    ).toHaveLength(1);
  });

  it("validates the database type, unit, and numeric precision", () => {
    expect(validateItemField("fgType", 40).ok).toBe(false);
    expect(validateItemField("cdUom", "PALLET").ok).toBe(false);
    expect(validateItemField("prPx", 1.1234567).ok).toBe(false);
    expect(validateItemField("prPx", 1.123456).ok).toBe(true);
  });

  it("rejects duplicate company-scoped item codes and blank required fields", () => {
    const items = createSampleItems("DEMO");
    const duplicate = { ...items[1], cdItem: items[0].cdItem };

    expect(validateItems([items[0], duplicate])).toBe(
      'Duplicate item code "ITEM-1001".',
    );
    expect(validateItems([{ ...items[0], nmItem: "" }])).toBe(
      "Item name is required.",
    );
  });
});
