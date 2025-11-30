// Community Skills Page - Browse and discover shared skills
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import {
  fetchCommunitySkills,
  incrementSkillUseCount,
  deleteCommunitySkill,
  type CommunitySkill,
  isSupabaseConfigured,
} from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import {
  Search,
  Users,
  Sparkles,
  Clock,
  Star,
  LogIn,
  Loader2,
  AlertCircle,
  Briefcase,
  TrendingUp,
  Filter,
  X,
  Play,
  Trash2,
  Upload,
} from 'lucide-react';

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'automation', label: 'Automation' },
  { value: 'analysis', label: 'Analysis' },
  { value: 'generation', label: 'Generation' },
  { value: 'optimization', label: 'Optimization' },
  { value: 'communication', label: 'Communication' },
];

const CommunitySkillsPage: React.FC = () => {
  const { user, loading: authLoading, signInWithGoogle, isConfigured } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [skills, setSkills] = useState<CommunitySkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Import from JSON state
  const [showImportModal, setShowImportModal] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Delete confirmation state
  const [deleteConfirmSkill, setDeleteConfirmSkill] = useState<CommunitySkill | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadSkills();
  }, [selectedCategory, roleFilter]);

  const loadSkills = async () => {
    setLoading(true);
    try {
      const data = await fetchCommunitySkills({
        category: selectedCategory || undefined,
        roleTitle: roleFilter || undefined,
        search: searchQuery || undefined,
        limit: 50,
      });
      setSkills(data);
    } catch (error) {
      console.error('Failed to load skills:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadSkills();
  };

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      addToast('Failed to sign in', 'error');
    }
  };

  const getAverageRating = (skill: CommunitySkill): number => {
    if (skill.rating_count === 0) return 0;
    return skill.rating_sum / skill.rating_count;
  };

  const handleLaunchSkill = (skill: CommunitySkill) => {
    // Store skill in sessionStorage and navigate to runner
    sessionStorage.setItem('communitySkillToRun', JSON.stringify(skill));
    navigate('/community-skill-runner');
  };

  const handleDeleteSkill = async () => {
    if (!deleteConfirmSkill) return;

    setIsDeleting(true);
    try {
      await deleteCommunitySkill(deleteConfirmSkill.id);
      addToast('Skill deleted successfully', 'success');
      setDeleteConfirmSkill(null);
      // Refresh the skills list
      loadSkills();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete skill';
      addToast(message, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setImportJsonText(text);
      setShowImportModal(true);
    };
    reader.readAsText(file);

    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImportFromJson = async () => {
    if (!importJsonText.trim()) {
      addToast('Please provide skill JSON', 'error');
      return;
    }

    if (!user) {
      addToast('Please sign in to publish skills', 'error');
      return;
    }

    setIsImporting(true);
    try {
      const parsed = JSON.parse(importJsonText);

      // Support both exported prompt format and direct skill format
      const skillData = {
        name: parsed.skillName || parsed.name || 'Imported Skill',
        description: parsed.skillDescription || parsed.description || '',
        longDescription: parsed.prompts?.longDescription || parsed.longDescription || parsed.description || '',
        category: parsed.category || 'automation',
        estimatedTimeSaved: parsed.estimatedTimeSaved || '10-30 minutes',
        roleTitle: parsed.roleTitle || undefined,
        roleDepartment: parsed.roleDepartment || undefined,
        roleLevel: parsed.roleLevel || undefined,
        systemInstruction: parsed.prompts?.systemInstruction || parsed.systemInstruction || '',
        userPromptTemplate: parsed.prompts?.userPromptTemplate || parsed.userPromptTemplate || '',
        outputFormat: parsed.prompts?.outputFormat || parsed.outputFormat || 'markdown',
        recommendedModel: parsed.config?.recommendedModel || parsed.recommendedModel || 'any',
        maxTokens: parsed.config?.maxTokens || parsed.maxTokens || 4096,
        temperature: parsed.config?.temperature || parsed.temperature || 0.4,
        inputs: parsed.inputs || [],
      };

      // Validate required fields
      if (!skillData.systemInstruction || !skillData.userPromptTemplate) {
        throw new Error('Skill must include systemInstruction and userPromptTemplate');
      }

      // Import the publishSkillToCommunity function
      const { publishSkillToCommunity } = await import('../lib/supabase');
      await publishSkillToCommunity(skillData);

      addToast('Skill published to community!', 'success');
      setShowImportModal(false);
      setImportJsonText('');
      loadSkills();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to import skill';
      addToast(message, 'error');
    } finally {
      setIsImporting(false);
    }
  };

  // Show configuration message if Supabase is not set up
  if (!isConfigured) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <div className="text-center">
          <AlertCircle className="mx-auto h-16 w-16 text-muted-foreground" />
          <h1 className="mt-6 text-3xl font-bold">Community Skills Coming Soon</h1>
          <p className="mt-4 text-muted-foreground max-w-md mx-auto">
            Community features require Supabase configuration. Once set up, you'll be able to
            browse, share, and discover skills created by other users.
          </p>
          <div className="mt-8 p-4 rounded-lg bg-muted/50 text-left max-w-md mx-auto">
            <h3 className="font-semibold mb-2">To enable community features:</h3>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Set up a Supabase project</li>
              <li>Add VITE_SUPABASE_URL to environment</li>
              <li>Add VITE_SUPABASE_ANON_KEY to environment</li>
              <li>Run the database schema SQL</li>
            </ol>
          </div>
          <Link to="/" className="inline-block mt-6">
            <Button variant="outline">Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            Community Skills
          </h1>
          <p className="text-muted-foreground mt-1">
            Discover and use skills shared by the community
          </p>
        </div>

        {authLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : user ? (
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              Import Skill
            </Button>
            <img
              src={user.user_metadata?.avatar_url || ''}
              alt=""
              className="h-8 w-8 rounded-full"
            />
            <span className="text-sm">{user.user_metadata?.full_name || user.email}</span>
          </div>
        ) : (
          <Button onClick={handleSignIn}>
            <LogIn className="h-4 w-4 mr-2" />
            Sign in to Share Skills
          </Button>
        )}
        {/* Hidden file input for JSON upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {/* Filters */}
      <div className="rounded-xl border bg-card p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-40"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </Select>
            <Input
              placeholder="Filter by role..."
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-48"
            />
            <Button onClick={handleSearch}>
              <Filter className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Sparkles className="h-4 w-4" />
            Total Skills
          </div>
          <p className="text-2xl font-bold mt-1">{skills.length}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <TrendingUp className="h-4 w-4" />
            Most Used
          </div>
          <p className="text-2xl font-bold mt-1">
            {skills.length > 0 ? Math.max(...skills.map(s => s.use_count)) : 0}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Briefcase className="h-4 w-4" />
            Roles Covered
          </div>
          <p className="text-2xl font-bold mt-1">
            {new Set(skills.map(s => s.role_title).filter(Boolean)).size}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Star className="h-4 w-4" />
            Avg Rating
          </div>
          <p className="text-2xl font-bold mt-1">
            {skills.length > 0
              ? (skills.reduce((sum, s) => sum + getAverageRating(s), 0) / skills.length).toFixed(1)
              : '—'}
          </p>
        </div>
      </div>

      {/* Skills Grid */}
      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">Loading community skills...</p>
        </div>
      ) : skills.length === 0 ? (
        <div className="text-center py-12 rounded-xl border border-dashed">
          <Sparkles className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No Skills Found</h3>
          <p className="text-muted-foreground mt-1">
            {searchQuery || selectedCategory || roleFilter
              ? 'Try adjusting your filters'
              : 'Be the first to share a skill with the community!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {skills.map((skill) => (
            <div
              key={skill.id}
              className="group rounded-xl border bg-card p-5 hover:border-primary/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <span>{getAverageRating(skill).toFixed(1)}</span>
                  <span className="text-muted-foreground">({skill.rating_count})</span>
                </div>
              </div>

              <h3 className="font-semibold mt-3">{skill.name}</h3>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {skill.description}
              </p>

              {skill.role_title && (
                <div className="flex items-center gap-2 mt-3 text-xs">
                  <Briefcase className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">{skill.role_title}</span>
                </div>
              )}

              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="px-2 py-0.5 rounded bg-muted">{skill.category}</span>
                  {skill.estimated_time_saved && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {skill.estimated_time_saved}
                    </span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {skill.use_count} uses
                </span>
              </div>

              <div className="flex gap-2 mt-4">
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => handleLaunchSkill(skill)}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Launch
                </Button>
                {user && skill.created_by === user.id && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeleteConfirmSkill(skill)}
                    title="Delete skill"
                    className="text-red-500 hover:text-red-600 hover:border-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Import from JSON Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card rounded-xl border shadow-lg w-full max-w-2xl mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Import Skill from JSON</h2>
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportJsonText('');
                }}
                className="p-1 hover:bg-muted rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              Paste your skill JSON below. This should include the system instruction and user prompt template.
            </p>

            <div className="space-y-4">
              <textarea
                value={importJsonText}
                onChange={(e) => setImportJsonText(e.target.value)}
                placeholder='{"skillName": "My Skill", "prompts": {"systemInstruction": "...", "userPromptTemplate": "..."}, ...}'
                className="w-full h-64 p-3 rounded-lg border bg-muted/50 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              />

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowImportModal(false);
                    setImportJsonText('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleImportFromJson}
                  disabled={isImporting || !importJsonText.trim()}
                >
                  {isImporting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Publish to Community
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmSkill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card rounded-xl border shadow-lg w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-red-500">Delete Skill</h2>
              <button
                onClick={() => setDeleteConfirmSkill(null)}
                className="p-1 hover:bg-muted rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4 p-3 rounded-lg bg-muted/50">
              <h3 className="font-medium">{deleteConfirmSkill.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {deleteConfirmSkill.description}
              </p>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              Are you sure you want to delete this skill from the community library? This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setDeleteConfirmSkill(null)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700"
                onClick={handleDeleteSkill}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunitySkillsPage;
