import { canAdvanceFromSetup } from "../app/proposalUtils";
import { sizeTiers } from "../data/defaults";
import {
  PROJECT_SIZE_MULTIPLIERS,
  STAKEHOLDER_SIZE_MULTIPLIERS,
} from "../config/estimation";
import { ProposalDraft, ReviewModel } from "../types";

function formatCurrency(value: number): string {
  return `$${Math.round(value).toLocaleString()}`;
}

export function getSetupEstimate(
  activeProposal: ProposalDraft,
  review: ReviewModel | null,
) {
  const selectedTier =
    sizeTiers.find((tier) => tier.id === activeProposal.sizeTierId) ?? sizeTiers[0];
  const projectSizeMultiplier =
    PROJECT_SIZE_MULTIPLIERS[activeProposal.projectSize] ?? 1;
  const stakeholderMultiplier =
    STAKEHOLDER_SIZE_MULTIPLIERS[
      activeProposal.complexity.stakeholdersComplexitySize
    ] ?? 1;

  return {
    setupReady: canAdvanceFromSetup(activeProposal),
    roughEstimate: formatCurrency(
      review?.totalPrice ??
        (selectedTier.maxBudget ?? selectedTier.minBudget) *
          projectSizeMultiplier *
          stakeholderMultiplier *
          (1 + activeProposal.projectBufferPercent / 100),
    ),
  };
}
