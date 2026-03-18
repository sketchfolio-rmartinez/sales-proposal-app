import { sizeTiers, timelineOptions } from "../data/defaults";
import { ProposalDraft } from "../types";
import { SummaryPill } from "./SummaryPill";
import { StepSectionHeader } from "./StepSectionHeader";
import { normalizePercentInput } from "./editorStepFieldUtils";

interface EditorStepSetupComplexityProps {
  activeProposal: ProposalDraft;
  setupReady: boolean;
  roughEstimate: string;
  onUpsertActive: (draft: ProposalDraft) => void;
}

export function EditorStepSetupComplexity({
  activeProposal,
  setupReady,
  roughEstimate,
  onUpsertActive,
}: EditorStepSetupComplexityProps) {
  return (
    <div className="step-section">
      <div className="panel step-section-shell">
        <StepSectionHeader
          title="Setup & Complexity"
          description="Set the proposal basics, timeline, and complexity inputs that drive the working estimate."
          summary={
            <SummaryPill
              primaryLabel="Rough Estimate"
              primaryValue={setupReady ? roughEstimate : "Complete setup"}
            />
          }
        />
      </div>
      <div className="panel">
        <div className="subpanel">
          <h4>Proposal Setup</h4>
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
        </div>
        <div className="subpanel">
          <h4>Timeline</h4>
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
            Start Date
            <input
              type="date"
              value={activeProposal.startDate}
              onChange={(event) =>
                onUpsertActive({
                  ...activeProposal,
                  startDate: event.target.value,
                })
              }
            />
          </label>
          <label>
            End Date / Event Date
            <input
              type="date"
              value={activeProposal.endDate}
              onChange={(event) =>
                onUpsertActive({
                  ...activeProposal,
                  endDate: event.target.value,
                })
              }
            />
          </label>
        </div>
        <div className="subpanel">
          <h4>Complexity</h4>
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
              <option value="Small">Small (1.0x)</option>
              <option value="Medium">Medium (1.25x)</option>
              <option value="Large">Large (1.5x)</option>
              <option value="XL">XL (1.75x)</option>
            </select>
          </label>
          <label>
            Stakeholder Count
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
              <option value="1">1-5 (1.0x)</option>
              <option value="1.1">6-12 (1.15x)</option>
              <option value="1.25">13+ (1.3x)</option>
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
                    cmsType: event.target.value as ProposalDraft["complexity"]["cmsType"],
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
                  projectBufferPercent: normalizePercentInput(event.target.value),
                })
              }
            />
          </label>
        </div>
      </div>
    </div>
  );
}
