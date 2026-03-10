import {
  BlurbLibraryItem,
  InclusionItem,
  Phase,
  ProposalDraft,
  RoleDefinition,
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
    defaultPhaseBudgetPercent: {
      discovery: 10,
      strategy_architecture: 12,
      creative_direction: 10,
      content: 8,
      development: 35,
      testing: 10,
      documentation: 7,
      launch: 8,
    },
  },
  {
    id: "tier_30_50",
    label: "$30k-$50k",
    minBudget: 30000,
    maxBudget: 50000,
    defaultPhaseBudgetPercent: {
      discovery: 10,
      strategy_architecture: 12,
      creative_direction: 11,
      content: 9,
      development: 33,
      testing: 10,
      documentation: 7,
      launch: 8,
    },
  },
  {
    id: "tier_50_80",
    label: "$50k-$80k",
    minBudget: 50000,
    maxBudget: 80000,
    defaultPhaseBudgetPercent: {
      discovery: 11,
      strategy_architecture: 13,
      creative_direction: 12,
      content: 9,
      development: 30,
      testing: 10,
      documentation: 7,
      launch: 8,
    },
  },
  {
    id: "tier_80_100",
    label: "$80k-$100k",
    minBudget: 80000,
    maxBudget: 100000,
    defaultPhaseBudgetPercent: {
      discovery: 12,
      strategy_architecture: 14,
      creative_direction: 12,
      content: 9,
      development: 29,
      testing: 9,
      documentation: 7,
      launch: 8,
    },
  },
  {
    id: "tier_100_130",
    label: "$100k-$130k",
    minBudget: 100000,
    maxBudget: 130000,
    defaultPhaseBudgetPercent: {
      discovery: 12,
      strategy_architecture: 14,
      creative_direction: 13,
      content: 10,
      development: 27,
      testing: 9,
      documentation: 7,
      launch: 8,
    },
  },
  {
    id: "tier_130_plus",
    label: "$130k+",
    minBudget: 130000,
    defaultPhaseBudgetPercent: {
      discovery: 13,
      strategy_architecture: 15,
      creative_direction: 13,
      content: 10,
      development: 25,
      testing: 9,
      documentation: 7,
      launch: 8,
    },
  },
];

export const timelineOptions: TimelineOption[] = [
  { id: "8_weeks", label: "8 weeks" },
  { id: "12_weeks", label: "12 weeks" },
  { id: "16_weeks", label: "16 weeks" },
  { id: "20_weeks", label: "20+ weeks" },
];

export const roles: RoleDefinition[] = [
  { id: "strategist", label: "Strategist", defaultBaseRate: 160 },
  { id: "project_manager", label: "Project Manager", defaultBaseRate: 140 },
  { id: "designer", label: "Designer", defaultBaseRate: 135 },
  { id: "developer", label: "Developer", defaultBaseRate: 155 },
  { id: "contractor", label: "Contractor", defaultBaseRate: 125 },
];

export const inclusions: InclusionItem[] = [
  {
    id: "inc_discovery_workshop",
    name: "Stakeholder Discovery Workshop",
    description: "Alignment workshop and project brief validation.",
    phaseId: "discovery",
    isRequired: true,
    defaultHoursByRole: { strategist: 10, project_manager: 6 }, // this here needs to change right to better match what Chris has on his mind, about him being able to mess with these percentages as he goes.
  },
  {
    id: "inc_ia",
    name: "Information Architecture",
    description: "Sitemap and page model definition.",
    phaseId: "strategy_architecture",
    isRequired: true,
    defaultHoursByRole: { strategist: 10, designer: 8 },
  },
  {
    id: "inc_ui_direction",
    name: "UI Direction Set",
    description: "Design system direction and key templates.",
    phaseId: "creative_direction",
    isRequired: true,
    defaultHoursByRole: { designer: 20, strategist: 4 },
  },
  {
    id: "inc_content_modeling",
    name: "Content Modeling",
    description: "Content types and migration planning.",
    phaseId: "content",
    isRequired: false,
    defaultHoursByRole: { strategist: 8, project_manager: 4 },
  },
  {
    id: "inc_build_core_pages",
    name: "Core Page Build",
    description: "Build and QA of primary templates/components.",
    phaseId: "development",
    isRequired: true,
    defaultHoursByRole: { developer: 52, designer: 10, project_manager: 12 },
  },
  {
    id: "inc_testing",
    name: "Functional QA + UAT Support",
    description: "Structured testing and issue triage.",
    phaseId: "testing",
    isRequired: true,
    defaultHoursByRole: { developer: 14, project_manager: 8, contractor: 12 },
  },
  {
    id: "inc_docs_training",
    name: "Documentation + Admin Training",
    description: "Operational documentation and training session.",
    phaseId: "documentation",
    isRequired: true,
    defaultHoursByRole: { strategist: 4, project_manager: 6, developer: 4 },
  },
  {
    id: "inc_launch_support",
    name: "Launch Window Support",
    description: "Go-live checklist and post-launch monitoring.",
    phaseId: "launch",
    isRequired: true,
    defaultHoursByRole: { developer: 8, project_manager: 6 },
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
    tags: ["compliance", "a11y"],
    contentPlaintext:
      "Our process includes WCAG-informed design and QA checks during implementation.",
    isActive: true,
  },
  {
    id: "blurb_handoff",
    title: "Post-launch Handoff",
    tags: ["training"],
    contentPlaintext:
      "We provide admin training and concise documentation to support internal team ownership.",
    isActive: true,
  },
];

export function createDraftProposal(): ProposalDraft {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    name: "",
    clientName: "",
    projectTitle: "",
    status: "Draft",
    sizeTierId: sizeTiers[2].id,
    companySize: "Medium",
    timelineOptionId: timelineOptions[1].id,
    complexity: {
      stakeholdersCompanySize: "Medium",
      cmsType: "WordPress",
      notes: "",
    },
    inclusions: inclusions.map((item) => ({
      inclusionId: item.id,
      selected: true,
      overrideReason: "",
    })),
    staffing: roles.map((role) => ({
      roleId: role.id,
      seniority: "Standard",
      baseRate: role.defaultBaseRate,
      markupPercent: 30,
    })),
    rfpRequirements: [],
    pickedBlurbIds: [],
    assumptions: defaultAssumptions,
    exclusions: defaultExclusions,
    risks: defaultRisks,
    createdAt: now,
    updatedAt: now,
  };
}
