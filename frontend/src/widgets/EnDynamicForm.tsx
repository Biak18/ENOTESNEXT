import { Button } from "@mui/material";
import EnCheckBox from "../components/controls/EnCheckBox";
import EnComboBox from "../components/controls/EnComboBox";
import EnDateBox from "../components/controls/EnDateBox";
import EnDateMonthBox from "../components/controls/EnDateMonthBox";
import EnMemoBox from "../components/controls/EnMemoBox";
import EnNumberBox from "../components/controls/EnNumberBox";
import EnRadioBox from "../components/controls/EnRadioBox";
import EnTextBox from "../components/controls/EnTextBox";
import type { EnOption } from "../components/controls/EnControlTypes";
import type { EnFormData, EnFormField, EnFormValue } from "./EnFormTypes";

interface EnDynamicFormProps {
  fields: EnFormField[];
  values: EnFormData;
  onChange: (fieldId: string, value: EnFormValue) => void;
  onFieldButtonClick?: (fieldId: string) => void;
  columns?: number;
}

function toEnOptions(options: { code: string; name: string }[] | undefined): EnOption[] {
  return (options ?? []).map((o) => ({ code: o.code, name: o.name }));
}

/**
 * Field-config-driven form (SNOTES SharedForm body). Each EnFormField maps to
 * the matching ENOTES En* control — EnTextBox/EnNumberBox/EnDateBox/
 * EnComboBox/EnCheckBox/EnRadioBox/EnMemoBox — so screens share one consistent
 * control set instead of raw MUI fields.
 */
export default function EnDynamicForm({
  fields,
  values,
  onChange,
  onFieldButtonClick,
  columns = 2,
}: EnDynamicFormProps) {
  return (
    <div
      className="grid min-w-0 gap-x-3 gap-y-2"
      style={{ gridTemplateColumns: `repeat(${Math.max(1, columns)}, minmax(0, 1fr))` }}
    >
      {fields.map((field) => {
        const value = values[field.id] ?? field.defaultValue ?? "";
        const disabled = field.disabled || field.readOnly;
        const handleChange = (next: EnFormValue) => onChange(field.id, next);
        const strValue = value == null ? "" : String(value);
        let control;

        if (field.render) {
          control = field.render(value, handleChange);
        } else if (field.type === "button") {
          control = (
            <Button
              type="button"
              variant="outlined"
              size="small"
              onClick={() => onFieldButtonClick?.(field.id)}
            >
              {field.label}
            </Button>
          );
        } else if (field.type === "group") {
          control = (
            <div className="border-b border-[var(--line)] pb-1 font-semibold">
              {field.label}
            </div>
          );
        } else if (field.type === "checkbox") {
          control = (
            <EnCheckBox
              label={field.label}
              defaultValue={value === true || value === "Y" ? "Y" : "N"}
              onValueChanged={(next) => handleChange(next === "Y")}
              isReadOnly={disabled}
            />
          );
        } else if (field.type === "radio") {
          control = (
            <EnRadioBox
              defaultValue={strValue}
              options={toEnOptions(field.options)}
              onValueChanged={(next) => handleChange(next)}
              isReadOnly={disabled}
            />
          );
        } else if (field.type === "number") {
          control = (
            <EnNumberBox
              defaultValue={value === "" || value == null ? 0 : Number(value)}
              onValueChanged={(next) => handleChange(next)}
              isReadOnly={disabled}
              isRequired={field.required}
              min={field.min}
              max={field.max}
              step={field.step}
            />
          );
        } else if (field.type === "date") {
          control = (
            <EnDateBox
              defaultValue={strValue}
              onValueChanged={(next) => handleChange(next)}
              isReadOnly={disabled}
              isRequired={field.required}
            />
          );
        } else if (field.type === "month") {
          control = (
            <EnDateMonthBox
              defaultValue={strValue}
              onValueChanged={(next) => handleChange(next)}
              isReadOnly={disabled}
              isRequired={field.required}
            />
          );
        } else if (field.type === "select") {
          control = (
            <EnComboBox
              defaultValue={strValue}
              options={toEnOptions(field.options)}
              onValueChanged={(next) => handleChange(next)}
              isReadOnly={disabled}
              isRequired={field.required}
            />
          );
        } else if (field.type === "textarea") {
          control = (
            <EnMemoBox
              defaultValue={strValue}
              onValueChanged={(next) => handleChange(next)}
              isReadOnly={disabled}
              isRequired={field.required}
              minRows={field.rows ?? 3}
            />
          );
        } else {
          // default: text
          control = (
            <EnTextBox
              defaultValue={strValue}
              onValueChanged={(next) => handleChange(next)}
              isReadOnly={disabled}
              isRequired={field.required}
              placeHolderText={field.placeholder}
            />
          );
        }

        return (
          <div
            key={field.id}
            className={field.type === "group" ? "col-span-full min-w-0" : "min-w-0"}
          >
            {field.type === "group" ? (
              control
            ) : (
              <div className="flex min-w-0 flex-col gap-1">
                {field.type !== "checkbox" && field.type !== "button" ? (
                  <label className="text-[11px] text-[#65768a]">
                    {field.label}
                    {field.required ? " *" : ""}
                  </label>
                ) : null}
                {control}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
