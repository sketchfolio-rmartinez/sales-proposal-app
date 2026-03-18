import { ComplexityBand } from "../types";

export const STAKEHOLDER_SIZE_MULTIPLIERS: Record<ComplexityBand, number> = {
  1: 1,
  1.1: 1.15,
  1.25: 1.3,
};

export const PROJECT_SIZE_MULTIPLIERS = {
  Small: 1,
  Medium: 1.25,
  Large: 1.5,
  XL: 1.75,
} as const;
