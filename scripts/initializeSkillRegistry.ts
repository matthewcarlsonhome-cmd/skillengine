#!/usr/bin/env npx ts-node
/**
 * Initialize Skill Registry
 *
 * This script seeds the skill_registry table with all built-in skills from the codebase.
 * It extracts system prompts and user prompt templates from each skill definition.
 *
 * Run this AFTER applying the database migration:
 *   npx ts-node scripts/initializeSkillRegistry.ts
 *
 * Or with environment variables:
 *   SUPABASE_URL=xxx SUPABASE_SERVICE_ROLE_KEY=xxx npx ts-node scripts/initializeSkillRegistry.ts
 */

import { createClient } from '@supabase/supabase-js';

// Import skills from the codebase
// Note: Adjust these imports based on your actual file structure
const SKILLS_IMPORT_PATH = '../lib/skills/static';
const ROLE_TEMPLATES_PATH = '../lib/roleTemplates';

interface SkillRegistryEntry {
  id: string;
  name: string;
  skill_type: 'built-in' | 'dynamic' | 'community' | 'library';
  current_system_instruction: string;
  current_user_prompt_template: string;
  current_version: number;
  min_grades_for_improvement: number;
  improvement_threshold: number;
}

async function main() {
  // Get environment variables
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Error: Missing required environment variables');
    console.error('Required: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    console.error('\nUsage:');
    console.error(
      '  SUPABASE_URL=https://xxx.supabase.co SUPABASE_SERVICE_ROLE_KEY=xxx npx ts-node scripts/initializeSkillRegistry.ts'
    );
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('SKILL REGISTRY INITIALIZATION');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const entries: SkillRegistryEntry[] = [];
  let successCount = 0;
  let errorCount = 0;

  // ─────────────────────────────────────────────────────────────────────────
  // 1. Load built-in skills from static.ts
  // ─────────────────────────────────────────────────────────────────────────
  console.log('Loading built-in skills from static.ts...\n');

  try {
    const { SKILLS } = await import(SKILLS_IMPORT_PATH);

    for (const [skillId, skill] of Object.entries(SKILLS) as [string, any][]) {
      try {
        // Generate a sample prompt to extract system instruction and user prompt
        // Create dummy inputs based on the skill's input definitions
        const dummyInputs: Record<string, string> = {};
        if (skill.inputs && Array.isArray(skill.inputs)) {
          for (const input of skill.inputs) {
            dummyInputs[input.id] = `{{${input.id}}}`;
          }
        }

        const prompt = skill.generatePrompt(dummyInputs);

        entries.push({
          id: skillId,
          name: skill.name,
          skill_type: 'built-in',
          current_system_instruction: prompt.systemInstruction || '',
          current_user_prompt_template: prompt.userPrompt || '',
          current_version: 1,
          min_grades_for_improvement: 50,
          improvement_threshold: 3.5,
        });

        console.log(`  ✓ ${skillId}: ${skill.name}`);
        successCount++;
      } catch (err) {
        console.error(`  ✗ ${skillId}: Failed to extract prompts - ${err}`);
        errorCount++;
      }
    }
  } catch (err) {
    console.warn('Could not load SKILLS from static.ts:', err);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 2. Load dynamic skills from role templates
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\nLoading skills from role templates...\n');

  try {
    const { ROLE_TEMPLATES } = await import(ROLE_TEMPLATES_PATH);

    for (const template of ROLE_TEMPLATES as any[]) {
      for (const dynamicSkill of template.dynamicSkills || []) {
        const skillId = `${template.id}-${dynamicSkill.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')}`;

        try {
          entries.push({
            id: skillId,
            name: `${dynamicSkill.name} (${template.name})`,
            skill_type: 'library',
            current_system_instruction: dynamicSkill.prompts?.systemInstruction || '',
            current_user_prompt_template: dynamicSkill.prompts?.userPromptTemplate || '',
            current_version: 1,
            min_grades_for_improvement: 50,
            improvement_threshold: 3.5,
          });

          console.log(`  ✓ ${skillId}`);
          successCount++;
        } catch (err) {
          console.error(`  ✗ ${skillId}: ${err}`);
          errorCount++;
        }
      }
    }
  } catch (err) {
    console.warn('Could not load ROLE_TEMPLATES:', err);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 3. Upsert all entries to Supabase
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('UPSERTING TO SUPABASE');
  console.log('═══════════════════════════════════════════════════════════════\n');

  console.log(`Total entries to upsert: ${entries.length}\n`);

  // Batch upsert in chunks of 100
  const chunkSize = 100;
  let upsertedCount = 0;
  let upsertErrors = 0;

  for (let i = 0; i < entries.length; i += chunkSize) {
    const chunk = entries.slice(i, i + chunkSize);

    const { error } = await supabase.from('skill_registry').upsert(chunk, {
      onConflict: 'id',
      ignoreDuplicates: false,
    });

    if (error) {
      console.error(`Error upserting chunk ${i / chunkSize + 1}:`, error.message);
      upsertErrors += chunk.length;
    } else {
      upsertedCount += chunk.length;
      console.log(`  Upserted chunk ${Math.floor(i / chunkSize) + 1}/${Math.ceil(entries.length / chunkSize)}`);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 4. Summary
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('SUMMARY');
  console.log('═══════════════════════════════════════════════════════════════\n');

  console.log(`Skills extracted:     ${successCount}`);
  console.log(`Extraction errors:    ${errorCount}`);
  console.log(`Successfully upserted: ${upsertedCount}`);
  console.log(`Upsert errors:        ${upsertErrors}`);

  if (upsertErrors === 0 && upsertedCount > 0) {
    console.log('\n✅ Skill registry initialization complete!');
  } else if (upsertedCount > 0) {
    console.log('\n⚠️  Skill registry initialization completed with some errors.');
  } else {
    console.log('\n❌ Skill registry initialization failed.');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
