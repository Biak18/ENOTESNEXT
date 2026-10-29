import type { ReactNode } from "react";
import EnCommonModal from "./EnCommonModal";

export interface EnIssueModalProps {
  open: boolean;
  title: string;
  children?: ReactNode;
  width?: number | string;
  height?: number | string;
  showConfirm?: boolean;
  onConfirm?: () => void | Promise<void>;
  onClose: () => void;
}

export default function EnIssueModal(props: EnIssueModalProps) {
  return <EnCommonModal {...props} confirmLabel="Confirm" cancelLabel="Close" />;
}
