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
 * - Two sections: Core Skills (builtin) and Skill Library (role-template)
 * - Visual skill selection with checkboxes
 * - Select All / Deselect All functionality per section
 * - Role filtering for Skill Library skills
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
import { getAllLibrarySkills, ROLE_DEFINITIONS } from '../lib/skillLibrary';
import type { LibrarySkill } from '../lib/skillLibrary/types';
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
  Library,
  Briefcase,
  Filter,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface ExportableSkill {
  id: string;
  name: string;
  description: string;
  systemInstruction: string;
  source: 'builtin' | 'role-template';
  roleId?: string;
  roleName?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

const SkillExportPage: React.FC = () => {
  const { addToast } = useToast();

  // ─────────────────────────────────────────────────────────────────────────
  // STATE
  // ─────────────────────────────────────────────────────────────────────────

  // Track which skills are selected
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set());

  // Active tab: 'core' for builtin skills, 'library' for role-template skills
  const [activeTab, setActiveTab] = useState<'core' | 'library'>('core');

  // Role filter for library skills
  const [selectedRole, setSelectedRole] = useState<string>('all');

  // Collapse state for sections
  const [coreExpanded, setCoreExpanded] = useState(true);
  const [libraryExpanded, setLibraryExpanded] = useState(true);

  // ─────────────────────────────────────────────────────────────────────────
  // PREPARE SKILLS DATA
  // ─────────────────────────────────────────────────────────────────────────

  // Convert builtin SKILLS to exportable format
  const coreSkills: ExportableSkill[] = useMemo(() => {
    return Object.values(SKILLS).map((skill) => {
      const { systemInstruction } = skill.generatePrompt({});
      return {
        id: skill.id,
        name: skill.name,
        description: skill.description,
        systemInstruction,
        source: 'builtin' as const,
      };
    });
  }, []);

  // Get role-template skills from library
  const librarySkills: ExportableSkill[] = useMemo(() => {
    const allSkills = getAllLibrarySkills();
    return allSkills
      .filter((skill) => skill.source === 'role-template')
      .map((skill) => {
        // Find the role name
        const role = ROLE_DEFINITIONS.find((r) => r.id === skill.sourceRoleId);
        return {
          id: skill.id,
          name: skill.name,
          description: skill.description,
          systemInstruction: skill.prompts.systemInstruction,
          source: 'role-template' as const,
          roleId: skill.sourceRoleId,
          roleName: role?.name || 'Unknown Role',
        };
      });
  }, []);

  // Filter library skills by selected role
  const filteredLibrarySkills = useMemo(() => {
    if (selectedRole === 'all') return librarySkills;
    return librarySkills.filter((skill) => skill.roleId === selectedRole);
  }, [librarySkills, selectedRole]);

  // All exportable skills
  const allSkills = useMemo(
    () => [...coreSkills, ...librarySkills],
    [coreSkills, librarySkills]
  );

  // Selected skills data
  const selectedSkillsData = useMemo(
    () => allSkills.filter((s) => selectedSkills.has(s.id)),
    [allSkills, selectedSkills]
  );

  // ─────────────────────────────────────────────────────────────────────────
  // SELECTION HANDLERS
  // ─────────────────────────────────────────────────────────────────────────

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

  const selectAllCore = () => {
    setSelectedSkills((prev) => {
      const newSet = new Set(prev);
      coreSkills.forEach((s) => newSet.add(s.id));
      return newSet;
    });
  };

  const deselectAllCore = () => {
    setSelectedSkills((prev) => {
      const newSet = new Set(prev);
      coreSkills.forEach((s) => newSet.delete(s.id));
      return newSet;
    });
  };

  const selectAllLibrary = () => {
    setSelectedSkills((prev) => {
      const newSet = new Set(prev);
      filteredLibrarySkills.forEach((s) => newSet.add(s.id));
      return newSet;
    });
  };

  const deselectAllLibrary = () => {
    setSelectedSkills((prev) => {
      const newSet = new Set(prev);
      filteredLibrarySkills.forEach((s) => newSet.delete(s.id));
      return newSet;
    });
  };

  const selectAll = () => {
    const allIds = [...coreSkills, ...filteredLibrarySkills].map((s) => s.id);
    setSelectedSkills(new Set(allIds));
  };

  const deselectAll = () => {
    setSelectedSkills(new Set());
  };

  // Count selected per section
  const coreSelectedCount = coreSkills.filter((s) => selectedSkills.has(s.id)).length;
  const librarySelectedCount = filteredLibrarySkills.filter((s) => selectedSkills.has(s.id)).length;

  // ─────────────────────────────────────────────────────────────────────────
  // EXPORT FUNCTIONS
  // ─────────────────────────────────────────────────────────────────────────

  const escapeCSV = (value: string): string => {
    const escaped = value.replace(/"/g, '""');
    if (escaped.includes(',') || escaped.includes('\n') || escaped.includes('"')) {
      return `"${escaped}"`;
    }
    return escaped;
  };

  const downloadCSV = () => {
    if (selectedSkills.size === 0) {
      addToast('Please select at least one skill to export', 'error');
      return;
    }

    const headers = ['Skill Name', 'Description', 'Source', 'Role', 'System Prompt'];

    const rows = selectedSkillsData.map((skill) => {
      return [
        escapeCSV(skill.name),
        escapeCSV(skill.description),
        escapeCSV(skill.source === 'builtin' ? 'Core Skill' : 'Skill Library'),
        escapeCSV(skill.roleName || '-'),
        escapeCSV(skill.systemInstruction),
      ].join(',');
    });

    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `skillengine-skills-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    addToast(`Exported ${selectedSkills.size} skill(s) to CSV`, 'success');
  };

  const downloadText = () => {
    if (selectedSkills.size === 0) {
      addToast('Please select at least one skill to export', 'error');
      return;
    }

    const textContent = selectedSkillsData.map((skill) => {
      const sourceLabel = skill.source === 'builtin' ? 'Core Skill' : `Skill Library (${skill.roleName})`;
      return `${'='.repeat(80)}
SKILL: ${skill.name}
${'='.repeat(80)}

SOURCE: ${sourceLabel}

DESCRIPTION:
${skill.description}

SYSTEM PROMPT:
${skill.systemInstruction}

`;
    }).join('\n');

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

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER SKILL CARD
  // ─────────────────────────────────────────────────────────────────────────

  const renderSkillCard = (skill: ExportableSkill) => {
    const isSelected = selectedSkills.has(skill.id);

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
        <div className="pt-0.5">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => toggleSkill(skill.id)}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold">{skill.name}</h3>
            {skill.source === 'role-template' && skill.roleName && (
              <span className="px-2 py-0.5 text-xs rounded-full bg-muted text-muted-foreground">
                {skill.roleName}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {skill.description}
          </p>
        </div>

        {isSelected && (
          <div className="shrink-0">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
        )}
      </div>
    );
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      {/* ═══════════════════════════════════════════════════════════════════════
          PAGE HEADER
      ═══════════════════════════════════════════════════════════════════════ */}
      <div className="mb-8">
        <Link to="/skills">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to AI Skills
          </Button>
        </Link>

        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
            <FileSpreadsheet className="h-6 w-6 text-amber-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Export Skills</h1>
            <p className="text-muted-foreground">
              Select skills from Core Skills or Skill Library and download their prompts
            </p>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          GLOBAL ACTIONS BAR
      ═══════════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 p-4 border rounded-xl bg-card">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={selectAll}>
            <CheckSquare className="h-4 w-4 mr-2" />
            Select All
          </Button>
          <Button variant="outline" size="sm" onClick={deselectAll}>
            <Square className="h-4 w-4 mr-2" />
            Deselect All
          </Button>
          <span className="text-sm text-muted-foreground">
            {selectedSkills.size} of {coreSkills.length + filteredLibrarySkills.length} selected
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={downloadText}
            disabled={selectedSkills.size === 0}
          >
            <FileText className="h-4 w-4 mr-2" />
            Download TXT
          </Button>
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
          CORE SKILLS SECTION
      ═══════════════════════════════════════════════════════════════════════ */}
      <div className="mb-8">
        <div
          className="flex items-center justify-between p-4 border rounded-xl bg-muted/30 cursor-pointer"
          onClick={() => setCoreExpanded(!coreExpanded)}
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Briefcase className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Core Skills</h2>
              <p className="text-sm text-muted-foreground">
                {coreSkills.length} built-in job search and career skills
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {coreSelectedCount} selected
            </span>
            {coreExpanded ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
        </div>

        {coreExpanded && (
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-4">
              <Button variant="outline" size="sm" onClick={selectAllCore}>
                <CheckSquare className="h-4 w-4 mr-2" />
                Select All Core
              </Button>
              <Button variant="outline" size="sm" onClick={deselectAllCore}>
                <Square className="h-4 w-4 mr-2" />
                Deselect All Core
              </Button>
            </div>
            <div className="space-y-3">
              {coreSkills.map(renderSkillCard)}
            </div>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          SKILL LIBRARY SECTION
      ═══════════════════════════════════════════════════════════════════════ */}
      <div className="mb-8">
        <div
          className="flex items-center justify-between p-4 border rounded-xl bg-muted/30 cursor-pointer"
          onClick={() => setLibraryExpanded(!libraryExpanded)}
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Library className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Skill Library</h2>
              <p className="text-sm text-muted-foreground">
                {librarySkills.length} professional role-specific skills
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {librarySelectedCount} selected
            </span>
            {libraryExpanded ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
        </div>

        {libraryExpanded && (
          <div className="mt-4">
            {/* Role filter */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filter by Role:</span>
              </div>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="px-3 py-1.5 border rounded-lg text-sm bg-background"
              >
                <option value="all">All Roles ({librarySkills.length})</option>
                {ROLE_DEFINITIONS.map((role) => {
                  const count = librarySkills.filter((s) => s.roleId === role.id).length;
                  return (
                    <option key={role.id} value={role.id}>
                      {role.name} ({count})
                    </option>
                  );
                })}
              </select>
              <Button variant="outline" size="sm" onClick={selectAllLibrary}>
                <CheckSquare className="h-4 w-4 mr-2" />
                Select All Shown
              </Button>
              <Button variant="outline" size="sm" onClick={deselectAllLibrary}>
                <Square className="h-4 w-4 mr-2" />
                Deselect All Shown
              </Button>
            </div>

            {/* Skills list */}
            <div className="space-y-3">
              {filteredLibrarySkills.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No skills found for this role
                </div>
              ) : (
                filteredLibrarySkills.map(renderSkillCard)
              )}
            </div>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          EXPORT PREVIEW
      ═══════════════════════════════════════════════════════════════════════ */}
      {selectedSkills.size > 0 && (
        <div className="mt-8 p-4 border rounded-xl bg-muted/30">
          <h3 className="font-semibold mb-2">Export Preview</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Your export will include the following fields for {selectedSkills.size} skill(s):
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-background border rounded-full text-sm">Skill Name</span>
            <span className="px-3 py-1 bg-background border rounded-full text-sm">Description</span>
            <span className="px-3 py-1 bg-background border rounded-full text-sm">Source</span>
            <span className="px-3 py-1 bg-background border rounded-full text-sm">Role</span>
            <span className="px-3 py-1 bg-background border rounded-full text-sm">System Prompt</span>
          </div>

          {/* Selected skills breakdown */}
          <div className="mt-4 pt-4 border-t flex flex-wrap gap-4 text-sm">
            {coreSelectedCount > 0 && (
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-blue-500" />
                <span>{coreSelectedCount} Core Skills</span>
              </div>
            )}
            {librarySelectedCount > 0 && (
              <div className="flex items-center gap-2">
                <Library className="h-4 w-4 text-purple-500" />
                <span>{librarySelectedCount} Library Skills</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillExportPage;
