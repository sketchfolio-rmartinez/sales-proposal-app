import { phases, roles } from "../data/defaults";
import { statusActionLabel } from "../app/proposalUtils";
import { ProposalDraft, ReviewModel } from "../types";

interface EditorStepReviewGenerateProps {
  activeProposal: ProposalDraft;
  review: ReviewModel;
  onUpsertActive: (draft: ProposalDraft) => void;
  onTransitionStatus: () => void;
}

function formatCurrency(value: number): string {
  return `$${Math.round(value).toLocaleString()}`;
}

function formatPercentValue(value: number): string {
  return `${Math.round(value * 100) / 100}%`;
}

function lineLabel(
  roleId: ProposalDraft["staffing"][number]["roleId"],
  scope: ProposalDraft["staffing"][number]["scope"],
): string {
  const role = roles.find((item) => item.id === roleId);
  return `${role?.label ?? roleId} ${scope === "lead" ? "Lead" : "Support"}`;
}

export function EditorStepReviewGenerate({
  activeProposal,
  review,
  onUpsertActive,
  onTransitionStatus,
}: EditorStepReviewGenerateProps) {
  const phaseRows = review.phaseAllocations.filter(
    (row) => row.allocationPercent > 0,
  );
  const roleRows = review.staffingAllocations;

  return (
    <div className="panel">
      <h3>Review & Generate</h3>
      <div className="row wrap">
        <button
          onClick={onTransitionStatus}
          disabled={activeProposal.status === "Approved"}
        >
          {statusActionLabel(activeProposal.status)}
        </button>
      </div>
      <p>
        Total Hours: <strong>{review.totalHours}</strong> | Subtotal:{" "}
        <strong>{formatCurrency(review.projectSubtotal)}</strong> | Buffer:{" "}
        <strong>
          {review.projectBufferPercent}% (
          {formatCurrency(review.projectBufferAmount)})
        </strong>{" "}
        | Total Price: <strong>{formatCurrency(review.totalPrice)}</strong>
      </p>

      <h4>Phase Allocation</h4>
      <table className="summary-table">
        <thead>
          <tr>
            <th>Phase</th>
            <th>Budget</th>
            <th>% of Project</th>
          </tr>
        </thead>
        <tbody>
          {phaseRows.map((row) => {
            const phase = phases.find((item) => item.id === row.phaseId);
            return (
              <tr key={row.phaseId}>
                <td>{phase?.name ?? row.phaseId}</td>
                <td>{formatCurrency(row.budget)}</td>
                <td>{formatPercentValue(row.allocationPercent)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <h4>Role Allocation</h4>
      <table className="summary-table">
        <thead>
          <tr>
            <th>Role Line</th>
            <th>Budget</th>
            <th>% of Project</th>
            <th>Hours</th>
          </tr>
        </thead>
        <tbody>
          {roleRows.map((row) => (
            <tr key={row.staffingLineId}>
              <td>{lineLabel(row.roleId, row.scope)}</td>
              <td>{formatCurrency(row.budget)}</td>
              <td>{formatPercentValue(row.allocationPercent)}</td>
              <td>{row.hours}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h4>Assumptions / Exclusions / Risks</h4>
      <label>
        Assumptions
        <textarea
          value={activeProposal.assumptions}
          onChange={(event) =>
            onUpsertActive({
              ...activeProposal,
              assumptions: event.target.value,
            })
          }
        />
      </label>
      <label>
        Exclusions
        <textarea
          value={activeProposal.exclusions}
          onChange={(event) =>
            onUpsertActive({
              ...activeProposal,
              exclusions: event.target.value,
            })
          }
        />
      </label>
      <label>
        Risks
        <textarea
          value={activeProposal.risks}
          onChange={(event) =>
            onUpsertActive({ ...activeProposal, risks: event.target.value })
          }
        />
      </label>
    </div>
  );
}
