import { ComponentPropsWithoutRef, useId } from "react";
import { Field } from "./Field";

interface TextFieldProps extends ComponentPropsWithoutRef<"input"> {
  label?: string;
  hint?: string;
  error?: string;
  fieldClassName?: string;
}

export function TextField({
  id,
  label,
  hint,
  error,
  required,
  className,
  fieldClassName,
  ...inputProps
}: TextFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const describedBy = error
    ? `${inputId}-error`
    : hint
      ? `${inputId}-hint`
      : undefined;

  return (
    <Field
      label={label}
      htmlFor={inputId}
      hint={hint ? <span id={`${inputId}-hint`}>{hint}</span> : undefined}
      error={error ? <span id={`${inputId}-error`}>{error}</span> : undefined}
      required={required}
      className={fieldClassName}
    >
      <input
        {...inputProps}
        id={inputId}
        required={required}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={describedBy}
        className={["field-control", error ? "is-invalid" : "", className ?? ""]
          .filter(Boolean)
          .join(" ")}
      />
    </Field>
  );
}
