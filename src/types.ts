export type ProposalStatus = "Draft" | "ReadyForApproval" | "Approved";

export type PhaseId =
  | "discovery"
  | "strategy_architecture"
  | "creative_direction"
  | "content"
  | "development"
  | "testing"
  | "documentation"
  | "launch";

export type RoleId =
  | "strategist"
  | "project_manager"
  | "designer"
  | "developer"
  | "contractor";

export type RoleScope = "lead" | "support";

export type ProjectSize = "Small" | "Medium" | "Large" | "XL";

export type CmsType =
  | "WordPress"
  | "Webflow"
  | "Shopify"
  | "Headless"
  | "Custom";

export type ComplexityBand = 1 | 1.1 | 1.25;

export type BlurbCategory =
  | "Inclusion"
  | "Assumptions"
  | "Exclusions"
  | "Security"
  | "Accessibility"
  | "Hosting"
  | "Training"
  | "Migration"
  | "General RFP";

export interface Phase {
  id: PhaseId;
  name: string;
  sortOrder: number;
}

export interface SizeTier {
  id: string;
  label: string;
  minBudget: number;
  maxBudget?: number;
}

export interface InclusionItem {
  id: string;
  name: string;
  description: string;
  phaseId: PhaseId;
}

export interface TimelineOption {
  id: string;
  label: string;
}

export interface RoleDefinition {
  id: RoleId;
  label: string;
  defaultBaseRate: number;
}

export interface ProposalInclusionState {
  inclusionId: string;
  allocationPercent: number;
  blurbIds: string[];
}

export interface ProposalStaffingLine {
  id: string;
  roleId: RoleId;
  scope: RoleScope;
  selected: boolean;
  allocationPercent: number;
  baseRate: number;
  markupPercent: number;
}

export interface RfpRequirement {
  id: string;
  prompt: string;
  response: string;
}

export interface BlurbLibraryItem {
  id: string;
  title: string;
  category: BlurbCategory;
  tags?: string[];
  contentPlaintext: string;
  isActive: boolean;
}

export interface ProposalDraft {
  id: string;
  name: string;
  clientName: string;
  projectTitle: string;
  status: ProposalStatus;
  sizeTierId: string;
  projectSize: ProjectSize;
  projectBufferPercent: number;
  timelineOptionId: string;
  complexity: {
    stakeholdersComplexitySize: ComplexityBand;
    cmsType: CmsType;
    notes: string;
  };
  inclusions: ProposalInclusionState[];
  staffing: ProposalStaffingLine[];
  rfpRequirements: RfpRequirement[];
  pickedBlurbIds: string[];
  assumptions: string;
  exclusions: string;
  risks: string;
  createdAt: string;
  updatedAt: string;
}

export interface PhaseAllocationSummary {
  phaseId: PhaseId;
  allocationPercent: number;
  budget: number;
}

export interface StaffingAllocationSummary {
  staffingLineId: string;
  roleId: RoleId;
  scope: RoleScope;
  allocationPercent: number;
  rate: number;
  markupPercent: number;
  effectiveRate: number;
  budget: number;
  hours: number;
}

export interface ReviewModel {
  phaseAllocations: PhaseAllocationSummary[];
  staffingAllocations: StaffingAllocationSummary[];
  totalHours: number;
  projectSubtotal: number;
  projectBufferPercent: number;
  projectBufferAmount: number;
  totalPrice: number;
}
