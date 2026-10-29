import EnSelectionDialog from "./EnSelectionDialog";
import type { EnPopupColumn, EnPopupRow } from "./EnSelectionDialog";

export interface EnSinglePopupProps<Row extends EnPopupRow> {
  open: boolean;
  title?: string;
  rows: Row[];
  columns: EnPopupColumn[];
  keyField?: keyof Row;
  searchLabel?: string;
  onClose: () => void;
  onSelect: (row: Row) => void;
}

export default function EnSinglePopup<Row extends EnPopupRow>({
  title = "Select a record",
  onSelect,
  ...props
}: EnSinglePopupProps<Row>) {
  return (
    <EnSelectionDialog
      {...props}
      title={title}
      multiple={false}
      onConfirm={(rows) => {
        const row = rows[0];
        if (row) onSelect(row);
      }}
    />
  );
}
