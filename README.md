# Sales Proposal Builder (v1 starter)

Starter SPA for generating:
- Proposal text (headings + plain text)
- Structured estimate and phase budget breakdown
- Teamwork import CSV (Excel-friendly first pass)

## Run

```bash
npm install
npm run dev
```

## Current Scope

- Desktop-first flow for your v1 screens 0-7
- Hardcoded tier/phase/inclusion defaults
- Required-inclusion guardrails with reason capture
- Hybrid estimate model (template defaults + complexity/cms multipliers)
- Local draft save in `localStorage`
- Export outputs from current proposal draft

## Not Yet Implemented

- True XLSX output (currently CSV)
- Auth/users and approval permissions
- Server/database persistence
- Blurb library admin screen (data is seeded and selectable)
- Rule-set versioning and audit trails
