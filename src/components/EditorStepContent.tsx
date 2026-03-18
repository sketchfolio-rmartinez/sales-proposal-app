import { useState } from "react";
import {
  sizeTiers,
} from "../data/defaults";
import {
  canAdvanceFromSetup,
  getInclusionAllocationTotal,
  getStaffingAllocationTotal,
} from "../app/proposalUtils";
import { EditorStepInclusionsScopeBuilder } from "./EditorStepInclusionsScopeBuilder";
import { EditorStepExports } from "./EditorStepExports";
import { EditorStepRfpRequirementsBlurbs } from "./EditorStepRfpRequirementsBlurbs";
import { EditorStepReviewGenerate } from "./EditorStepReviewGenerate";
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
    mode: "inclusion";
    inclusionId?: string;
  }>(null);

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
      <EditorStepRfpRequirementsBlurbs
        activeProposal={activeProposal}
        blurbs={blurbs}
        onUpsertActive={onUpsertActive}
      />
    );
  }

  if (step === 5 && review) {
    return (
      <EditorStepReviewGenerate
        activeProposal={activeProposal}
        review={review}
        onUpsertActive={onUpsertActive}
        onTransitionStatus={onTransitionStatus}
      />
    );
  }

  if (step === 6) {
    return (
      <EditorStepExports
        exportText={exportText}
        exportCsv={exportCsv}
        onDownloadCsv={onDownloadCsv}
      />
    );
  }

  return null;
}
