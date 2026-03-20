import { ProposalDraft } from "../types";
import "./ProposalSidebar.css";

interface ProposalSidebarProps {
  isCollapsed: boolean;
  onToggleCollapsed: () => void;
  proposals: ProposalDraft[];
  activeProposalId: string | null;
  proposalQuery: string;
  onProposalQueryChange: (value: string) => void;
  onNewProposal: () => void;
  onSelectProposal: (proposalId: string) => void;
  onDuplicateProposal: (proposal: ProposalDraft) => void;
  onDeleteProposal: (proposalId: string) => void;
  formatUpdated: (iso: string) => string;
  sizeTierLabel: (sizeTierId: string) => string;
}

export function ProposalSidebar({
  isCollapsed,
  onToggleCollapsed,
  proposals,
  activeProposalId,
  proposalQuery,
  onProposalQueryChange,
  onNewProposal,
  onSelectProposal,
  onDuplicateProposal,
  onDeleteProposal,
  formatUpdated,
  sizeTierLabel,
}: ProposalSidebarProps) {
  return (
    <aside
      className={`proposal-sidebar ${isCollapsed ? "is-collapsed" : ""}`}
    >
      <div className="proposal-sidebar-head">
        <h2>Proposals</h2>
        <div className="proposal-sidebar-head-actions">
          <button
            type="button"
            className="new-proposal-btn"
            onClick={onNewProposal}
          >
            New
          </button>
          <button
            type="button"
            className="proposal-sidebar-toggle"
            aria-label={isCollapsed ? "Open proposals sidebar" : "Collapse proposals sidebar"}
            aria-expanded={!isCollapsed}
            onClick={onToggleCollapsed}
          >
            {isCollapsed ? ">" : "<"}
          </button>
        </div>
      </div>
      <div className="proposal-sidebar-body">
        <label className="proposal-sidebar-search">
          <input
            placeholder="Search proposals"
            value={proposalQuery}
            onChange={(event) => onProposalQueryChange(event.target.value)}
          />
        </label>
        <div className="proposal-list-head" aria-hidden="true">
          <span>Name</span>
        </div>
        <div className="proposal-list">
          {proposals.map((proposal) => (
            <div
              key={proposal.id}
              className={`proposal-row ${proposal.id === activeProposalId ? "active" : ""}`}
            >
              <button
                type="button"
                className="proposal-row-main"
                onClick={() => onSelectProposal(proposal.id)}
              >
                <div className="proposal-primary">
                  <div className="proposal-row-top">
                    <span className="proposal-title">
                      {proposal.name || proposal.projectTitle || "New Proposal"}
                    </span>
                    <span className="proposal-updated">
                      {formatUpdated(proposal.updatedAt)}
                    </span>
                  </div>
                  <div className="proposal-meta">
                    <span className="proposal-client">
                      {proposal.clientName || "Client pending"}
                    </span>
                    <span className="proposal-tier">
                      {sizeTierLabel(proposal.sizeTierId)}
                    </span>
                  </div>
                </div>
              </button>
              <div className="proposal-row-actions">
                <span
                  className={`status-dot status-${proposal.status.toLowerCase()}`}
                >
                  {proposal.status}
                </span>
                <button
                  type="button"
                  onClick={() => onDuplicateProposal(proposal)}
                >
                  Dup
                </button>
                <button
                  type="button"
                  className="danger"
                  onClick={() => onDeleteProposal(proposal.id)}
                >
                  Del
                </button>
              </div>
            </div>
          ))}
          {proposals.length === 0 && <p className="muted">No matches</p>}
        </div>
      </div>
    </aside>
  );
}
