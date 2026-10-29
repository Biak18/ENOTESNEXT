import EnSelectionDialog from "./EnSelectionDialog";
import type { EnPopupColumn, EnPopupRow } from "./EnSelectionDialog";

export interface EnMultiPopupProps<Row extends EnPopupRow> {
  open: boolean;
  title?: string;
  rows: Row[];
  columns: EnPopupColumn[];
  keyField?: keyof Row;
  searchLabel?: string;
  onClose: () => void;
  onSelect: (rows: Row[]) => void;
}

export default function EnMultiPopup<Row extends EnPopupRow>({
  title = "Select records",
  onSelect,
  ...props
}: EnMultiPopupProps<Row>) {
  return (
    <EnSelectionDialog
      {...props}
      title={title}
      multiple
      onConfirm={onSelect}
    />
  );
}
