import { useState } from "react";
import {
  canAdvanceFromInclusions,
  updateInclusion,
} from "../../../app/proposalUtils";
import { inclusions, phases } from "../../../data/defaults";
import { BlurbLibraryItem, ProposalDraft } from "../../../types";
import { normalizePercentInput } from "../../../lib/editorStepFieldUtils";
import { BlurbPickerModal } from "../../blurbs/BlurbPickerModal";
import { ProposalStepIntroShell } from "../../shared/ProposalStepIntroShell";
import { SummaryPill } from "../../shared/SummaryPill";
import "./EditorStepInclusionsScopeBuilder.css";

interface EditorStepInclusionsScopeBuilderProps {
  activeProposal: ProposalDraft;
  blurbs: BlurbLibraryItem[];
  inclusionTotal: number;
  remainingInclusionAllocation: number;
  onUpsertActive: (draft: ProposalDraft) => void;
}

const phaseAccentPalette = [
  "#8a6ee8",
  "#f39a2d",
  "#5c8edb",
  "#eb8f2f",
  "#45a658",
  "#6db7b0",
];

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
  const [inclusionPickerId, setInclusionPickerId] = useState<string | null>(
    null,
  );
  const resolveBlurb = (blurbId: string | null | undefined) =>
    blurbs.find((blurb) => blurb.id === blurbId) ?? null;

  return (
    <>
      <div className="step-section inclusions-step">
        <ProposalStepIntroShell
          activeProposal={activeProposal}
          className="inclusions-step-shell"
          showProposalMeta={false}
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
        <div className="inclusions-phase-grid">
          {phases.map((phase) => {
            const phaseItems = inclusions.filter(
              (item) => item.phaseId === phase.id,
            );
            const phaseStates = phaseItems
              .map((item) => ({
                inclusion: item,
                state: activeProposal.inclusions.find(
                  (state) => state.inclusionId === item.id,
                ),
              }))
              .filter(
                (
                  item,
                ): item is {
                  inclusion: (typeof phaseItems)[number];
                  state: ProposalDraft["inclusions"][number];
                } => Boolean(item.state),
              );
            const activeInclusionCount = phaseStates.filter(
              (item) => item.state.allocationPercent > 0,
            ).length;

            return (
              <section key={phase.id} className="panel inclusions-phase-card">
                <div className="inclusions-phase-card-header">
                  <div className="inclusions-phase-card-heading">
                    <p className="inclusions-phase-card-kicker">{phase.name}</p>
                    <span
                      className={`inclusions-phase-card-meta ${activeInclusionCount > 0 ? "is-active" : ""}`}
                    >
                      {activeInclusionCount > 0 ? "Active" : "Not set"}
                    </span>
                  </div>
                  <div className="inclusions-phase-accent-bar" aria-hidden="true">
                    {phaseStates.map((item, index) => {
                      const width = Math.max(
                        0,
                        Math.min(100, item.state.allocationPercent),
                      );
                      return (
                        <span
                          key={item.inclusion.id}
                          style={{
                            width: `${width}%`,
                            ["--phase-accent" as string]:
                              phaseAccentPalette[index % phaseAccentPalette.length],
                            opacity:
                              item.state.allocationPercent > 0 ? 1 : 0.3,
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
                <div className="inclusions-phase-list">
                {phaseItems.map((inclusion) => {
                  const state = activeProposal.inclusions.find(
                    (item) => item.inclusionId === inclusion.id,
                  );
                  if (!state) return null;

                  return (
                    <article key={inclusion.id} className="inclusions-item">
                      <div className="inclusions-item-top">
                        <div className="inclusions-item-copy">
                          <h4>{inclusion.name}</h4>
                          <p>{inclusion.description}</p>
                        </div>
                        <label className="inclusions-allocation-field">
                          <span>Allocation</span>
                          <div className="inclusions-allocation-input">
                            <input
                              type="number"
                              min={0}
                              max={100}
                              step={1}
                              inputMode="numeric"
                              value={state.allocationPercent}
                              onChange={(event) =>
                                onUpsertActive({
                                  ...activeProposal,
                                  inclusions: updateInclusion(
                                    activeProposal.inclusions,
                                    inclusion.id,
                                    {
                                      allocationPercent: normalizePercentInput(
                                        event.target.value,
                                      ),
                                    },
                                  ),
                                })
                              }
                            />
                            <span aria-hidden="true">%</span>
                          </div>
                        </label>
                      </div>

                      <div className="inclusions-blurb-section">
                        {state.blurbIds.length > 0 ? (
                          <div className="inclusions-blurb-list">
                            {state.blurbIds.map((blurbId) => {
                              const blurb = resolveBlurb(blurbId);
                              if (!blurb) return null;
                              return (
                                <div key={blurb.id} className="inclusions-blurb-card">
                                  <strong>{blurb.title}</strong>
                                  <span>{blurb.contentPlaintext}</span>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="inclusions-empty-state">
                            No inclusion blurbs attached.
                          </p>
                        )}
                        <div className="inclusions-actions">
                          <button
                            type="button"
                            className="inclusions-action-btn"
                            onClick={() => setInclusionPickerId(inclusion.id)}
                          >
                            {state.blurbIds.length > 0
                              ? "Manage Blurbs"
                              : "Add Blurbs"}
                          </button>
                          <span className="inclusions-blurb-count">
                            {state.blurbIds.length}{" "}
                            {state.blurbIds.length === 1 ? "blurb" : "blurbs"}
                          </span>
                        </div>
                      </div>
                    </article>
                  );
                })}
                </div>
              </section>
            );
          })}

          {!canAdvanceFromInclusions(activeProposal) && (
            <p className="warning inclusions-warning">
              Total inclusion allocation must equal 100% before you can
              continue.
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
