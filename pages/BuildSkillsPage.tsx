// Build Skills Page - Generates full skill definitions for selected recommendations

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { buildMultipleSkills, type BuildProgress } from '../lib/skills/dynamic';
import { useWorkspace } from '../hooks/useStorage';
import { useAppContext } from '../hooks/useAppContext';
import { useToast } from '../hooks/useToast';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Progress } from '../components/ui/Progress';
import {
  ArrowLeft,
  CheckCircle,
  Circle,
  Loader2,
  AlertCircle,
  Sparkles,
  KeyRound
} from 'lucide-react';

const BuildSkillsPage: React.FC = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { selectedApi } = useAppContext();
  const { workspace, skills, loading, addSkills } = useWorkspace(workspaceId);

  const [apiKey, setApiKey] = useState('');
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildProgress, setBuildProgress] = useState<BuildProgress[]>([]);
  const [buildComplete, setBuildComplete] = useState(false);

  // Check if skills are already built
  useEffect(() => {
    if (!loading && workspace && skills.length > 0) {
      // Skills already exist, redirect to workspace
      navigate(`/workspace/${workspaceId}`, { replace: true });
    }
  }, [loading, workspace, skills, workspaceId, navigate]);

  const handleBuild = useCallback(async () => {
    if (!workspace || !apiKey) {
      addToast('API key is required', 'error');
      return;
    }

    const selectedRecs = workspace.recommendations.filter(
      r => workspace.selectedSkillIds.includes(r.id)
    );

    if (selectedRecs.length === 0) {
      addToast('No skills selected', 'error');
      return;
    }

    setIsBuilding(true);
    setBuildProgress(selectedRecs.map(r => ({
      skillId: r.id,
      skillName: r.name,
      status: 'pending'
    })));

    try {
      const builtSkills = await buildMultipleSkills(
        selectedRecs,
        workspace.jdAnalysis,
        workspace.jobDescription,
        workspace.id,
        apiKey,
        selectedApi as 'gemini' | 'claude',
        (progress) => setBuildProgress([...progress])
      );

      await addSkills(builtSkills);
      setBuildComplete(true);
      addToast(`Successfully built ${builtSkills.length} skills!`, 'success');
    } catch (error) {
      console.error('Build failed:', error);
      addToast(error instanceof Error ? error.message : 'Build failed', 'error');
    } finally {
      setIsBuilding(false);
    }
  }, [workspace, apiKey, selectedApi, addSkills, addToast]);

  if (loading) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-12 text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
        <p className="mt-4 text-muted-foreground">Loading workspace...</p>
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-12 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
        <h1 className="mt-4 text-2xl font-bold">Workspace Not Found</h1>
        <Button onClick={() => navigate('/')} className="mt-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
      </div>
    );
  }

  const completedCount = buildProgress.filter(p => p.status === 'complete').length;
  const totalCount = buildProgress.length || workspace.selectedSkillIds.length;
  const overallProgress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" onClick={() => navigate('/')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
        <h1 className="text-3xl font-bold">Build Skills</h1>
        <p className="text-muted-foreground mt-2">
          {workspace.name} • {workspace.selectedSkillIds.length} skills to build
        </p>
      </div>

      {/* Not started */}
      {!isBuilding && !buildComplete && (
        <div className="space-y-6">
          <div className="rounded-xl border bg-card p-6">
            <h2 className="font-semibold mb-4">Ready to Build</h2>
            <p className="text-sm text-muted-foreground mb-4">
              The AI will generate complete, production-ready skill definitions for each
              selected recommendation. This typically takes 10-30 seconds per skill.
            </p>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <KeyRound className="h-4 w-4" />
                  API Key *
                </label>
                <Input
                  type="password"
                  placeholder={`Enter your ${selectedApi === 'gemini' ? 'Gemini' : 'Claude'} API key`}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
              </div>

              <Button
                size="lg"
                className="w-full"
                onClick={handleBuild}
                disabled={!apiKey}
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Build {workspace.selectedSkillIds.length} Skills
              </Button>
            </div>
          </div>

          {/* Preview of skills to build */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Skills to Build:</h3>
            <div className="space-y-2">
              {workspace.recommendations
                .filter(r => workspace.selectedSkillIds.includes(r.id))
                .map(rec => (
                  <div key={rec.id} className="flex items-center gap-3 p-3 rounded-lg border">
                    <Circle className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{rec.name}</p>
                      <p className="text-xs text-muted-foreground">{rec.estimatedTimeSaved}</p>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      )}

      {/* Building */}
      {isBuilding && (
        <div className="space-y-6">
          <div className="text-center py-4">
            <Sparkles className="mx-auto h-10 w-10 text-primary animate-pulse" />
            <h2 className="mt-4 text-xl font-semibold">Building Your Skills</h2>
            <p className="text-muted-foreground text-sm mt-1">
              {completedCount} of {totalCount} complete
            </p>
            <Progress value={overallProgress} className="mt-4 max-w-md mx-auto" />
          </div>

          <div className="space-y-2">
            {buildProgress.map((item) => (
              <div key={item.skillId} className="flex items-center gap-3 p-3 rounded-lg border">
                {item.status === 'pending' && (
                  <Circle className="h-4 w-4 text-muted-foreground" />
                )}
                {item.status === 'building' && (
                  <Loader2 className="h-4 w-4 text-primary animate-spin" />
                )}
                {item.status === 'complete' && (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
                {item.status === 'error' && (
                  <AlertCircle className="h-4 w-4 text-destructive" />
                )}
                <div className="flex-1">
                  <p className="font-medium">{item.skillName}</p>
                  {item.status === 'building' && (
                    <p className="text-xs text-muted-foreground">Generating prompts and form...</p>
                  )}
                  {item.error && (
                    <p className="text-xs text-destructive">{item.error}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Complete */}
      {buildComplete && (
        <div className="text-center py-12 space-y-6">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
          <div>
            <h2 className="text-2xl font-bold">Skills Built Successfully!</h2>
            <p className="text-muted-foreground mt-2">
              {completedCount} skills are ready to use.
            </p>
          </div>
          <Button size="lg" onClick={() => navigate(`/workspace/${workspaceId}`)}>
            Go to Workspace
          </Button>
        </div>
      )}
    </div>
  );
};

export default BuildSkillsPage;
