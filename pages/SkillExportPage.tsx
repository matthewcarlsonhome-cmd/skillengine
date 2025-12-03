// Skill Export Page - Select and download skills as CSV

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

const SkillExportPage: React.FC = () => {
  const { addToast } = useToast();
  const skillsArray = useMemo(() => Object.values(SKILLS), []);
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set());

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

  const selectAll = () => {
    setSelectedSkills(new Set(skillsArray.map((s) => s.id)));
  };

  const deselectAll = () => {
    setSelectedSkills(new Set());
  };

  const escapeCSV = (value: string): string => {
    // Escape double quotes and wrap in quotes if contains comma, newline, or quotes
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

    const selectedSkillsData = skillsArray.filter((s) => selectedSkills.has(s.id));

    // CSV header
    const headers = ['Skill Name', 'Description', 'Skill Prompt'];

    // CSV rows
    const rows = selectedSkillsData.map((skill) => {
      // Generate prompt to get the systemInstruction
      const { systemInstruction } = skill.generatePrompt({});
      return [
        escapeCSV(skill.name),
        escapeCSV(skill.description),
        escapeCSV(systemInstruction),
      ].join(',');
    });

    const csv = [headers.join(','), ...rows].join('\n');

    // Download
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

    const selectedSkillsData = skillsArray.filter((s) => selectedSkills.has(s.id));

    // Build text content
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

    // Download
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

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      {/* Header */}
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
              Select skills and download their prompts as CSV or text file
            </p>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
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
            {selectedSkills.size} of {skillsArray.length} selected
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

      {/* Skills List */}
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
              <div className="pt-0.5">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => toggleSkill(skill.id)}
                />
              </div>
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${skill.theme.secondary}`}>
                <IconComponent className={`h-5 w-5 ${skill.theme.primary}`} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold">{skill.name}</h3>
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
        })}
      </div>

      {/* Export Preview */}
      {selectedSkills.size > 0 && (
        <div className="mt-8 p-4 border rounded-xl bg-muted/30">
          <h3 className="font-semibold mb-2">Export Preview</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Your export will include the following fields for {selectedSkills.size} skill(s):
          </p>
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
