import { inclusions, phases, sizeTiers } from "../data/defaults";
import {
  EstimateLine,
  PhaseId,
  ProposalDraft,
  ProposalRoleStaffing,
  ReviewModel,
  RoleId,
} from "../types";

function complexityMultiplier(draft: ProposalDraft): number {
  // this here is.part of the formula
  const bandMult =
    draft.complexity.stakeholdersCompanySize === "High"
      ? 1.3
      : draft.complexity.stakeholdersCompanySize === "Low"
        ? 0.9
        : 1;

  const cmsMult =
    draft.complexity.cmsType === "Custom"
      ? 1.2
      : draft.complexity.cmsType === "Headless"
        ? 1.15
        : 1;

  return bandMult * cmsMult; // okkay cool to know this
}

function staffingMap(staffing: ProposalRoleStaffing[]) {
  return new Map(staffing.map((item) => [item.roleId, item]));
}

function calcRate(staffing?: ProposalRoleStaffing): number {
  if (!staffing) return 0;
  const seniorityMult = staffing.seniority === "Senior" ? 1.25 : 1;
  const effectiveRate = staffing.baseRate * seniorityMult;
  return Math.round(effectiveRate);
}

function toFixedMoney(value: number): number {
  return Math.round(value * 100) / 100;
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
      const adjustedHours = Math.round(hours * multiplier);
      const cost = toFixedMoney(adjustedHours * rate);
      const markup = staffing?.markupPercent ?? 0;
      const price = toFixedMoney(cost * (1 + markup / 100));

      return {
        phaseId,
        roleId,
        seniority: staffing?.seniority ?? "Standard",
        hours: adjustedHours,
        rate,
        cost,
        markup,
        price,
        source: multiplier === 1 ? "default" : "rule-adjusted",
      };
    },
  );

  estimateLines.sort((a, b) => {
    const phaseA = phases.find((p) => p.id === a.phaseId)?.sortOrder ?? 99;
    const phaseB = phases.find((p) => p.id === b.phaseId)?.sortOrder ?? 99;
    if (phaseA !== phaseB) return phaseA - phaseB;
    return a.roleId.localeCompare(b.roleId);
  });

  const totalPrice = estimateLines.reduce((sum, line) => sum + line.price, 0);
  const totalHours = estimateLines.reduce((sum, line) => sum + line.hours, 0);
  const tier =
    sizeTiers.find((item) => item.id === draft.sizeTierId) ?? sizeTiers[0];
  const budgetByPhase = {} as Record<PhaseId, number>;

  for (const phase of phases) {
    const phasePercent = tier.defaultPhaseBudgetPercent[phase.id] ?? 0;
    budgetByPhase[phase.id] = toFixedMoney(totalPrice * (phasePercent / 100));
  }

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
