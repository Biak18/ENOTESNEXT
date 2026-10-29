import type { EnPopupColumn } from "./EnSelectionDialog";

export interface EnPopupSetting {
  title: string;
  columns: EnPopupColumn[];
  searchField?: string;
  autoSearch?: boolean;
  multiple?: boolean;
}

export const EnPopupSettings: Record<string, EnPopupSetting> = {
  customer: {
    title: "Select customer",
    columns: [
      { field: "customerCode", label: "Code" },
      { field: "customerName", label: "Name" },
      { field: "businessNumber", label: "Business number" },
    ],
    searchField: "customerCode",
  },
  item: {
    title: "Select item",
    columns: [
      { field: "itemCode", label: "Code" },
      { field: "itemName", label: "Name" },
      { field: "unit", label: "Unit" },
    ],
    searchField: "itemCode",
  },
  employee: {
    title: "Select employee",
    columns: [
      { field: "employeeId", label: "Employee ID" },
      { field: "employeeName", label: "Name" },
      { field: "department", label: "Department" },
    ],
    searchField: "employeeId",
  },
};
