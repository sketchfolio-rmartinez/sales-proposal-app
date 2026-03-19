interface SummaryPillProps {
  primaryLabel: string;
  primaryValue: string;
  secondaryLabel?: string;
  secondaryValue?: string;
  secondaryTone?: "default" | "warning";
}

export function SummaryPill({
  primaryLabel,
  primaryValue,
  secondaryLabel,
  secondaryValue,
  secondaryTone = "default",
}: SummaryPillProps) {
  return (
    <div className="summary-pill">
      <span className="summary-pill-item">
        <strong>{primaryLabel}:</strong> {primaryValue}
      </span>
      {secondaryLabel && secondaryValue ? (
        <span
          className={`summary-pill-item ${secondaryTone === "warning" ? "warning" : "muted"}`}
        >
          {secondaryLabel}: {secondaryValue}
        </span>
      ) : null}
    </div>
  );
}
