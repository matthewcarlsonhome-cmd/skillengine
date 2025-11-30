// Community Skills Page - Browse and discover shared skills
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import {
  fetchCommunitySkills,
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

  const [skills, setSkills] = useState<CommunitySkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

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

              <Button
                variant="outline"
                size="sm"
                className="w-full mt-4"
                onClick={() => {
                  // TODO: Implement skill import/use
                  addToast('Skill import coming soon!', 'info');
                }}
              >
                Use This Skill
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommunitySkillsPage;
