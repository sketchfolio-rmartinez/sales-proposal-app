import { inclusions, phases, roles, sizeTiers } from "../data/defaults";
import { BlurbLibraryItem, ProposalDraft, ReviewModel } from "../types";

export function generateProposalText(
  draft: ProposalDraft,
  review: ReviewModel,
  blurbs: BlurbLibraryItem[],
): string {
  const tier = sizeTiers.find((item) => item.id === draft.sizeTierId);
  const pickedBlurbs = blurbs.filter((item) => draft.pickedBlurbIds.includes(item.id));
  const selectedInclusions = draft.inclusions
    .filter((item) => item.allocationPercent > 0)
    .map((item) => {
      const inclusion = inclusions.find((inc) => inc.id === item.inclusionId);
      return inclusion
        ? {
            inclusion,
            allocationPercent: item.allocationPercent,
            blurbs: blurbs.filter((blurb) => item.blurbIds.includes(blurb.id)),
          }
        : null;
    })
    .filter((item): item is { inclusion: NonNullable<typeof inclusions[number]>; allocationPercent: number; blurbs: BlurbLibraryItem[] } => Boolean(item));

  const lines: string[] = [];
  lines.push(`# ${draft.projectTitle || draft.name || "Proposal"}`);
  lines.push("");
  lines.push("## Client");
  lines.push(draft.clientName || "TBD");
  lines.push("");
  lines.push("## Scope Summary");
  lines.push(`- Size Tier: ${tier?.label ?? "TBD"}`);
  if (draft.startDate) {
    lines.push(`- Start Date: ${draft.startDate}`);
  }
  if (draft.endDate) {
    lines.push(`- End Date / Event Date: ${draft.endDate}`);
  }
  lines.push("");

  for (const phase of phases) {
    const phaseInclusions = selectedInclusions.filter((item) => item.inclusion.phaseId === phase.id);
    if (phaseInclusions.length === 0) continue;
    lines.push(`### ${phase.name}`);
    for (const item of phaseInclusions) {
      lines.push(`- ${item.inclusion.name} (${item.allocationPercent}%): ${item.inclusion.description}`);
      for (const blurb of item.blurbs) {
        lines.push(`  ${blurb.contentPlaintext}`);
      }
    }
    lines.push("");
  }

  lines.push("## Pricing Summary");
  lines.push(`- Estimated Hours: ${review.totalHours}`);
  lines.push(`- Subtotal: $${review.projectSubtotal.toLocaleString()}`);
  lines.push(
    `- Project Buffer: ${review.projectBufferPercent}% ($${review.projectBufferAmount.toLocaleString()})`,
  );
  lines.push(`- Estimated Price: $${review.totalPrice.toLocaleString()}`);
  lines.push("");

  lines.push("## Assumptions");
  lines.push(draft.assumptions);
  lines.push("");
  lines.push("## Exclusions");
  lines.push(draft.exclusions);
  lines.push("");
  lines.push("## Risks");
  lines.push(draft.risks);
  lines.push("");

  if (draft.rfpRequirements.length > 0 || pickedBlurbs.length > 0) {
    lines.push("## RFP Responses");
    for (const req of draft.rfpRequirements) {
      lines.push(`- ${req.prompt}`);
      lines.push(`  ${req.response}`);
    }
    for (const blurb of pickedBlurbs) {
      lines.push(`- ${blurb.title}: ${blurb.contentPlaintext}`);
    }
    lines.push("");
  }

  lines.push("## Role Rates");
  for (const staff of draft.staffing.filter((item) => item.selected || item.allocationPercent > 0)) {
    const role = roles.find((r) => r.id === staff.roleId);
    lines.push(
      `- ${role?.label ?? staff.roleId} ${staff.scope === "lead" ? "Lead" : "Support"}: ${staff.allocationPercent}% of project, base $${staff.baseRate}/hr, markup ${staff.markupPercent}%`
    );
  }

  return lines.join("\n");
}

export function generateTeamworkCsv(draft: ProposalDraft): string {
  const selectedInclusions = draft.inclusions
    .filter((item) => item.allocationPercent > 0)
    .map((item) => inclusions.find((inc) => inc.id === item.inclusionId))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  const header = ["List Name", "Task Name", "Task Description", "Assignee Role", "Sort Order"];
  const rows = [header];
  let index = 1;

  for (const phase of phases) {
    const phaseInclusions = selectedInclusions.filter((inc) => inc.phaseId === phase.id);
    for (const inclusion of phaseInclusions) {
      rows.push([phase.name, inclusion.name, inclusion.description, "", String(index)]);
      index += 1;
    }
  }

  return rows
    .map((row) =>
      row
        .map((cell) => {
          const escaped = String(cell).replace(/"/g, "\"\"");
          return `"${escaped}"`;
        })
        .join(",")
    )
    .join("\n");
}
