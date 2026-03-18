import { ComponentPropsWithoutRef, forwardRef, useId } from "react";
import { Field } from "./Field";

interface TextareaFieldProps extends ComponentPropsWithoutRef<"textarea"> {
  label?: string;
  hint?: string;
  error?: string;
  fieldClassName?: string;
}

export const TextareaField = forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
  function TextareaField(
    {
      id,
      label,
      hint,
      error,
      required,
      className,
      fieldClassName,
      ...textareaProps
    },
    ref,
  ) {
    const generatedId = useId();
    const textareaId = id ?? generatedId;
    const describedBy = error
      ? `${textareaId}-error`
      : hint
        ? `${textareaId}-hint`
        : undefined;

    return (
      <Field
        label={label}
        htmlFor={textareaId}
        hint={hint ? <span id={`${textareaId}-hint`}>{hint}</span> : undefined}
        error={error ? <span id={`${textareaId}-error`}>{error}</span> : undefined}
        required={required}
        className={fieldClassName}
      >
        <textarea
          {...textareaProps}
          ref={ref}
          id={textareaId}
          required={required}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={describedBy}
          className={["field-control", error ? "is-invalid" : "", className ?? ""]
            .filter(Boolean)
            .join(" ")}
        />
      </Field>
    );
  },
);
