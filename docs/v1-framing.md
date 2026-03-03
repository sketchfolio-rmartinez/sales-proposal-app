# v1 Framing Notes

## MVP proposal

Keep v1 focused on one fast path:
1. Sales creates proposal draft with required scoping inputs.
2. App computes baseline hours/pricing/budget allocation.
3. Sales edits assumptions/exclusions/risks and RFP responses.
4. App exports proposal text and Teamwork import file.

## Suggested architecture

- Frontend: React + TypeScript SPA (this starter)
- State management: local component state now, move to API-backed store later
- Export layer: dedicated functions per output type (`proposal text`, `teamwork file`)
- Logic layer: isolated estimate engine that can be rule-versioned later
- Persistence v1: local browser storage
- Persistence v2: Postgres with core objects from your draft model

## Key clarifications for next pass

1. Teamwork format: Is CSV acceptable for v1, or must we deliver strict XLSX to match Teamwork's sample template?
2. Approval workflow: Is status tracking enough in v1, or should `Ready for Approval` notify/assign leadership?
3. Pricing model: Should markup be per role only, or also include proposal-level overhead/contingency?
4. Required inclusions by tier: Are required items global or tier-specific?
5. Timeline effect: Should timeline selection change hours/cost, or only show as proposal metadata?
6. Save model: Is browser-local save acceptable for early pilot, or do we need multi-user shared drafts in v1?

## Recommended v1 boundary

- Include:
  - Draft creation/editing
  - Guardrails for required inclusions
  - Rule-adjusted estimate output
  - Proposal + Teamwork export
- Defer:
  - Full admin for tiers/rules
  - API integrations
  - Advanced versioning/audit system
  - Mobile support and responsive design
