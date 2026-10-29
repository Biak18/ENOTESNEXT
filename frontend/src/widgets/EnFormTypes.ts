import type { ReactNode } from "react";

export type EnFormValue = string | number | boolean | null;
export type EnFormData = Record<string, EnFormValue>;
export type EnFormFieldType =
  | "text"
  | "number"
  | "date"
  | "month"
  | "select"
  | "checkbox"
  | "radio"
  | "textarea"
  | "button"
  | "group";

export interface EnFormOption {
  code: string;
  name: string;
}

export interface EnFormField {
  id: string;
  label: string;
  type?: EnFormFieldType;
  options?: EnFormOption[];
  required?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  rows?: number;
  helperText?: string;
  defaultValue?: EnFormValue;
  render?: (value: EnFormValue, onChange: (value: EnFormValue) => void) => ReactNode;
}

export interface EnFormHandle {
  getFormData: () => EnFormData;
  setFormData: (data: EnFormData) => void;
  validate: () => boolean;
}

export function isEnFormValid(fields: EnFormField[], values: EnFormData) {
  return fields.every((field) => {
    if (!field.required) return true;
    const value = values[field.id];
    if (field.type === "checkbox") return value === true || value === "Y";
    return value !== undefined && value !== null && value !== "";
  });
}
