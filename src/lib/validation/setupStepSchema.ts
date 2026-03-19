import { z } from "zod";
import { ProposalDraft } from "../../types";

const projectSizes = ["Small", "Medium", "Large", "XL"] as const;
const stakeholderBands = ["1", "1.1", "1.25"] as const;
const cmsTypes = [
  "WordPress",
  "Webflow",
  "Shopify",
  "Headless",
  "Custom",
] as const;

export const setupStepSchema = z.object({
  name: z.string().trim().min(1, "Proposal name is required."),
  clientName: z.string().trim().min(1, "Client name is required."),
  projectTitle: z.string().trim().min(1, "Project title is required."),
  sizeTierId: z.string().trim().min(1, "Select a size tier."),
  startDate: z.string(),
  endDate: z.string(),
  projectSize: z.enum(projectSizes),
  stakeholdersComplexitySize: z.enum(stakeholderBands),
  cmsType: z.enum(cmsTypes),
  notes: z.string(),
  projectBufferPercent: z
    .string()
    .trim()
    .refine((value) => {
      if (value.length === 0) return true;
      const numericValue = Number(value);
      return Number.isFinite(numericValue) && numericValue >= 0 && numericValue <= 100;
    }, "Project buffer must be between 0 and 100."),
});

export type SetupStepFormValues = z.infer<typeof setupStepSchema>;

export function getSetupStepFormValues(
  draft: ProposalDraft,
): SetupStepFormValues {
  return {
    name: draft.name,
    clientName: draft.clientName,
    projectTitle: draft.projectTitle,
    sizeTierId: draft.sizeTierId,
    startDate: draft.startDate,
    endDate: draft.endDate,
    projectSize: draft.projectSize,
    stakeholdersComplexitySize: String(
      draft.complexity.stakeholdersComplexitySize,
    ) as SetupStepFormValues["stakeholdersComplexitySize"],
    cmsType: draft.complexity.cmsType,
    notes: draft.complexity.notes,
    projectBufferPercent: String(draft.projectBufferPercent),
  };
}
