/**
 * Excel & Analytics Skills Module
 */
export { EXCEL_SKILLS } from './skills';

export const EXCEL_SKILL_IDS = [
  'excel-data-analyzer',
  'excel-data-cleaner',
  'excel-marketing-dashboard',
  'excel-chart-designer',
  'budget-variance-narrator',
] as const;

export type ExcelSkillId = typeof EXCEL_SKILL_IDS[number];
