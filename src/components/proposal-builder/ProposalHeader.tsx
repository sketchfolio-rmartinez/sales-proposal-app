import { steps, type EditorStep } from "../../app/editorConfig";
import { ProposalDraft } from "../../types";
import "../shared/ProposalStatusPill.css";
import "./ProposalHeader.css";

interface ProposalHeaderProps {
  step: EditorStep;
  maxAccessibleStep: EditorStep;
  showWorkspaceMeta?: boolean;
  showStatusPill?: boolean;
  activeProposal?: ProposalDraft;
  onStepChange: (step: EditorStep) => void;
}

export function ProposalHeader({
  step,
  maxAccessibleStep,
  showWorkspaceMeta = true,
  showStatusPill = false,
  activeProposal,
  onStepChange,
}: ProposalHeaderProps) {
  return (
    <div
      className={`proposal-header ${showWorkspaceMeta ? "has-meta" : ""}`.trim()}
    >
      {showWorkspaceMeta && activeProposal ? (
        <div className="proposal-heading">
          <h2>
            {activeProposal.name ||
              activeProposal.projectTitle ||
              "New Proposal"}
          </h2>
          <span
            className={`status-pill status-pill--${activeProposal.status.toLowerCase()}`}
          >
            {activeProposal.status}
          </span>
        </div>
      ) : null}
      <div className="stepper-row">
        <div
          className="stepper-grid"
          role="tablist"
          aria-label="Proposal steps"
        >
          {steps.map((stepItem) => {
            const isActive = step === stepItem.id;
            const isComplete = step > stepItem.id;
            const isLocked = stepItem.id > maxAccessibleStep;
            return (
              <div
                key={stepItem.id}
                className={`step-node ${isActive ? "active" : ""} ${isComplete ? "complete" : ""} ${isLocked ? "locked" : ""}`}
              >
                <button
                  type="button"
                  onClick={() => onStepChange(stepItem.id)}
                  disabled={isLocked}
                  className="step-chip"
                  aria-label={`Step ${stepItem.id}: ${stepItem.label}`}
                  title={stepItem.label}
                >
                  <span className="step-chip-number">{stepItem.id}</span>
                </button>
                {stepItem.id < steps.length ? (
                  <span className="step-node-connector" aria-hidden="true" />
                ) : null}
              </div>
            );
          })}
        </div>
        {showStatusPill && activeProposal ? (
          <span
            className={`status-pill status-pill--${activeProposal.status.toLowerCase()}`}
          >
            {activeProposal.status}
          </span>
        ) : null}
      </div>
    </div>
  );
}
