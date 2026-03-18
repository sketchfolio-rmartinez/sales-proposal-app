import { useState } from "react";
import { canAdvanceFromRfp } from "../app/proposalUtils";
import { BlurbLibraryItem, ProposalDraft } from "../types";
import { BlurbPickerModal } from "./BlurbPickerModal";

interface EditorStepRfpRequirementsBlurbsProps {
  activeProposal: ProposalDraft;
  blurbs: BlurbLibraryItem[];
  onUpsertActive: (draft: ProposalDraft) => void;
}

export function EditorStepRfpRequirementsBlurbs({
  activeProposal,
  blurbs,
  onUpsertActive,
}: EditorStepRfpRequirementsBlurbsProps) {
  const [draftRequirement, setDraftRequirement] = useState({
    prompt: "",
    response: "",
  });
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const resolveBlurb = (blurbId: string | null | undefined) =>
    blurbs.find((blurb) => blurb.id === blurbId) ?? null;

  const addRequirement = () => {
    const prompt = draftRequirement.prompt.trim();
    const response = draftRequirement.response.trim();
    if (!prompt || !response) return;

    onUpsertActive({
      ...activeProposal,
      rfpRequirements: [
        ...activeProposal.rfpRequirements,
        {
          id: crypto.randomUUID(),
          prompt,
          response,
        },
      ],
    });

    setDraftRequirement({
      prompt: "",
      response: "",
    });
  };

  return (
    <>
      <div className="panel">
        <h3>RFP Requirements & Blurbs</h3>
        <div className="subpanel">
          <div className="row">
            <h4>Add Requirement</h4>
            <button type="button" className="next-btn" onClick={addRequirement}>
              Save Requirement
            </button>
          </div>
          <label>
            Prompt
            <input
              value={draftRequirement.prompt}
              onChange={(event) =>
                setDraftRequirement((current) => ({
                  ...current,
                  prompt: event.target.value,
                }))
              }
            />
          </label>
          <label>
            Response
            <textarea
              value={draftRequirement.response}
              onChange={(event) =>
                setDraftRequirement((current) => ({
                  ...current,
                  response: event.target.value,
                }))
              }
            />
          </label>
        </div>

        <h4>Requirements</h4>
        {activeProposal.rfpRequirements.length === 0 && (
          <p className="muted">No requirements added yet.</p>
        )}
        {activeProposal.rfpRequirements.map((req) => (
          <div key={req.id} className="subpanel">
            <div className="row">
              <h4>Requirement</h4>
              <button
                type="button"
                onClick={() =>
                  onUpsertActive({
                    ...activeProposal,
                    rfpRequirements: activeProposal.rfpRequirements.filter(
                      (item) => item.id !== req.id,
                    ),
                  })
                }
              >
                Remove
              </button>
            </div>
            <label>
              Prompt
              <input
                value={req.prompt}
                onChange={(event) =>
                  onUpsertActive({
                    ...activeProposal,
                    rfpRequirements: activeProposal.rfpRequirements.map((item) =>
                      item.id === req.id
                        ? { ...item, prompt: event.target.value }
                        : item,
                    ),
                  })
                }
              />
            </label>
            <label>
              Response
              <textarea
                value={req.response}
                onChange={(event) =>
                  onUpsertActive({
                    ...activeProposal,
                    rfpRequirements: activeProposal.rfpRequirements.map((item) =>
                      item.id === req.id
                        ? { ...item, response: event.target.value }
                        : item,
                    ),
                  })
                }
              />
            </label>
          </div>
        ))}
        <div className="row">
          <h4>Selected Blurbs</h4>
          <button type="button" onClick={() => setIsPickerOpen(true)}>
            Add Blurb
          </button>
        </div>
        {activeProposal.pickedBlurbIds.length > 0 ? (
          <div className="subpanel">
            {activeProposal.pickedBlurbIds.map((blurbId) => {
              const blurb = resolveBlurb(blurbId);
              if (!blurb) return null;
              return (
                <div key={blurb.id} className="inline-blurb">
                  <strong>
                    {blurb.title} <em>{blurb.category}</em>
                  </strong>
                  <span>{blurb.contentPlaintext}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="muted">
            No library blurbs added to proposal narrative yet.
          </p>
        )}

        {!canAdvanceFromRfp(activeProposal) && (
          <p className="warning">
            Each saved requirement needs both a prompt and a response.
          </p>
        )}
      </div>
      {isPickerOpen && (
        <BlurbPickerModal
          title="Pick Proposal Blurbs"
          blurbs={blurbs.filter(
            (blurb) => blurb.isActive && blurb.category !== "Inclusion",
          )}
          selectedIds={activeProposal.pickedBlurbIds}
          selectionMode="multiple"
          onClose={() => setIsPickerOpen(false)}
          onConfirm={(selectedIds) => {
            onUpsertActive({
              ...activeProposal,
              pickedBlurbIds: selectedIds,
            });
            setIsPickerOpen(false);
          }}
        />
      )}
    </>
  );
}
