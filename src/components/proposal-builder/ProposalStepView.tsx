import { ReactNode } from "react";
import {
  getInclusionAllocationTotal,
  getStaffingAllocationTotal,
} from "../../app/proposalUtils";
import { EditorStepInclusionsScopeBuilder } from "./steps/EditorStepInclusionsScopeBuilder";
import { EditorStepExports } from "./steps/EditorStepExports";
import { EditorStepRfpRequirementsBlurbs } from "./steps/EditorStepRfpRequirementsBlurbs";
import { EditorStepReviewGenerate } from "./steps/EditorStepReviewGenerate";
import { EditorStepRolesLeadSupport } from "./steps/EditorStepRolesLeadSupport";
import { EditorStepSetupComplexity } from "./steps/EditorStepSetupComplexity";
import { EditorStep } from "../../app/editorConfig";
import {
  BlurbLibraryItem,
  ProposalDraft,
  ReviewModel,
} from "../../types";
import { getSetupEstimate } from "../../lib/proposalStepViewUtils";

interface ProposalStepViewProps {
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

export function ProposalStepView({
  step,
  activeProposal,
  blurbs,
  review,
  exportText,
  exportCsv,
  onUpsertActive,
  onTransitionStatus,
  onDownloadCsv,
}: ProposalStepViewProps) {
  const inclusionTotal = getInclusionAllocationTotal(activeProposal);
  const remainingInclusionAllocation = Math.round((100 - inclusionTotal) * 100) / 100;
  const staffingTotal = getStaffingAllocationTotal(activeProposal);
  const remainingStaffingAllocation = Math.round((100 - staffingTotal) * 100) / 100;
  const { setupReady, roughEstimate } = getSetupEstimate(activeProposal, review);

  const stepViews: Record<EditorStep, () => ReactNode> = {
    1: () => (
      <EditorStepSetupComplexity
        activeProposal={activeProposal}
        setupReady={setupReady}
        roughEstimate={roughEstimate}
        onUpsertActive={onUpsertActive}
      />
    ),
    2: () => (
      <EditorStepInclusionsScopeBuilder
        activeProposal={activeProposal}
        blurbs={blurbs}
        inclusionTotal={inclusionTotal}
        remainingInclusionAllocation={remainingInclusionAllocation}
        onUpsertActive={onUpsertActive}
      />
    ),
    3: () => (
      <EditorStepRolesLeadSupport
        activeProposal={activeProposal}
        staffingTotal={staffingTotal}
        remainingStaffingAllocation={remainingStaffingAllocation}
        onUpsertActive={onUpsertActive}
      />
    ),
    4: () => (
      <EditorStepRfpRequirementsBlurbs
        activeProposal={activeProposal}
        blurbs={blurbs}
        onUpsertActive={onUpsertActive}
      />
    ),
    5: () =>
      review ? (
      <EditorStepReviewGenerate
        activeProposal={activeProposal}
        review={review}
        onUpsertActive={onUpsertActive}
        onTransitionStatus={onTransitionStatus}
      />
      ) : null,
    6: () => (
      <EditorStepExports
        exportText={exportText}
        exportCsv={exportCsv}
        onDownloadCsv={onDownloadCsv}
      />
    ),
  };

  return stepViews[step]?.() ?? null;
}
