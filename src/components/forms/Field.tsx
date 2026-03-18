import { ReactNode } from "react";

interface FieldProps {
  label?: ReactNode;
  htmlFor?: string;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  className?: string;
  children: ReactNode;
}

export function Field({
  label,
  htmlFor,
  hint,
  error,
  required = false,
  className,
  children,
}: FieldProps) {
  const classes = ["field"];
  if (className) classes.push(className);

  return (
    <div className={classes.join(" ")}>
      {label ? (
        <label className="field-label" htmlFor={htmlFor}>
          <span>{label}</span>
          {required ? <span className="field-required">Required</span> : null}
        </label>
      ) : null}
      {children}
      {error ? (
        <p className="field-error" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="field-hint">{hint}</p>
      ) : null}
    </div>
  );
}
