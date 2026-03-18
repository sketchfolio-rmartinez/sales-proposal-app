import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { sizeTiers, timelineOptions } from "../../../data/defaults";
import { ProposalDraft } from "../../../types";
import { normalizePercentInput } from "../../../lib/editorStepFieldUtils";
import {
  getSetupStepFormValues,
  setupStepSchema,
  SetupStepFormValues,
} from "../../../lib/validation/setupStepSchema";
import { SelectField } from "../../forms/SelectField";
import { TextareaField } from "../../forms/TextareaField";
import { TextField } from "../../forms/TextField";
import { StepSectionHeader } from "../../shared/StepSectionHeader";
import { SummaryPill } from "../../shared/SummaryPill";

interface EditorStepSetupComplexityProps {
  activeProposal: ProposalDraft;
  setupReady: boolean;
  roughEstimate: string;
  onUpsertActive: (draft: ProposalDraft) => void;
  onValidationChange?: (isValid: boolean) => void;
}

export function EditorStepSetupComplexity({
  activeProposal,
  setupReady,
  roughEstimate,
  onUpsertActive,
  onValidationChange,
}: EditorStepSetupComplexityProps) {
  const {
    watch,
    register,
    reset,
    formState: { errors },
  } = useForm<SetupStepFormValues>({
    resolver: zodResolver(setupStepSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: getSetupStepFormValues(activeProposal),
  });

  useEffect(() => {
    reset(getSetupStepFormValues(activeProposal));
  }, [activeProposal.id, reset]);

  const values = watch();

  useEffect(() => {
    if (!onValidationChange) return;
    onValidationChange(setupStepSchema.safeParse(values).success);
  }, [onValidationChange, values]);

  return (
    <div className="step-section">
      <div className="panel step-section-shell">
        <StepSectionHeader
          title="Setup & Complexity"
          description="Set the proposal basics, timeline, and complexity inputs that drive the working estimate."
          summary={
            <SummaryPill
              primaryLabel="Rough Estimate"
              primaryValue={setupReady ? roughEstimate : "Complete setup"}
            />
          }
        />
      </div>
      <div className="panel">
        <div className="subpanel">
          <h4>Proposal Setup</h4>
          <TextField
            label="Proposal Name (Internal)"
            error={errors.name?.message}
            required
            {...register("name", {
              onChange: (event) =>
                onUpsertActive({ ...activeProposal, name: event.target.value }),
            })}
          />
          <TextField
            label="Client Name"
            error={errors.clientName?.message}
            required
            {...register("clientName", {
              onChange: (event) =>
                onUpsertActive({
                  ...activeProposal,
                  clientName: event.target.value,
                }),
            })}
          />
          <TextField
            label="Project Title"
            error={errors.projectTitle?.message}
            required
            {...register("projectTitle", {
              onChange: (event) =>
                onUpsertActive({
                  ...activeProposal,
                  projectTitle: event.target.value,
                }),
            })}
          />
          <SelectField
            label="Size Tier"
            error={errors.sizeTierId?.message}
            required
            {...register("sizeTierId", {
              onChange: (event) =>
                onUpsertActive({
                  ...activeProposal,
                  sizeTierId: event.target.value,
                }),
            })}
          >
            {sizeTiers.map((tier) => (
              <option key={tier.id} value={tier.id}>
                {tier.label}
              </option>
            ))}
          </SelectField>
        </div>
        <div className="subpanel">
          <h4>Timeline</h4>
          <SelectField
            label="Timeline Option"
            error={errors.timelineOptionId?.message}
            required
            {...register("timelineOptionId", {
              onChange: (event) =>
                onUpsertActive({
                  ...activeProposal,
                  timelineOptionId: event.target.value,
                }),
            })}
          >
            {timelineOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </SelectField>
          <TextField
            type="date"
            label="Start Date"
            error={errors.startDate?.message}
            {...register("startDate", {
              onChange: (event) =>
                onUpsertActive({
                  ...activeProposal,
                  startDate: event.target.value,
                }),
            })}
          />
          <TextField
            type="date"
            label="End Date / Event Date"
            error={errors.endDate?.message}
            {...register("endDate", {
              onChange: (event) =>
                onUpsertActive({
                  ...activeProposal,
                  endDate: event.target.value,
                }),
            })}
          />
        </div>
        <div className="subpanel">
          <h4>Complexity</h4>
          <SelectField
            label="Project Size"
            error={errors.projectSize?.message}
            required
            {...register("projectSize", {
              onChange: (event) =>
                onUpsertActive({
                  ...activeProposal,
                  projectSize: event.target.value as ProposalDraft["projectSize"],
                }),
            })}
          >
            <option value="Small">Small (1.0x)</option>
            <option value="Medium">Medium (1.25x)</option>
            <option value="Large">Large (1.5x)</option>
            <option value="XL">XL (1.75x)</option>
          </SelectField>
          <SelectField
            label="Stakeholder Count"
            error={errors.stakeholdersComplexitySize?.message}
            required
            {...register("stakeholdersComplexitySize", {
              onChange: (event) =>
                onUpsertActive({
                  ...activeProposal,
                  complexity: {
                    ...activeProposal.complexity,
                    stakeholdersComplexitySize: Number(
                      event.target.value,
                    ) as ProposalDraft["complexity"]["stakeholdersComplexitySize"],
                  },
                }),
            })}
          >
            <option value="1">1-5 (1.0x)</option>
            <option value="1.1">6-12 (1.15x)</option>
            <option value="1.25">13+ (1.3x)</option>
          </SelectField>
          <SelectField
            label="CMS Type"
            error={errors.cmsType?.message}
            required
            {...register("cmsType", {
              onChange: (event) =>
                onUpsertActive({
                  ...activeProposal,
                  complexity: {
                    ...activeProposal.complexity,
                    cmsType: event.target.value as ProposalDraft["complexity"]["cmsType"],
                  },
                }),
            })}
          >
            <option value="WordPress">WordPress</option>
            <option value="Webflow">Webflow</option>
            <option value="Shopify">Shopify</option>
            <option value="Headless">Headless</option>
            <option value="Custom">Custom</option>
          </SelectField>
          <TextareaField
            label="Complexity Notes"
            error={errors.notes?.message}
            {...register("notes", {
              onChange: (event) =>
                onUpsertActive({
                  ...activeProposal,
                  complexity: {
                    ...activeProposal.complexity,
                    notes: event.target.value,
                  },
                }),
            })}
          />
          <TextField
            type="number"
            min={0}
            step={5}
            label="Project Buffer %"
            error={errors.projectBufferPercent?.message}
            required
            {...register("projectBufferPercent", {
              onChange: (event) =>
                onUpsertActive({
                  ...activeProposal,
                  projectBufferPercent: normalizePercentInput(event.target.value),
                }),
            })}
          />
        </div>
      </div>
    </div>
  );
}
