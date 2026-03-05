import { ProposalDraft } from "../types";

interface ProposalSidebarProps {
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
    <aside className="sidebar">
      <div className="sidebar-head">
        <h2>Proposals</h2>
        <button className="new-proposal-btn" onClick={onNewProposal}>
          New
        </button>
      </div>
      <label className="sidebar-search">
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
          <div key={proposal.id} className={`proposal-row ${proposal.id === activeProposalId ? "active" : ""}`}>
            <button className="proposal-row-main" onClick={() => onSelectProposal(proposal.id)}>
              <div className="proposal-primary">
                <span className="proposal-title">{proposal.name || proposal.projectTitle || "New Proposal"}</span>
                <span className="proposal-meta">
                  <span className="proposal-client">{proposal.clientName || "Client pending"}</span>
                  <span className="proposal-tier">{sizeTierLabel(proposal.sizeTierId)}</span>
                  <span className="proposal-updated">{formatUpdated(proposal.updatedAt)}</span>
                </span>
              </div>
            </button>
            <div className="proposal-row-actions">
              <span className={`status-dot status-${proposal.status.toLowerCase()}`}>{proposal.status}</span>
              <button onClick={() => onDuplicateProposal(proposal)}>Dup</button>
              <button className="danger" onClick={() => onDeleteProposal(proposal.id)}>
                Del
              </button>
            </div>
          </div>
        ))}
        {proposals.length === 0 && <p className="muted">No matches</p>}
      </div>
    </aside>
  );
}
