import {
  blurbLibrary,
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
import { EditorStep } from "../app/editorConfig";
import { ProposalDraft, ReviewModel, RfpRequirement } from "../types";

interface EditorStepContentProps {
  step: EditorStep;
  activeProposal: ProposalDraft;
  review: ReviewModel | null;
  exportText: string;
  exportCsv: string;
  onUpsertActive: (draft: ProposalDraft) => void;
  onRegenerate: () => void;
  onTransitionStatus: () => void;
  onDownloadCsv: () => void;
}

export function EditorStepContent({
  step,
  activeProposal,
  review,
  exportText,
  exportCsv,
  onUpsertActive,
  onRegenerate,
  onTransitionStatus,
  onDownloadCsv,
}: EditorStepContentProps) {
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
          Company Size
          <select
            value={activeProposal.companySize}
            onChange={(event) =>
              onUpsertActive({
                ...activeProposal,
                companySize: event.target.value as ProposalDraft["companySize"],
              })
            }
          >
            <option value="Small">Small</option>
            <option value="Medium">Medium</option>
            <option value="Large">Large</option>
            <option value="XL">XL</option>
          </select>
        </label>
      </div>
    );
  }

  if (step === 2) {
    return (
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
            value={activeProposal.complexity.stakeholdersCompanySize}
            onChange={(event) =>
              onUpsertActive({
                ...activeProposal,
                complexity: {
                  ...activeProposal.complexity,
                  stakeholdersCompanySize: event.target.value as
                    | "Low"
                    | "Medium"
                    | "High",
                },
              })
            }
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
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
      <div className="panel">
        <h3>RFP Requirements & Blurbs</h3>
        <button
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

        <h4>Saved Blurbs</h4>
        {blurbLibrary.map((blurb) => {
          const selected = activeProposal.pickedBlurbIds.includes(blurb.id);
          return (
            <label key={blurb.id} className="checkbox-row">
              <input
                type="checkbox"
                checked={selected}
                onChange={(event) =>
                  onUpsertActive({
                    ...activeProposal,
                    pickedBlurbIds: event.target.checked
                      ? [...activeProposal.pickedBlurbIds, blurb.id]
                      : activeProposal.pickedBlurbIds.filter(
                          (id) => id !== blurb.id,
                        ),
                  })
                }
              />
              <span>
                <strong>{blurb.title}</strong> - {blurb.contentPlaintext}
              </span>
            </label>
          );
        })}
      </div>
    );
  }

  if (step === 6 && review) {
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
          Total Hours: <strong>{review.totalHours}</strong> | Total Price:{" "}
          <strong>${review.totalPrice.toLocaleString()}</strong>
        </p>

        <h4>Estimates by Phase and Role</h4>
        <table>
          <thead>
            <tr>
              <th>Phase</th>
              <th>Role</th>
              <th>Hours</th>
              <th>Rate</th>
              <th>Markup</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {review.estimateLines.map((line) => (
              <tr key={`${line.phaseId}-${line.roleId}`}>
                <td>
                  {phases.find((phase) => phase.id === line.phaseId)?.name}
                </td>
                <td>{roles.find((role) => role.id === line.roleId)?.label}</td>
                <td>{line.hours}</td>
                <td>${line.rate}</td>
                <td>{line.markup}%</td>
                <td>${line.price.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h4>Budget Allocation by Phase</h4>
        <table>
          <thead>
            <tr>
              <th>Phase</th>
              <th>Budget</th>
            </tr>
          </thead>
          <tbody>
            {phases.map((phase) => (
              <tr key={phase.id}>
                <td>{phase.name}</td>
                <td>${review.budgetByPhase[phase.id].toLocaleString()}</td>
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
