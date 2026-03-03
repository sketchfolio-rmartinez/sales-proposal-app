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

export type Seniority = "Standard" | "Senior";

export type CmsType =
  | "WordPress"
  | "Webflow"
  | "Shopify"
  | "Headless"
  | "Custom";

export type ComplexityBand = "Low" | "Medium" | "High";

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
  defaultPhaseBudgetPercent: Record<PhaseId, number>;
}

export interface InclusionItem {
  id: string;
  name: string;
  description: string;
  phaseId: PhaseId;
  isRequired: boolean;
  defaultHoursByRole: Partial<Record<RoleId, number>>;
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
  selected: boolean;
  overrideReason: string;
}

export interface ProposalRoleStaffing {
  roleId: RoleId;
  seniority: Seniority;
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
  tags: string[];
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
  timelineOptionId: string;
  complexity: {
    stakeholdersCompanySize: ComplexityBand;
    cmsType: CmsType;
    notes: string;
  };
  inclusions: ProposalInclusionState[];
  staffing: ProposalRoleStaffing[];
  rfpRequirements: RfpRequirement[];
  pickedBlurbIds: string[];
  assumptions: string;
  exclusions: string;
  risks: string;
  createdAt: string;
  updatedAt: string;
}

export interface EstimateLine {
  phaseId: PhaseId;
  roleId: RoleId;
  seniority: Seniority;
  hours: number;
  rate: number;
  cost: number;
  markup: number;
  price: number;
  source: "default" | "rule-adjusted" | "manual-override";
}

export interface ReviewModel {
  estimateLines: EstimateLine[];
  budgetByPhase: Record<PhaseId, number>;
  totalHours: number;
  totalPrice: number;
}
