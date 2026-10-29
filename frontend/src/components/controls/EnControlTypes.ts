import type { Ref } from "react";

export type EnOption = {
  code: string;
  name: string;
  [key: string]: unknown;
};

export type EnFocusTarget = "current" | "next";

export interface EnValueControlProps {
  defaultValue?: string;
  onValueChanged?: (value: string) => void;
  isReadOnly?: boolean;
  isRequired?: boolean;
  isEditable?: boolean;
  inputRef?: Ref<HTMLInputElement>;
  isSearchPanel?: boolean;
  onFocus?: (target: EnFocusTarget) => void;
}

export const controlHeight = 30;
