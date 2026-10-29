export type SaleLine = {
  id: string;
  itemCode: string;
  description: string;
  category: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  amount: number;
};

export type SaleDraft = {
  invoiceNumber: string;
  customer: string;
  saleDate: string;
  dueDate: string;
  currency: string;
  reference: string;
  notes: string;
};

export type SaleFilters = {
  item: string;
  category: string;
  periodFrom: string;
  periodTo: string;
};

export type EditResult =
  | { ok: true; value: string | number }
  | { ok: false; message: string };

export type ExportCell =
  | string
  | number
  | { value: number; type: NumberConstructor; format?: string }
  | { value: Date; format: string };

export const customerOptions = [
  "Pioneer Retail",
  "Thiri Mart",
  "Central Office",
  "Nilar Grocery",
];

export const saleCategoryOptions = [
  "Office supplies",
  "Writing",
  "Point of sale",
  "Filing",
  "Hardware",
];

export const currencyOptions = ["USD", "MMK"];

const maxQuantity = 1_000_000;
const maxUnitPrice = 1_000_000_000;
const maxDescriptionLength = 120;

export const initialSaleDraft: SaleDraft = {
  invoiceNumber: "SA-2026-0248",
  customer: "Pioneer Retail",
  saleDate: "2026-10-22",
  dueDate: "2026-11-21",
  currency: "USD",
  reference: "SO-1187",
  notes: "Deliver with the weekly office-supply run.",
};

export const initialSaleFilters: SaleFilters = {
  item: "",
  category: "",
  periodFrom: "",
  periodTo: "",
};

export const initialSaleLines: SaleLine[] = [
  {
    id: "so-line-1",
    itemCode: "ITM-1001",
    description: "A4 Copy Paper, 80 gsm",
    category: "Office supplies",
    unit: "Ream",
    quantity: 40,
    unitPrice: 5.6,
    amount: 224,
  },
  {
    id: "so-line-2",
    itemCode: "ITM-1005",
    description: "Lever Arch File, Navy",
    category: "Filing",
    unit: "Each",
    quantity: 20,
    unitPrice: 4.1,
    amount: 82,
  },
  {
    id: "so-line-3",
    itemCode: "ITM-1009",
    description: "Thermal Label Roll, 50x30",
    category: "Point of sale",
    unit: "Roll",
    quantity: 60,
    unitPrice: 3.0,
    amount: 180,
  },
  {
    id: "so-line-4",
    itemCode: "ITM-1011",
    description: "Gel Pen, 0.5 mm",
    category: "Writing",
    unit: "Box",
    quantity: 15,
    unitPrice: 6.4,
    amount: 96,
  },
];

export function lineAmount(line: Pick<SaleLine, "quantity" | "unitPrice">) {
  const quantity = Number(line.quantity);
  const unitPrice = Number(line.unitPrice);
  if (!Number.isFinite(quantity) || !Number.isFinite(unitPrice)) return 0;
  return quantity * unitPrice;
}

export function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function withDerivedAmount(line: SaleLine): SaleLine {
  return { ...line, amount: lineAmount(line) };
}

export function validateEditValue(prop: string, raw: unknown): EditResult {
  if (prop === "description") {
    const value = String(raw ?? "").trim();
    if (!value) return { ok: false, message: "Description cannot be blank." };
    if (value.length > maxDescriptionLength) {
      return {
        ok: false,
        message: `Description cannot exceed ${maxDescriptionLength} characters.`,
      };
    }
    return { ok: true, value };
  }
  if (prop === "category") {
    const value = String(raw ?? "").trim();
    if (!saleCategoryOptions.includes(value)) {
      return { ok: false, message: "Choose a category from the list." };
    }
    return { ok: true, value };
  }
  if (prop === "quantity") {
    const value = Number(raw);
    if (!Number.isFinite(value)) {
      return { ok: false, message: "Quantity must be a number." };
    }
    if (value <= 0) {
      return { ok: false, message: "Quantity must be greater than zero." };
    }
    if (value > maxQuantity) {
      return { ok: false, message: `Quantity cannot exceed ${maxQuantity}.` };
    }
    return { ok: true, value };
  }
  if (prop === "unitPrice") {
    const value = Number(raw);
    if (!Number.isFinite(value)) {
      return { ok: false, message: "Unit price must be a number." };
    }
    if (value < 0) {
      return { ok: false, message: "Unit price cannot be negative." };
    }
    if (value > maxUnitPrice) {
      return { ok: false, message: `Unit price cannot exceed ${maxUnitPrice}.` };
    }
    return { ok: true, value };
  }
  return { ok: false, message: `${prop} cannot be edited.` };
}

export function validateLine(line: SaleLine): string | null {
  if (!line.description.trim()) {
    return "Description is required on every line.";
  }
  const categoryCheck = validateEditValue("category", line.category);
  if (!categoryCheck.ok) return categoryCheck.message;
  const quantityCheck = validateEditValue("quantity", line.quantity);
  if (!quantityCheck.ok) return quantityCheck.message;
  const priceCheck = validateEditValue("unitPrice", line.unitPrice);
  if (!priceCheck.ok) return priceCheck.message;
  return null;
}

export function validateDraft(
  draft: SaleDraft,
  lines: SaleLine[],
): string | null {
  if (!draft.customer.trim()) {
    return "Choose a customer before saving this local draft.";
  }
  if (!draft.saleDate) {
    return "Enter a sale date before saving this local draft.";
  }
  if (draft.dueDate && draft.saleDate && draft.dueDate < draft.saleDate) {
    return "The due date cannot be earlier than the sale date.";
  }
  if (!lines.length) {
    return "Add at least one sale line before saving this local draft.";
  }
  for (const line of lines) {
    const problem = validateLine(line);
    if (problem) return problem;
  }
  return null;
}

export function summarize(lines: SaleLine[]) {
  return lines.reduce(
    (total, line) => {
      total.quantity += Number(line.quantity) || 0;
      total.amount += lineAmount(line);
      return total;
    },
    { quantity: 0, amount: 0 },
  );
}

export function filterSaleLines(lines: SaleLine[], filters: SaleFilters) {
  const item = filters.item.trim().toLowerCase();
  return lines.filter((line) => {
    if (item) {
      const haystack =
        `${line.itemCode} ${line.description} ${line.category}`.toLowerCase();
      if (!haystack.includes(item)) return false;
    }
    if (filters.category && line.category !== filters.category) return false;
    return true;
  });
}

export function createLine(id: string, index: number): SaleLine {
  return {
    id,
    itemCode: `NEW-${String(index).padStart(3, "0")}`,
    description: "New sale item",
    category: saleCategoryOptions[0],
    unit: "Each",
    quantity: 1,
    unitPrice: 0,
    amount: 0,
  };
}

export function buildExportSheet(
  draft: SaleDraft,
  lines: SaleLine[],
): ExportCell[][] {
  const totals = summarize(lines);
  const header: ExportCell[] = [
    "Item code",
    "Description",
    "Category",
    "Unit",
    "Quantity",
    "Unit price",
    "Line total",
  ];
  const body: ExportCell[][] = lines.map((line) => [
    line.itemCode,
    line.description,
    line.category,
    line.unit,
    { value: Number(line.quantity), type: Number },
    { value: roundMoney(Number(line.unitPrice)), type: Number, format: "0.00" },
    { value: roundMoney(lineAmount(line)), type: Number, format: "0.00" },
  ]);
  return [
    ["Sales invoice", draft.invoiceNumber],
    ["Customer", draft.customer],
    ["Sale date", { value: toDate(draft.saleDate), format: "yyyy-mm-dd" }],
    ["Due date", { value: toDate(draft.dueDate), format: "yyyy-mm-dd" }],
    ["Currency", draft.currency],
    ["Reference", draft.reference],
    ["Status", "Local draft - not saved to a server"],
    [],
    header,
    ...body,
    [
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
