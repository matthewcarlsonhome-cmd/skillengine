// My Skills Page - View and run installed dynamic skills from role templates

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from '../hooks/useDebounce';
import { db } from '../lib/storage/indexeddb';
import type { DynamicSkill } from '../lib/storage/types';
import { useToast } from '../hooks/useToast';
import { logger } from '../lib/logger';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import {
  Package,
  Search,
  Play,
  Trash2,
  Clock,
  Sparkles,
  Users,
  ArrowRight,
  FolderOpen,
} from 'lucide-react';

const MySkillsPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [skills, setSkills] = useState<DynamicSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 150);

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    setLoading(true);
    try {
      await db.init();
      const allSkills = await db.getAllDynamicSkills();
      // Sort by most recently updated
      allSkills.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      setSkills(allSkills);
    } catch (error) {
      logger.error('Failed to load skills', { error: error instanceof Error ? error.message : String(error) });
      addToast('Failed to load skills', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSkill = async (skill: DynamicSkill) => {
    if (!confirm(`Delete "${skill.name}"? This cannot be undone.`)) return;

    try {
      await db.deleteDynamicSkill(skill.id);
      setSkills(prev => prev.filter(s => s.id !== skill.id));
      addToast('Skill deleted', 'success');
    } catch (error) {
      addToast('Failed to delete skill', 'error');
    }
  };

  const handleRunSkill = (skill: DynamicSkill) => {
    // Store skill in session storage and navigate to a generic runner
    sessionStorage.setItem('dynamicSkillToRun', JSON.stringify(skill));
    // Navigate to dynamic skill runner - need to handle this
    navigate(`/workspace/${skill.workspaceId}/skill/${skill.id}`);
  };

  // Filter skills using debounced search for performance
  const filteredSkills = skills.filter(
    skill =>
      skill.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
      skill.description.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
      skill.category.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
  );

  // Group skills by workspace/source
  const groupedSkills = filteredSkills.reduce((acc, skill) => {
    const group = skill.workspaceId.startsWith('role-template-')
      ? 'Role Templates'
      : 'Custom Skills';
    if (!acc[group]) acc[group] = [];
    acc[group].push(skill);
    return acc;
  }, {} as Record<string, DynamicSkill[]>);

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      automation: 'text-blue-400 bg-blue-500/10',
      analysis: 'text-purple-400 bg-purple-500/10',
      generation: 'text-green-400 bg-green-500/10',
      optimization: 'text-orange-400 bg-orange-500/10',
      communication: 'text-pink-400 bg-pink-500/10',
    };
    return colors[category] || 'text-gray-400 bg-gray-500/10';
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading skills...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
            <Package className="h-6 w-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">My Skills</h1>
            <p className="text-muted-foreground">
              {skills.length} skill{skills.length !== 1 ? 's' : ''} installed
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/role-templates')}>
            <Users className="h-4 w-4 mr-2" />
            Browse Roles
          </Button>
          <Button variant="outline" onClick={() => navigate('/analyze')}>
            <FolderOpen className="h-4 w-4 mr-2" />
            Create Custom
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search skills..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Skills List */}
      {skills.length === 0 ? (
        <div className="text-center py-12 border rounded-xl bg-muted/30">
          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No skills installed</h3>
          <p className="text-muted-foreground mb-6">
            Install skills from role templates or create custom skills
          </p>
          <div className="flex justify-center gap-3">
            <Button onClick={() => navigate('/role-templates')}>
              <Users className="h-4 w-4 mr-2" />
              Browse Role Templates
            </Button>
            <Button variant="outline" onClick={() => navigate('/analyze')}>
              <Sparkles className="h-4 w-4 mr-2" />
              Create Custom Skill
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedSkills).map(([group, groupSkills]) => (
            <div key={group}>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                {group === 'Role Templates' ? (
                  <Users className="h-5 w-5 text-purple-400" />
                ) : (
                  <Sparkles className="h-5 w-5 text-blue-400" />
                )}
                {group}
                <span className="text-sm font-normal text-muted-foreground">
                  ({groupSkills.length})
                </span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupSkills.map((skill) => (
                  <div
                    key={skill.id}
                    className="rounded-xl border bg-card p-4 hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">{skill.name}</h3>
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs ${getCategoryColor(skill.category)}`}>
                          {skill.category}
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {skill.description}
                    </p>

                    {skill.estimatedTimeSaved && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                        <Clock className="h-3 w-3" />
                        Saves {skill.estimatedTimeSaved}
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => handleRunSkill(skill)}
                      >
                        <Play className="h-3 w-3 mr-1" />
                        Run
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDeleteSkill(skill)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MySkillsPage;
