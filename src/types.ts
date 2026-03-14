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

export type CmsType =
  | "WordPress"
  | "Webflow"
  | "Shopify"
  | "Headless"
  | "Custom";

export type ComplexityBand = 1 | 1.25 | 1.5;

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
  defaultPhaseBudgetPercent: Record<PhaseId, number>; // not sure what this one does?
}

export interface InclusionItem {
  id: string;
  name: string;
  description: string;
  phaseId: PhaseId;
  isRequired: boolean;
  defaultHoursByRole: Partial<Record<RoleId, number>>; // ex defaultHoursByRole: { strategist: 10, project_manager: 6 }
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
  blurbId: string | null;
}

export interface ProposalRoleStaffing {
  roleId: RoleId;
  leadSelected: boolean;
  supportSelected: boolean;
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
  projectSize: "Small" | "Medium" | "Large" | "XL";
  projectBufferPercent: number;
  timelineOptionId: string;
  complexity: {
    stakeholdersComplexitySize: ComplexityBand;
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
  hours: number;
  rate: number;
  cost: number;
  markup: number;
  price: number;
  source: "default" | "rule-adjusted" | "manual-override";
}

export interface ReviewModel {
  // okay this is the money model here
  estimateLines: EstimateLine[];
  budgetByPhase: Record<PhaseId, number>;
  totalHours: number;
  projectSubtotal: number;
  projectBufferPercent: number;
  projectBufferAmount: number;
  totalPrice: number;
}
