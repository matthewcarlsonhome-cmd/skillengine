/**
 * SkillExportPage.tsx - Export Skills to CSV/TXT
 *
 * This page allows users to select AI skills and export their prompts
 * in bulk as either CSV or plain text files. This is useful for:
 * - Documenting the skills available in the system
 * - Sharing prompts with team members
 * - Backing up skill configurations
 * - Analyzing prompt patterns across skills
 *
 * FEATURES:
 * =========
 * - Visual skill selection with checkboxes
 * - Select All / Deselect All functionality
 * - CSV export with proper escaping for special characters
 * - TXT export with formatted sections
 * - Real-time selection count display
 *
 * EXPORT FORMATS:
 * ===============
 * CSV: "Skill Name","Description","Skill Prompt"
 * TXT: Formatted text with clear section separators
 */

import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { SKILLS } from '../lib/skills';
import { Button } from '../components/ui/Button';
import { Checkbox } from '../components/ui/Checkbox';
import { useToast } from '../hooks/useToast';
import {
  Download,
  FileSpreadsheet,
  ArrowLeft,
  CheckSquare,
  Square,
  FileText,
  Sparkles,
} from 'lucide-react';

/**
 * SkillExportPage Component
 *
 * Renders a page where users can:
 * 1. View all available skills in a selectable list
 * 2. Select individual skills or use bulk selection
 * 3. Download selected skills as CSV or TXT
 */
const SkillExportPage: React.FC = () => {
  // Toast notifications for user feedback
  const { addToast } = useToast();

  // Convert SKILLS object to array for iteration
  // useMemo prevents recreation on every render
  const skillsArray = useMemo(() => Object.values(SKILLS), []);

  // Track which skills are selected using a Set for O(1) lookup
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set());

  /**
   * Toggle a skill's selection state
   * Uses functional update to ensure we're working with latest state
   *
   * @param skillId - The ID of the skill to toggle
   */
  const toggleSkill = (skillId: string) => {
    setSelectedSkills((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(skillId)) {
        newSet.delete(skillId);
      } else {
        newSet.add(skillId);
      }
      return newSet;
    });
  };

  /**
   * Select all skills at once
   * Creates a new Set containing all skill IDs
   */
  const selectAll = () => {
    setSelectedSkills(new Set(skillsArray.map((s) => s.id)));
  };

  /**
   * Deselect all skills
   * Replaces the Set with an empty one
   */
  const deselectAll = () => {
    setSelectedSkills(new Set());
  };

  /**
   * Escape a string for CSV format
   *
   * CSV escaping rules:
   * 1. Double quotes within the value must be escaped as ""
   * 2. Values containing commas, newlines, or quotes must be wrapped in quotes
   *
   * @param value - The string to escape
   * @returns CSV-safe string
   */
  const escapeCSV = (value: string): string => {
    // First, escape any existing double quotes by doubling them
    const escaped = value.replace(/"/g, '""');

    // Wrap in quotes if the value contains special characters
    if (escaped.includes(',') || escaped.includes('\n') || escaped.includes('"')) {
      return `"${escaped}"`;
    }
    return escaped;
  };

  /**
   * Download selected skills as a CSV file
   *
   * Process:
   * 1. Validate that at least one skill is selected
   * 2. Filter skills to only selected ones
   * 3. Generate prompt for each skill to get systemInstruction
   * 4. Build CSV string with header and data rows
   * 5. Create Blob and trigger download
   */
  const downloadCSV = () => {
    // Validate selection
    if (selectedSkills.size === 0) {
      addToast('Please select at least one skill to export', 'error');
      return;
    }

    // Filter to selected skills only
    const selectedSkillsData = skillsArray.filter((s) => selectedSkills.has(s.id));

    // CSV header row
    const headers = ['Skill Name', 'Description', 'Skill Prompt'];

    // Build data rows
    // Each skill's generatePrompt() returns { systemInstruction, userPrompt }
    // We pass empty object {} since we just need the system instruction template
    const rows = selectedSkillsData.map((skill) => {
      const { systemInstruction } = skill.generatePrompt({});
      return [
        escapeCSV(skill.name),
        escapeCSV(skill.description),
        escapeCSV(systemInstruction),
      ].join(',');
    });

    // Combine header and rows
    const csv = [headers.join(','), ...rows].join('\n');

    // Create downloadable file
    // Blob represents the file data in memory
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

    // Create temporary URL for the Blob
    const url = URL.createObjectURL(blob);

    // Create and trigger download link
    const a = document.createElement('a');
    a.href = url;
    a.download = `skillengine-skills-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();

    // Cleanup: remove link and revoke URL to free memory
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    addToast(`Exported ${selectedSkills.size} skill(s) to CSV`, 'success');
  };

  /**
   * Download selected skills as a formatted text file
   *
   * Creates a human-readable document with clear section separators
   * for each skill, including name, description, and full prompt.
   */
  const downloadText = () => {
    // Validate selection
    if (selectedSkills.size === 0) {
      addToast('Please select at least one skill to export', 'error');
      return;
    }

    // Filter to selected skills only
    const selectedSkillsData = skillsArray.filter((s) => selectedSkills.has(s.id));

    // Build formatted text content
    // Each skill gets a clear header with separator lines
    const textContent = selectedSkillsData.map((skill) => {
      const { systemInstruction } = skill.generatePrompt({});
      return `${'='.repeat(80)}
SKILL: ${skill.name}
${'='.repeat(80)}

DESCRIPTION:
${skill.description}

SYSTEM PROMPT:
${systemInstruction}

`;
    }).join('\n');

    // Create and download file (same pattern as CSV)
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `skillengine-skills-export-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    addToast(`Exported ${selectedSkills.size} skill(s) to text file`, 'success');
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      {/* ═══════════════════════════════════════════════════════════════════════
          PAGE HEADER
          Back navigation, title, and description
      ═══════════════════════════════════════════════════════════════════════ */}
      <div className="mb-8">
        {/* Back button to return to skills list */}
        <Link to="/skills">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to AI Skills
          </Button>
        </Link>

        {/* Page title with icon */}
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
            <FileSpreadsheet className="h-6 w-6 text-amber-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Export Skills</h1>
            <p className="text-muted-foreground">
              Select skills and download their prompts as CSV or text file
            </p>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          ACTIONS BAR
          Bulk selection controls and download buttons
      ═══════════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 p-4 border rounded-xl bg-card">
        {/* Left side: Selection controls */}
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={selectAll}>
            <CheckSquare className="h-4 w-4 mr-2" />
            Select All
          </Button>
          <Button variant="outline" size="sm" onClick={deselectAll}>
            <Square className="h-4 w-4 mr-2" />
            Deselect All
          </Button>
          {/* Selection counter */}
          <span className="text-sm text-muted-foreground">
            {selectedSkills.size} of {skillsArray.length} selected
          </span>
        </div>

        {/* Right side: Download buttons */}
        <div className="flex items-center gap-2">
          {/* TXT download - formatted text file */}
          <Button
            variant="outline"
            onClick={downloadText}
            disabled={selectedSkills.size === 0}
          >
            <FileText className="h-4 w-4 mr-2" />
            Download TXT
          </Button>
          {/* CSV download - structured data file */}
          <Button
            onClick={downloadCSV}
            disabled={selectedSkills.size === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Download CSV
          </Button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          SKILLS LIST
          Selectable cards for each skill
      ═══════════════════════════════════════════════════════════════════════ */}
      <div className="space-y-3">
        {skillsArray.map((skill) => {
          const isSelected = selectedSkills.has(skill.id);
          const IconComponent = skill.icon;

          return (
            <div
              key={skill.id}
              onClick={() => toggleSkill(skill.id)}
              className={`
                flex items-start gap-4 p-4 border rounded-xl cursor-pointer transition-all
                ${isSelected
                  ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                  : 'hover:border-muted-foreground/30 hover:bg-muted/30'
                }
              `}
            >
              {/* Checkbox - visual indicator of selection */}
              <div className="pt-0.5">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => toggleSkill(skill.id)}
                />
              </div>

              {/* Skill icon with theme colors */}
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${skill.theme.secondary}`}>
                <IconComponent className={`h-5 w-5 ${skill.theme.primary}`} />
              </div>

              {/* Skill name and description */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold">{skill.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {skill.description}
                </p>
              </div>

              {/* Selection indicator icon */}
              {isSelected && (
                <div className="shrink-0">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          EXPORT PREVIEW
          Shows what fields will be included in the export
          Only visible when skills are selected
      ═══════════════════════════════════════════════════════════════════════ */}
      {selectedSkills.size > 0 && (
        <div className="mt-8 p-4 border rounded-xl bg-muted/30">
          <h3 className="font-semibold mb-2">Export Preview</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Your export will include the following fields for {selectedSkills.size} skill(s):
          </p>
          {/* Field badges showing export columns */}
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-background border rounded-full text-sm">Skill Name</span>
            <span className="px-3 py-1 bg-background border rounded-full text-sm">Description</span>
            <span className="px-3 py-1 bg-background border rounded-full text-sm">Skill Prompt (System Instruction)</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillExportPage;
