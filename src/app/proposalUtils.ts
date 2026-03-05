import { inclusions, sizeTiers } from "../data/defaults";
import { ProposalDraft, ProposalInclusionState, ProposalRoleStaffing, ProposalStatus } from "../types";

const STORAGE_KEY = "sales-proposal-app:v1";

export function loadStoredProposals(): ProposalDraft[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ProposalDraft[]) : [];
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
  patch: Partial<ProposalInclusionState>
): ProposalInclusionState[] {
  return inclusionsState.map((item) => (item.inclusionId === inclusionId ? { ...item, ...patch } : item));
}

export function updateStaffing(
  staffingState: ProposalRoleStaffing[],
  roleId: ProposalRoleStaffing["roleId"],
  patch: Partial<ProposalRoleStaffing>
): ProposalRoleStaffing[] {
  return staffingState.map((item) => (item.roleId === roleId ? { ...item, ...patch } : item));
}

export function canAdvanceFromInclusions(draft: ProposalDraft): boolean {
  for (const state of draft.inclusions) {
    const inclusion = inclusions.find((item) => item.id === state.inclusionId);
    if (!inclusion?.isRequired) continue;
    if (!state.selected && !state.overrideReason.trim()) return false;
  }
  return true;
}

export function statusActionLabel(status: ProposalStatus): string {
  if (status === "Draft") return "Mark Ready";
  if (status === "ReadyForApproval") return "Approve";
  return "Approved";
}

export function filterProposals(proposals: ProposalDraft[], query: string): ProposalDraft[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return proposals;
  return proposals.filter((proposal) => {
    const name = proposal.name.toLowerCase();
    const title = proposal.projectTitle.toLowerCase();
    const client = proposal.clientName.toLowerCase();
    return name.includes(normalizedQuery) || title.includes(normalizedQuery) || client.includes(normalizedQuery);
  });
}

export function formatUpdated(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function sizeTierLabel(sizeTierId: string): string {
  return sizeTiers.find((tier) => tier.id === sizeTierId)?.label ?? "";
}
