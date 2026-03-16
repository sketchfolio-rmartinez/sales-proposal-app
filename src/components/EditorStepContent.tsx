import { useState } from "react";
import {
  inclusions,
  phases,
  roles,
  sizeTiers,
  timelineOptions,
} from "../data/defaults";
import {
  canAdvanceFromInclusions,
  statusActionLabel,
  updateInclusion,
  updateStaffing,
} from "../app/proposalUtils";
import { BlurbPickerModal } from "./BlurbPickerModal";
import { EditorStep } from "../app/editorConfig";
import {
  BlurbLibraryItem,
  ProposalDraft,
  ReviewModel,
  RfpRequirement,
} from "../types";

interface EditorStepContentProps {
  step: EditorStep;
  activeProposal: ProposalDraft;
  blurbs: BlurbLibraryItem[];
  review: ReviewModel | null;
  exportText: string;
  exportCsv: string;
  onUpsertActive: (draft: ProposalDraft) => void;
  onRegenerate: () => void;
  onTransitionStatus: () => void;
  onDownloadCsv: () => void;
}

function formatCurrency(value: number): string {
  return `$${Math.round(value).toLocaleString()}`;
}

function formatPercent(part: number, total: number): string {
  if (total <= 0) return "0%";
  return `${Math.round((part / total) * 100)}%`;
}

export function EditorStepContent({
  step,
  activeProposal,
  blurbs,
  review,
  exportText,
  exportCsv,
  onUpsertActive,
  onRegenerate,
  onTransitionStatus,
  onDownloadCsv,
}: EditorStepContentProps) {
  const [pickerState, setPickerState] = useState<null | {
    mode: "inclusion" | "rfp";
    inclusionId?: string;
  }>(null);

  const resolveBlurb = (blurbId: string | null | undefined) =>
    blurbs.find((blurb) => blurb.id === blurbId) ?? null;

  if (step === 1) {
    return (
      <div className="panel">
        <h3>New Proposal Setup</h3>
        <label>
          Proposal Name (Internal)
          <input
            value={activeProposal.name}
            onChange={(event) =>
              onUpsertActive({ ...activeProposal, name: event.target.value })
            }
          />
        </label>
        <label>
          Client Name
          <input
            value={activeProposal.clientName}
            onChange={(event) =>
              onUpsertActive({
                ...activeProposal,
                clientName: event.target.value,
              })
            }
          />
        </label>
        <label>
          Project Title
          <input
            value={activeProposal.projectTitle}
            onChange={(event) =>
              onUpsertActive({
                ...activeProposal,
                projectTitle: event.target.value,
              })
            }
          />
        </label>
        <label>
          Size Tier
          <select
            value={activeProposal.sizeTierId}
            onChange={(event) =>
              onUpsertActive({
                ...activeProposal,
                sizeTierId: event.target.value,
              })
            }
          >
            {sizeTiers.map((tier) => (
              <option key={tier.id} value={tier.id}>
                {tier.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Project Size
          <select
            value={activeProposal.projectSize}
            onChange={(event) =>
              onUpsertActive({
                ...activeProposal,
                projectSize: event.target.value as ProposalDraft["projectSize"],
              })
            }
          >
            <option value="Small">Small (1x)</option>
            <option value="Medium">Medium (2x)</option>
            <option value="Large">Large (3x)</option>
            <option value="XL">XL (5x)</option>
          </select>
        </label>
        <label>
          Project Buffer %
          <input
            type="number"
            min={0}
            step={5}
            value={activeProposal.projectBufferPercent}
            onChange={(event) =>
              onUpsertActive({
                ...activeProposal,
                projectBufferPercent: Number(event.target.value),
              })
            }
          />
        </label>
      </div>
    );
  }

  if (step === 2) {
    return (
      <>
        <div className="panel">
          <h3>Inclusions (Scope Builder)</h3>
          {phases.map((phase) => (
            <div key={phase.id} className="subpanel">
              <h4>{phase.name}</h4>
              {inclusions
                .filter((item) => item.phaseId === phase.id)
                .map((inclusion) => {
                  const state = activeProposal.inclusions.find(
                    (item) => item.inclusionId === inclusion.id,
                  );
                  if (!state) return null;
                  return (
                    <div key={inclusion.id} className="inclusion-row">
                      <label className="checkbox-row">
                        <input
                          type="checkbox"
                          checked={state.selected}
                          onChange={(event) =>
                            onUpsertActive({
                              ...activeProposal,
                              inclusions: updateInclusion(
                                activeProposal.inclusions,
                                inclusion.id,
                                {
                                  selected: event.target.checked,
                                },
                              ),
                            })
                          }
                        />
                        <span>
                          {inclusion.name}{" "}
                          {inclusion.isRequired ? "(Required)" : ""}
                        </span>
                      </label>
                      <p className="muted">{inclusion.description}</p>
                      <div className="inclusion-blurb-row">
                        {state.blurbId ? (
                          <div className="inline-blurb">
                            <strong>
                              {resolveBlurb(state.blurbId)?.title ??
                                "Selected blurb"}
                            </strong>
                            <span>
                              {resolveBlurb(state.blurbId)?.contentPlaintext}
                            </span>
                          </div>
                        ) : (
                          <p className="muted">No inclusion blurb attached.</p>
                        )}
                        <div className="row">
                          <button
                            type="button"
                            onClick={() =>
                              setPickerState({
                                mode: "inclusion",
                                inclusionId: inclusion.id,
                              })
                            }
                          >
                            {state.blurbId ? "Change Blurb" : "+ Add Blurb"}
                          </button>
                          {state.blurbId && (
                            <button
                              type="button"
                              onClick={() =>
                                onUpsertActive({
                                  ...activeProposal,
                                  inclusions: updateInclusion(
                                    activeProposal.inclusions,
                                    inclusion.id,
                                    {
                                      blurbId: null,
                                    },
                                  ),
                                })
                              }
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                      {inclusion.isRequired && !state.selected && (
                        <label>
                          Reason/Assumption (required to continue)
                          <input
                            value={state.overrideReason}
                            onChange={(event) =>
                              onUpsertActive({
                                ...activeProposal,
                                inclusions: updateInclusion(
                                  activeProposal.inclusions,
                                  inclusion.id,
                                  {
                                    overrideReason: event.target.value,
                                  },
                                ),
                              })
                            }
                          />
                        </label>
                      )}
                    </div>
                  );
                })}
            </div>
          ))}
          {!canAdvanceFromInclusions(activeProposal) && (
            <p className="warning">
              Complete required reason fields before moving to next step.
            </p>
          )}
        </div>
        {pickerState?.mode === "inclusion" && (
          <BlurbPickerModal
            title="Pick Inclusion Blurb"
            blurbs={blurbs.filter((blurb) => blurb.isActive)}
            allowedCategories={["Inclusion"]}
            selectedIds={[
              activeProposal.inclusions.find(
                (item) => item.inclusionId === pickerState.inclusionId,
              )?.blurbId ?? "",
            ].filter(Boolean)}
            selectionMode="single"
            onClose={() => setPickerState(null)}
            onConfirm={(selectedIds) => {
              if (!pickerState.inclusionId) return;
              onUpsertActive({
                ...activeProposal,
                inclusions: updateInclusion(
                  activeProposal.inclusions,
                  pickerState.inclusionId,
                  {
                    blurbId: selectedIds[0] ?? null,
                  },
                ),
              });
              setPickerState(null);
            }}
          />
        )}
      </>
    );
  }

  if (step === 3) {
    return (
      <div className="panel">
        <h3>Timeline & Complexity</h3>
        <label>
          Timeline Option
          <select
            value={activeProposal.timelineOptionId}
            onChange={(event) =>
              onUpsertActive({
                ...activeProposal,
                timelineOptionId: event.target.value,
              })
            }
          >
            {timelineOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Stakeholders Size
          <select
            value={activeProposal.complexity.stakeholdersComplexitySize}
            onChange={(event) =>
              onUpsertActive({
                ...activeProposal,
                complexity: {
                  ...activeProposal.complexity,
                  stakeholdersComplexitySize: Number(
                    event.target.value,
                  ) as ProposalDraft["complexity"]["stakeholdersComplexitySize"],
                },
              })
            }
          >
            <option value="1">1-5</option>
            <option value="1.25">6-12</option>
            <option value="1.5">13+</option>
          </select>
        </label>
        <label>
          CMS Type
          <select
            value={activeProposal.complexity.cmsType}
            onChange={(event) =>
              onUpsertActive({
                ...activeProposal,
                complexity: {
                  ...activeProposal.complexity,
                  cmsType: event.target
                    .value as ProposalDraft["complexity"]["cmsType"],
                },
              })
            }
          >
            <option value="WordPress">WordPress</option>
            <option value="Webflow">Webflow</option>
            <option value="Shopify">Shopify</option>
            <option value="Headless">Headless</option>
            <option value="Custom">Custom</option>
          </select>
        </label>
        <label>
          Complexity Notes
          <textarea
            value={activeProposal.complexity.notes}
            onChange={(event) =>
              onUpsertActive({
                ...activeProposal,
                complexity: {
                  ...activeProposal.complexity,
                  notes: event.target.value,
                },
              })
            }
          />
        </label>
      </div>
    );
  }

  if (step === 4) {
    return (
      <div className="panel">
        <h3 className="role-header-title">Roles, Lead & Support</h3>
        <p className="role-matrix-description">
          High-level role structure for planning &nbsp;
          <strong>(This does not change estimator formula.)</strong>
        </p>
        <table className="role-matrix">
          <thead>
            <tr>
              <th>Role</th>
              <th>Lead</th>
              <th>Support</th>
              <th>Base Rate</th>
              <th>Markup %</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((role) => {
              const staff = activeProposal.staffing.find(
                (item) => item.roleId === role.id,
              );
              if (!staff) return null;
              return (
                <tr key={role.id}>
                  <td>{role.label}</td>
                  <td>
                    <input
                      type="checkbox"
                      checked={Boolean(staff.leadSelected)}
                      onChange={(event) =>
                        onUpsertActive({
                          ...activeProposal,
                          staffing: updateStaffing(
                            activeProposal.staffing,
                            role.id,
                            {
                              leadSelected: event.target.checked,
                            },
                          ),
                        })
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      checked={Boolean(staff.supportSelected)}
                      onChange={(event) =>
                        onUpsertActive({
                          ...activeProposal,
                          staffing: updateStaffing(
                            activeProposal.staffing,
                            role.id,
                            {
                              supportSelected: event.target.checked,
                            },
                          ),
                        })
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min={0}
                      value={staff.baseRate}
                      onChange={(event) =>
                        onUpsertActive({
                          ...activeProposal,
                          staffing: updateStaffing(
                            activeProposal.staffing,
                            role.id,
                            {
                              baseRate: Number(event.target.value),
                            },
                          ),
                        })
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min={0}
                      value={staff.markupPercent}
                      onChange={(event) =>
                        onUpsertActive({
                          ...activeProposal,
                          staffing: updateStaffing(
                            activeProposal.staffing,
                            role.id,
                            {
                              markupPercent: Number(event.target.value),
                            },
                          ),
                        })
                      }
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  if (step === 5) {
    return (
      <>
        <div className="panel">
          <h3>RFP Requirements & Blurbs</h3>
          <button
            type="button"
            onClick={() =>
              onUpsertActive({
                ...activeProposal,
                rfpRequirements: [
                  ...activeProposal.rfpRequirements,
                  {
                    id: crypto.randomUUID(),
                    prompt: "",
                    response: "",
                  } as RfpRequirement,
                ],
              })
            }
          >
            Add Requirement
          </button>
          <div className="row">
            <h4>Selected Blurbs</h4>
            <button
              type="button"
              onClick={() => setPickerState({ mode: "rfp" })}
            >
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
          {activeProposal.rfpRequirements.map((req) => (
            <div key={req.id} className="subpanel">
              <label>
                Prompt
                <input
                  value={req.prompt}
                  onChange={(event) =>
                    onUpsertActive({
                      ...activeProposal,
                      rfpRequirements: activeProposal.rfpRequirements.map(
                        (item) =>
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
                      rfpRequirements: activeProposal.rfpRequirements.map(
                        (item) =>
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

          <h4>Library Reference</h4>
          <p className="muted">
            Blurbs are referenced from the library and can be reused across
            proposals.
          </p>
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

  if (step === 6 && review) {
    const phaseRows = phases
      .map((phase) => ({
        id: phase.id,
        label: phase.name,
        budget: review.budgetByPhase[phase.id],
      }))
      .filter((row) => row.budget > 0);

    const roleRows = roles
      .map((role) => {
        const matchingLines = review.estimateLines.filter(
          (line) => line.roleId === role.id,
        );
        const hours = matchingLines.reduce((sum, line) => sum + line.hours, 0);
        const budget = matchingLines.reduce((sum, line) => sum + line.price, 0);
        return {
          id: role.id,
          label: role.label,
          hours,
          budget,
        };
      })
      .filter((row) => row.hours > 0 || row.budget > 0);

    return (
      <div className="panel">
        <h3>Review & Generate</h3>
        <div className="row wrap">
          <button onClick={onRegenerate}>Regenerate</button>
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
            {phaseRows.map((row) => (
              <tr key={row.id}>
                <td>{row.label}</td>
                <td>{formatCurrency(row.budget)}</td>
                <td>{formatPercent(row.budget, review.projectSubtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h4>Role Allocation</h4>
        <table className="summary-table">
          <thead>
            <tr>
              <th>Role</th>
              <th>Budget</th>
              <th>% of Project</th>
              <th>Hours</th>
            </tr>
          </thead>
          <tbody>
            {roleRows.map((row) => (
              <tr key={row.id}>
                <td>{row.label}</td>
                <td>{formatCurrency(row.budget)}</td>
                <td>{formatPercent(row.budget, review.projectSubtotal)}</td>
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

  if (step === 7) {
    return (
      <div className="panel">
        <h3>Exports</h3>
        <div className="row wrap">
          <button onClick={onRegenerate}>Generate Outputs</button>
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
