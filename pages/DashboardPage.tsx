import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { db } from '../lib/storage/indexeddb';
import type { SavedOutput, FavoriteSkill, SkillExecution } from '../lib/storage/types';
import { SKILLS } from '../lib/skills';
import { useToast } from '../hooks/useToast.tsx';
import { Button } from '../components/ui/Button.tsx';
import { Input } from '../components/ui/Input.tsx';
import {
  LayoutDashboard,
  Star,
  Clock,
  FileText,
  Trash2,
  ChevronDown,
  ChevronUp,
  Search,
  Play,
  Copy,
  Download,
  Heart,
  Sparkles,
  TrendingUp,
  Calendar,
  ExternalLink,
  X,
  Edit3,
  Check
} from 'lucide-react';

type TabType = 'saved' | 'favorites' | 'history';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState<TabType>('saved');
  const [savedOutputs, setSavedOutputs] = useState<SavedOutput[]>([]);
  const [favoriteSkills, setFavoriteSkills] = useState<FavoriteSkill[]>([]);
  const [recentExecutions, setRecentExecutions] = useState<SkillExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedOutputId, setExpandedOutputId] = useState<string | null>(null);
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Initialize db first
      await db.init();
      console.log('Dashboard: DB initialized');

      const [outputs, favorites, executions] = await Promise.all([
        db.getAllSavedOutputs().catch((e) => {
          console.error('Failed to load saved outputs:', e);
          return [] as SavedOutput[];
        }),
        db.getAllFavoriteSkills().catch((e) => {
          console.error('Failed to load favorites:', e);
          return [] as FavoriteSkill[];
        }),
        db.getRecentExecutions(100).catch((e) => {
          console.error('Failed to load executions:', e);
          return [] as SkillExecution[];
        })
      ]);
      console.log('Dashboard: Data loaded', { outputs: outputs.length, favorites: favorites.length, executions: executions.length });
      setSavedOutputs(outputs);
      setFavoriteSkills(favorites);
      setRecentExecutions(executions);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
      addToast('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSavedOutput = async (id: string) => {
    try {
      await db.deleteSavedOutput(id);
      setSavedOutputs(prev => prev.filter(o => o.id !== id));
      addToast('Output deleted', 'success');
    } catch (error) {
      addToast('Failed to delete output', 'error');
    }
  };

  const handleToggleFavoriteOutput = async (output: SavedOutput) => {
    try {
      await db.updateSavedOutput(output.id, { isFavorite: !output.isFavorite });
      setSavedOutputs(prev =>
        prev.map(o => o.id === output.id ? { ...o, isFavorite: !o.isFavorite } : o)
      );
      addToast(output.isFavorite ? 'Removed from favorites' : 'Added to favorites', 'success');
    } catch (error) {
      addToast('Failed to update favorite', 'error');
    }
  };

  const handleRemoveFavoriteSkill = async (id: string) => {
    try {
      await db.removeFavoriteSkill(id);
      setFavoriteSkills(prev => prev.filter(f => f.id !== id));
      addToast('Skill removed from favorites', 'success');
    } catch (error) {
      addToast('Failed to remove favorite', 'error');
    }
  };

  const handleCopyOutput = (text: string) => {
    navigator.clipboard.writeText(text);
    addToast('Copied to clipboard', 'success');
  };

  const handleDownloadOutput = (output: SavedOutput) => {
    const blob = new Blob([output.output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${output.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast('Downloaded', 'success');
  };

  const handleUpdateTitle = async (id: string) => {
    if (!editingTitle.trim()) return;
    try {
      await db.updateSavedOutput(id, { title: editingTitle.trim() });
      setSavedOutputs(prev =>
        prev.map(o => o.id === id ? { ...o, title: editingTitle.trim() } : o)
      );
      setEditingTitleId(null);
      addToast('Title updated', 'success');
    } catch (error) {
      addToast('Failed to update title', 'error');
    }
  };

  const getSkillRoute = (skillSource: string, skillId: string) => {
    if (skillSource === 'static') {
      return `/skill/${skillId}`;
    } else if (skillSource === 'community') {
      return '/community';
    }
    return '/';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      if (hours === 0) {
        const minutes = Math.floor(diff / (1000 * 60));
        return minutes <= 1 ? 'Just now' : `${minutes} minutes ago`;
      }
      return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return `${days} days ago`;
    }
    return date.toLocaleDateString();
  };

  const filteredSavedOutputs = savedOutputs.filter(o =>
    o.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.skillName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFavorites = favoriteSkills.filter(f =>
    f.skillName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    totalSaved: savedOutputs.length,
    totalFavorites: favoriteSkills.length,
    totalExecutions: recentExecutions.length,
    thisWeek: recentExecutions.filter(e => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(e.createdAt) > weekAgo;
    }).length
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-destructive mb-4">Error: {error}</p>
          <Button onClick={loadData}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <LayoutDashboard className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Your saved outputs and favorite skills</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <FileText className="h-4 w-4" />
            Saved Outputs
          </div>
          <p className="text-2xl font-bold mt-1">{stats.totalSaved}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Star className="h-4 w-4" />
            Favorite Skills
          </div>
          <p className="text-2xl font-bold mt-1">{stats.totalFavorites}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Sparkles className="h-4 w-4" />
            Total Runs
          </div>
          <p className="text-2xl font-bold mt-1">{stats.totalExecutions}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <TrendingUp className="h-4 w-4" />
            This Week
          </div>
          <p className="text-2xl font-bold mt-1">{stats.thisWeek}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search saved outputs and favorites..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        <button
          onClick={() => setActiveTab('saved')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'saved'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <FileText className="h-4 w-4 inline mr-2" />
          Saved Outputs ({savedOutputs.length})
        </button>
        <button
          onClick={() => setActiveTab('favorites')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'favorites'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Star className="h-4 w-4 inline mr-2" />
          Favorite Skills ({favoriteSkills.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'history'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Clock className="h-4 w-4 inline mr-2" />
          Recent History ({recentExecutions.length})
        </button>
      </div>

      {/* Tab Content */}
      <div className="space-y-4">
        {/* Saved Outputs Tab */}
        {activeTab === 'saved' && (
          <>
            {filteredSavedOutputs.length === 0 ? (
              <div className="text-center py-12 border rounded-xl bg-muted/30">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No saved outputs yet</h3>
                <p className="text-muted-foreground mb-4">
                  Run a skill and save the output to see it here
                </p>
                <Button onClick={() => navigate('/skills')}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Browse Skills
                </Button>
              </div>
            ) : (
              filteredSavedOutputs.map((output) => (
                <div key={output.id} className="border rounded-xl bg-card overflow-hidden">
                  <div className="p-4 flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {editingTitleId === output.id ? (
                          <div className="flex items-center gap-2 flex-1">
                            <Input
                              value={editingTitle}
                              onChange={(e) => setEditingTitle(e.target.value)}
                              className="h-8 text-lg font-semibold"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleUpdateTitle(output.id);
                                if (e.key === 'Escape') setEditingTitleId(null);
                              }}
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleUpdateTitle(output.id)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setEditingTitleId(null)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <h3 className="text-lg font-semibold truncate">{output.title}</h3>
                            <button
                              onClick={() => {
                                setEditingTitleId(output.id);
                                setEditingTitle(output.title);
                              }}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              <Edit3 className="h-3 w-3" />
                            </button>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Sparkles className="h-3 w-3" />
                          {output.skillName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(output.createdAt)}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-muted text-xs">
                          {output.model}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleFavoriteOutput(output)}
                        className={output.isFavorite ? 'text-yellow-500' : ''}
                      >
                        <Heart className={`h-4 w-4 ${output.isFavorite ? 'fill-current' : ''}`} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCopyOutput(output.output)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDownloadOutput(output)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteSavedOutput(output.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setExpandedOutputId(
                          expandedOutputId === output.id ? null : output.id
                        )}
                      >
                        {expandedOutputId === output.id ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  {expandedOutputId === output.id && (
                    <div className="border-t bg-muted/30 p-4">
                      <div className="prose prose-sm dark:prose-invert max-w-none max-h-96 overflow-y-auto">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {output.output}
                        </ReactMarkdown>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </>
        )}

        {/* Favorites Tab */}
        {activeTab === 'favorites' && (
          <>
            {filteredFavorites.length === 0 ? (
              <div className="text-center py-12 border rounded-xl bg-muted/30">
                <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No favorite skills yet</h3>
                <p className="text-muted-foreground mb-4">
                  Star your most-used skills for quick access
                </p>
                <Button onClick={() => navigate('/skills')}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Browse Skills
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredFavorites.map((favorite) => (
                  <div key={favorite.id} className="border rounded-xl bg-card p-4">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold">{favorite.skillName}</h3>
                      <button
                        onClick={() => handleRemoveFavoriteSkill(favorite.id)}
                        className="text-yellow-500 hover:text-yellow-600"
                      >
                        <Star className="h-4 w-4 fill-current" />
                      </button>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {favorite.skillDescription}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs px-2 py-1 rounded bg-muted">
                        {favorite.category}
                      </span>
                      <Link to={getSkillRoute(favorite.skillSource, favorite.skillId)}>
                        <Button size="sm" variant="outline">
                          <Play className="h-3 w-3 mr-1" />
                          Run
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <>
            {recentExecutions.length === 0 ? (
              <div className="text-center py-12 border rounded-xl bg-muted/30">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No execution history</h3>
                <p className="text-muted-foreground mb-4">
                  Your skill execution history will appear here
                </p>
                <Button onClick={() => navigate('/skills')}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Run Your First Skill
                </Button>
              </div>
            ) : (
              <div className="border rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-3 text-sm font-medium">Skill</th>
                      <th className="text-left p-3 text-sm font-medium">Type</th>
                      <th className="text-left p-3 text-sm font-medium">Model</th>
                      <th className="text-left p-3 text-sm font-medium">Duration</th>
                      <th className="text-left p-3 text-sm font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {recentExecutions.slice(0, 20).map((execution) => {
                      const skill = SKILLS[execution.skillId];
                      return (
                        <tr key={execution.id} className="hover:bg-muted/30">
                          <td className="p-3">
                            <span className="font-medium">
                              {skill?.name || execution.skillId}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="text-xs px-2 py-1 rounded bg-muted">
                              {execution.skillSource}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="text-sm text-muted-foreground">
                              {execution.model}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="text-sm text-muted-foreground">
                              {(execution.durationMs / 1000).toFixed(1)}s
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="text-sm text-muted-foreground">
                              {formatDate(execution.createdAt)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
