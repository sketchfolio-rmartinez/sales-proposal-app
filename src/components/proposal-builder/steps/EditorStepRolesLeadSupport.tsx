import {
  canAdvanceFromRoles,
  updateStaffing,
} from "../../../app/proposalUtils";
import { roles } from "../../../data/defaults";
import { ProposalDraft } from "../../../types";
import {
  normalizeNonNegativeInput,
  normalizePercentInput,
} from "../../../lib/editorStepFieldUtils";
import { ProposalStepIntroShell } from "../../shared/ProposalStepIntroShell";
import { SummaryPill } from "../../shared/SummaryPill";

interface EditorStepRolesLeadSupportProps {
  activeProposal: ProposalDraft;
  staffingTotal: number;
  remainingStaffingAllocation: number;
  onUpsertActive: (draft: ProposalDraft) => void;
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

export function EditorStepRolesLeadSupport({
  activeProposal,
  staffingTotal,
  remainingStaffingAllocation,
  onUpsertActive,
}: EditorStepRolesLeadSupportProps) {
  return (
    <div className="step-section">
      <ProposalStepIntroShell
        activeProposal={activeProposal}
        title="Roles, Lead & Support"
        description="Select the lead/support lines you need, then split the full 100% project allocation across those lines."
        summary={
          <SummaryPill
            primaryLabel="Allocated"
            primaryValue={formatPercentValue(staffingTotal)}
            secondaryLabel={
              remainingStaffingAllocation >= 0 ? "Remaining" : "Over"
            }
            secondaryValue={formatPercentValue(
              Math.abs(remainingStaffingAllocation),
            )}
            secondaryTone={
              remainingStaffingAllocation === 0 ? "default" : "warning"
            }
          />
        }
      />
      <div className="panel">
        <table className="role-matrix staffing-table polished-staffing-table">
          <thead>
            <tr>
              <th>Use</th>
              <th>Line Item</th>
              <th>Alloc %</th>
              <th>Rate</th>
              <th>Markup</th>
              <th>Effective Rate</th>
            </tr>
          </thead>
          <tbody>
            {activeProposal.staffing.map((line) => {
              const effectiveRate = Math.round(
                line.baseRate * (1 + line.markupPercent / 100),
              );

              return (
                <tr
                  key={line.id}
                  className={line.selected ? "is-selected" : "is-idle"}
                >
                  <td>
                    <input
                      type="checkbox"
                      checked={line.selected}
                      onChange={(event) =>
                        onUpsertActive({
                          ...activeProposal,
                          staffing: updateStaffing(
                            activeProposal.staffing,
                            line.id,
                            {
                              selected: event.target.checked,
                              allocationPercent: event.target.checked
                                ? line.allocationPercent
                                : 0,
                            },
                          ),
                        })
                      }
                    />
                  </td>
                  <td className="staffing-line-label">
                    {lineLabel(line.roleId, line.scope)}
                  </td>
                  <td>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={1}
                      value={line.allocationPercent}
                      disabled={!line.selected}
                      onChange={(event) =>
                        onUpsertActive({
                          ...activeProposal,
                          staffing: updateStaffing(
                            activeProposal.staffing,
                            line.id,
                            {
                              allocationPercent: normalizePercentInput(
                                event.target.value,
                              ),
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
                      value={line.baseRate}
                      onChange={(event) =>
                        onUpsertActive({
                          ...activeProposal,
                          staffing: updateStaffing(
                            activeProposal.staffing,
                            line.id,
                            {
                              baseRate: normalizeNonNegativeInput(
                                event.target.value,
                              ),
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
                      value={line.markupPercent}
                      onChange={(event) =>
                        onUpsertActive({
                          ...activeProposal,
                          staffing: updateStaffing(
                            activeProposal.staffing,
                            line.id,
                            {
                              markupPercent: normalizePercentInput(
                                event.target.value,
                              ),
                            },
                          ),
                        })
                      }
                    />
                  </td>
                  <td className="staffing-effective-cell">
                    {formatCurrency(effectiveRate)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {!canAdvanceFromRoles(activeProposal) && (
          <p className="warning">
            Selected role lines must have valid rates and total 100% before you
            can continue.
          </p>
        )}
      </div>
    </div>
  );
}
