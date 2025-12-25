// Analyze Role Page - Enter JD and generate skill recommendations

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { analyzeJobDescription, generateSkillRecommendations } from '../lib/skills/dynamic';
import { useWorkspaces } from '../hooks/useStorage';
import { useAppContext } from '../hooks/useAppContext';
import { useToast } from '../hooks/useToast';
import type { Workspace, JDAnalysis, SkillRecommendation } from '../lib/storage/types';
import type { ApiProviderType } from '../types';
import { Button } from '../components/ui/Button';
import { Textarea } from '../components/ui/Textarea';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Progress } from '../components/ui/Progress';
import {
  ArrowLeft,
  Sparkles,
  CheckCircle,
  Briefcase,
  Building,
  Users,
  Zap,
  KeyRound,
  HelpCircle
} from 'lucide-react';
import { logger } from '../lib/logger';

type AnalysisStep = 'input' | 'analyzing' | 'recommendations' | 'building';

const AnalyzeRolePage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { selectedApi, setSelectedApi } = useAppContext();
  const { createWorkspace } = useWorkspaces();

  const [step, setStep] = useState<AnalysisStep>('input');
  const [jobDescription, setJobDescription] = useState('');
  const [workspaceName, setWorkspaceName] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');

  const [analysis, setAnalysis] = useState<JDAnalysis | null>(null);
  const [recommendations, setRecommendations] = useState<SkillRecommendation[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set());

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      addToast('Please enter a job description', 'error');
      return;
    }
    if (!apiKey.trim()) {
      addToast('Please enter your API key', 'error');
      return;
    }

    setStep('analyzing');
    setProgress(10);
    setStatusMessage('Analyzing job description...');

    try {
      // Step 1: Analyze JD
      logger.info('Starting JD analysis', { provider: selectedApi });
      setProgress(20);

      const jdAnalysis = await analyzeJobDescription(
        jobDescription,
        apiKey,
        selectedApi as 'gemini' | 'claude'
      );

      logger.info('JD Analysis result received', { hasRole: !!jdAnalysis?.role });

      if (!jdAnalysis || !jdAnalysis.role) {
        throw new Error('Invalid analysis response - missing role data');
      }

      setAnalysis(jdAnalysis);
      setProgress(50);

      // Auto-generate workspace name if not provided
      if (!workspaceName.trim()) {
        setWorkspaceName(`${jdAnalysis.role.title} - ${jdAnalysis.role.department}`);
      }

      // Step 2: Generate recommendations
      setStatusMessage('Generating skill recommendations...');
      setProgress(60);
      logger.info('Generating skill recommendations');

      const skillRecs = await generateSkillRecommendations(
        jdAnalysis,
        jobDescription,
        apiKey,
        selectedApi as 'gemini' | 'claude'
      );

      logger.info('Skill recommendations generated', { count: skillRecs?.length || 0 });

      if (!skillRecs || skillRecs.length === 0) {
        throw new Error('No skill recommendations generated');
      }

      setRecommendations(skillRecs);

      // Pre-select high-impact skills
      const preSelected = new Set(
        skillRecs
          .filter(s => s.automationPotential === 'high')
          .map(s => s.id)
      );
      setSelectedSkills(preSelected);

      setProgress(100);
      setStep('recommendations');
      addToast('Analysis complete!', 'success');
    } catch (error) {
      logger.error('Analysis failed', { error: error instanceof Error ? error.message : String(error) });
      const errorMessage = error instanceof Error ? error.message : 'Analysis failed. Please try again.';
      addToast(errorMessage, 'error');
      setStep('input');
    }
  };

  const toggleSkill = (skillId: string) => {
    setSelectedSkills(prev => {
      const next = new Set(prev);
      if (next.has(skillId)) {
        next.delete(skillId);
      } else {
        next.add(skillId);
      }
      return next;
    });
  };

  const handleCreateWorkspace = async () => {
    if (selectedSkills.size === 0) {
      addToast('Please select at least one skill', 'error');
      return;
    }

    if (!analysis) return;

    const now = new Date().toISOString();
    const workspace: Workspace = {
      id: crypto.randomUUID(),
      name: workspaceName || `${analysis.role.title} Workspace`,
      createdAt: now,
      updatedAt: now,
      jobDescription,
      jdAnalysis: analysis,
      recommendations,
      selectedSkillIds: Array.from(selectedSkills),
      roleType: analysis.role.type,
      company: analysis.role.department,
    };

    await createWorkspace(workspace);
    addToast('Workspace created! Now building your skills...', 'success');

    // Navigate to workspace to build skills
    navigate(`/workspace/${workspace.id}/build`);
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" onClick={() => navigate('/')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
        <h1 className="text-3xl font-bold">Analyze a Role</h1>
        <p className="text-muted-foreground mt-2">
          Paste a job description to generate AI-powered skills tailored to the role.
        </p>
      </div>

      {/* Step 1: Input */}
      {step === 'input' && (
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Job Description *</label>
            <Textarea
              placeholder="Paste the full job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={12}
              className="font-mono text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Workspace Name (Optional)</label>
            <Input
              placeholder="Auto-generated from role title"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
            />
          </div>

          {/* API Configuration */}
          <div className="p-4 border rounded-lg bg-card">
            <h3 className="text-lg font-semibold mb-4">AI Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">AI Provider *</label>
                <Select
                  value={selectedApi}
                  onChange={(e) => setSelectedApi(e.target.value as ApiProviderType)}
                >
                  <option value="gemini">Gemini</option>
                  <option value="claude">Claude</option>
                  <option value="chatgpt" disabled>ChatGPT (Requires Backend - No CORS)</option>
                </Select>
                {selectedApi === 'gemini' && (
                  <p className="text-xs text-amber-500">
                    Requires API key from Google AI Studio (aistudio.google.com)
                  </p>
                )}
                {selectedApi === 'claude' && (
                  <p className="text-xs text-muted-foreground">
                    Get key from console.anthropic.com
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <KeyRound className="h-4 w-4" />
                  {selectedApi === 'gemini' ? 'Gemini' : selectedApi === 'claude' ? 'Claude' : 'API'} Key *
                </label>
                <Input
                  type="password"
                  placeholder={`Enter your ${selectedApi === 'gemini' ? 'Gemini' : 'Claude'} API key`}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button size="lg" onClick={handleAnalyze} disabled={!jobDescription.trim() || !apiKey.trim()}>
              <Sparkles className="mr-2 h-5 w-5" />
              Analyze Role
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Analyzing */}
      {step === 'analyzing' && (
        <div className="text-center py-12 space-y-6">
          <Sparkles className="mx-auto h-12 w-12 text-primary animate-pulse" />
          <h2 className="text-xl font-semibold">{statusMessage}</h2>
          <Progress value={progress} className="max-w-md mx-auto" />
          <p className="text-muted-foreground text-sm">
            Using {selectedApi === 'gemini' ? 'Gemini' : 'Claude'} • This may take 15-30 seconds...
          </p>
        </div>
      )}

      {/* Step 3: Recommendations */}
      {step === 'recommendations' && analysis && (
        <div className="space-y-8">
          {/* Analysis Summary */}
          <div className="rounded-xl border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">Role Analysis</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Title</p>
                  <p className="font-medium">{analysis.role.title}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Building className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Department</p>
                  <p className="font-medium">{analysis.role.department}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Level</p>
                  <p className="font-medium">{analysis.role.level}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Type</p>
                  <p className="font-medium">{analysis.role.type}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Skill Recommendations */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">
                Recommended Skills ({selectedSkills.size} selected)
              </h2>
              <div className="space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedSkills(new Set(recommendations.map(r => r.id)))}
                >
                  Select All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedSkills(new Set())}
                >
                  Clear
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendations.map((rec) => (
                <div
                  key={rec.id}
                  onClick={() => toggleSkill(rec.id)}
                  className={`
                    relative rounded-lg border p-4 cursor-pointer transition-all
                    ${selectedSkills.has(rec.id)
                      ? 'border-primary bg-primary/5 ring-1 ring-primary'
                      : 'border-border hover:border-primary/50'
                    }
                  `}
                >
                  {selectedSkills.has(rec.id) && (
                    <CheckCircle className="absolute top-3 right-3 h-5 w-5 text-primary" />
                  )}
                  <h3 className="font-semibold pr-8">{rec.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{rec.description}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className={`
                      text-xs px-2 py-0.5 rounded-full
                      ${rec.automationPotential === 'high' ? 'bg-green-500/20 text-green-400' :
                        rec.automationPotential === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-gray-500/20 text-gray-400'}
                    `}>
                      {rec.automationPotential} impact
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                      {rec.estimatedTimeSaved}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-4 border-t">
            <Button variant="outline" onClick={() => setStep('input')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Edit
            </Button>
            <Button size="lg" onClick={handleCreateWorkspace} disabled={selectedSkills.size === 0}>
              <Sparkles className="mr-2 h-5 w-5" />
              Build {selectedSkills.size} Skills
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyzeRolePage;
