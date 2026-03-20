import { useEffect, useState } from "react";
import { ProposalHeader } from "./components/proposal-builder/ProposalHeader";
import { ProposalStepView } from "./components/proposal-builder/ProposalStepView";
import { ProposalSidebar } from "./components/ProposalSidebar";
import { BlurbAdminPage } from "./components/blurbs/BlurbAdminPage";
import { steps, type EditorStep } from "./app/editorConfig";
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
  const {
    state: blurbState,
    view: blurbView,
    handlers: blurbHandlers,
  } = useBlurbLibrary();
  const { state, view, handlers } = useProposalBuilder(blurbState.blurbs);
  const { route, navigate } = useAppRoute();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [stepValidity, setStepValidity] = useState<
    Partial<Record<EditorStep, boolean>>
  >({});

  useEffect(() => {
    setStepValidity({});
  }, [state.activeProposalId]);

  const canAdvance = view.activeProposal
    ? (stepValidity[state.step] ??
      canAdvanceFromStep(view.activeProposal, state.step))
    : false;

  return (
    <div className="page">
      <header className="app-header">
        <div className="row">
          <div className="app-brand">
            <img
              alt="Sketchfolio Logo"
              className="siteLogo"
              src="https://sketchfolio.com/wp-content/themes/sketchfolio-v3/img/logo-sketchfolio-660x168-white.png"
            />
            <span className="app-brand-label">Proposal Builder</span>
          </div>
          <div className="app-nav">
            <button
              className={route === "builder" ? "active-step" : ""}
              onClick={() => navigate("builder")}
            >
              Builder
            </button>
            <button
              className={route === "blurbs" ? "active-step" : ""}
              onClick={() => navigate("blurbs")}
            >
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
        <main
          className={`layout ${isSidebarCollapsed ? "layout--sidebar-collapsed" : ""}`}
        >
          <ProposalSidebar
            isCollapsed={isSidebarCollapsed}
            onToggleCollapsed={() =>
              setIsSidebarCollapsed((current) => !current)
            }
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
                <ProposalHeader
                  step={state.step}
                  maxAccessibleStep={getMaxAccessibleStep(view.activeProposal)}
                  showWorkspaceMeta={state.step >= 4}
                  showStatusPill={state.step < 4}
                  activeProposal={view.activeProposal}
                  onStepChange={handlers.setStep}
                />

                <ProposalStepView
                  step={state.step}
                  activeProposal={view.activeProposal}
                  blurbs={blurbState.blurbs}
                  review={view.review}
                  exportText={view.exportText}
                  exportCsv={view.exportCsv}
                  onUpsertActive={handlers.upsertActive}
                  onTransitionStatus={handlers.transitionStatus}
                  onDownloadCsv={handlers.downloadCsv}
                  onStepValidityChange={(step, isValid) =>
                    setStepValidity((current) =>
                      current[step] === isValid
                        ? current
                        : { ...current, [step]: isValid },
                    )
                  }
                />

                <div className="step-nav">
                  <button
                    onClick={() =>
                      handlers.setStep((value) =>
                        value > 1 ? ((value - 1) as EditorStep) : value,
                      )
                    }
                    disabled={state.step === 1}
                  >
                    Back
                  </button>
                  {state.step < steps.length && (
                    <button
                      className="next-btn"
                      onClick={() =>
                        handlers.setStep((value) =>
                          value < steps.length
                            ? ((value + 1) as EditorStep)
                            : value,
                        )
                      }
                      disabled={!canAdvance}
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
