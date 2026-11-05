import type { EnOption } from "../../../components/controls";

export type ItemType = 10 | 20 | 30;

export type ItemRow = {
  id: string;
  cdCompany: string;
  cdItem: string;
  nmItem: string;
  fgType: ItemType;
  cdCategory: string | null;
  cdUom: string;
  prPx: number | null;
  amCost: number | null;
  flLot: boolean;
  flActive: boolean;
  __new?: boolean;
};

export type ItemFilters = {
  item: string;
  type: ItemType | "";
};

export type EditableItemField =
  | "cdItem"
  | "nmItem"
  | "fgType"
  | "cdCategory"
  | "cdUom"
  | "prPx"
  | "flLot"
  | "flActive";

export type ItemEditResult =
  | { ok: true; value: string | number | boolean | null }
  | { ok: false; message: string };

/** EnOption codes are strings; fgType stays numeric in ItemRow/ItemFilters. */
export const itemTypeOptions: EnOption[] = [
  { code: "10", name: "Stock" },
  { code: "20", name: "Non-stock" },
  { code: "30", name: "Service" },
];

export const itemUomOptions: EnOption[] = [
  { code: "EA", name: "Each" },
  { code: "KG", name: "Kilogram" },
  { code: "BOX", name: "Box" },
];

export const initialItemFilters: ItemFilters = { item: "", type: "" };

export function createSampleItems(companyCode: string): ItemRow[] {
  return [
    {
      id: `${companyCode}-item-1001`,
      cdCompany: companyCode,
      cdItem: "ITEM-1001",
      nmItem: "A4 copy paper",
      fgType: 10,
      cdCategory: "Office supplies",
      cdUom: "EA",
      prPx: 2.5,
      amCost: 1.75,
      flLot: false,
      flActive: true,
    },
    {
      id: `${companyCode}-item-1002`,
      cdCompany: companyCode,
      cdItem: "ITEM-1002",
      nmItem: "Packing carton",
      fgType: 10,
      cdCategory: "Packaging",
      cdUom: "BOX",
      prPx: 18,
      amCost: 13.25,
      flLot: false,
      flActive: true,
    },
    {
      id: `${companyCode}-item-1003`,
      cdCompany: companyCode,
      cdItem: "ITEM-1003",
      nmItem: "Installation service",
      fgType: 30,
      cdCategory: "Services",
      cdUom: "EA",
      prPx: 45,
      amCost: null,
      flLot: false,
      flActive: true,
    },
  ];
}

export function filterItems(items: ItemRow[], filters: ItemFilters): ItemRow[] {
  const query = filters.item.trim().toLocaleLowerCase();
  return items.filter((item) => {
    if (
      query &&
      !`${item.cdItem} ${item.nmItem} ${item.cdCategory ?? ""} ${item.cdUom}`
        .toLocaleLowerCase()
        .includes(query) &&
      !item.__new
    ) {
      return false;
    }
    return filters.type === "" || item.fgType === filters.type;
  });
}

export function validateItemField(
  field: EditableItemField,
  raw: unknown,
): ItemEditResult {
  if (field === "cdItem") {
    const value = String(raw ?? "").trim();
    if (!value) return { ok: false, message: "Item code is required." };
    if (value.length > 30) {
      return { ok: false, message: "Item code cannot exceed 30 characters." };
    }
    return { ok: true, value };
  }

  if (field === "nmItem") {
    const value = String(raw ?? "").trim();
    if (!value) return { ok: false, message: "Item name is required." };
    if (value.length > 200) {
      return { ok: false, message: "Item name cannot exceed 200 characters." };
    }
    return { ok: true, value };
  }

  if (field === "fgType") {
    const value = Number(raw);
    if (itemTypeOptions.some((option) => Number(option.code) === value)) {
      return { ok: true, value };
    }
    return { ok: false, message: "Choose a valid item type." };
  }

  if (field === "cdCategory") {
    const value = String(raw ?? "").trim();
    if (value.length > 30) {
      return { ok: false, message: "Category cannot exceed 30 characters." };
    }
    return { ok: true, value: value || null };
  }

  if (field === "cdUom") {
    const value = String(raw ?? "");
    if (!itemUomOptions.some((option) => option.code === value)) {
      return { ok: false, message: "Choose a valid unit of measure." };
    }
    return { ok: true, value };
  }

  if (field === "prPx") {
    return validateAmount(raw, "Price");
  }

  if (field === "flLot" || field === "flActive") {
    if (typeof raw === "boolean") return { ok: true, value: raw };
    return { ok: false, message: "Choose a valid checkbox value." };
  }

  return { ok: false, message: "This item field cannot be edited." };
}

export function validateItems(items: ItemRow[]): string | null {
  const codes = new Set<string>();
  for (const item of items) {
    if (!item.cdCompany.trim() || item.cdCompany.length > 10) {
      return "Company code is required and cannot exceed 10 characters.";
    }
    const code = validateItemField("cdItem", item.cdItem);
    if (!code.ok) return code.message;
    const name = validateItemField("nmItem", item.nmItem);
    if (!name.ok) return name.message;
    const type = validateItemField("fgType", item.fgType);
    if (!type.ok) return type.message;
    const category = validateItemField("cdCategory", item.cdCategory);
    if (!category.ok) return category.message;
    const uom = validateItemField("cdUom", item.cdUom);
    if (!uom.ok) return uom.message;
    const price = validateItemField("prPx", item.prPx);
    if (!price.ok) return price.message;
    const cost = validateAmount(item.amCost, "Cost");
    if (!cost.ok) return cost.message;

    const key = `${item.cdCompany}\u0000${item.cdItem}`;
    if (codes.has(key)) return `Duplicate item code "${item.cdItem}".`;
    codes.add(key);
  }
  return null;
}

function validateAmount(raw: unknown, label: string): ItemEditResult {
  if (raw == null || raw === "") return { ok: true, value: null };
  const value = Number(raw);
  if (!Number.isFinite(value) || value < 0 || value >= 1_000_000_000_000) {
    return {
      ok: false,
      message: `${label} must be a non-negative number within the database range.`,
    };
  }
  const [coefficient, exponentText] = value.toString().toLowerCase().split("e");
  const exponent = Number(exponentText ?? 0);
  const decimalPlaces = Math.max(
    0,
    (coefficient.split(".")[1]?.length ?? 0) - exponent,
  );
  if (decimalPlaces > 6) {
    return { ok: false, message: `${label} cannot have more than 6 decimal places.` };
  }
  return { ok: true, value };
}
