/**
 * WorkflowRunnerPage.tsx - Multi-Step Workflow Execution
 *
 * This page runs pre-built workflows that chain multiple AI skills together.
 * Each workflow collects all inputs upfront, then executes skills in sequence,
 * passing outputs from one step as inputs to the next.
 *
 * WORKFLOW EXECUTION FLOW:
 * ========================
 * 1. User selects a workflow from HomePage or navigation
 * 2. All global inputs are collected in a single form
 * 3. Steps execute sequentially, with progress visualization
 * 4. Each step's output can feed into subsequent steps
 * 5. Final output package displays all results together
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Briefcase,
  MessageSquare,
  Mail,
  Play,
  CheckCircle,
  Circle,
  Loader2,
  AlertTriangle,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Clipboard,
  Download,
  Clock,
  KeyRound,
  HelpCircle,
  GraduationCap,
  Search,
  Rocket,
} from 'lucide-react';
import { WORKFLOWS } from '../lib/workflows';
import { SKILLS, interpolateTemplate } from '../lib/skills';
import { getAllLibrarySkills } from '../lib/skillLibrary';
import type { Workflow, WorkflowStep, WorkflowGlobalInput, DynamicSkill } from '../lib/storage/types';
import type { LibrarySkill } from '../lib/skillLibrary/types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Select } from '../components/ui/Select';
import { Progress } from '../components/ui/Progress';
import { useToast } from '../hooks/useToast';
import { useAppContext } from '../hooks/useAppContext';
import { runSkillStream as runGeminiSkillStream } from '../lib/gemini';
import { runSkillStream as runClaudeSkillStream } from '../lib/claude';
import { getApiKey } from '../lib/apiKeyStorage';
import type { ApiProviderType } from '../types';

// Icon mapping for workflows
const WORKFLOW_ICONS: Record<string, React.FC<{ className?: string }>> = {
  Briefcase,
  MessageSquare,
  Mail,
  GraduationCap,
  Search,
  Rocket,
};

// Step status type
type StepStatus = 'pending' | 'running' | 'completed' | 'error';

const WorkflowRunnerPage: React.FC = () => {
  const { workflowId } = useParams<{ workflowId: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { selectedApi, setSelectedApi, resumeText, jobDescriptionText, refreshProfileFromStorage } = useAppContext();

  // Get the workflow definition
  const workflow: Workflow | undefined = useMemo(() => {
    return workflowId ? WORKFLOWS[workflowId] : undefined;
  }, [workflowId]);

  // Form state for global inputs
  const [globalInputs, setGlobalInputs] = useState<Record<string, string>>({});
  const [apiKey, setApiKey] = useState('');
  const [claudeModel, setClaudeModel] = useState<'haiku' | 'sonnet' | 'opus'>('sonnet');

  // Execution state
  const [isRunning, setIsRunning] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [stepStatuses, setStepStatuses] = useState<Record<string, StepStatus>>({});
  const [stepOutputs, setStepOutputs] = useState<Record<string, string>>({});
  const [stepErrors, setStepErrors] = useState<Record<string, string>>({});
  const [overallProgress, setOverallProgress] = useState(0);

  // UI state
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());
  const [showInputsSummary, setShowInputsSummary] = useState(false);

  // Refresh profile data on mount
  useEffect(() => {
    refreshProfileFromStorage();
  }, [refreshProfileFromStorage]);

  // Initialize form state with prefill values
  useEffect(() => {
    if (workflow) {
      const initialState: Record<string, string> = {};
      workflow.globalInputs.forEach((input) => {
        if (input.prefillFrom === 'resume' && resumeText) {
          initialState[input.id] = resumeText;
        } else if (input.prefillFrom === 'jobDescription' && jobDescriptionText) {
          initialState[input.id] = jobDescriptionText;
        } else {
          initialState[input.id] = '';
        }
      });
      setGlobalInputs(initialState);

      // Initialize step statuses
      const statuses: Record<string, StepStatus> = {};
      workflow.steps.forEach((step) => {
        statuses[step.id] = 'pending';
      });
      setStepStatuses(statuses);
    }
  }, [workflow, resumeText, jobDescriptionText]);

  // Load stored API key
  useEffect(() => {
    const storedKey = getApiKey(selectedApi as 'gemini' | 'claude');
    if (storedKey) {
      setApiKey(storedKey);
    }
  }, [selectedApi]);

  // Handle input changes
  const handleInputChange = (id: string, value: string) => {
    setGlobalInputs((prev) => ({ ...prev, [id]: value }));
  };

  // Validate form before running
  const validateForm = (): boolean => {
    if (!apiKey) {
      addToast('API Key is required.', 'error');
      return false;
    }
    if (!workflow) return false;

    for (const input of workflow.globalInputs) {
      if (input.required && !globalInputs[input.id]?.trim()) {
        addToast(`${input.label} is required.`, 'error');
        return false;
      }
    }
    return true;
  };

  // Resolve input mapping to get actual value
  const resolveInputMapping = (
    step: WorkflowStep,
    inputId: string,
    currentOutputs: Record<string, string>
  ): string => {
    const mapping = step.inputMappings[inputId];
    if (!mapping) return '';

    switch (mapping.type) {
      case 'global':
        return globalInputs[mapping.inputId] || '';
      case 'previous':
        return currentOutputs[mapping.outputKey] || '';
      case 'static':
        return mapping.value;
      case 'computed':
        // Replace {{placeholders}} with actual values
        let template = mapping.template;
        // Replace global inputs
        Object.entries(globalInputs).forEach(([key, value]) => {
          template = template.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
        });
        // Replace previous outputs
        Object.entries(currentOutputs).forEach(([key, value]) => {
          template = template.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
        });
        return template;
      default:
        return '';
    }
  };

  // Execute a single step - supports both static skills and library skills
  const executeStep = async (
    step: WorkflowStep,
    currentOutputs: Record<string, string>
  ): Promise<string> => {
    // First try static skills
    const staticSkill = SKILLS[step.skillId];

    if (staticSkill) {
      // Execute static skill (original logic)
      const inputValues: Record<string, string> = {};
      staticSkill.inputs.forEach((input) => {
        inputValues[input.id] = resolveInputMapping(step, input.id, currentOutputs);
      });

      const promptData = staticSkill.generatePrompt(inputValues);
      let fullResponse = '';

      if (selectedApi === 'gemini') {
        const result = await runGeminiSkillStream(apiKey, promptData, staticSkill.useGoogleSearch);
        const stream = result && result.stream ? result.stream : result;
        if (!stream || typeof stream[Symbol.asyncIterator] !== 'function') {
          throw new Error('Invalid response from Gemini service');
        }
        for await (const chunk of stream) {
          const text = typeof chunk.text === 'function' ? chunk.text() : chunk.text;
          if (text) {
            fullResponse += text;
          }
        }
      } else if (selectedApi === 'claude') {
        const response = await runClaudeSkillStream(apiKey, promptData, claudeModel);
        if (!response.body) throw new Error('Response body is null');
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const jsonStr = line.substring(6);
              if (jsonStr.trim() === '[DONE]') break;
              try {
                const parsed = JSON.parse(jsonStr);
                if (parsed.type === 'content_block_delta' && parsed.delta.type === 'text_delta') {
                  fullResponse += parsed.delta.text;
                }
              } catch {
                // Ignore parsing errors
              }
            }
          }
        }
      }

      return fullResponse;
    }

    // Try library skill (role template skills)
    const allLibrarySkills = getAllLibrarySkills();
    const librarySkill = allLibrarySkills.find(s => s.id === step.skillId);

    if (librarySkill && librarySkill.source === 'role-template') {
      // Build input values from workflow mappings
      const inputValues: Record<string, string> = {};

      // Map workflow inputs to skill inputs
      Object.keys(step.inputMappings).forEach((inputId) => {
        inputValues[inputId] = resolveInputMapping(step, inputId, currentOutputs);
      });

      // Also include any skill inputs that might have defaults
      librarySkill.inputs?.forEach((input) => {
        if (!inputValues[input.id]) {
          inputValues[input.id] = resolveInputMapping(step, input.id, currentOutputs);
        }
      });

      // Interpolate the user prompt template
      const systemPrompt = librarySkill.prompts.systemInstruction;
      const userPrompt = interpolateTemplate(librarySkill.prompts.userPromptTemplate, inputValues);

      let fullResponse = '';

      if (selectedApi === 'gemini') {
        const { GoogleGenerativeAI } = await import('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
          model: 'gemini-2.0-flash',
          systemInstruction: systemPrompt,
        });

        const result = await model.generateContentStream({
          contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
          generationConfig: {
            temperature: librarySkill.config.temperature,
            maxOutputTokens: Math.max(librarySkill.config.maxTokens, 16384),
          },
        });

        for await (const chunk of result.stream) {
          const text = chunk.text();
          if (text) {
            fullResponse += text;
          }
        }
      } else if (selectedApi === 'claude') {
        const CLAUDE_MODELS = {
          haiku: 'claude-3-5-haiku-latest',
          sonnet: 'claude-3-5-sonnet-latest',
          opus: 'claude-3-opus-latest',
        };

        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true',
          },
          body: JSON.stringify({
            model: CLAUDE_MODELS[claudeModel],
            max_tokens: librarySkill.config.maxTokens,
            system: systemPrompt,
            messages: [{ role: 'user', content: userPrompt }],
            stream: true,
          }),
        });

        if (!response.ok) {
          const error = await response.text();
          throw new Error(`Claude API error: ${error}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error('Response body is null');

        const decoder = new TextDecoder();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const jsonStr = line.substring(6);
              if (jsonStr.trim() === '[DONE]') break;
              try {
                const parsed = JSON.parse(jsonStr);
                if (parsed.type === 'content_block_delta' && parsed.delta?.type === 'text_delta') {
                  fullResponse += parsed.delta.text;
                }
              } catch {
                // Ignore parsing errors
              }
            }
          }
        }
      }

      return fullResponse;
    }

    throw new Error(`Skill not found: ${step.skillId}`);
  };

  // Run the entire workflow
  const handleRunWorkflow = async () => {
    if (!validateForm() || !workflow) return;

    setIsRunning(true);
    setCurrentStepIndex(0);
    setStepOutputs({});
    setStepErrors({});
    setOverallProgress(0);

    // Reset all step statuses
    const newStatuses: Record<string, StepStatus> = {};
    workflow.steps.forEach((step) => {
      newStatuses[step.id] = 'pending';
    });
    setStepStatuses(newStatuses);

    const outputs: Record<string, string> = {};
    const totalSteps = workflow.steps.length;

    for (let i = 0; i < workflow.steps.length; i++) {
      const step = workflow.steps[i];
      setCurrentStepIndex(i);
      setStepStatuses((prev) => ({ ...prev, [step.id]: 'running' }));
      setOverallProgress(((i) / totalSteps) * 100);

      try {
        const output = await executeStep(step, outputs);
        outputs[step.outputKey] = output;
        setStepOutputs((prev) => ({ ...prev, [step.outputKey]: output }));
        setStepStatuses((prev) => ({ ...prev, [step.id]: 'completed' }));

        // Auto-expand completed step
        setExpandedSteps((prev) => new Set([...prev, step.id]));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setStepErrors((prev) => ({ ...prev, [step.id]: errorMessage }));
        setStepStatuses((prev) => ({ ...prev, [step.id]: 'error' }));
        addToast(`Step "${step.name}" failed: ${errorMessage}`, 'error');
        break;
      }

      // Small delay between steps
      if (i < workflow.steps.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    setOverallProgress(100);
    setIsRunning(false);
    setCurrentStepIndex(-1);
    addToast('Workflow completed!', 'success');
  };

  // Toggle step expansion
  const toggleStepExpansion = (stepId: string) => {
    setExpandedSteps((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(stepId)) {
        newSet.delete(stepId);
      } else {
        newSet.add(stepId);
      }
      return newSet;
    });
  };

  // Copy all outputs to clipboard
  const copyAllOutputs = () => {
    if (!workflow) return;
    let fullOutput = `# ${workflow.name} Results\n\n`;
    workflow.steps.forEach((step) => {
      const output = stepOutputs[step.outputKey];
      if (output) {
        fullOutput += `## ${step.name}\n\n${output}\n\n---\n\n`;
      }
    });
    navigator.clipboard.writeText(fullOutput);
    addToast('All outputs copied to clipboard!', 'success');
  };

  // Download all outputs
  const downloadAllOutputs = () => {
    if (!workflow) return;
    let fullOutput = `# ${workflow.name} Results\n\n`;
    fullOutput += `Generated: ${new Date().toLocaleString()}\n\n`;
    workflow.steps.forEach((step) => {
      const output = stepOutputs[step.outputKey];
      if (output) {
        fullOutput += `## ${step.name}\n\n${output}\n\n---\n\n`;
      }
    });
    const blob = new Blob([fullOutput], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${workflow.id}-results.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast('Results downloaded!', 'success');
  };

  // Render input field
  const renderInput = (input: WorkflowGlobalInput) => {
    const value = globalInputs[input.id] || '';

    return (
      <div key={input.id} className="space-y-2">
        <label htmlFor={input.id} className="text-sm font-medium">
          {input.label}
          {input.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {input.helpText && (
          <p className="text-xs text-muted-foreground">{input.helpText}</p>
        )}
        {input.type === 'text' && (
          <Input
            id={input.id}
            placeholder={input.placeholder}
            value={value}
            onChange={(e) => handleInputChange(input.id, e.target.value)}
            required={input.required}
            disabled={isRunning}
          />
        )}
        {input.type === 'textarea' && (
          <Textarea
            id={input.id}
            placeholder={input.placeholder}
            value={value}
            onChange={(e) => handleInputChange(input.id, e.target.value)}
            required={input.required}
            rows={input.rows || 5}
            disabled={isRunning}
          />
        )}
        {input.type === 'select' && input.options && (
          <Select
            id={input.id}
            value={value}
            onChange={(e) => handleInputChange(input.id, e.target.value)}
            required={input.required}
            disabled={isRunning}
          >
            <option value="">Select an option...</option>
            {input.options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </Select>
        )}
      </div>
    );
  };

  // Get step status icon
  const getStepStatusIcon = (status: StepStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'running':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Circle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  // 404 if workflow not found
  if (!workflow) {
    return (
      <div className="container mx-auto max-w-4xl text-center py-20">
        <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
        <h1 className="mt-4 text-3xl font-bold">Workflow Not Found</h1>
        <p className="mt-2 text-muted-foreground">The workflow you're looking for doesn't exist.</p>
        <Button onClick={() => navigate('/')} className="mt-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
      </div>
    );
  }

  const WorkflowIcon = WORKFLOW_ICONS[workflow.icon] || Briefcase;
  const hasCompletedSteps = Object.values(stepStatuses).some((s) => s === 'completed');

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
        <div className="flex items-center gap-4">
          <div className={`h-14 w-14 rounded-xl flex items-center justify-center bg-${workflow.color}-500/20`}>
            <WorkflowIcon className={`h-7 w-7 text-${workflow.color}-400`} />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{workflow.name}</h1>
            <p className="text-muted-foreground">{workflow.description}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Workflow Info & Inputs */}
        <div className="lg:col-span-1 space-y-6">
          {/* Workflow Details */}
          <div className="rounded-xl border bg-card p-6">
            <p className="text-sm text-muted-foreground mb-4">{workflow.longDescription}</p>

            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <Clock className="h-4 w-4" />
              <span>Estimated time: {workflow.estimatedTime}</span>
            </div>

            <h3 className="font-semibold mb-2">What you'll get:</h3>
            <ul className="space-y-1">
              {workflow.outputs.map((output, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                  <span>{output}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Workflow Steps Overview */}
          <div className="rounded-xl border bg-card p-6">
            <h3 className="font-semibold mb-4">Workflow Steps ({workflow.steps.length})</h3>
            <div className="space-y-3">
              {workflow.steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                    currentStepIndex === index
                      ? 'bg-blue-500/10 border border-blue-500/30'
                      : stepStatuses[step.id] === 'completed'
                      ? 'bg-green-500/5'
                      : 'bg-muted/30'
                  }`}
                >
                  <div className="shrink-0 mt-0.5">{getStepStatusIcon(stepStatuses[step.id])}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{step.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Form & Results */}
        <div className="lg:col-span-2 space-y-6">
          {/* API Configuration */}
          <div className="rounded-xl border bg-card p-6">
            <h3 className="text-lg font-semibold mb-4">Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="api-provider" className="text-sm font-medium">
                  AI Provider
                </label>
                <Select
                  id="api-provider"
                  value={selectedApi}
                  onChange={(e) => setSelectedApi(e.target.value as ApiProviderType)}
                  disabled={isRunning}
                >
                  <option value="gemini">Gemini</option>
                  <option value="claude">Claude</option>
                </Select>
                <Link
                  to="/api-keys"
                  className="text-xs text-muted-foreground hover:underline flex items-center gap-1"
                >
                  <HelpCircle className="h-3 w-3" />
                  Get API Key
                </Link>
              </div>
              <div className="space-y-2">
                <label htmlFor="api-key" className="text-sm font-medium">
                  API Key<span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="api-key"
                    type="password"
                    placeholder="Enter your API key"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="pl-10"
                    disabled={isRunning}
                  />
                </div>
              </div>
              {selectedApi === 'claude' && (
                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="claude-model" className="text-sm font-medium">
                    Claude Model
                  </label>
                  <Select
                    id="claude-model"
                    value={claudeModel}
                    onChange={(e) => setClaudeModel(e.target.value as 'haiku' | 'sonnet' | 'opus')}
                    disabled={isRunning}
                  >
                    <option value="haiku">Haiku (Fastest)</option>
                    <option value="sonnet">Sonnet (Recommended)</option>
                    <option value="opus">Opus (Most Capable)</option>
                  </Select>
                </div>
              )}
            </div>
          </div>

          {/* Global Inputs Form */}
          <div className="rounded-xl border bg-card p-6">
            <h3 className="text-lg font-semibold mb-4">Workflow Inputs</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Fill in all required information below. This data will be used across all workflow steps.
            </p>
            <div className="space-y-6">
              {workflow.globalInputs.map((input) => renderInput(input))}
            </div>
          </div>

          {/* Run Button */}
          <div className="flex justify-center">
            <Button
              size="lg"
              onClick={handleRunWorkflow}
              disabled={isRunning}
              className="px-12"
            >
              {isRunning ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Running Workflow...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-5 w-5" />
                  Run Workflow
                </>
              )}
            </Button>
          </div>

          {/* Progress Bar */}
          {(isRunning || hasCompletedSteps) && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">
                  {isRunning
                    ? `Running Step ${currentStepIndex + 1} of ${workflow.steps.length}...`
                    : 'Workflow Complete'}
                </span>
                <span className="text-muted-foreground">{Math.round(overallProgress)}%</span>
              </div>
              <Progress value={overallProgress} />
            </div>
          )}

          {/* Results Section */}
          {hasCompletedSteps && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">Results</h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={copyAllOutputs}>
                    <Clipboard className="h-4 w-4 mr-2" />
                    Copy All
                  </Button>
                  <Button variant="outline" size="sm" onClick={downloadAllOutputs}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>

              {/* Step Results */}
              <div className="space-y-4">
                {workflow.steps.map((step) => {
                  const status = stepStatuses[step.id];
                  const output = stepOutputs[step.outputKey];
                  const error = stepErrors[step.id];
                  const isExpanded = expandedSteps.has(step.id);

                  if (status !== 'completed' && status !== 'error') return null;

                  return (
                    <div key={step.id} className="rounded-xl border bg-card overflow-hidden">
                      <button
                        onClick={() => toggleStepExpansion(step.id)}
                        className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {getStepStatusIcon(status)}
                          <div className="text-left">
                            <p className="font-medium">{step.name}</p>
                            <p className="text-xs text-muted-foreground">{step.description}</p>
                          </div>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        )}
                      </button>

                      {isExpanded && (
                        <div className="border-t p-4">
                          {error ? (
                            <div className="text-red-500 flex items-center gap-2">
                              <AlertTriangle className="h-5 w-5" />
                              <p>Error: {error}</p>
                            </div>
                          ) : (
                            <div className="prose prose-sm dark:prose-invert max-w-none">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {output || ''}
                              </ReactMarkdown>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkflowRunnerPage;
