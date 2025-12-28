/**
 * Product & Strategy Skills Module
 */
export { PRODUCT_SKILLS } from './skills';

export const PRODUCT_SKILL_IDS = [
  'prd-writer',
  'market-sizing-analyst',
  'competitive-landscape-mapper',
  'okr-workshop-facilitator',
] as const;

export type ProductSkillId = typeof PRODUCT_SKILL_IDS[number];
