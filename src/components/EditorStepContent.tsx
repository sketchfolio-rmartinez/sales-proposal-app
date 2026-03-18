import { useState } from "react";
import {
  phases,
  roles,
  sizeTiers,
} from "../data/defaults";
import {
  canAdvanceFromSetup,
  canAdvanceFromRfp,
  getInclusionAllocationTotal,
  getStaffingAllocationTotal,
  statusActionLabel,
} from "../app/proposalUtils";
import { BlurbPickerModal } from "./BlurbPickerModal";
import { EditorStepInclusionsScopeBuilder } from "./EditorStepInclusionsScopeBuilder";
import { EditorStepRolesLeadSupport } from "./EditorStepRolesLeadSupport";
import { EditorStepSetupComplexity } from "./EditorStepSetupComplexity";
import { EditorStep } from "../app/editorConfig";
import {
  PROJECT_SIZE_MULTIPLIERS,
  STAKEHOLDER_SIZE_MULTIPLIERS,
} from "../config/estimation";
import {
  BlurbLibraryItem,
  ProposalDraft,
  ReviewModel,
} from "../types";

interface EditorStepContentProps {
  step: EditorStep;
  activeProposal: ProposalDraft;
  blurbs: BlurbLibraryItem[];
  review: ReviewModel | null;
  exportText: string;
  exportCsv: string;
  onUpsertActive: (draft: ProposalDraft) => void;
  onTransitionStatus: () => void;
  onDownloadCsv: () => void;
}

function formatCurrency(value: number): string {
  return `$${Math.round(value).toLocaleString()}`;
}

function formatPercentValue(value: number): string {
  return `${Math.round(value * 100) / 100}%`;
}

function lineLabel(
  roleId: ProposalDraft["staffing"][number]["roleId"],
  scope: ProposalDraft["staffing"][number]["scope"],
): string {
  const role = roles.find((item) => item.id === roleId);
  return `${role?.label ?? roleId} ${scope === "lead" ? "Lead" : "Support"}`;
}

export function EditorStepContent({
  step,
  activeProposal,
  blurbs,
  review,
  exportText,
  exportCsv,
  onUpsertActive,
  onTransitionStatus,
  onDownloadCsv,
}: EditorStepContentProps) {
  const [pickerState, setPickerState] = useState<null | {
    mode: "inclusion" | "rfp";
    inclusionId?: string;
  }>(null);
  const [draftRequirement, setDraftRequirement] = useState({
    prompt: "",
    response: "",
  });

  const inclusionTotal = getInclusionAllocationTotal(activeProposal);
  const remainingInclusionAllocation = Math.round((100 - inclusionTotal) * 100) / 100;
  const staffingTotal = getStaffingAllocationTotal(activeProposal);
  const remainingStaffingAllocation = Math.round((100 - staffingTotal) * 100) / 100;
  const selectedTier =
    sizeTiers.find((tier) => tier.id === activeProposal.sizeTierId) ?? sizeTiers[0];
  const projectSizeMultiplier =
    PROJECT_SIZE_MULTIPLIERS[activeProposal.projectSize] ?? 1;
  const stakeholderMultiplier =
    STAKEHOLDER_SIZE_MULTIPLIERS[
      activeProposal.complexity.stakeholdersComplexitySize
    ] ?? 1;
  const setupReady = canAdvanceFromSetup(activeProposal);
  const roughEstimate = formatCurrency(
    review?.totalPrice ??
      (selectedTier.maxBudget ?? selectedTier.minBudget) *
        projectSizeMultiplier *
        stakeholderMultiplier *
        (1 + activeProposal.projectBufferPercent / 100),
  );

  const resolveBlurb = (blurbId: string | null | undefined) =>
    blurbs.find((blurb) => blurb.id === blurbId) ?? null;

  const addRequirement = () => {
    const prompt = draftRequirement.prompt.trim();
    const response = draftRequirement.response.trim();
    if (!prompt || !response) return;

    onUpsertActive({
      ...activeProposal,
      rfpRequirements: [
        ...activeProposal.rfpRequirements,
        {
          id: crypto.randomUUID(),
          prompt,
          response,
        },
      ],
    });

    setDraftRequirement({
      prompt: "",
      response: "",
    });
  };

  if (step === 1) {
    return (
      <EditorStepSetupComplexity
        activeProposal={activeProposal}
        setupReady={setupReady}
        roughEstimate={roughEstimate}
        onUpsertActive={onUpsertActive}
      />
    );
  }

  if (step === 2) {
    return (
      <EditorStepInclusionsScopeBuilder
        activeProposal={activeProposal}
        blurbs={blurbs}
        inclusionTotal={inclusionTotal}
        remainingInclusionAllocation={remainingInclusionAllocation}
        inclusionPickerId={
          pickerState?.mode === "inclusion" ? pickerState.inclusionId : undefined
        }
        onOpenInclusionPicker={(inclusionId) =>
          setPickerState({
            mode: "inclusion",
            inclusionId,
          })
        }
        onCloseInclusionPicker={() => setPickerState(null)}
        onUpsertActive={onUpsertActive}
      />
    );
  }

  if (step === 3) {
    return (
      <EditorStepRolesLeadSupport
        activeProposal={activeProposal}
        staffingTotal={staffingTotal}
        remainingStaffingAllocation={remainingStaffingAllocation}
        onUpsertActive={onUpsertActive}
      />
    );
  }

  if (step === 4) {
    return (
      <>
        <div className="panel">
          <h3>RFP Requirements & Blurbs</h3>
          <div className="subpanel">
            <div className="row">
              <h4>Add Requirement</h4>
              <button type="button" className="next-btn" onClick={addRequirement}>
                Save Requirement
              </button>
            </div>
            <label>
              Prompt
              <input
                value={draftRequirement.prompt}
                onChange={(event) =>
                  setDraftRequirement((current) => ({
                    ...current,
                    prompt: event.target.value,
                  }))
                }
              />
            </label>
            <label>
              Response
              <textarea
                value={draftRequirement.response}
                onChange={(event) =>
                  setDraftRequirement((current) => ({
                    ...current,
                    response: event.target.value,
                  }))
                }
              />
            </label>
          </div>

          <h4>Requirements</h4>
          {activeProposal.rfpRequirements.length === 0 && (
            <p className="muted">No requirements added yet.</p>
          )}
          {activeProposal.rfpRequirements.map((req) => (
            <div key={req.id} className="subpanel">
              <div className="row">
                <h4>Requirement</h4>
                <button
                  type="button"
                  onClick={() =>
                    onUpsertActive({
                      ...activeProposal,
                      rfpRequirements: activeProposal.rfpRequirements.filter(
                        (item) => item.id !== req.id,
                      ),
                    })
                  }
                >
                  Remove
                </button>
              </div>
              <label>
                Prompt
                <input
                  value={req.prompt}
                  onChange={(event) =>
                    onUpsertActive({
                      ...activeProposal,
                      rfpRequirements: activeProposal.rfpRequirements.map((item) =>
                        item.id === req.id
                          ? { ...item, prompt: event.target.value }
                          : item,
                      ),
                    })
                  }
                />
              </label>
              <label>
                Response
                <textarea
                  value={req.response}
                  onChange={(event) =>
                    onUpsertActive({
                      ...activeProposal,
                      rfpRequirements: activeProposal.rfpRequirements.map((item) =>
                        item.id === req.id
                          ? { ...item, response: event.target.value }
                          : item,
                      ),
                    })
                  }
                />
              </label>
            </div>
          ))}
          <div className="row">
            <h4>Selected Blurbs</h4>
            <button type="button" onClick={() => setPickerState({ mode: "rfp" })}>
              Add Blurb
            </button>
          </div>
          {activeProposal.pickedBlurbIds.length > 0 ? (
            <div className="subpanel">
              {activeProposal.pickedBlurbIds.map((blurbId) => {
                const blurb = resolveBlurb(blurbId);
                if (!blurb) return null;
                return (
                  <div key={blurb.id} className="inline-blurb">
                    <strong>
                      {blurb.title} <em>{blurb.category}</em>
                    </strong>
                    <span>{blurb.contentPlaintext}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="muted">
              No library blurbs added to proposal narrative yet.
            </p>
          )}

          {!canAdvanceFromRfp(activeProposal) && (
            <p className="warning">
              Each saved requirement needs both a prompt and a response.
            </p>
          )}
        </div>
        {pickerState?.mode === "rfp" && (
          <BlurbPickerModal
            title="Pick Proposal Blurbs"
            blurbs={blurbs.filter(
              (blurb) => blurb.isActive && blurb.category !== "Inclusion",
            )}
            selectedIds={activeProposal.pickedBlurbIds}
            selectionMode="multiple"
            onClose={() => setPickerState(null)}
            onConfirm={(selectedIds) => {
              onUpsertActive({
                ...activeProposal,
                pickedBlurbIds: selectedIds,
              });
              setPickerState(null);
            }}
          />
        )}
      </>
    );
  }

  if (step === 5 && review) {
    const phaseRows = review.phaseAllocations.filter(
      (row) => row.allocationPercent > 0,
    );
    const roleRows = review.staffingAllocations;

    return (
      <div className="panel">
        <h3>Review & Generate</h3>
        <div className="row wrap">
          <button
            onClick={onTransitionStatus}
            disabled={activeProposal.status === "Approved"}
          >
            {statusActionLabel(activeProposal.status)}
          </button>
        </div>
        <p>
          Total Hours: <strong>{review.totalHours}</strong> | Subtotal:{" "}
          <strong>{formatCurrency(review.projectSubtotal)}</strong> | Buffer:{" "}
          <strong>
            {review.projectBufferPercent}% (
            {formatCurrency(review.projectBufferAmount)})
          </strong>{" "}
          | Total Price: <strong>{formatCurrency(review.totalPrice)}</strong>
        </p>

        <h4>Phase Allocation</h4>
        <table className="summary-table">
          <thead>
            <tr>
              <th>Phase</th>
              <th>Budget</th>
              <th>% of Project</th>
            </tr>
          </thead>
          <tbody>
            {phaseRows.map((row) => {
              const phase = phases.find((item) => item.id === row.phaseId);
              return (
                <tr key={row.phaseId}>
                  <td>{phase?.name ?? row.phaseId}</td>
                  <td>{formatCurrency(row.budget)}</td>
                  <td>{formatPercentValue(row.allocationPercent)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <h4>Role Allocation</h4>
        <table className="summary-table">
          <thead>
            <tr>
              <th>Role Line</th>
              <th>Budget</th>
              <th>% of Project</th>
              <th>Hours</th>
            </tr>
          </thead>
          <tbody>
            {roleRows.map((row) => (
              <tr key={row.staffingLineId}>
                <td>{lineLabel(row.roleId, row.scope)}</td>
                <td>{formatCurrency(row.budget)}</td>
                <td>{formatPercentValue(row.allocationPercent)}</td>
                <td>{row.hours}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h4>Assumptions / Exclusions / Risks</h4>
        <label>
          Assumptions
          <textarea
            value={activeProposal.assumptions}
            onChange={(event) =>
              onUpsertActive({
                ...activeProposal,
                assumptions: event.target.value,
              })
            }
          />
        </label>
        <label>
          Exclusions
          <textarea
            value={activeProposal.exclusions}
            onChange={(event) =>
              onUpsertActive({
                ...activeProposal,
                exclusions: event.target.value,
              })
            }
          />
        </label>
        <label>
          Risks
          <textarea
            value={activeProposal.risks}
            onChange={(event) =>
              onUpsertActive({ ...activeProposal, risks: event.target.value })
            }
          />
        </label>
      </div>
    );
  }

  if (step === 6) {
    return (
      <div className="panel">
        <h3>Exports</h3>
        <div className="row wrap">
          <button onClick={onDownloadCsv} disabled={!exportCsv}>
            Download Teamwork CSV
          </button>
        </div>
        <label>
          Proposal Text Output
          <textarea value={exportText} readOnly rows={16} />
        </label>
        <label>
          Teamwork CSV Preview
          <textarea value={exportCsv} readOnly rows={8} />
        </label>
      </div>
    );
  }

  return null;
}
