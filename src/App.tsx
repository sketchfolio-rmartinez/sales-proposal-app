import { EditorHeader } from "./components/EditorHeader";
import { EditorStepContent } from "./components/EditorStepContent";
import { ProposalSidebar } from "./components/ProposalSidebar";
import { BlurbAdminPage } from "./components/BlurbAdminPage";
import { type EditorStep } from "./app/editorConfig";
import {
  canAdvanceFromStep,
  formatUpdated,
  getMaxAccessibleStep,
  sizeTierLabel,
} from "./app/proposalUtils";
import { useProposalBuilder } from "./app/useProposalBuilder";
import { useBlurbLibrary } from "./app/useBlurbLibrary";
import { useAppRoute } from "./app/useAppRoute";

export default function App() {
  const { state: blurbState, view: blurbView, handlers: blurbHandlers } = useBlurbLibrary();
  const { state, view, handlers } = useProposalBuilder(blurbState.blurbs);
  const { route, navigate } = useAppRoute();

  return (
    <div className="page">
      <header className="app-header">
        <div className="row">
          <h1>Proposal & Project Seeding App (v1)</h1>
          <div className="app-nav">
            <button className={route === "builder" ? "active-step" : ""} onClick={() => navigate("builder")}>
              Builder
            </button>
            <button className={route === "blurbs" ? "active-step" : ""} onClick={() => navigate("blurbs")}>
              Blurb Library
            </button>
          </div>
        </div>
      </header>

      {route === "blurbs" ? (
        <main className="admin-layout">
          <BlurbAdminPage
            blurbs={blurbView.filteredBlurbs}
            searchQuery={blurbState.searchQuery}
            categoryFilter={blurbState.categoryFilter}
            onSearchQueryChange={blurbHandlers.setSearchQuery}
            onCategoryFilterChange={blurbHandlers.setCategoryFilter}
            onCreateBlurb={blurbHandlers.createBlurb}
            onUpdateBlurb={blurbHandlers.updateBlurb}
            onDeactivateBlurb={blurbHandlers.deactivateBlurb}
          />
        </main>
      ) : (
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
                <EditorHeader
                  activeProposal={view.activeProposal}
                  step={state.step}
                  maxAccessibleStep={getMaxAccessibleStep(view.activeProposal)}
                  onStepChange={handlers.setStep}
                />

                <EditorStepContent
                  step={state.step}
                  activeProposal={view.activeProposal}
                  blurbs={blurbState.blurbs}
                  review={view.review}
                  exportText={view.exportText}
                  exportCsv={view.exportCsv}
                  onUpsertActive={handlers.upsertActive}
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
                      disabled={!canAdvanceFromStep(view.activeProposal, state.step)}
                    >
                      Next
                    </button>
                  )}
                </div>
              </>
            )}
          </section>
        </main>
      )}
    </div>
  );
}
