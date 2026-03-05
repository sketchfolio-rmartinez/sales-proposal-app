import { EditorHeader } from "./components/EditorHeader";
import { EditorStepContent } from "./components/EditorStepContent";
import { ProposalSidebar } from "./components/ProposalSidebar";
import { type EditorStep } from "./app/editorConfig";
import { canAdvanceFromInclusions, formatUpdated, sizeTierLabel } from "./app/proposalUtils";
import { useProposalBuilder } from "./app/useProposalBuilder";

export default function App() {
  const { state, view, handlers } = useProposalBuilder();

  return (
    <div className="page">
      <header className="app-header">
        <h1>Proposal & Project Seeding App (v1)</h1>
      </header>

      <main className="layout">
        <ProposalSidebar
          proposals={view.filteredProposals}
          activeProposalId={state.activeProposalId}
          proposalQuery={state.proposalQuery}
          onProposalQueryChange={handlers.setProposalQuery}
          onNewProposal={handlers.newProposal}
          onSelectProposal={handlers.setActiveProposalId}
          onDuplicateProposal={handlers.duplicateProposal}
          onDeleteProposal={handlers.deleteProposal}
          formatUpdated={formatUpdated}
          sizeTierLabel={sizeTierLabel}
        />

        <section className="content">
          {!view.activeProposal ? (
            <div className="panel">
              <p>Create a proposal to begin.</p>
            </div>
          ) : (
            <>
              <EditorHeader activeProposal={view.activeProposal} step={state.step} onStepChange={handlers.setStep} />

              <EditorStepContent
                step={state.step}
                activeProposal={view.activeProposal}
                review={view.review}
                exportText={state.exportText}
                exportCsv={state.exportCsv}
                onUpsertActive={handlers.upsertActive}
                onRegenerate={handlers.regenerate}
                onTransitionStatus={handlers.transitionStatus}
                onDownloadCsv={handlers.downloadCsv}
              />

              <div className="step-nav">
                <button
                  onClick={() => handlers.setStep((value) => (value > 1 ? ((value - 1) as EditorStep) : value))}
                  disabled={state.step === 1}
                >
                  Back
                </button>
                {state.step < 7 && (
                  <button
                    className="next-btn"
                    onClick={() => handlers.setStep((value) => (value < 7 ? ((value + 1) as EditorStep) : value))}
                    disabled={state.step === 2 && !canAdvanceFromInclusions(view.activeProposal)}
                  >
                    Next
                  </button>
                )}
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
