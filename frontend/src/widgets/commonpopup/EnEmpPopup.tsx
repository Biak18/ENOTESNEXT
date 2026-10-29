import EnSinglePopup from "./EnSinglePopup";
import type { EnSinglePopupProps } from "./EnSinglePopup";
import type { EnPopupRow } from "./EnSelectionDialog";

export interface EnEmployeeRow extends EnPopupRow {
  employeeId: string;
  employeeName: string;
  department?: string;
}

export type EnEmpPopupProps = Omit<
  EnSinglePopupProps<EnEmployeeRow>,
  "title" | "keyField" | "searchLabel" | "columns"
> & {
  columns?: EnSinglePopupProps<EnEmployeeRow>["columns"];
};

export default function EnEmpPopup({
  columns = [
    { field: "employeeId", label: "Employee ID" },
    { field: "employeeName", label: "Employee name" },
    { field: "department", label: "Department" },
  ],
  ...props
}: EnEmpPopupProps) {
  return (
    <EnSinglePopup
      {...props}
      title="Select an employee"
      keyField="employeeId"
      searchLabel="Search employees"
      columns={columns}
    />
  );
}
