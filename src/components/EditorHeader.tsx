import { steps, type EditorStep } from "../app/editorConfig";
import { ProposalDraft } from "../types";

interface EditorHeaderProps {
  activeProposal: ProposalDraft;
  step: EditorStep;
  onStepChange: (step: EditorStep) => void;
}

export function EditorHeader({ activeProposal, step, onStepChange }: EditorHeaderProps) {
  return (
    <div className="panel">
      <div className="proposal-heading">
        <h2>{activeProposal.name || activeProposal.projectTitle || "New Proposal"}</h2>
        <span className="status-pill">{activeProposal.status}</span>
      </div>
      <div className="stepper-header">
        <p className="stepper-title">
          Step {step} of {steps.length}: <strong>{steps[step - 1].label}</strong>
        </p>
        <div className="stepper-progress-track" aria-hidden="true">
          <div className="stepper-progress-fill" style={{ width: `${(step / steps.length) * 100}%` }} />
        </div>
      </div>
      <div className="stepper-grid" role="tablist" aria-label="Proposal steps">
        {steps.map((stepItem) => {
          const isActive = step === stepItem.id;
          const isComplete = step > stepItem.id;
          return (
            <button
              key={stepItem.id}
              onClick={() => onStepChange(stepItem.id)}
              className={`step-chip ${isActive ? "active" : ""} ${isComplete ? "complete" : ""}`}
            >
              <span className="step-chip-number">{stepItem.id}</span>
              <span className="step-chip-label">{stepItem.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
