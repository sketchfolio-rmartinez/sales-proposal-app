export const steps = [
  { id: 1, label: "Setup" },
  { id: 2, label: "Inclusions" },
  { id: 3, label: "Timeline" },
  { id: 4, label: "Roles & Rates" },
  { id: 5, label: "RFP Responses" },
  { id: 6, label: "Review" },
  { id: 7, label: "Exports" },
] as const;

export type EditorStep = (typeof steps)[number]["id"];
