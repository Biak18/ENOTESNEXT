import type { ReactNode } from "react";

export interface EnTabProps {
  value: string;
  selectedValue: string;
  children: ReactNode;
}

export default function EnTab({ value, selectedValue, children }: EnTabProps) {
  if (value !== selectedValue) return null;
  return (
    <div role="tabpanel" id={`en-tabpanel-${value}`} aria-labelledby={`en-tab-${value}`}>
      {children}
    </div>
  );
}
