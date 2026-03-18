export const steps = [
  { id: 1, label: "Setup & Complexity" },
  { id: 2, label: "Inclusions" },
  { id: 3, label: "Roles & Rates" },
  { id: 4, label: "RFP Responses" },
  { id: 5, label: "Review" },
  { id: 6, label: "Exports" },
] as const;

export type EditorStep = (typeof steps)[number]["id"];
