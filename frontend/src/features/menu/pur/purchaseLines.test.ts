import { describe, expect, it } from "vitest";
import {
  buildExportSheet,
  createLine,
  filterPurchaseLines,
  filterLines,
  groupSummaries,
  initialDraft,
  initialFilters,
  initialLines,
  summarize,
  validateDraft,
  validateEditValue,
  withDerivedAmount,
  type PurchaseLine,
} from "./purchaseLines";

describe("validateEditValue", () => {
  it("rejects a blank description and trims a valid one", () => {
    const blank = validateEditValue("description", "   ");
    expect(blank.ok).toBe(false);
    if (!blank.ok) expect(blank.message).toContain("blank");

    const trimmed = validateEditValue("description", "  A4 Paper  ");
    expect(trimmed).toEqual({ ok: true, value: "A4 Paper" });
  });

  it("keeps category and location inside the allowed list", () => {
    expect(validateEditValue("category", "Office supplies").ok).toBe(true);
    const invalid = validateEditValue("category", "Unlisted");
    expect(invalid.ok).toBe(false);
    expect(validateEditValue("location", "Mandalay").ok).toBe(true);
    expect(validateEditValue("location", "Elsewhere").ok).toBe(false);
  });

  it("requires a positive quantity and a non negative unit price", () => {
    expect(validateEditValue("quantity", 3).ok).toBe(true);
    expect(validateEditValue("quantity", 0).ok).toBe(false);
    expect(validateEditValue("quantity", -2).ok).toBe(false);
    expect(validateEditValue("quantity", "abc").ok).toBe(false);
    expect(validateEditValue("unitPrice", 0).ok).toBe(true);
    expect(validateEditValue("unitPrice", -0.5).ok).toBe(false);
  });

  it("refuses to edit read-only columns", () => {
    const result = validateEditValue("amount", 12);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.message).toContain("cannot be edited");
  });
});

describe("validateDraft", () => {
  it("requires a supplier, at least one line, and valid lines", () => {
    expect(validateDraft({ ...initialDraft, supplier: "" }, initialLines)).toContain(
      "supplier",
    );
    expect(validateDraft(initialDraft, [])).toContain("at least one purchase line");

    const broken: PurchaseLine = { ...initialLines[0], quantity: 0 };
    expect(validateDraft(initialDraft, [broken])).toContain("Quantity");
  });

  it("accepts a complete draft", () => {
    expect(validateDraft(initialDraft, initialLines)).toBeNull();
  });

  it("rejects an expected date earlier than the order date", () => {
    const draft = { ...initialDraft, orderDate: "2026-10-22", expectedDate: "2026-10-01" };
    expect(validateDraft(draft, initialLines)).toContain("expected date");
  });
});

describe("totals and grouping", () => {
  it("sums quantity and amount across lines", () => {
    const totals = summarize(initialLines);
    const expectedAmount = initialLines.reduce(
      (sum, line) => sum + line.quantity * line.unitPrice,
      0,
    );
    expect(totals.quantity).toBe(
      initialLines.reduce((sum, line) => sum + line.quantity, 0),
    );
    expect(totals.amount).toBeCloseTo(expectedAmount, 6);
  });

  it("groups totals by category and location without a paid aggregation plugin", () => {
    const byCategory = groupSummaries(initialLines, "category");
    const categoryTotal = byCategory.reduce((sum, group) => sum + group.amount, 0);
    expect(categoryTotal).toBeCloseTo(summarize(initialLines).amount, 6);
    expect(byCategory.map((group) => group.name)).toContain("Office supplies");

    const byLocation = groupSummaries(initialLines, "location");
    expect(byLocation.map((group) => group.name)).toContain("Yangon Main");
  });
});

describe("filterLines", () => {
  it("matches item text and keeps parent rows visible", () => {
    const byText = filterLines(initialLines, { ...initialFilters, item: "paper" });
    expect(byText.length).toBeGreaterThan(0);
    expect(
      byText.every((line) =>
        `${line.itemCode} ${line.description} ${line.category} ${line.location}`
          .toLowerCase()
          .includes("paper"),
      ),
    ).toBe(true);
  });

  it("filters by category and location", () => {
    const byCategory = filterLines(initialLines, { ...initialFilters, category: "Writing" });
    expect(byCategory.every((line) => line.category === "Writing")).toBe(true);
    const byLocation = filterLines(initialLines, { ...initialFilters, location: "Mandalay" });
    expect(byLocation.every((line) => line.location === "Mandalay")).toBe(true);
  });
});

describe("filterPurchaseLines", () => {
  it("filters details using the purchase order date", () => {
    const filters = {
      ...initialFilters,
      periodFrom: "2026-10-01",
      periodTo: "2026-10-31",
    };
    expect(filterPurchaseLines(initialLines, filters, initialDraft.orderDate)).toHaveLength(
      initialLines.length,
    );
    expect(filterPurchaseLines(initialLines, filters, "2026-11-01")).toEqual([]);
  });

  it("rejects an invalid date range and missing order dates", () => {
    expect(
      filterPurchaseLines(
        initialLines,
        { ...initialFilters, periodFrom: "2026-11-01", periodTo: "2026-10-01" },
        initialDraft.orderDate,
      ),
    ).toEqual([]);
    expect(
      filterPurchaseLines(
        initialLines,
        { ...initialFilters, periodFrom: "2026-10-01" },
        "",
      ),
    ).toEqual([]);
  });
});

describe("buildExportSheet", () => {
  const sheet = buildExportSheet(initialDraft, initialLines);
  const headerIndex = sheet.findIndex((row) => row[0] === "Item code");

  it("writes the document header before the table", () => {
    expect(sheet[0]).toEqual(["Purchase order", initialDraft.orderNumber]);
    expect(sheet[1]).toEqual(["Supplier", initialDraft.supplier]);
    expect(headerIndex).toBeGreaterThan(0);
  });

  it("keeps quantity and money cells numeric", () => {
    const firstRow = sheet[headerIndex + 1];
    expect(firstRow[5]).toEqual({ value: initialLines[0].quantity, type: Number });
    expect(firstRow[7]).toEqual({
      value: Math.round((initialLines[0].quantity * initialLines[0].unitPrice) * 100) / 100,
      type: Number,
      format: "0.00",
    });
    const totalRow = sheet[sheet.length - 1];
    const totals = summarize(initialLines);
    expect(totalRow[5]).toEqual({ value: totals.quantity, type: Number });
    expect(totalRow[7]).toEqual({ value: Math.round(totals.amount * 100) / 100, type: Number, format: "0.00" });
  });

  it("omits internal row identifiers", () => {
    const flattened = JSON.stringify(sheet);
    expect(flattened).not.toContain(initialLines[0].id);
  });
});

describe("line helpers", () => {
  it("recomputes the line amount from quantity and price", () => {
    const line = withDerivedAmount({ ...initialLines[0], quantity: 3, unitPrice: 2 });
    expect(line.amount).toBe(6);
  });

  it("creates a new line with a unique identifier", () => {
    const line = createLine("po-line-99", 99);
    expect(line.id).toBe("po-line-99");
    expect(line.amount).toBe(0);
    expect(line.quantity).toBeGreaterThan(0);
  });
});
