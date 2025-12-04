/**
 * Library Skill Runner Page
 *
 * Executes skills from the unified Skill Library (role-template skills).
 * Built-in skills redirect to their dedicated SkillRunnerPage.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { executeDynamicSkill } from '../lib/skills/dynamic';
import { useAppContext } from '../hooks/useAppContext';
import { useToast } from '../hooks/useToast';
import type { DynamicSkill, DynamicFormInput, SavedOutput, SkillExecution } from '../lib/storage/types';
import type { LibrarySkill } from '../lib/skillLibrary/types';
import { db } from '../lib/storage/indexeddb';
import { getApiKey } from '../lib/apiKeyStorage';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Select } from '../components/ui/Select';
import { Checkbox } from '../components/ui/Checkbox';
import { Progress } from '../components/ui/Progress';
import {
  ArrowLeft,
  Sparkles,
  Clipboard,
  Download,
  AlertTriangle,
  KeyRound,
  Loader2,
  Clock,
  Code,
  ChevronDown,
  ChevronUp,
  FileCode,
  Briefcase,
  Save,
  Check,
  BookOpen,
} from 'lucide-react';

const LibrarySkillRunnerPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { selectedApi, setSelectedApi } = useAppContext();

  const [librarySkill, setLibrarySkill] = useState<LibrarySkill | null>(null);
  const [loading, setLoading] = useState(true);
  const [formState, setFormState] = useState<Record<string, unknown>>({});
  const [apiKey, setApiKey] = useState('');
  const [claudeModel, setClaudeModel] = useState<'haiku' | 'sonnet' | 'opus'>('haiku');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [showPrompts, setShowPrompts] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveTitle, setSaveTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [outputSaved, setOutputSaved] = useState(false);

  // Load skill from sessionStorage
  useEffect(() => {
    const loadSkill = () => {
      try {
        const stored = sessionStorage.getItem('librarySkillToRun');
        if (stored) {
          const skill = JSON.parse(stored) as LibrarySkill;

          // If it's a builtin skill, redirect to the proper page
          if (skill.source === 'builtin') {
            navigate(`/skill/${skill.id}`);
            return;
          }

          setLibrarySkill(skill);

          // Initialize form state with defaults
          const inputs = skill.inputs || [];
          const initial: Record<string, unknown> = {};
          inputs.forEach((input) => {
            initial[input.id] = input.defaultValue ?? (input.type === 'checkbox' ? false : '');
          });
          setFormState(initial);
        }
      } catch (e) {
        console.error('Failed to load library skill:', e);
      } finally {
        setLoading(false);
      }
    };

    loadSkill();
  }, [navigate]);

  // Load stored API key when provider changes
  useEffect(() => {
    const storedKey = getApiKey(selectedApi as 'gemini' | 'claude');
    if (storedKey) {
      setApiKey(storedKey);
    }
  }, [selectedApi]);

  // Convert library skill to format needed for execution
  const getExecutableSkill = (): DynamicSkill | null => {
    if (!librarySkill) return null;

    return {
      id: librarySkill.id,
      workspaceId: '',
      version: 1,
      createdAt: librarySkill.createdAt || new Date().toISOString(),
      updatedAt: librarySkill.createdAt || new Date().toISOString(),
      name: librarySkill.name,
      description: librarySkill.description,
      longDescription: librarySkill.longDescription || '',
      category: librarySkill.tags.category as DynamicSkill['category'],
      estimatedTimeSaved: librarySkill.estimatedTimeSaved || '',
      theme: {
        primary: librarySkill.theme.primary,
        secondary: librarySkill.theme.secondary,
        gradient: librarySkill.theme.gradient,
        iconName: librarySkill.theme.iconName || 'Sparkles',
      },
      inputs: librarySkill.inputs,
      prompts: librarySkill.prompts,
      config: librarySkill.config,
      executionCount: librarySkill.useCount,
    };
  };

  const handleInputChange = (id: string, value: unknown) => {
    setFormState((prev) => ({ ...prev, [id]: value }));
  };

  const validateForm = (): boolean => {
    if (!apiKey) {
      addToast('API Key is required', 'error');
      return false;
    }
    if (!librarySkill) return false;

    const inputs = librarySkill.inputs || [];
    for (const input of inputs) {
      if (input.validation?.required && !formState[input.id]) {
        addToast(`${input.label} is required`, 'error');
        return false;
      }
    }
    return true;
  };

  const handleRun = async () => {
    const skill = getExecutableSkill();
    if (!validateForm() || !skill) return;

    setIsRunning(true);
    setOutput('');
    setError(null);
    setProgress(0);
    setStartTime(Date.now());

    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 2, 95));
    }, 200);

    try {
      let fullOutput = '';

      for await (const chunk of executeDynamicSkill({
        skill,
        formInputs: formState,
        apiKey,
        provider: selectedApi as 'gemini' | 'claude',
        claudeModel,
      })) {
        fullOutput += chunk;
        setOutput(fullOutput);
      }

      // Save execution to history
      if (librarySkill && startTime) {
        const execution: SkillExecution = {
          id: crypto.randomUUID(),
          skillId: librarySkill.id,
          skillName: librarySkill.name,
          skillSource: 'dynamic',
          createdAt: new Date().toISOString(),
          inputs: formState,
          output: fullOutput,
          model: selectedApi as 'gemini' | 'claude',
          durationMs: Date.now() - startTime,
        };
        await db.saveExecution(execution);
      }

      setProgress(100);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'An unknown error occurred';
      setError(message);
      addToast(message, 'error');
    } finally {
      clearInterval(progressInterval);
      setIsRunning(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    addToast('Copied to clipboard!', 'success');
  };

  const downloadOutput = () => {
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${librarySkill?.name.toLowerCase().replace(/\s+/g, '-') || 'skill'}-output.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast('Downloaded!', 'success');
  };

  const downloadPrompts = () => {
    if (!librarySkill) return;

    const promptExport = {
      skillName: librarySkill.name,
      skillDescription: librarySkill.description,
      category: librarySkill.tags.category,
      exportedAt: new Date().toISOString(),
      prompts: librarySkill.prompts,
      config: librarySkill.config,
      inputs: librarySkill.inputs.map((input) => ({
        id: input.id,
        label: input.label,
        type: input.type,
        placeholder: input.placeholder,
        required: input.validation?.required || false,
      })),
    };

    const blob = new Blob([JSON.stringify(promptExport, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${librarySkill.name.toLowerCase().replace(/\s+/g, '-')}-prompt.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast('Prompt exported!', 'success');
  };

  const copyPromptToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    addToast(`${label} copied!`, 'success');
  };

  const handleSaveOutput = async () => {
    if (!librarySkill || !saveTitle.trim()) return;

    setIsSaving(true);
    try {
      const savedOutput: SavedOutput = {
        id: crypto.randomUUID(),
        title: saveTitle.trim(),
        skillId: librarySkill.id,
        skillName: librarySkill.name,
        skillSource: 'dynamic',
        output: output,
        inputs: formState,
        model: selectedApi as 'gemini' | 'claude',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isFavorite: false,
      };

      await db.saveOutput(savedOutput);
      addToast('Output saved successfully!', 'success');
      setShowSaveDialog(false);
      setSaveTitle('');
      setOutputSaved(true);
    } catch (e) {
      addToast('Failed to save output', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // No skill found
  if (!librarySkill) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-16 w-16 text-yellow-500" />
          <h1 className="mt-6 text-2xl font-bold">Skill Not Found</h1>
          <p className="mt-2 text-muted-foreground">
            The skill you're looking for wasn't found. Please select a skill from the library.
          </p>
          <Button onClick={() => navigate('/library')} className="mt-6">
            <BookOpen className="h-4 w-4 mr-2" />
            Browse Skill Library
          </Button>
        </div>
      </div>
    );
  }

  const inputs = librarySkill.inputs || [];

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/library')}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Skill Library
        </button>

        <div className="flex items-start gap-4">
          <div
            className={`h-14 w-14 rounded-xl flex items-center justify-center ${librarySkill.theme.secondary}`}
          >
            <Sparkles className={`h-7 w-7 ${librarySkill.theme.primary}`} />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{librarySkill.name}</h1>
            <p className="text-muted-foreground mt-1">{librarySkill.description}</p>
            <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
              {librarySkill.tags.roles.length > 0 && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-primary/10 text-primary">
                  <Briefcase className="h-3 w-3" />
                  {librarySkill.sourceRoleId?.replace(/-/g, ' ')}
                </span>
              )}
              <span className="px-2 py-0.5 rounded bg-muted capitalize">
                {librarySkill.tags.category}
              </span>
              {librarySkill.estimatedTimeSaved && (
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {librarySkill.estimatedTimeSaved}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <div className="space-y-6">
          {/* API Configuration */}
          <div className="rounded-xl border bg-card p-6">
            <h2 className="font-semibold flex items-center gap-2 mb-4">
              <KeyRound className="h-5 w-5 text-primary" />
              API Configuration
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">AI Provider</label>
                <Select
                  value={selectedApi}
                  onChange={(e) => setSelectedApi(e.target.value as 'gemini' | 'claude')}
                >
                  <option value="gemini">Google Gemini</option>
                  <option value="claude">Anthropic Claude</option>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  {selectedApi === 'gemini' ? 'Gemini' : 'Claude'} API Key
                </label>
                <Input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={`Enter your ${selectedApi === 'gemini' ? 'Gemini' : 'Claude'} API key`}
                />
              </div>

              {selectedApi === 'claude' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Claude Model</label>
                  <Select
                    value={claudeModel}
                    onChange={(e) =>
                      setClaudeModel(e.target.value as 'haiku' | 'sonnet' | 'opus')
                    }
                  >
                    <option value="haiku">Claude Haiku (Fast)</option>
                    <option value="sonnet">Claude Sonnet (Balanced)</option>
                    <option value="opus">Claude Opus (Most Capable)</option>
                  </Select>
                </div>
              )}
            </div>
          </div>

          {/* Skill Inputs */}
          {inputs.length > 0 && (
            <div className="rounded-xl border bg-card p-6">
              <h2 className="font-semibold mb-4">Skill Inputs</h2>

              <div className="space-y-4">
                {inputs.map((input) => (
                  <div key={input.id}>
                    <label className="block text-sm font-medium mb-1">
                      {input.label}
                      {input.validation?.required && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </label>

                    {input.type === 'textarea' ? (
                      <Textarea
                        value={(formState[input.id] as string) || ''}
                        onChange={(e) => handleInputChange(input.id, e.target.value)}
                        placeholder={input.placeholder}
                        rows={4}
                      />
                    ) : input.type === 'select' && input.options ? (
                      <Select
                        value={(formState[input.id] as string) || ''}
                        onChange={(e) => handleInputChange(input.id, e.target.value)}
                      >
                        <option value="">Select...</option>
                        {input.options.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </Select>
                    ) : input.type === 'checkbox' ? (
                      <Checkbox
                        checked={(formState[input.id] as boolean) || false}
                        onChange={(e) => handleInputChange(input.id, e.target.checked)}
                        label={input.placeholder || ''}
                      />
                    ) : (
                      <Input
                        type={input.type === 'number' ? 'number' : 'text'}
                        value={(formState[input.id] as string) || ''}
                        onChange={(e) => handleInputChange(input.id, e.target.value)}
                        placeholder={input.placeholder}
                      />
                    )}

                    {input.helpText && (
                      <p className="text-xs text-muted-foreground mt-1">{input.helpText}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Run Button */}
          <Button
            onClick={handleRun}
            disabled={isRunning}
            className="w-full"
            size="lg"
          >
            {isRunning ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 mr-2" />
                Run Skill
              </>
            )}
          </Button>

          {/* Progress */}
          {isRunning && (
            <div className="space-y-2">
              <Progress value={progress} />
              <p className="text-sm text-center text-muted-foreground">
                Processing... {progress}%
              </p>
            </div>
          )}

          {/* View Prompts */}
          <div className="rounded-xl border bg-card overflow-hidden">
            <button
              onClick={() => setShowPrompts(!showPrompts)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
            >
              <span className="flex items-center gap-2 font-medium">
                <Code className="h-4 w-4" />
                View Prompts
              </span>
              {showPrompts ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>

            {showPrompts && (
              <div className="px-6 pb-6 space-y-4 border-t">
                <div className="pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium">System Instruction</h3>
                    <button
                      onClick={() =>
                        copyPromptToClipboard(
                          librarySkill.prompts.systemInstruction,
                          'System instruction'
                        )
                      }
                      className="text-xs text-primary hover:text-primary/80"
                    >
                      Copy
                    </button>
                  </div>
                  <pre className="text-xs bg-muted p-3 rounded-lg overflow-auto max-h-48 whitespace-pre-wrap">
                    {librarySkill.prompts.systemInstruction}
                  </pre>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium">User Prompt Template</h3>
                    <button
                      onClick={() =>
                        copyPromptToClipboard(
                          librarySkill.prompts.userPromptTemplate,
                          'User prompt'
                        )
                      }
                      className="text-xs text-primary hover:text-primary/80"
                    >
                      Copy
                    </button>
                  </div>
                  <pre className="text-xs bg-muted p-3 rounded-lg overflow-auto max-h-48 whitespace-pre-wrap">
                    {librarySkill.prompts.userPromptTemplate}
                  </pre>
                </div>

                <Button variant="outline" size="sm" onClick={downloadPrompts}>
                  <FileCode className="h-4 w-4 mr-2" />
                  Export Prompt JSON
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Output Panel */}
        <div className="space-y-4">
          <div className="rounded-xl border bg-card min-h-[600px] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="font-semibold">Output</h2>
              {output && (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={copyToClipboard}>
                    <Clipboard className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={downloadOutput}>
                    <Download className="h-4 w-4" />
                  </Button>
                  {!outputSaved && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowSaveDialog(true)}
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                  )}
                  {outputSaved && (
                    <span className="text-xs text-green-500 flex items-center gap-1">
                      <Check className="h-3 w-3" />
                      Saved
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="flex-1 p-6 overflow-auto">
              {error ? (
                <div className="flex flex-col items-center justify-center h-full text-red-500">
                  <AlertTriangle className="h-12 w-12 mb-4" />
                  <p className="text-center">{error}</p>
                </div>
              ) : output ? (
                <div className="prose prose-invert max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{output}</ReactMarkdown>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <Sparkles className="h-12 w-12 mb-4 opacity-50" />
                  <p>Fill in the inputs and click "Run Skill" to generate output</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card rounded-xl border shadow-lg w-full max-w-md mx-4 p-6">
            <h2 className="text-xl font-semibold mb-4">Save Output</h2>
            <Input
              value={saveTitle}
              onChange={(e) => setSaveTitle(e.target.value)}
              placeholder="Enter a title for this output..."
              className="mb-4"
            />
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowSaveDialog(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleSaveOutput}
                disabled={!saveTitle.trim() || isSaving}
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Save'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LibrarySkillRunnerPage;
