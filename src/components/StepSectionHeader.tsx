import { ReactNode } from "react";

interface StepSectionHeaderProps {
  title: string;
  description?: string;
  summary: ReactNode;
}

export function StepSectionHeader({
  title,
  description,
  summary,
}: StepSectionHeaderProps) {
  return (
    <div className="step-section-header">
      <div className="step-section-copy">
        <h3>{title}</h3>
        {description ? (
          <p className="step-section-description">{description}</p>
        ) : null}
      </div>
      {summary}
    </div>
  );
}
