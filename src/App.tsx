import { useMemo, useState } from "react";
import { blurbLibrary, createDraftProposal, inclusions, phases, roles, sizeTiers, timelineOptions } from "./data/defaults";
import { generateProposalText, generateTeamworkCsv } from "./lib/exporters";
import { buildReviewModel } from "./lib/estimate";
import { ProposalDraft, ProposalInclusionState, ProposalRoleStaffing, ProposalStatus, RfpRequirement } from "./types";

const STORAGE_KEY = "sales-proposal-app:v1";
const steps = [
  "0) Proposal List",
  "1) New Proposal Setup",
  "2) Inclusions",
  "3) Timeline & Complexity",
  "4) Roles, Seniority & Rates",
  "5) RFP Requirements & Blurbs",
  "6) Review & Generate",
  "7) Exports",
] as const;

type EditorStep = 1 | 2 | 3 | 4 | 5 | 6 | 7;

function loadStoredProposals(): ProposalDraft[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ProposalDraft[]) : [];
  } catch {
    return [];
  }
}

function saveStoredProposals(proposals: ProposalDraft[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(proposals));
}

function touch(draft: ProposalDraft): ProposalDraft {
  return { ...draft, updatedAt: new Date().toISOString() };
}

function updateInclusion(
  inclusionsState: ProposalInclusionState[],
  inclusionId: string,
  patch: Partial<ProposalInclusionState>
): ProposalInclusionState[] {
  return inclusionsState.map((item) => (item.inclusionId === inclusionId ? { ...item, ...patch } : item));
}

function updateStaffing(
  staffingState: ProposalRoleStaffing[],
  roleId: ProposalRoleStaffing["roleId"],
  patch: Partial<ProposalRoleStaffing>
): ProposalRoleStaffing[] {
  return staffingState.map((item) => (item.roleId === roleId ? { ...item, ...patch } : item));
}

function canAdvanceFromInclusions(draft: ProposalDraft): boolean {
  for (const state of draft.inclusions) {
    const inclusion = inclusions.find((item) => item.id === state.inclusionId);
    if (!inclusion?.isRequired) continue;
    if (!state.selected && !state.overrideReason.trim()) return false;
  }
  return true;
}

function statusActionLabel(status: ProposalStatus): string {
  if (status === "Draft") return "Mark Ready";
  if (status === "ReadyForApproval") return "Approve";
  return "Approved";
}

export default function App() {
  const [proposals, setProposals] = useState<ProposalDraft[]>(() => loadStoredProposals());
  const [activeProposalId, setActiveProposalId] = useState<string | null>(proposals[0]?.id ?? null);
  const [step, setStep] = useState<EditorStep>(1);
  const [exportText, setExportText] = useState("");
  const [exportCsv, setExportCsv] = useState("");

  const activeProposal = useMemo(
    () => proposals.find((item) => item.id === activeProposalId) ?? null,
    [activeProposalId, proposals]
  );

  const review = useMemo(() => (activeProposal ? buildReviewModel(activeProposal) : null), [activeProposal]);

  const persist = (next: ProposalDraft[]) => {
    setProposals(next);
    saveStoredProposals(next);
  };

  const upsertActive = (nextDraft: ProposalDraft) => {
    if (!activeProposal) return;
    const next = proposals.map((item) => (item.id === activeProposal.id ? touch(nextDraft) : item));
    persist(next);
  };

  const newProposal = () => {
    const draft = createDraftProposal();
    const next = [draft, ...proposals];
    persist(next);
    setActiveProposalId(draft.id);
    setStep(1);
    setExportText("");
    setExportCsv("");
  };

  const duplicateProposal = (proposal: ProposalDraft) => {
    const duplicate = {
      ...proposal,
      id: crypto.randomUUID(),
      name: `${proposal.name || proposal.projectTitle || "Proposal"} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "Draft" as ProposalStatus,
    };
    const next = [duplicate, ...proposals];
    persist(next);
    setActiveProposalId(duplicate.id);
    setStep(1);
  };

  const deleteProposal = (proposalId: string) => {
    const next = proposals.filter((item) => item.id !== proposalId);
    persist(next);
    if (activeProposalId === proposalId) {
      setActiveProposalId(next[0]?.id ?? null);
      setStep(1);
      setExportText("");
      setExportCsv("");
    }
  };

  const transitionStatus = () => {
    if (!activeProposal) return;
    const nextStatus: ProposalStatus =
      activeProposal.status === "Draft"
        ? "ReadyForApproval"
        : activeProposal.status === "ReadyForApproval"
        ? "Approved"
        : "Approved";
    upsertActive({ ...activeProposal, status: nextStatus });
  };

  const regenerate = () => {
    if (!activeProposal || !review) return;
    setExportText(generateProposalText(activeProposal, review));
    setExportCsv(generateTeamworkCsv(activeProposal));
  };

  const downloadCsv = () => {
    if (!exportCsv) return;
    const blob = new Blob([exportCsv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${activeProposal?.projectTitle || "teamwork-import"}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page">
      <header className="app-header">
        <h1>Proposal & Project Seeding App (v1)</h1>
      </header>

      <main className="layout">
        <aside className="sidebar">
          <div className="row">
            <h2>Proposals</h2>
            <button onClick={newProposal}>New Proposal</button>
          </div>
          {proposals.length === 0 && <p className="muted">No proposals saved yet.</p>}
          {proposals.map((proposal) => (
            <div key={proposal.id} className={`card ${proposal.id === activeProposalId ? "active" : ""}`}>
              <button className="linklike" onClick={() => setActiveProposalId(proposal.id)}>
                <strong>{proposal.name || proposal.projectTitle || "New Proposal"}</strong>
                <span>{proposal.clientName || "No client"}</span>
                <span>{proposal.status}</span>
              </button>
              <div className="row">
                <button onClick={() => duplicateProposal(proposal)}>Duplicate</button>
                <button className="danger" onClick={() => deleteProposal(proposal.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </aside>

        <section className="content">
          {!activeProposal ? (
            <div className="panel">
              <p>Create a proposal to begin.</p>
            </div>
          ) : (
            <>
              <div className="panel">
                <div className="row">
                  <h2>{activeProposal.name || activeProposal.projectTitle || "New Proposal"}</h2>
                  <span className="status-pill">{activeProposal.status}</span>
                </div>
                <p className="muted">Current step: {steps[step]}</p>
                <div className="row wrap">
                  {[1, 2, 3, 4, 5, 6, 7].map((number) => (
                    <button key={number} onClick={() => setStep(number as EditorStep)} className={step === number ? "active-step" : ""}>
                      {number}
                    </button>
                  ))}
                </div>
              </div>

              {step === 1 && (
                <div className="panel">
                  <h3>New Proposal Setup</h3>
                  <label>
                    Proposal Name (Internal)
                    <input
                      value={activeProposal.name}
                      onChange={(event) => upsertActive({ ...activeProposal, name: event.target.value })}
                    />
                  </label>
                  <label>
                    Client Name
                    <input
                      value={activeProposal.clientName}
                      onChange={(event) => upsertActive({ ...activeProposal, clientName: event.target.value })}
                    />
                  </label>
                  <label>
                    Project Title
                    <input
                      value={activeProposal.projectTitle}
                      onChange={(event) => upsertActive({ ...activeProposal, projectTitle: event.target.value })}
                    />
                  </label>
                  <label>
                    Size Tier
                    <select
                      value={activeProposal.sizeTierId}
                      onChange={(event) => upsertActive({ ...activeProposal, sizeTierId: event.target.value })}
                    >
                      {sizeTiers.map((tier) => (
                        <option key={tier.id} value={tier.id}>
                          {tier.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              )}

              {step === 2 && (
                <div className="panel">
                  <h3>Inclusions (Scope Builder)</h3>
                  {phases.map((phase) => (
                    <div key={phase.id} className="subpanel">
                      <h4>{phase.name}</h4>
                      {inclusions
                        .filter((item) => item.phaseId === phase.id)
                        .map((inclusion) => {
                          const state = activeProposal.inclusions.find((item) => item.inclusionId === inclusion.id);
                          if (!state) return null;
                          return (
                            <div key={inclusion.id} className="inclusion-row">
                              <label className="checkbox-row">
                                <input
                                  type="checkbox"
                                  checked={state.selected}
                                  onChange={(event) =>
                                    upsertActive({
                                      ...activeProposal,
                                      inclusions: updateInclusion(activeProposal.inclusions, inclusion.id, {
                                        selected: event.target.checked,
                                      }),
                                    })
                                  }
                                />
                                <span>
                                  {inclusion.name} {inclusion.isRequired ? "(Required)" : ""}
                                </span>
                              </label>
                              <p className="muted">{inclusion.description}</p>
                              {inclusion.isRequired && !state.selected && (
                                <label>
                                  Reason/Assumption (required to continue)
                                  <input
                                    value={state.overrideReason}
                                    onChange={(event) =>
                                      upsertActive({
                                        ...activeProposal,
                                        inclusions: updateInclusion(activeProposal.inclusions, inclusion.id, {
                                          overrideReason: event.target.value,
                                        }),
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
                    <p className="warning">Complete required reason fields before moving to next step.</p>
                  )}
                </div>
              )}

              {step === 3 && (
                <div className="panel">
                  <h3>Timeline & Complexity</h3>
                  <label>
                    Timeline Option
                    <select
                      value={activeProposal.timelineOptionId}
                      onChange={(event) => upsertActive({ ...activeProposal, timelineOptionId: event.target.value })}
                    >
                      {timelineOptions.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Stakeholders / Company Size
                    <select
                      value={activeProposal.complexity.stakeholdersCompanySize}
                      onChange={(event) =>
                        upsertActive({
                          ...activeProposal,
                          complexity: { ...activeProposal.complexity, stakeholdersCompanySize: event.target.value as "Low" | "Medium" | "High" },
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
                        upsertActive({
                          ...activeProposal,
                          complexity: { ...activeProposal.complexity, cmsType: event.target.value as ProposalDraft["complexity"]["cmsType"] },
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
                        upsertActive({
                          ...activeProposal,
                          complexity: { ...activeProposal.complexity, notes: event.target.value },
                        })
                      }
                    />
                  </label>
                </div>
              )}

              {step === 4 && (
                <div className="panel">
                  <h3>Roles, Seniority & Rates</h3>
                  {roles.map((role) => {
                    const staff = activeProposal.staffing.find((item) => item.roleId === role.id);
                    if (!staff) return null;
                    const effectiveRate = Math.round(staff.baseRate * (staff.seniority === "Senior" ? 1.25 : 1));
                    return (
                      <div key={role.id} className="staff-row">
                        <h4>{role.label}</h4>
                        <label>
                          Seniority
                          <select
                            value={staff.seniority}
                            onChange={(event) =>
                              upsertActive({
                                ...activeProposal,
                                staffing: updateStaffing(activeProposal.staffing, role.id, {
                                  seniority: event.target.value as ProposalRoleStaffing["seniority"],
                                }),
                              })
                            }
                          >
                            <option value="Standard">Standard</option>
                            <option value="Senior">Senior</option>
                          </select>
                        </label>
                        <label>
                          Base Rate
                          <input
                            type="number"
                            min={0}
                            value={staff.baseRate}
                            onChange={(event) =>
                              upsertActive({
                                ...activeProposal,
                                staffing: updateStaffing(activeProposal.staffing, role.id, {
                                  baseRate: Number(event.target.value),
                                }),
                              })
                            }
                          />
                        </label>
                        <label>
                          Markup %
                          <input
                            type="number"
                            min={0}
                            value={staff.markupPercent}
                            onChange={(event) =>
                              upsertActive({
                                ...activeProposal,
                                staffing: updateStaffing(activeProposal.staffing, role.id, {
                                  markupPercent: Number(event.target.value),
                                }),
                              })
                            }
                          />
                        </label>
                        <div className="effective">Effective rate: ${effectiveRate}/hr</div>
                      </div>
                    );
                  })}
                </div>
              )}

              {step === 5 && (
                <div className="panel">
                  <h3>RFP Requirements & Blurbs</h3>
                  <button
                    onClick={() =>
                      upsertActive({
                        ...activeProposal,
                        rfpRequirements: [
                          ...activeProposal.rfpRequirements,
                          { id: crypto.randomUUID(), prompt: "", response: "" } as RfpRequirement,
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
                            upsertActive({
                              ...activeProposal,
                              rfpRequirements: activeProposal.rfpRequirements.map((item) =>
                                item.id === req.id ? { ...item, prompt: event.target.value } : item
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
                            upsertActive({
                              ...activeProposal,
                              rfpRequirements: activeProposal.rfpRequirements.map((item) =>
                                item.id === req.id ? { ...item, response: event.target.value } : item
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
                            upsertActive({
                              ...activeProposal,
                              pickedBlurbIds: event.target.checked
                                ? [...activeProposal.pickedBlurbIds, blurb.id]
                                : activeProposal.pickedBlurbIds.filter((id) => id !== blurb.id),
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
              )}

              {step === 6 && review && (
                <div className="panel">
                  <h3>Review & Generate</h3>
                  <div className="row wrap">
                    <button onClick={regenerate}>Regenerate</button>
                    <button onClick={transitionStatus} disabled={activeProposal.status === "Approved"}>
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
                          <td>{phases.find((phase) => phase.id === line.phaseId)?.name}</td>
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
                      onChange={(event) => upsertActive({ ...activeProposal, assumptions: event.target.value })}
                    />
                  </label>
                  <label>
                    Exclusions
                    <textarea
                      value={activeProposal.exclusions}
                      onChange={(event) => upsertActive({ ...activeProposal, exclusions: event.target.value })}
                    />
                  </label>
                  <label>
                    Risks
                    <textarea value={activeProposal.risks} onChange={(event) => upsertActive({ ...activeProposal, risks: event.target.value })} />
                  </label>
                </div>
              )}

              {step === 7 && (
                <div className="panel">
                  <h3>Exports</h3>
                  <div className="row wrap">
                    <button onClick={regenerate}>Generate Outputs</button>
                    <button onClick={downloadCsv} disabled={!exportCsv}>
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
                  <p className="muted">Current export is CSV for Excel upload. Swap to true XLSX in a later iteration.</p>
                </div>
              )}

              <div className="row">
                <button onClick={() => setStep((value) => (value > 1 ? ((value - 1) as EditorStep) : value))} disabled={step === 1}>
                  Back
                </button>
                <button
                  onClick={() => setStep((value) => (value < 7 ? ((value + 1) as EditorStep) : value))}
                  disabled={step === 2 && !canAdvanceFromInclusions(activeProposal)}
                >
                  Next
                </button>
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
