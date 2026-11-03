import { forwardRef, useImperativeHandle } from "react";
import type { ReactNode } from "react";
import EnDynamicForm from "./EnDynamicForm";
import EnFormSkeleton from "./EnFormSkeleton";
import useEnSyncedState from "../components/controls/useEnSyncedState";
import { isEnFormValid } from "./EnFormTypes";
import type { EnFormData, EnFormField, EnFormHandle, EnFormValue } from "./EnFormTypes";

const EMPTY_FORM_DATA: EnFormData = {};

export interface EnSharedFormProps {
  fields: EnFormField[];
  defaultValues?: EnFormData;
  title?: string;
  header?: ReactNode;
  columns?: number;
  onButtonClick?: (fieldId: string) => void;
  onValueChanged?: (fieldId: string, value: EnFormValue, values: EnFormData) => void;
  /** When truthy, the form body renders as a layout-preserving skeleton
   * (mirroring `fields`) instead of mounting the editable controls. */
  busy?: boolean;
}

const EnSharedForm = forwardRef<EnFormHandle, EnSharedFormProps>(
  (
    {
      fields,
      defaultValues = EMPTY_FORM_DATA,
      title,
      header,
      columns = 2,
      onButtonClick,
      onValueChanged,
      busy,
    },
    ref,
  ) => {
  const [values, setValues] = useEnSyncedState<EnFormData>(
    { ...defaultValues },
    defaultValues,
  );

  useImperativeHandle(ref, () => ({
    getFormData: () => values,
    setFormData: (data) => setValues({ ...data }),
    validate: () => isEnFormValid(fields, values),
  }), [fields, setValues, values]);

  const updateValue = (fieldId: string, value: EnFormValue) => {
    const next = { ...values, [fieldId]: value };
    setValues(next);
    onValueChanged?.(fieldId, value, next);
  };

  const content = busy ? (
    // Busy: skeleton keeps the pending form's layout stable (no control mounts).
    <div className="min-w-0 p-3" aria-busy="true" aria-live="polite">
      <EnFormSkeleton fields={fields} columns={columns} />
    </div>
  ) : (
    <div className="min-w-0 p-3">
      <EnDynamicForm
        fields={fields}
        values={values}
        onChange={updateValue}
        onFieldButtonClick={onButtonClick}
        columns={columns}
      />
    </div>
  );

  return title ? (
    <section className="min-w-0 overflow-hidden rounded border border-[var(--line)] bg-white">
      <header className="flex min-h-9 items-center justify-between border-b border-[var(--line)] bg-[var(--lavender-light)] px-3">
        <h2 className="m-0 text-sm font-semibold">{title}</h2>
        {header}
      </header>
      {content}
    </section>
  ) : content;
});

export default EnSharedForm;
