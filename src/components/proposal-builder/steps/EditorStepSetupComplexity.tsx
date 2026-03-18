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
import "./EditorStepSetupComplexity.css";

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
    <div className="step-section setup-step">
      <div className="panel step-section-shell setup-step-shell">
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

      <div className="setup-step-grid">
        <section className="panel setup-step-card setup-step-card--primary">
          <div className="setup-step-card-header">
            <div className="setup-step-card-copy">
              <p className="setup-step-card-kicker">Foundation</p>
              <h4>Proposal Setup</h4>
            </div>
            <p className="setup-step-card-description">
              Lock in the working title, client context, and budget band before
              the estimate starts taking shape.
            </p>
          </div>

          <div className="setup-step-form-grid setup-step-form-grid--setup">
            <TextField
              label="Proposal Name (Internal)"
              hint="Internal working name used inside the builder."
              error={errors.name?.message}
              required
              fieldClassName="setup-step-field setup-step-field--span-2"
              {...register("name", {
                onChange: (event) =>
                  onUpsertActive({ ...activeProposal, name: event.target.value }),
              })}
            />
            <TextField
              label="Client Name"
              hint="Organization or client account name."
              error={errors.clientName?.message}
              required
              fieldClassName="setup-step-field"
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
              hint="Client-facing title for the engagement."
              error={errors.projectTitle?.message}
              required
              fieldClassName="setup-step-field"
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
              hint="Budget band that seeds the working estimate."
              error={errors.sizeTierId?.message}
              required
              fieldClassName="setup-step-field setup-step-field--span-2"
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
        </section>

        <section className="panel setup-step-card">
          <div className="setup-step-card-header">
            <div className="setup-step-card-copy">
              <p className="setup-step-card-kicker">Scheduling</p>
              <h4>Timeline</h4>
            </div>
            <p className="setup-step-card-description">
              Set the expected pace of delivery and capture key dates when they
              are already known.
            </p>
          </div>

          <div className="setup-step-form-grid">
            <SelectField
              label="Timeline Option"
              hint="Baseline delivery window for the proposal."
              error={errors.timelineOptionId?.message}
              required
              fieldClassName="setup-step-field setup-step-field--span-2"
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
              hint="Leave blank if the start window is still flexible."
              error={errors.startDate?.message}
              fieldClassName="setup-step-field"
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
              hint="Optional target launch date or event date."
              error={errors.endDate?.message}
              fieldClassName="setup-step-field"
              {...register("endDate", {
                onChange: (event) =>
                  onUpsertActive({
                    ...activeProposal,
                    endDate: event.target.value,
                  }),
              })}
            />
          </div>
        </section>

        <section className="panel setup-step-card setup-step-card--accent">
          <div className="setup-step-card-header">
            <div className="setup-step-card-copy">
              <p className="setup-step-card-kicker">Effort Drivers</p>
              <h4>Complexity</h4>
            </div>
            <p className="setup-step-card-description">
              Capture the factors that most directly affect level of effort,
              coordination, and contingency.
            </p>
          </div>

          <div className="setup-step-form-grid setup-step-form-grid--complexity">
            <SelectField
              label="Project Size"
              hint="Overall breadth and build intensity."
              error={errors.projectSize?.message}
              required
              fieldClassName="setup-step-field"
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
              hint="How many approvers and collaborators are involved."
              error={errors.stakeholdersComplexitySize?.message}
              required
              fieldClassName="setup-step-field"
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
              hint="Primary platform or implementation model."
              error={errors.cmsType?.message}
              required
              fieldClassName="setup-step-field"
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
              hint="Anything atypical that meaningfully changes the estimate."
              error={errors.notes?.message}
              fieldClassName="setup-step-field setup-step-field--span-3"
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
              hint="Recommended cushion for coordination and unknowns."
              error={errors.projectBufferPercent?.message}
              required
              fieldClassName="setup-step-field setup-step-field--buffer"
              {...register("projectBufferPercent", {
                onChange: (event) =>
                  onUpsertActive({
                    ...activeProposal,
                    projectBufferPercent: normalizePercentInput(event.target.value),
                  }),
              })}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
