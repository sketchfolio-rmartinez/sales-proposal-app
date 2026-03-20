import { ReactNode } from "react";
import { ProposalDraft } from "../../types";
import { StepSectionHeader } from "./StepSectionHeader";
import "./ProposalStatusPill.css";
import "./ProposalStepIntroShell.css";

interface ProposalStepIntroShellProps {
  activeProposal: ProposalDraft;
  title: string;
  description?: string;
  summary: ReactNode;
  className?: string;
  showProposalMeta?: boolean;
}

export function ProposalStepIntroShell({
  activeProposal,
  title,
  description,
  summary,
  className = "",
  showProposalMeta = true,
}: ProposalStepIntroShellProps) {
  return (
    <div className={`panel step-section-shell proposal-step-intro-shell ${className}`.trim()}>
      {showProposalMeta ? (
        <>
          <div className="proposal-step-intro-top">
            <h2>{activeProposal.name || activeProposal.projectTitle || "New Proposal"}</h2>
            <span
              className={`status-pill status-pill--${activeProposal.status.toLowerCase()}`}
            >
              {activeProposal.status}
            </span>
          </div>
          <div className="proposal-step-intro-divider" aria-hidden="true" />
        </>
      ) : null}
      <StepSectionHeader
        title={title}
        description={description}
        summary={summary}
      />
    </div>
  );
}
