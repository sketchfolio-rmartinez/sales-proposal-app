import { useEffect, useMemo, useState } from "react";
import { createDraftProposal } from "../data/defaults";
import { generateProposalText, generateTeamworkCsv } from "../lib/exporters";
import { buildReviewModel } from "../lib/estimate";
import {
  BlurbLibraryItem,
  ProposalDraft,
  ProposalStatus,
  ReviewModel,
} from "../types";
import { type EditorStep } from "./editorConfig";
import {
  filterProposals,
  getMaxAccessibleStep,
  loadStoredProposals,
  saveStoredProposals,
  touch,
} from "./proposalUtils";

interface ProposalBuilderState {
  activeProposalId: string | null;
  proposalQuery: string;
  step: EditorStep;
}

interface ProposalBuilderView {
  activeProposal: ProposalDraft | null;
  review: ReviewModel | null;
  filteredProposals: ProposalDraft[];
  exportText: string;
  exportCsv: string;
}

interface ProposalBuilderHandlers {
  setActiveProposalId: (id: string | null) => void;
  setProposalQuery: (query: string) => void;
  setStep: (step: EditorStep | ((prev: EditorStep) => EditorStep)) => void;
  upsertActive: (draft: ProposalDraft) => void;
  newProposal: () => void;
  duplicateProposal: (proposal: ProposalDraft) => void;
  deleteProposal: (proposalId: string) => void;
  transitionStatus: () => void;
  downloadCsv: () => void;
}

export interface ProposalBuilderModel {
  state: ProposalBuilderState;
  view: ProposalBuilderView;
  handlers: ProposalBuilderHandlers;
}

export function useProposalBuilder(
  blurbs: BlurbLibraryItem[],
): ProposalBuilderModel {
  const [proposals, setProposals] = useState<ProposalDraft[]>(() =>
    loadStoredProposals(),
  );
  const [activeProposalId, setActiveProposalId] = useState<string | null>(
    proposals[0]?.id ?? null,
  );
  const [proposalQuery, setProposalQuery] = useState("");
  const [step, setStep] = useState<EditorStep>(1);

  const activeProposal = useMemo(
    () => proposals.find((item) => item.id === activeProposalId) ?? null,
    [activeProposalId, proposals],
  );

  useEffect(() => {
    if (!activeProposal) return;
    const maxAccessibleStep = getMaxAccessibleStep(activeProposal);
    if (step > maxAccessibleStep) {
      setStep(maxAccessibleStep);
    }
  }, [activeProposal, step]);

  const review = useMemo(
    () => (activeProposal ? buildReviewModel(activeProposal) : null),
    [activeProposal],
  );
  const filteredProposals = useMemo(
    () => filterProposals(proposals, proposalQuery),
    [proposalQuery, proposals],
  );
  const exportText = useMemo(
    () =>
      activeProposal && review
        ? generateProposalText(activeProposal, review, blurbs)
        : "",
    [activeProposal, blurbs, review],
  );
  const exportCsv = useMemo(
    () => (activeProposal ? generateTeamworkCsv(activeProposal) : ""),
    [activeProposal],
  );

  const persist = (next: ProposalDraft[]) => {
    setProposals(next);
    saveStoredProposals(next);
  };

  const upsertActive = (nextDraft: ProposalDraft) => {
    if (!activeProposal) return;
    const next = proposals.map((item) =>
      item.id === activeProposal.id ? touch(nextDraft) : item,
    );
    persist(next);
  };

  const newProposal = () => {
    const draft = createDraftProposal();
    const next = [draft, ...proposals];
    persist(next);
    setActiveProposalId(draft.id);
    setStep(1);
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
    }
  };

  const transitionStatus = () => {
    if (!activeProposal) return;
    const nextStatus: ProposalStatus =
      activeProposal.status === "Draft"
        ? "ReadyForApproval"
        : "Approved";
    upsertActive({ ...activeProposal, status: nextStatus });
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

  return {
    state: {
      activeProposalId,
      proposalQuery,
      step,
    },
    view: {
      activeProposal,
      review,
      filteredProposals,
      exportText,
      exportCsv,
    },
    handlers: {
      setActiveProposalId,
      setProposalQuery,
      setStep,
      upsertActive,
      newProposal,
      duplicateProposal,
      deleteProposal,
      transitionStatus,
      downloadCsv,
    },
  };
}
