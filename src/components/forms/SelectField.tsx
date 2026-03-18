import { ComponentPropsWithoutRef, forwardRef, useId } from "react";
import { Field } from "./Field";

interface SelectFieldProps extends ComponentPropsWithoutRef<"select"> {
  label?: string;
  hint?: string;
  error?: string;
  fieldClassName?: string;
}

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  function SelectField(
    {
      id,
      label,
      hint,
      error,
      required,
      className,
      fieldClassName,
      children,
      ...selectProps
    },
    ref,
  ) {
    const generatedId = useId();
    const selectId = id ?? generatedId;
    const describedBy = error
      ? `${selectId}-error`
      : hint
        ? `${selectId}-hint`
        : undefined;

    return (
      <Field
        label={label}
        htmlFor={selectId}
        hint={hint ? <span id={`${selectId}-hint`}>{hint}</span> : undefined}
        error={error ? <span id={`${selectId}-error`}>{error}</span> : undefined}
        required={required}
        className={fieldClassName}
      >
        <select
          {...selectProps}
          ref={ref}
          id={selectId}
          required={required}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={describedBy}
          className={["field-control", error ? "is-invalid" : "", className ?? ""]
            .filter(Boolean)
            .join(" ")}
        >
          {children}
        </select>
      </Field>
    );
  },
);
