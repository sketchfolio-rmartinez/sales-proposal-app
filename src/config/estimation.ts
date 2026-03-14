import { ComplexityBand } from "../types";

export const STAKEHOLDER_SIZE_MULTIPLIERS: Record<ComplexityBand, number> = {
  1: 1,
  1.25: 1.25,
  1.5: 1.5,
};

export const CMS_MULTIPLIERS = {
  WordPress: 1,
  Webflow: 1,
  Shopify: 1,
  Headless: 1.15,
  Custom: 1.2,
} as const;

export const PROJECT_SIZE_MULTIPLIERS = {
  Small: 1,
  Medium: 2,
  Large: 3,
  XL: 5,
} as const;
