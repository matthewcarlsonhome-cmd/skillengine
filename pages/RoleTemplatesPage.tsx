// Role Templates Page - Browse and install pre-built skill bundles for professional roles

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ROLE_TEMPLATES, type RoleTemplate } from '../lib/roleTemplates';
import { SKILLS } from '../lib/skills';
import { db } from '../lib/storage/indexeddb';
import type { DynamicSkill } from '../lib/storage/types';
import { useToast } from '../hooks/useToast';
import { logger } from '../lib/logger';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import {
  Users,
  Search,
  Check,
  Download,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Clock,
  Package,
  ArrowRight,
  Code2,
  BarChart3,
  Megaphone,
  TrendingUp,
  Palette,
  PieChart,
  ClipboardList,
  Figma,
  HandCoins,
  Briefcase,
  FileDown,
  ArrowUpRight,
} from 'lucide-react';

// Icon mapping
const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Code2: Code2,
  BarChart3: BarChart3,
  Megaphone: Megaphone,
  TrendingUp: TrendingUp,
  Palette: Palette,
  Package: Package,
  PieChart: PieChart,
  ClipboardList: ClipboardList,
  Figma: Figma,
  HandCoins: HandCoins,
};

const RoleTemplatesPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRoleId, setExpandedRoleId] = useState<string | null>(null);
  const [installedRoles, setInstalledRoles] = useState<Set<string>>(new Set());
  const [installing, setInstalling] = useState<string | null>(null);

  // Check which roles have been installed
  useEffect(() => {
    const checkInstalledRoles = async () => {
      try {
        await db.init();
        const existingSkills = await db.getAllDynamicSkills();
        const installedSet = new Set<string>();

        // Check if any skills from each role template exist
        for (const role of ROLE_TEMPLATES) {
          const hasInstalledSkill = role.dynamicSkills.some(templateSkill =>
            existingSkills.some(existing => existing.name === templateSkill.name)
          );
          if (hasInstalledSkill) {
            installedSet.add(role.id);
          }
        }

        setInstalledRoles(installedSet);
      } catch (error) {
        logger.error('Failed to check installed roles', { error: error instanceof Error ? error.message : String(error) });
      }
    };

    checkInstalledRoles();
  }, []);

  const handleInstallRole = async (role: RoleTemplate) => {
    setInstalling(role.id);

    try {
      await db.init();
      let installedCount = 0;

      // Install dynamic skills from the role template
      for (const skillTemplate of role.dynamicSkills) {
        // Check if skill already exists
        const existingSkills = await db.getAllDynamicSkills();
        const alreadyExists = existingSkills.some(s => s.name === skillTemplate.name);

        if (!alreadyExists) {
          const newSkill: DynamicSkill = {
            id: crypto.randomUUID(),
            workspaceId: 'role-template-' + role.id,
            version: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            executionCount: 0,
            ...skillTemplate,
          };

          await db.saveDynamicSkill(newSkill);
          installedCount++;
        }
      }

      setInstalledRoles(prev => new Set([...prev, role.id]));

      if (installedCount > 0) {
        addToast(`Installed ${installedCount} skills for ${role.name}!`, 'success');
      } else {
        addToast(`${role.name} skills already installed`, 'success');
      }
    } catch (error) {
      logger.error('Failed to install role', { error: error instanceof Error ? error.message : String(error) });
      addToast('Failed to install skills', 'error');
    } finally {
      setInstalling(null);
    }
  };

  const filteredRoles = ROLE_TEMPLATES.filter(
    role =>
      role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStaticSkillNames = (skillIds: string[]): string[] => {
    return skillIds
      .map(id => SKILLS[id]?.name)
      .filter((name): name is string => !!name);
  };

  const getRoleIcon = (iconName: string) => {
    const IconComponent = ICON_MAP[iconName] || Briefcase;
    return IconComponent;
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
            <Users className="h-6 w-6 text-purple-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Role Templates</h1>
            <p className="text-muted-foreground">
              {ROLE_TEMPLATES.length} professional roles with {ROLE_TEMPLATES.reduce((acc, r) => acc + r.dynamicSkills.length, 0)}+ production-ready skills
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/export-skills">
            <Button variant="outline">
              <FileDown className="h-4 w-4 mr-2" />
              Export Skills
            </Button>
          </Link>
          <Button variant="outline" onClick={() => navigate('/my-skills')}>
            <Package className="h-4 w-4 mr-2" />
            My Skills
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search roles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Info Banner */}
      <div className="mb-8 grid md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border bg-gradient-to-r from-purple-500/10 to-pink-500/10">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-purple-400 mt-0.5 shrink-0" />
            <div>
              <h3 className="font-semibold mb-1">Expert-Level System Prompts</h3>
              <p className="text-sm text-muted-foreground">
                Each skill is crafted by domain experts with 15-20+ years of experience.
                Includes industry frameworks, best practices, and production-ready templates.
              </p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl border bg-gradient-to-r from-green-500/10 to-emerald-500/10">
          <div className="flex items-start gap-3">
            <FileDown className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
            <div>
              <h3 className="font-semibold mb-1">Export for Any LLM</h3>
              <p className="text-sm text-muted-foreground">
                Download skill prompts as CSV or TXT files. Use them in ChatGPT, Claude, Gemini,
                or refine them for your specific needs.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Role Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredRoles.map((role) => {
          const isExpanded = expandedRoleId === role.id;
          const isInstalled = installedRoles.has(role.id);
          const isInstalling = installing === role.id;
          const RoleIcon = getRoleIcon(role.icon);
          const staticSkillNames = getStaticSkillNames(role.staticSkillIds);

          return (
            <div
              key={role.id}
              className={`rounded-xl border bg-card overflow-hidden transition-all ${
                isExpanded ? 'ring-2 ring-primary/50' : ''
              }`}
            >
              {/* Role Header */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${role.color.replace('text-', 'from-')}/20 to-transparent flex items-center justify-center`}>
                      <RoleIcon className={`h-6 w-6 ${role.color}`} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{role.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{role.dynamicSkills.length} role skills</span>
                        <span>+</span>
                        <span>{role.staticSkillIds.length} job-search skills</span>
                      </div>
                    </div>
                  </div>
                  {isInstalled && (
                    <span className="flex items-center gap-1 text-sm text-green-500 bg-green-500/10 px-2 py-1 rounded-full">
                      <Check className="h-3 w-3" />
                      Installed
                    </span>
                  )}
                </div>

                <p className="text-muted-foreground mb-4">{role.description}</p>

                {/* Action Buttons */}
                <div className="flex items-center gap-3">
                  <Button
                    onClick={() => handleInstallRole(role)}
                    disabled={isInstalling}
                    className="flex-1"
                  >
                    {isInstalling ? (
                      <>
                        <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Installing...
                      </>
                    ) : isInstalled ? (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Reinstall Skills
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Install Bundle
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setExpandedRoleId(isExpanded ? null : role.id)}
                  >
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="border-t bg-muted/30 p-6 space-y-6">
                  {/* Role-Specific Skills */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-purple-400" />
                      Role-Specific AI Skills
                    </h4>
                    <div className="space-y-3">
                      {role.dynamicSkills.map((skill, index) => (
                        <div
                          key={index}
                          className="p-3 rounded-lg bg-card border"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <h5 className="font-medium">{skill.name}</h5>
                              <p className="text-sm text-muted-foreground">
                                {skill.description}
                              </p>
                            </div>
                            {skill.estimatedTimeSaved && (
                              <span className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
                                <Clock className="h-3 w-3" />
                                {skill.estimatedTimeSaved}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Included Job-Search Skills */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-blue-400" />
                      Included Job-Search Skills
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {staticSkillNames.map((name, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-sm"
                        >
                          {name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  {isInstalled && (
                    <div className="pt-4 border-t">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => navigate('/my-skills')}
                      >
                        Go to My Skills
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredRoles.length === 0 && (
        <div className="text-center py-12 border rounded-xl bg-muted/30">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No roles found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search query
          </p>
        </div>
      )}
    </div>
  );
};

export default RoleTemplatesPage;
