import { useState } from "react";
import { canAdvanceFromInclusions, updateInclusion } from "../../../app/proposalUtils";
import { inclusions, phases } from "../../../data/defaults";
import { BlurbLibraryItem, ProposalDraft } from "../../../types";
import { normalizePercentInput } from "../../../lib/editorStepFieldUtils";
import { BlurbPickerModal } from "../../blurbs/BlurbPickerModal";
import { StepSectionHeader } from "../../shared/StepSectionHeader";
import { SummaryPill } from "../../shared/SummaryPill";

interface EditorStepInclusionsScopeBuilderProps {
  activeProposal: ProposalDraft;
  blurbs: BlurbLibraryItem[];
  inclusionTotal: number;
  remainingInclusionAllocation: number;
  onUpsertActive: (draft: ProposalDraft) => void;
}

function formatPercentValue(value: number): string {
  return `${Math.round(value * 100) / 100}%`;
}

export function EditorStepInclusionsScopeBuilder({
  activeProposal,
  blurbs,
  inclusionTotal,
  remainingInclusionAllocation,
  onUpsertActive,
}: EditorStepInclusionsScopeBuilderProps) {
  const [inclusionPickerId, setInclusionPickerId] = useState<string | null>(null);
  const resolveBlurb = (blurbId: string | null | undefined) =>
    blurbs.find((blurb) => blurb.id === blurbId) ?? null;

  return (
    <>
      <div className="step-section">
        <div className="panel step-section-shell">
          <StepSectionHeader
            title="Inclusions (Scope Builder)"
            description="All inclusions start at 0%. Allocate the full 100% of the project budget to move forward."
            summary={
              <SummaryPill
                primaryLabel="Allocated"
                primaryValue={formatPercentValue(inclusionTotal)}
                secondaryLabel={
                  remainingInclusionAllocation >= 0 ? "Remaining" : "Over"
                }
                secondaryValue={formatPercentValue(
                  Math.abs(remainingInclusionAllocation),
                )}
                secondaryTone={
                  remainingInclusionAllocation === 0 ? "default" : "warning"
                }
              />
            }
          />
        </div>
        <div className="panel">
          {phases.map((phase) => {
            const phaseItems = inclusions.filter((item) => item.phaseId === phase.id);
            const phaseTotal = activeProposal.inclusions
              .filter((item) =>
                phaseItems.some((phaseItem) => phaseItem.id === item.inclusionId),
              )
              .reduce((sum, item) => sum + item.allocationPercent, 0);

            return (
              <div key={phase.id} className="subpanel">
                <div className="row wrap">
                  <h4>{phase.name}</h4>
                  <span className="muted">Phase total: {formatPercentValue(phaseTotal)}</span>
                </div>
                {phaseItems.map((inclusion) => {
                  const state = activeProposal.inclusions.find(
                    (item) => item.inclusionId === inclusion.id,
                  );
                  if (!state) return null;

                  return (
                    <div key={inclusion.id} className="inclusion-row">
                      <div className="allocation-row">
                        <div>
                          <strong>{inclusion.name}</strong>
                          <p className="muted">{inclusion.description}</p>
                        </div>
                        <label className="compact-field">
                          Allocation %
                          <input
                            type="number"
                            min={0}
                            max={100}
                            step={1}
                            value={state.allocationPercent}
                            onChange={(event) =>
                              onUpsertActive({
                                ...activeProposal,
                                inclusions: updateInclusion(
                                  activeProposal.inclusions,
                                  inclusion.id,
                                  {
                                    allocationPercent: normalizePercentInput(event.target.value),
                                  },
                                ),
                              })
                            }
                          />
                        </label>
                      </div>

                      <div className="inclusion-blurb-row">
                        {state.blurbIds.length > 0 ? (
                          <div className="inline-blurb-stack">
                            {state.blurbIds.map((blurbId) => {
                              const blurb = resolveBlurb(blurbId);
                              if (!blurb) return null;
                              return (
                                <div key={blurb.id} className="inline-blurb">
                                  <strong>{blurb.title}</strong>
                                  <span>{blurb.contentPlaintext}</span>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="muted">No inclusion blurbs attached.</p>
                        )}
                        <div className="row">
                          <button
                            type="button"
                            onClick={() => setInclusionPickerId(inclusion.id)}
                          >
                            {state.blurbIds.length > 0 ? "Manage Blurbs" : "+ Add Blurbs"}
                          </button>
                          {state.blurbIds.length > 0 && (
                            <button
                              type="button"
                              onClick={() =>
                                onUpsertActive({
                                  ...activeProposal,
                                  inclusions: updateInclusion(
                                    activeProposal.inclusions,
                                    inclusion.id,
                                    {
                                      blurbIds: [],
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
                    </div>
                  );
                })}
              </div>
            );
          })}

          {!canAdvanceFromInclusions(activeProposal) && (
            <p className="warning">
              Total inclusion allocation must equal 100% before you can continue.
            </p>
          )}
        </div>
      </div>

      {inclusionPickerId && (
        <BlurbPickerModal
          title="Pick Inclusion Blurbs"
          blurbs={blurbs.filter((blurb) => blurb.isActive)}
          allowedCategories={["Inclusion"]}
          selectedIds={
            activeProposal.inclusions.find(
              (item) => item.inclusionId === inclusionPickerId,
            )?.blurbIds ?? []
          }
          selectionMode="multiple"
          onClose={() => setInclusionPickerId(null)}
          onConfirm={(selectedIds) => {
            onUpsertActive({
              ...activeProposal,
              inclusions: updateInclusion(
                activeProposal.inclusions,
                inclusionPickerId,
                {
                  blurbIds: selectedIds,
                },
              ),
            });
            setInclusionPickerId(null);
          }}
        />
      )}
    </>
  );
}
