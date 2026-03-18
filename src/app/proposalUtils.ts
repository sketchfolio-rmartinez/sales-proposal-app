import { type EditorStep } from "./editorConfig";
import {
  createDefaultStaffingLines,
  getStaffingLineId,
  inclusions,
  sizeTiers,
  timelineOptions,
} from "../data/defaults";
import {
  ProposalDraft,
  ProposalInclusionState,
  ProposalStaffingLine,
  ProposalStatus,
} from "../types";

const STORAGE_KEY = "sales-proposal-app:v1";
const PERCENT_EPSILON = 0.01;

type LegacyInclusionState = ProposalInclusionState & {
  selected?: boolean;
  blurbId?: string | null;
};

type LegacyStaffingState = {
  roleId: ProposalStaffingLine["roleId"];
  leadSelected?: boolean;
  supportSelected?: boolean;
  baseRate?: number;
  markupPercent?: number;
};

function toNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function clampPercent(value: number): number {
  return Math.min(100, Math.max(0, Math.round(value * 100) / 100));
}

function normalizeStakeholderComplexity(value: unknown): ProposalDraft["complexity"]["stakeholdersComplexitySize"] {
  if (value === 1 || value === 1.1 || value === 1.25) {
    return value;
  }

  if (value === 1.5) {
    return 1.25;
  }

  return 1.1;
}

function distributeEvenly(keys: string[]): Record<string, number> {
  if (keys.length === 0) return {};

  let remaining = 100;
  return keys.reduce<Record<string, number>>((accumulator, key, index) => {
    const isLast = index === keys.length - 1;
    const nextValue = isLast
      ? remaining
      : Math.round((100 / keys.length) * 100) / 100;
    accumulator[key] = nextValue;
    remaining = Math.round((remaining - nextValue) * 100) / 100;
    return accumulator;
  }, {});
}

function normalizeInclusions(
  rawInclusions: unknown,
): ProposalInclusionState[] {
  const entries = Array.isArray(rawInclusions)
    ? (rawInclusions as LegacyInclusionState[])
    : [];
  const selectedIds = entries
    .filter((item) =>
      typeof item?.allocationPercent === "number"
        ? item.allocationPercent > 0
        : Boolean(item?.selected),
    )
    .map((item) => item.inclusionId);
  const fallbackDistribution = distributeEvenly(selectedIds);

  return inclusions.map((inclusion) => {
    const existing = entries.find((item) => item.inclusionId === inclusion.id);
    const blurbIds = Array.isArray(existing?.blurbIds)
      ? existing.blurbIds
      : existing?.blurbId
        ? [existing.blurbId]
        : [];

    return {
      inclusionId: inclusion.id,
      allocationPercent:
        typeof existing?.allocationPercent === "number"
          ? clampPercent(existing.allocationPercent)
          : clampPercent(fallbackDistribution[inclusion.id] ?? 0),
      blurbIds,
    };
  });
}

function normalizeStaffing(rawStaffing: unknown): ProposalStaffingLine[] {
  const defaults = createDefaultStaffingLines();
  const entries = Array.isArray(rawStaffing) ? rawStaffing : [];
  const hasScopedLines = entries.some(
    (item) => typeof item === "object" && item !== null && "scope" in item,
  );

  if (hasScopedLines) {
    return defaults.map((line) => {
      const existing = entries.find(
        (item) =>
          typeof item === "object" &&
          item !== null &&
          "id" in item &&
          item.id === line.id,
      ) as Partial<ProposalStaffingLine> | undefined;

      return {
        ...line,
        selected: Boolean(existing?.selected),
        allocationPercent: clampPercent(
          toNumber(existing?.allocationPercent, line.allocationPercent),
        ),
        baseRate: toNumber(existing?.baseRate, line.baseRate),
        markupPercent: clampPercent(
          toNumber(existing?.markupPercent, line.markupPercent),
        ),
      };
    });
  }

  const legacyEntries = entries as LegacyStaffingState[];
  const selectedLineIds = legacyEntries.flatMap((item) => {
    const lineIds: string[] = [];
    if (item.leadSelected) {
      lineIds.push(getStaffingLineId(item.roleId, "lead"));
    }
    if (item.supportSelected) {
      lineIds.push(getStaffingLineId(item.roleId, "support"));
    }
    return lineIds;
  });
  const fallbackDistribution = distributeEvenly(selectedLineIds);

  return defaults.map((line) => {
    const existing = legacyEntries.find((item) => item.roleId === line.roleId);
    const isSelected =
      line.scope === "lead"
        ? Boolean(existing?.leadSelected)
        : Boolean(existing?.supportSelected);

    return {
      ...line,
      selected: isSelected,
      allocationPercent: clampPercent(fallbackDistribution[line.id] ?? 0),
      baseRate: toNumber(existing?.baseRate, line.baseRate),
      markupPercent: clampPercent(
        toNumber(existing?.markupPercent, line.markupPercent),
      ),
    };
  });
}

function normalizeProposal(rawProposal: unknown): ProposalDraft | null {
  if (!rawProposal || typeof rawProposal !== "object") return null;
  const proposal = rawProposal as Partial<ProposalDraft>;
  const sizeTierId =
    typeof proposal.sizeTierId === "string" &&
    sizeTiers.some((tier) => tier.id === proposal.sizeTierId)
      ? proposal.sizeTierId
      : sizeTiers[0].id;

  return {
    id:
      typeof proposal.id === "string" ? proposal.id : crypto.randomUUID(),
    name: typeof proposal.name === "string" ? proposal.name : "",
    clientName:
      typeof proposal.clientName === "string" ? proposal.clientName : "",
    projectTitle:
      typeof proposal.projectTitle === "string" ? proposal.projectTitle : "",
    status:
      proposal.status === "ReadyForApproval" || proposal.status === "Approved"
        ? proposal.status
        : "Draft",
    sizeTierId,
    startDate:
      typeof proposal.startDate === "string" ? proposal.startDate : "",
    endDate:
      typeof proposal.endDate === "string" ? proposal.endDate : "",
    projectSize:
      proposal.projectSize === "Small" ||
      proposal.projectSize === "Medium" ||
      proposal.projectSize === "Large" ||
      proposal.projectSize === "XL"
        ? proposal.projectSize
        : "Medium",
    projectBufferPercent: clampPercent(
      toNumber(proposal.projectBufferPercent, 0),
    ),
    timelineOptionId:
      typeof proposal.timelineOptionId === "string" &&
      timelineOptions.some((option) => option.id === proposal.timelineOptionId)
        ? proposal.timelineOptionId
        : timelineOptions[1].id,
    complexity: {
      stakeholdersComplexitySize: normalizeStakeholderComplexity(
        proposal.complexity?.stakeholdersComplexitySize,
      ),
      cmsType:
        proposal.complexity?.cmsType === "WordPress" ||
        proposal.complexity?.cmsType === "Webflow" ||
        proposal.complexity?.cmsType === "Shopify" ||
        proposal.complexity?.cmsType === "Headless" ||
        proposal.complexity?.cmsType === "Custom"
          ? proposal.complexity.cmsType
          : "WordPress",
      notes: typeof proposal.complexity?.notes === "string"
        ? proposal.complexity.notes
        : "",
    },
    inclusions: normalizeInclusions(proposal.inclusions),
    staffing: normalizeStaffing(proposal.staffing),
    rfpRequirements: Array.isArray(proposal.rfpRequirements)
      ? proposal.rfpRequirements
          .filter(
            (item): item is ProposalDraft["rfpRequirements"][number] =>
              Boolean(item) &&
              typeof item.id === "string" &&
              typeof item.prompt === "string" &&
              typeof item.response === "string",
          )
      : [],
    pickedBlurbIds: Array.isArray(proposal.pickedBlurbIds)
      ? proposal.pickedBlurbIds.filter(
          (item): item is string => typeof item === "string",
        )
      : [],
    assumptions:
      typeof proposal.assumptions === "string" ? proposal.assumptions : "",
    exclusions:
      typeof proposal.exclusions === "string" ? proposal.exclusions : "",
    risks: typeof proposal.risks === "string" ? proposal.risks : "",
    createdAt:
      typeof proposal.createdAt === "string"
        ? proposal.createdAt
        : new Date().toISOString(),
    updatedAt:
      typeof proposal.updatedAt === "string"
        ? proposal.updatedAt
        : new Date().toISOString(),
  };
}

export function loadStoredProposals(): ProposalDraft[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(normalizeProposal)
      .filter((proposal): proposal is ProposalDraft => Boolean(proposal));
  } catch {
    return [];
  }
}

export function saveStoredProposals(proposals: ProposalDraft[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(proposals));
}

export function touch(draft: ProposalDraft): ProposalDraft {
  return { ...draft, updatedAt: new Date().toISOString() };
}

export function updateInclusion(
  inclusionsState: ProposalInclusionState[],
  inclusionId: string,
  patch: Partial<ProposalInclusionState>,
): ProposalInclusionState[] {
  return inclusionsState.map((item) =>
    item.inclusionId === inclusionId ? { ...item, ...patch } : item,
  );
}

export function updateStaffing(
  staffingState: ProposalStaffingLine[],
  staffingLineId: string,
  patch: Partial<ProposalStaffingLine>,
): ProposalStaffingLine[] {
  return staffingState.map((item) =>
    item.id === staffingLineId ? { ...item, ...patch } : item,
  );
}

export function getInclusionAllocationTotal(draft: ProposalDraft): number {
  return Math.round(
    draft.inclusions.reduce(
      (sum, item) => sum + clampPercent(item.allocationPercent),
      0,
    ) * 100,
  ) / 100;
}

export function getSelectedStaffingLines(
  draft: ProposalDraft,
): ProposalStaffingLine[] {
  return draft.staffing.filter(
    (item) => item.selected || item.allocationPercent > 0,
  );
}

export function getStaffingAllocationTotal(draft: ProposalDraft): number {
  return Math.round(
    getSelectedStaffingLines(draft).reduce(
      (sum, item) => sum + clampPercent(item.allocationPercent),
      0,
    ) * 100,
  ) / 100;
}

function isPercentComplete(total: number): boolean {
  return Math.abs(total - 100) <= PERCENT_EPSILON;
}

export function canAdvanceFromSetup(draft: ProposalDraft): boolean {
  return Boolean(
    draft.name.trim() &&
      draft.clientName.trim() &&
      draft.projectTitle.trim() &&
      draft.sizeTierId &&
      draft.timelineOptionId &&
      draft.projectSize &&
      draft.complexity.stakeholdersComplexitySize &&
      draft.complexity.cmsType,
  );
}

export function canAdvanceFromInclusions(draft: ProposalDraft): boolean {
  return isPercentComplete(getInclusionAllocationTotal(draft));
}

export function canAdvanceFromRoles(draft: ProposalDraft): boolean {
  const selectedLines = getSelectedStaffingLines(draft);
  if (selectedLines.length === 0) return false;

  const hasInvalidRate = selectedLines.some((line) => line.baseRate <= 0);
  if (hasInvalidRate) return false;

  return isPercentComplete(getStaffingAllocationTotal(draft));
}

export function canAdvanceFromRfp(draft: ProposalDraft): boolean {
  return draft.rfpRequirements.every(
    (item) => item.prompt.trim() && item.response.trim(),
  );
}

export function canAdvanceFromStep(
  draft: ProposalDraft,
  step: EditorStep,
): boolean {
  if (step === 1) return canAdvanceFromSetup(draft);
  if (step === 2) return canAdvanceFromInclusions(draft);
  if (step === 3) return canAdvanceFromRoles(draft);
  if (step === 4) return canAdvanceFromRfp(draft);
  if (step === 5) return true;
  return false;
}

export function getMaxAccessibleStep(draft: ProposalDraft): EditorStep {
  for (const step of [1, 2, 3, 4, 5] as const) {
    if (!canAdvanceFromStep(draft, step)) return step;
  }
  return 6;
}

export function canOpenStep(
  draft: ProposalDraft,
  step: EditorStep,
): boolean {
  return step <= getMaxAccessibleStep(draft);
}

export function statusActionLabel(status: ProposalStatus): string {
  if (status === "Draft") return "Mark Ready";
  if (status === "ReadyForApproval") return "Approve";
  return "Approved";
}

export function filterProposals(
  proposals: ProposalDraft[],
  query: string,
): ProposalDraft[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return proposals;

  return proposals.filter((proposal) => {
    const name = proposal.name.toLowerCase();
    const title = proposal.projectTitle.toLowerCase();
    const client = proposal.clientName.toLowerCase();
    return (
      name.includes(normalizedQuery) ||
      title.includes(normalizedQuery) ||
      client.includes(normalizedQuery)
    );
  });
}

export function formatUpdated(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function sizeTierLabel(sizeTierId: string): string {
  return sizeTiers.find((tier) => tier.id === sizeTierId)?.label ?? "";
}
