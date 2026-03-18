import {
  BlurbLibraryItem,
  InclusionItem,
  Phase,
  ProposalDraft,
  ProposalStaffingLine,
  RoleDefinition,
  RoleId,
  RoleScope,
  SizeTier,
  TimelineOption,
} from "../types";

export const phases: Phase[] = [
  { id: "discovery", name: "Discovery", sortOrder: 1 },
  {
    id: "strategy_architecture",
    name: "Strategy & Architecture",
    sortOrder: 2,
  },
  { id: "creative_direction", name: "Creative Direction", sortOrder: 3 },
  { id: "content", name: "Content", sortOrder: 4 },
  { id: "development", name: "Development", sortOrder: 5 },
  { id: "testing", name: "Testing", sortOrder: 6 },
  { id: "documentation", name: "Documentation", sortOrder: 7 },
  { id: "launch", name: "Launch", sortOrder: 8 },
];

export const sizeTiers: SizeTier[] = [
  {
    id: "tier_20_30",
    label: "$20k-$30k",
    minBudget: 20000,
    maxBudget: 30000,
  },
  {
    id: "tier_30_50",
    label: "$30k-$50k",
    minBudget: 30000,
    maxBudget: 50000,
  },
  {
    id: "tier_50_80",
    label: "$50k-$80k",
    minBudget: 50000,
    maxBudget: 80000,
  },
  {
    id: "tier_80_100",
    label: "$80k-$100k",
    minBudget: 80000,
    maxBudget: 100000,
  },
  {
    id: "tier_100_130",
    label: "$100k-$130k",
    minBudget: 100000,
    maxBudget: 130000,
  },
  {
    id: "tier_130_plus",
    label: "$130k+",
    minBudget: 130000,
  },
];

export const timelineOptions: TimelineOption[] = [
  { id: "8_weeks", label: "8 weeks" },
  { id: "12_weeks", label: "12 weeks" },
  { id: "16_weeks", label: "16 weeks" },
  { id: "20_weeks", label: "20+ weeks" },
];

export const roles: RoleDefinition[] = [
  { id: "strategist", label: "Strategist", defaultBaseRate: 150 },
  { id: "project_manager", label: "Project Manager", defaultBaseRate: 150 },
  { id: "designer", label: "Designer", defaultBaseRate: 150 },
  { id: "developer", label: "Developer", defaultBaseRate: 150 },
  { id: "contractor", label: "Contractor", defaultBaseRate: 150 },
];

export const inclusions: InclusionItem[] = [
  {
    id: "inc_discovery_workshop",
    name: "Stakeholder Discovery Workshop",
    description: "Alignment workshop and project brief validation.",
    phaseId: "discovery",
  },
  {
    id: "inc_ia",
    name: "Information Architecture",
    description: "Sitemap and page model definition.",
    phaseId: "strategy_architecture",
  },
  {
    id: "inc_ui_direction",
    name: "UI Direction Set",
    description: "Design system direction and key templates.",
    phaseId: "creative_direction",
  },
  {
    id: "inc_content_modeling",
    name: "Content Modeling",
    description: "Content types and migration planning.",
    phaseId: "content",
  },
  {
    id: "inc_build_core_pages",
    name: "Core Page Build",
    description: "Build and QA of primary templates/components.",
    phaseId: "development",
  },
  {
    id: "inc_testing",
    name: "Functional QA + UAT Support",
    description: "Structured testing and issue triage.",
    phaseId: "testing",
  },
  {
    id: "inc_docs_training",
    name: "Documentation + Admin Training",
    description: "Operational documentation and training session.",
    phaseId: "documentation",
  },
  {
    id: "inc_launch_support",
    name: "Launch Window Support",
    description: "Go-live checklist and post-launch monitoring.",
    phaseId: "launch",
  },
];

export const defaultAssumptions =
  "- Client provides timely stakeholder access.\n- Feedback cycles are consolidated into one response per round.\n- Existing brand assets are available and production-ready.";

export const defaultExclusions =
  "- Ongoing retainer support after launch.\n- Net-new enterprise integrations not listed in scope.\n- Multi-language localization workflows.";

export const defaultRisks =
  "- Delayed stakeholder feedback can extend timeline.\n- Third-party platform limitations may change implementation approach.\n- Content readiness may affect development sequencing.";

export const blurbLibrary: BlurbLibraryItem[] = [
  {
    id: "blurb_compliance",
    title: "Accessibility and Compliance",
    category: "Accessibility",
    tags: ["compliance", "a11y"],
    contentPlaintext:
      "Our process includes WCAG-informed design and QA checks during implementation.",
    isActive: true,
  },
  {
    id: "blurb_handoff",
    title: "Post-launch Handoff",
    category: "Training",
    tags: ["training"],
    contentPlaintext:
      "We provide admin training and concise documentation to support internal team ownership.",
    isActive: true,
  },
  {
    id: "blurb_content_modeling_scope",
    title: "Content Modeling Scope",
    category: "Inclusion",
    contentPlaintext:
      "Content modeling includes defining reusable content types, field structures, and relationships needed for long-term content governance.",
    isActive: true,
  },
  {
    id: "blurb_security_practices",
    title: "Security Practices",
    category: "Security",
    contentPlaintext:
      "Our development practices follow secure coding standards, dependency hygiene, and environment-level access controls appropriate to the project.",
    isActive: true,
  },
  {
    id: "blurb_hosting_responsibility",
    title: "Hosting Responsibility",
    category: "Hosting",
    contentPlaintext:
      "Hosting, DNS, and third-party infrastructure procurement are assumed to remain client-managed unless explicitly included in scope.",
    isActive: true,
  },
];

export function getStaffingLineId(roleId: RoleId, scope: RoleScope): string {
  return `${roleId}_${scope}`;
}

export function getDefaultBudgetAmount(sizeTierId: string): number {
  const tier = sizeTiers.find((item) => item.id === sizeTierId) ?? sizeTiers[0];
  return tier.maxBudget ?? tier.minBudget;
}

export function createDefaultStaffingLines(): ProposalStaffingLine[] {
  return roles.flatMap((role) =>
    (["lead", "support"] as const).map((scope) => ({
      id: getStaffingLineId(role.id, scope),
      roleId: role.id,
      scope,
      selected: false,
      allocationPercent: 0,
      baseRate: role.defaultBaseRate,
      markupPercent: 0,
    })),
  );
}

export function createDraftProposal(): ProposalDraft {
  const now = new Date().toISOString();
  const defaultTierId = sizeTiers[2].id;

  return {
    id: crypto.randomUUID(),
    name: "",
    clientName: "",
    projectTitle: "",
    status: "Draft",
    sizeTierId: defaultTierId,
    startDate: "",
    endDate: "",
    projectSize: "Medium",
    projectBufferPercent: 0,
    timelineOptionId: timelineOptions[1].id,
    complexity: {
      stakeholdersComplexitySize: 1.1,
      cmsType: "WordPress",
      notes: "",
    },
    inclusions: inclusions.map((item) => ({
      inclusionId: item.id,
      allocationPercent: 0,
      blurbIds: [],
    })),
    staffing: createDefaultStaffingLines(),
    rfpRequirements: [],
    pickedBlurbIds: [],
    assumptions: defaultAssumptions,
    exclusions: defaultExclusions,
    risks: defaultRisks,
    createdAt: now,
    updatedAt: now,
  };
}
