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
  const attachedBlurbCount = activeProposal.inclusions.reduce(
    (sum, item) => sum + item.blurbIds.length,
    0,
  );
  const activePhaseCount = phases.filter((phase) => {
    const phaseItems = inclusions.filter((item) => item.phaseId === phase.id);
    return activeProposal.inclusions.some(
      (item) =>
        phaseItems.some((phaseItem) => phaseItem.id === item.inclusionId) &&
        item.allocationPercent > 0,
    );
  }).length;
  const summaryLabel =
    remainingInclusionAllocation === 0
      ? "Allocated"
      : remainingInclusionAllocation > 0
        ? "Remaining"
        : "Over";
  const summaryValue =
    remainingInclusionAllocation === 0
      ? formatPercentValue(inclusionTotal)
      : formatPercentValue(Math.abs(remainingInclusionAllocation));

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
              primaryLabel={summaryLabel}
              primaryValue={summaryValue}
            />
          }
        />
        <div className="inclusions-dashboard">
          <div className="inclusions-metrics-grid">
            <article className="panel inclusions-metric-card">
              <span className="inclusions-metric-label">Allocated</span>
              <strong>{formatPercentValue(inclusionTotal)}</strong>
              <span className="inclusions-metric-note">
                of proposal scope assigned
              </span>
            </article>
            <article className="panel inclusions-metric-card">
              <span className="inclusions-metric-label">Phases In Play</span>
              <strong>{activePhaseCount}</strong>
              <span className="inclusions-metric-note">
                {activePhaseCount === 1 ? "phase has" : "phases have"} active
                allocation
              </span>
            </article>
            <article className="panel inclusions-metric-card">
              <span className="inclusions-metric-label">Attached Blurbs</span>
              <strong>{attachedBlurbCount}</strong>
              <span className="inclusions-metric-note">
                snippets connected to scope
              </span>
            </article>
          </div>

        <div className="panel inclusions-phase-grid">
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
            const phaseTotal = phaseStates.reduce(
              (sum, item) => sum + item.state.allocationPercent,
              0,
            );
            const activeInclusionCount = phaseStates.filter(
              (item) => item.state.allocationPercent > 0,
            ).length;
            const phaseBlurbCount = phaseStates.reduce(
              (sum, item) => sum + item.state.blurbIds.length,
              0,
            );

            return (
              <section key={phase.id} className="panel inclusions-phase-card">
                <div className="inclusions-phase-card-header">
                  <div className="inclusions-phase-card-heading">
                    <p className="inclusions-phase-card-kicker">{phase.name}</p>
                    <span className="inclusions-phase-card-meta">
                      {activeInclusionCount > 0
                        ? `${activeInclusionCount} active`
                        : "Not set"}
                    </span>
                  </div>
                  <div className="inclusions-phase-accent-bar" aria-hidden="true">
                    {phaseStates.map((item, index) => {
                      const width =
                        phaseTotal > 0
                          ? Math.max(
                              8,
                              (item.state.allocationPercent / phaseTotal) * 100,
                            )
                          : 100 / Math.max(phaseStates.length, 1);
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
                  <div className="inclusions-phase-card-stats">
                    <span>{formatPercentValue(phaseTotal)} allocated</span>
                    <span>{phaseBlurbCount} blurbs</span>
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
                          {state.blurbIds.length > 0 && (
                            <button
                              type="button"
                              className="inclusions-action-btn inclusions-action-btn--secondary"
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
