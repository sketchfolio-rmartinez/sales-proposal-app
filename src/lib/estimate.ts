import { inclusions, phases } from "../data/defaults";
import {
  EstimateLine,
  PhaseId,
  ProposalDraft,
  ProposalRoleStaffing,
  ReviewModel,
  RoleId,
} from "../types";
import {
  STAKEHOLDER_SIZE_MULTIPLIERS,
  CMS_MULTIPLIERS,
  COMPANY_SIZE_MULTIPLIERS,
} from "../config/estimation";

function complexityMultiplier(draft: ProposalDraft): number {
  const bandMult =
    STAKEHOLDER_SIZE_MULTIPLIERS[draft.complexity.stakeholdersCompanySize] ?? 1;
  const cmsMult = CMS_MULTIPLIERS[draft.complexity.cmsType] ?? 1;

  return bandMult * cmsMult;
}

function staffingMap(staffing: ProposalRoleStaffing[]) {
  return new Map(staffing.map((item) => [item.roleId, item]));
}

function calcRate(staffing?: ProposalRoleStaffing): number {
  if (!staffing) return 0;
  return Math.round(staffing.baseRate);
}

function toFixedMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

function companySizeMultiplier(size: string): number {
  return (
    COMPANY_SIZE_MULTIPLIERS[size as keyof typeof COMPANY_SIZE_MULTIPLIERS] ?? 1
  );
}

// this takes in the whole proposal draft and builds the review model, which is basically the most important logic
// this is the money
// this is where we have to get it right
// this is what crunches our numbers to generate the estimate and the bugdet numbers
export function buildReviewModel(draft: ProposalDraft): ReviewModel {
  // okay so grab all the inclusions we need
  const selectedInclusions = draft.inclusions
    .filter((state) => state.selected)
    .map((state) => inclusions.find((item) => item.id === state.inclusionId))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  const staff = staffingMap(draft.staffing);
  const multiplier = complexityMultiplier(draft); // ex 1.08
  const sizeMult = companySizeMultiplier(draft.companySize);

  const aggregate = new Map<string, number>();
  for (const inclusion of selectedInclusions) {
    for (const [roleId, baseHours] of Object.entries(
      inclusion.defaultHoursByRole,
    )) {
      if (!baseHours) continue;
      const key = `${inclusion.phaseId}|${roleId}`;
      const current = aggregate.get(key) ?? 0;
      aggregate.set(key, current + baseHours);
    }
  }

  const estimateLines: EstimateLine[] = Array.from(aggregate.entries()).map(
    ([key, hours]) => {
      const [phaseId, roleId] = key.split("|") as [PhaseId, RoleId];
      const staffing = staff.get(roleId);
      const rate = calcRate(staffing);
      const adjustedHours = Math.round(hours * sizeMult * multiplier);
      const cost = toFixedMoney(adjustedHours * rate);
      const markup = staffing?.markupPercent ?? 0;
      const price = toFixedMoney(cost * (1 + markup / 100));

      return {
        phaseId,
        roleId,
        hours: adjustedHours,
        rate,
        cost,
        markup,
        price,
        source: multiplier === 1 ? "default" : "rule-adjusted",
      };
    },
  );

  const budgetByPhase = {} as Record<PhaseId, number>;
  for (const phase of phases) {
    const phasePrice = estimateLines
      .filter((line) => line.phaseId === phase.id)
      .reduce((sum, line) => sum + line.price, 0);
    budgetByPhase[phase.id] = toFixedMoney(phasePrice);
  }

  estimateLines.sort((a, b) => {
    const phaseA = phases.find((p) => p.id === a.phaseId)?.sortOrder ?? 99;
    const phaseB = phases.find((p) => p.id === b.phaseId)?.sortOrder ?? 99;
    if (phaseA !== phaseB) return phaseA - phaseB;
    return a.roleId.localeCompare(b.roleId);
  });

  const totalPrice = Object.values(budgetByPhase).reduce(
    (sum, phaseBudget) => sum + phaseBudget,
    0,
  );
  const totalHours = estimateLines.reduce((sum, line) => sum + line.hours, 0);

  console.log("Review Model:\n\n", {
    estimateLines,
    budgetByPhase,
    totalHours,
    totalPrice: toFixedMoney(totalPrice),
  });
  return {
    estimateLines,
    budgetByPhase,
    totalHours,
    totalPrice: toFixedMoney(totalPrice),
  };
}
