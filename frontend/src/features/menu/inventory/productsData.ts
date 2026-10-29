export type Product = {
  id: string;
  itemCode: string;
  name: string;
  category: string;
  unit: string;
  price: number;
  inStock: number;
};

export type ProductFilters = {
  item: string;
  category: string;
};

export type EditResult =
  | { ok: true; value: string | number }
  | { ok: false; message: string };

export const productCategoryOptions = [
  "Office supplies",
  "Writing",
  "Point of sale",
  "Filing",
  "Hardware",
];

export const productUnitOptions = [
  "Each",
  "Box",
  "Pack",
  "Ream",
  "Roll",
];

const maxPrice = 1_000_000_000;
const maxStock = 1_000_000;
const maxNameLength = 120;

export const initialProductFilters: ProductFilters = {
  item: "",
  category: "",
};

export const initialProducts: Product[] = [
  { id: "itm-1", itemCode: "ITM-1001", name: "A4 Copy Paper, 80 gsm", category: "Office supplies", unit: "Ream", price: 4.8, inStock: 128 },
  { id: "itm-2", itemCode: "ITM-1002", name: "Ballpoint Pen, Blue", category: "Writing", unit: "Box", price: 8.5, inStock: 46 },
  { id: "itm-3", itemCode: "ITM-1003", name: "Thermal Receipt Roll", category: "Point of sale", unit: "Pack", price: 12, inStock: 32 },
  { id: "itm-4", itemCode: "ITM-1004", name: "Desktop Calculator", category: "Office supplies", unit: "Each", price: 16.9, inStock: 18 },
  { id: "itm-5", itemCode: "ITM-1005", name: "Lever Arch File, Navy", category: "Filing", unit: "Each", price: 3.25, inStock: 74 },
  { id: "itm-6", itemCode: "ITM-1006", name: "Permanent Marker, Black", category: "Writing", unit: "Box", price: 11.4, inStock: 58 },
  { id: "itm-7", itemCode: "ITM-1007", name: "Receipt Printer Paper", category: "Point of sale", unit: "Pack", price: 9.75, inStock: 40 },
  { id: "itm-8", itemCode: "ITM-1008", name: "Document Wallet, A4", category: "Filing", unit: "Pack", price: 6.2, inStock: 61 },
  { id: "itm-9", itemCode: "ITM-1009", name: "Thermal Label Roll, 50x30", category: "Point of sale", unit: "Roll", price: 2.4, inStock: 210 },
  { id: "itm-10", itemCode: "ITM-1010", name: "Tape Dispenser, Heavy Duty", category: "Hardware", unit: "Each", price: 18.6, inStock: 22 },
];

export function validateEditValue(prop: string, raw: unknown): EditResult {
  if (prop === "name") {
    const value = String(raw ?? "").trim();
    if (!value) return { ok: false, message: "Product name cannot be blank." };
    if (value.length > maxNameLength) {
      return { ok: false, message: `Product name cannot exceed ${maxNameLength} characters.` };
    }
    return { ok: true, value };
  }
  if (prop === "category") {
    const value = String(raw ?? "").trim();
    if (!productCategoryOptions.includes(value)) {
      return { ok: false, message: "Choose a category from the list." };
    }
    return { ok: true, value };
  }
  if (prop === "unit") {
    const value = String(raw ?? "").trim();
    if (!productUnitOptions.includes(value)) {
      return { ok: false, message: "Choose a unit from the list." };
    }
    return { ok: true, value };
  }
  if (prop === "price") {
    const value = Number(raw);
    if (!Number.isFinite(value)) return { ok: false, message: "Price must be a number." };
    if (value < 0) return { ok: false, message: "Price cannot be negative." };
    if (value > maxPrice) return { ok: false, message: `Price cannot exceed ${maxPrice}.` };
    return { ok: true, value };
  }
  if (prop === "inStock") {
    const value = Number(raw);
    if (!Number.isFinite(value)) return { ok: false, message: "Stock must be a number." };
    if (value < 0) return { ok: false, message: "Stock cannot be negative." };
    if (value > maxStock) return { ok: false, message: `Stock cannot exceed ${maxStock}.` };
    return { ok: true, value };
  }
  return { ok: false, message: `${prop} cannot be edited.` };
}

export function filterProducts(products: Product[], filters: ProductFilters) {
  const item = filters.item.trim().toLowerCase();
  return products.filter((product) => {
    if (item) {
      const haystack = `${product.itemCode} ${product.name} ${product.category}`.toLowerCase();
      if (!haystack.includes(item)) return false;
    }
    if (filters.category && product.category !== filters.category) return false;
    return true;
  });
}

export function createProduct(id: string, index: number): Product {
  return {
    id,
    itemCode: `ITM-${String(1000 + index).padStart(4, "0")}`,
    name: "New product",
    category: productCategoryOptions[0],
    unit: "Each",
    price: 0,
    inStock: 0,
  };
}
