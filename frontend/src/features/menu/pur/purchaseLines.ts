export type PurchaseLine = {
  id: string;
  itemCode: string;
  description: string;
  category: string;
  location: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  amount: number;
};

export type PurchaseDraft = {
  orderNumber: string;
  supplier: string;
  orderDate: string;
  expectedDate: string;
  currency: string;
  reference: string;
  notes: string;
};

export type PurchaseFilters = {
  item: string;
  category: string;
  location: string;
  periodFrom: string;
  periodTo: string;
};

export type GroupByKey = "none" | "category" | "location";

export type EditableProp = "description" | "category" | "location" | "quantity" | "unitPrice";

export type EditResult =
  | { ok: true; value: string | number }
  | { ok: false; message: string };

export type ExportCell = string | number | { value: number; type: NumberConstructor; format?: string } | { value: Date; format: string };

export const supplierOptions = [
  "Golden Star Trading",
  "City Office Supply",
  "Mandalay Wholesale",
  "Apex Stationery",
];

export const categoryOptions = [
  "Office supplies",
  "Writing",
  "Point of sale",
  "Filing",
  "Hardware",
];

export const locationOptions = [
  "Yangon Main",
  "Mandalay",
  "Naypyidaw",
];

export const currencyOptions = ["USD", "MMK"];

export const editableProps: EditableProp[] = [
  "description",
  "category",
  "location",
  "quantity",
  "unitPrice",
];

const maxQuantity = 1_000_000;
const maxUnitPrice = 1_000_000_000;
const maxDescriptionLength = 120;

export const initialDraft: PurchaseDraft = {
  orderNumber: "PO-2026-0184",
  supplier: "Golden Star Trading",
  orderDate: "2026-10-22",
  expectedDate: "2026-10-31",
  currency: "USD",
  reference: "GST-INV-2086",
  notes: "Delivered to the Yangon Main store counter.",
};

export const initialFilters: PurchaseFilters = {
  item: "",
  category: "",
  location: "",
  periodFrom: "",
  periodTo: "",
};

export const initialLines: PurchaseLine[] = [
  {
    id: "po-line-1",
    itemCode: "ITM-1001",
    description: "A4 Copy Paper, 80 gsm",
    category: "Office supplies",
    location: "Yangon Main",
    unit: "Ream",
    quantity: 24,
    unitPrice: 4.8,
    amount: 115.2,
  },
  {
    id: "po-line-2",
    itemCode: "ITM-1002",
    description: "Ballpoint Pen, Blue",
    category: "Writing",
    location: "Yangon Main",
    unit: "Box",
    quantity: 12,
    unitPrice: 8.5,
    amount: 102,
  },
  {
    id: "po-line-3",
    itemCode: "ITM-1003",
    description: "Thermal Receipt Roll",
    category: "Point of sale",
    location: "Mandalay",
    unit: "Pack",
    quantity: 18,
    unitPrice: 12,
    amount: 216,
  },
  {
    id: "po-line-4",
    itemCode: "ITM-1004",
    description: "Desktop Calculator",
    category: "Office supplies",
    location: "Yangon Main",
    unit: "Each",
    quantity: 6,
    unitPrice: 16.9,
    amount: 101.4,
  },
  {
    id: "po-line-5",
    itemCode: "ITM-1005",
    description: "Lever Arch File, Navy",
    category: "Filing",
    location: "Naypyidaw",
    unit: "Each",
    quantity: 30,
    unitPrice: 3.25,
    amount: 97.5,
  },
  {
    id: "po-line-6",
    itemCode: "ITM-1006",
    description: "Permanent Marker, Black",
    category: "Writing",
    location: "Mandalay",
    unit: "Box",
    quantity: 8,
    unitPrice: 11.4,
    amount: 91.2,
  },
  {
    id: "po-line-7",
    itemCode: "ITM-1007",
    description: "Receipt Printer Paper",
    category: "Point of sale",
    location: "Yangon Main",
    unit: "Pack",
    quantity: 10,
    unitPrice: 9.75,
    amount: 97.5,
  },
  {
    id: "po-line-8",
    itemCode: "ITM-1008",
    description: "Document Wallet, A4",
    category: "Filing",
    location: "Naypyidaw",
    unit: "Pack",
    quantity: 15,
    unitPrice: 6.2,
    amount: 93,
  },
  {
    id: "po-line-9",
    itemCode: "ITM-1009",
    description: "Thermal Label Roll, 50x30",
    category: "Point of sale",
    location: "Naypyidaw",
    unit: "Roll",
    quantity: 40,
    unitPrice: 2.4,
    amount: 96,
  },
  {
    id: "po-line-10",
    itemCode: "ITM-1010",
    description: "Tape Dispenser, Heavy Duty",
    category: "Hardware",
    location: "Yangon Main",
    unit: "Each",
    quantity: 5,
    unitPrice: 18.6,
    amount: 93,
  },
  {
    id: "po-line-11",
    itemCode: "ITM-1011",
    description: "Gel Pen, 0.5 mm",
    category: "Writing",
    location: "Naypyidaw",
    unit: "Box",
    quantity: 20,
    unitPrice: 5.4,
    amount: 108,
  },
  {
    id: "po-line-12",
    itemCode: "ITM-1012",
    description: "Sticky Notes, 3x3 in",
    category: "Office supplies",
    location: "Mandalay",
    unit: "Pack",
    quantity: 25,
    unitPrice: 2.05,
    amount: 51.25,
  },
];

export function lineAmount(line: Pick<PurchaseLine, "quantity" | "unitPrice">) {
  const quantity = Number(line.quantity);
  const unitPrice = Number(line.unitPrice);
  if (!Number.isFinite(quantity) || !Number.isFinite(unitPrice)) return 0;
  return quantity * unitPrice;
}

export function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function withDerivedAmount(line: PurchaseLine): PurchaseLine {
  return { ...line, amount: lineAmount(line) };
}

export function validateEditValue(prop: string, raw: unknown): EditResult {
  if (prop === "description") {
    const value = String(raw ?? "").trim();
    if (!value) return { ok: false, message: "Description cannot be blank." };
    if (value.length > maxDescriptionLength) {
      return { ok: false, message: `Description cannot exceed ${maxDescriptionLength} characters.` };
    }
    return { ok: true, value };
  }
  if (prop === "category" || prop === "location") {
    const value = String(raw ?? "").trim();
    const options = prop === "category" ? categoryOptions : locationOptions;
    if (!options.includes(value)) {
      return { ok: false, message: `Choose a ${prop} from the list.` };
    }
    return { ok: true, value };
  }
  if (prop === "quantity") {
    const value = Number(raw);
    if (!Number.isFinite(value)) return { ok: false, message: "Quantity must be a number." };
    if (value <= 0) return { ok: false, message: "Quantity must be greater than zero." };
    if (value > maxQuantity) return { ok: false, message: `Quantity cannot exceed ${maxQuantity}.` };
    return { ok: true, value };
  }
  if (prop === "unitPrice") {
    const value = Number(raw);
    if (!Number.isFinite(value)) return { ok: false, message: "Unit price must be a number." };
    if (value < 0) return { ok: false, message: "Unit price cannot be negative." };
    if (value > maxUnitPrice) return { ok: false, message: `Unit price cannot exceed ${maxUnitPrice}.` };
    return { ok: true, value };
  }
  return { ok: false, message: `${prop} cannot be edited.` };
}

export function validateLine(line: PurchaseLine): string | null {
  if (!line.description.trim()) return "Description is required on every line.";
  const categoryCheck = validateEditValue("category", line.category);
  if (!categoryCheck.ok) return categoryCheck.message;
  const locationCheck = validateEditValue("location", line.location);
  if (!locationCheck.ok) return locationCheck.message;
  const quantityCheck = validateEditValue("quantity", line.quantity);
  if (!quantityCheck.ok) return quantityCheck.message;
  const priceCheck = validateEditValue("unitPrice", line.unitPrice);
  if (!priceCheck.ok) return priceCheck.message;
  return null;
}

export function validateDraft(draft: PurchaseDraft, lines: PurchaseLine[]): string | null {
  if (!draft.supplier.trim()) return "Choose a supplier before saving this local draft.";
  if (!draft.orderDate) return "Enter an order date before saving this local draft.";
  if (draft.expectedDate && draft.orderDate && draft.expectedDate < draft.orderDate) {
    return "The expected date cannot be earlier than the order date.";
  }
  if (!lines.length) return "Add at least one purchase line before saving this local draft.";
  for (const line of lines) {
    const problem = validateLine(line);
    if (problem) return problem;
  }
  return null;
}

export function summarize(lines: PurchaseLine[]) {
  return lines.reduce(
    (total, line) => {
      total.quantity += Number(line.quantity) || 0;
      total.amount += lineAmount(line);
      return total;
    },
    { quantity: 0, amount: 0 },
  );
}

export function groupSummaries(lines: PurchaseLine[], key: Exclude<GroupByKey, "none">) {
  const summary = new Map<string, { name: string; quantity: number; amount: number }>();
  for (const line of lines) {
    const name = String(line[key] ?? "");
    const entry = summary.get(name) ?? { name, quantity: 0, amount: 0 };
    entry.quantity += Number(line.quantity) || 0;
    entry.amount += lineAmount(line);
    summary.set(name, entry);
  }
  return [...summary.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export function filterLines(lines: PurchaseLine[], filters: PurchaseFilters) {
  const item = filters.item.trim().toLowerCase();
  return lines.filter((line) => {
    if (item) {
      const haystack = `${line.itemCode} ${line.description} ${line.category} ${line.location}`.toLowerCase();
      if (!haystack.includes(item)) return false;
    }
    if (filters.category && line.category !== filters.category) return false;
    if (filters.location && line.location !== filters.location) return false;
    return true;
  });
}

export function filterPurchaseLines(
  lines: PurchaseLine[],
  filters: PurchaseFilters,
  orderDate: string,
) {
  if (
    filters.periodFrom &&
    filters.periodTo &&
    filters.periodFrom > filters.periodTo
  ) {
    return [];
  }
  if (
    (filters.periodFrom || filters.periodTo) &&
    (!orderDate ||
      (filters.periodFrom && orderDate < filters.periodFrom) ||
      (filters.periodTo && orderDate > filters.periodTo))
  ) {
    return [];
  }
  return filterLines(lines, filters);
}

export function createLine(id: string, index: number): PurchaseLine {
  return {
    id,
    itemCode: `NEW-${String(index).padStart(3, "0")}`,
    description: "New purchase item",
    category: categoryOptions[0],
    location: locationOptions[0],
    unit: "Each",
    quantity: 1,
    unitPrice: 0,
    amount: 0,
  };
}

export function buildExportSheet(draft: PurchaseDraft, lines: PurchaseLine[]): ExportCell[][] {
  const totals = summarize(lines);
  const header: ExportCell[] = [
    "Item code",
    "Description",
    "Category",
    "Location",
    "Unit",
    "Quantity",
    "Unit price",
    "Line total",
  ];
  const body: ExportCell[][] = lines.map((line) => [
    line.itemCode,
    line.description,
    line.category,
    line.location,
    line.unit,
    { value: Number(line.quantity), type: Number },
    { value: roundMoney(Number(line.unitPrice)), type: Number, format: "0.00" },
    { value: roundMoney(lineAmount(line)), type: Number, format: "0.00" },
  ]);
  return [
    ["Purchase order", draft.orderNumber],
    ["Supplier", draft.supplier],
    ["Order date", { value: toDate(draft.orderDate), format: "yyyy-mm-dd" }],
    ["Expected date", { value: toDate(draft.expectedDate), format: "yyyy-mm-dd" }],
    ["Currency", draft.currency],
    ["Supplier reference", draft.reference],
    ["Status", "Local draft - not saved to a server"],
    [],
    header,
    ...body,
    [
      "",
      "",
      "",
      "",
      "Total",
      { value: totals.quantity, type: Number },
      "",
      { value: roundMoney(totals.amount), type: Number, format: "0.00" },
    ],
  ];
}

export function toDate(value: string) {
  if (!value) return new Date(0);
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? new Date(0) : parsed;
}
