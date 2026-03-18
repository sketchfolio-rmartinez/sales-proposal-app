import { ComplexityBand } from "../types";

export const STAKEHOLDER_SIZE_MULTIPLIERS: Record<ComplexityBand, number> = {
  1: 1,
  1.1: 1.1,
  1.25: 1.25,
};

export const PROJECT_SIZE_MULTIPLIERS = {
  Small: 1,
  Medium: 1.15,
  Large: 1.3,
  XL: 1.5,
} as const;
