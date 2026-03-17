import { inclusions, phases } from "../data/defaults";
import { ProposalDraft, ReviewModel } from "../types";

function toFixedMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

function toFixedHours(value: number): number {
  return Math.round(value * 10) / 10;
}

export function buildReviewModel(draft: ProposalDraft): ReviewModel {
  const projectSubtotal = toFixedMoney(draft.budgetAmount);

  const phaseAllocations = phases.map((phase) => {
    const allocationPercent = draft.inclusions
      .filter((item) => {
        const inclusion = inclusions.find(
          (candidate) => candidate.id === item.inclusionId,
        );
        return inclusion?.phaseId === phase.id;
      })
      .reduce((sum, item) => sum + item.allocationPercent, 0);

    return {
      phaseId: phase.id,
      allocationPercent,
      budget: toFixedMoney(projectSubtotal * (allocationPercent / 100)),
    };
  });

  const staffingAllocations = draft.staffing
    .filter((line) => line.selected || line.allocationPercent > 0)
    .map((line) => {
      const rate = toFixedMoney(line.baseRate);
      const effectiveRate = toFixedMoney(rate * (1 + line.markupPercent / 100));
      const budget = toFixedMoney(projectSubtotal * (line.allocationPercent / 100));
      const hours =
        effectiveRate > 0 ? toFixedHours(budget / effectiveRate) : 0;

      return {
        staffingLineId: line.id,
        roleId: line.roleId,
        scope: line.scope,
        allocationPercent: line.allocationPercent,
        rate,
        markupPercent: line.markupPercent,
        effectiveRate,
        budget,
        hours,
      };
    });

  const totalHours = toFixedHours(
    staffingAllocations.reduce((sum, line) => sum + line.hours, 0),
  );
  const projectBufferPercent = draft.projectBufferPercent ?? 0;
  const projectBufferAmount = toFixedMoney(
    projectSubtotal * (projectBufferPercent / 100),
  );
  const totalPrice = toFixedMoney(projectSubtotal + projectBufferAmount);

  return {
    phaseAllocations,
    staffingAllocations,
    totalHours,
    projectSubtotal,
    projectBufferPercent,
    projectBufferAmount,
    totalPrice,
  };
}
