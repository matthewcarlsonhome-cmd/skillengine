
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { SKILLS } from '../lib/skills';
import { Skill, FormInput as FormInputType, ApiProviderType } from '../types.ts';
import { runSkillStream as runGeminiSkillStream } from '../lib/gemini.ts';
import { runSkillStream as runClaudeSkillStream } from '../lib/claude.ts';
import { useToast } from '../hooks/useToast.tsx';
import { useAppContext } from '../hooks/useAppContext.tsx';
import { useAuth } from '../hooks/useAuth.tsx';
import { Button } from '../components/ui/Button.tsx';
import { Input } from '../components/ui/Input.tsx';
import { Textarea } from '../components/ui/Textarea.tsx';
import { Select } from '../components/ui/Select.tsx';
import { Checkbox } from '../components/ui/Checkbox.tsx';
import { Progress } from '../components/ui/Progress.tsx';
import { Sparkles, Clipboard, Download, AlertTriangle, ArrowLeft, KeyRound, Link as LinkIcon, Upload, HelpCircle, Save, Star, Check, Code, ChevronDown, ChevronUp, FileCode } from 'lucide-react';
import { db } from '../lib/storage/indexeddb';
import type { SavedOutput, FavoriteSkill, SkillExecution } from '../lib/storage/types';
import { getApiKey, saveApiKey as storeApiKey } from '../lib/apiKeyStorage';
import { trackSkillUsage } from '../lib/admin';
import { TestDataBanner } from '../components/TestOutputButton';

const SkillRunnerPage: React.FC = () => {
  const { skillId } = useParams<{ skillId: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { selectedApi, setSelectedApi, resumeText, jobDescriptionText, additionalInfoText, refreshProfileFromStorage } = useAppContext();
  const { user, appUser } = useAuth();

  const skill: Skill | undefined = useMemo(() => skillId ? SKILLS[skillId] : undefined, [skillId]);

  const [formState, setFormState] = useState<Record<string, any>>({});
  const [apiKey, setApiKey] = useState('');
  const [claudeModel, setClaudeModel] = useState<'haiku' | 'sonnet' | 'opus'>('haiku');
  const [output, setOutput] = useState('');
  const [citations, setCitations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveTitle, setSaveTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [outputSaved, setOutputSaved] = useState(false);
  const [showPrompts, setShowPrompts] = useState(false);

  // Refresh profile from storage on mount to ensure we have latest data
  useEffect(() => {
    refreshProfileFromStorage();
  }, [refreshProfileFromStorage]);

  useEffect(() => {
    if (skill) {
      const initialFormState = skill.inputs.reduce((acc, input) => {
        if (input.id === 'userBackground') {
          acc[input.id] = resumeText;
        } else if (input.id === 'jobDescription') {
          acc[input.id] = jobDescriptionText;
        } else if (input.id === 'additionalContext') {
          acc[input.id] = additionalInfoText;
        } else if (input.type === 'select' && input.options) {
          acc[input.id] = input.options[0];
        } else {
          acc[input.id] = input.type === 'checkbox' ? false : '';
        }
        return acc;
      }, {} as Record<string, any>);
      setFormState(initialFormState);
    }
  }, [skill, resumeText, jobDescriptionText, additionalInfoText]);

  // Check if skill is favorited
  useEffect(() => {
    if (skillId) {
      db.isSkillFavorited(skillId).then(setIsFavorited);
    }
  }, [skillId]);

  // Load stored API key when provider changes
  useEffect(() => {
    const storedKey = getApiKey(selectedApi as 'gemini' | 'claude');
    if (storedKey) {
      setApiKey(storedKey);
    }
  }, [selectedApi]);

  // Reset saved state when output changes
  useEffect(() => {
    setOutputSaved(false);
  }, [output]);

  const handleInputChange = (id: string, value: string | boolean) => {
    setFormState(prev => ({ ...prev, [id]: value }));
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, inputId: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text === 'string') {
        handleInputChange(inputId, text);
        addToast(`File "${file.name}" loaded successfully.`, 'success');
      } else {
        addToast('Failed to read file content.', 'error');
      }
    };
    reader.onerror = () => {
      addToast(`Error reading file: ${reader.error}`, 'error');
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset file input
  };

  const validateForm = () => {
    if (!apiKey) {
      addToast('API Key is required.', 'error');
      return false;
    }
    if (!skill) return false;
    for (const input of skill.inputs) {
      if (input.required && !formState[input.id]) {
        addToast(`${input.label} is required.`, 'error');
        return false;
      }
    }
    return true;
  };

  const handleRunSkill = async () => {
    if (!validateForm() || !skill) return;

    setIsLoading(true);
    setOutput('');
    setCitations([]);
    setError(null);
    setProgress(0);

    const startTime = Date.now();
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 2, 95));
    }, 200);

    try {
      const promptData = skill.generatePrompt(formState);
      let fullResponseText = '';

      if (selectedApi === 'gemini') {
        const result = await runGeminiSkillStream(apiKey, promptData, skill.useGoogleSearch);
        const stream = result && result.stream ? result.stream : result;
        if (!stream || typeof stream[Symbol.asyncIterator] !== 'function') {
          throw new Error("Received an invalid response from the Gemini service.");
        }
        for await (const chunk of stream) {
          // Use chunk.text() for @google/generative-ai SDK
          const text = typeof chunk.text === 'function' ? chunk.text() : chunk.text;
          if (text) {
            fullResponseText += text;
            setOutput(fullResponseText);
          }
        }
        // Get final response for citations
        try {
          const finalResponse = await result.response;
          if (finalResponse?.candidates?.[0]?.groundingMetadata?.groundingChunks) {
            setCitations(finalResponse.candidates[0].groundingMetadata.groundingChunks);
          }
        } catch (e) {
          // Citations may not be available, continue without them
        }
      } else if (selectedApi === 'claude') {
        const response = await runClaudeSkillStream(apiKey, promptData, claudeModel);
        if (!response.body) throw new Error("Response body is null");
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
                            fullResponseText += parsed.delta.text;
                            setOutput(fullResponseText);
                        }
                    } catch (e) {
                        // Ignore parsing errors for incomplete JSON chunks
                    }
                }
            }
        }
      } else {
        throw new Error(`API provider "${selectedApi}" is not supported yet.`);
      }

      // Save execution to history
      const execution: SkillExecution = {
        id: crypto.randomUUID(),
        skillId: skill.id,
        skillName: skill.name,
        skillSource: 'static',
        createdAt: new Date().toISOString(),
        inputs: formState,
        output: fullResponseText,
        model: selectedApi as 'gemini' | 'claude',
        durationMs: Date.now() - startTime,
      };
      await db.saveExecution(execution);

      // Track skill usage for admin analytics
      if (appUser) {
        trackSkillUsage(
          appUser.id,
          appUser.email,
          skill.id,
          skill.name,
          'static'
        );
      } else if (user) {
        trackSkillUsage(
          user.id,
          user.email || 'anonymous',
          skill.id,
          skill.name,
          'static'
        );
      }
    } catch (e: any) {
      setError(e.message || 'An unknown error occurred.');
      addToast(e.message || 'An unknown error occurred.', 'error');
    } finally {
      clearInterval(progressInterval);
      setProgress(100);
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    addToast('Copied to clipboard!', 'success');
  };

  const downloadTextFile = () => {
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${skill?.id || 'skill'}-output.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast('Text file downloaded.', 'success');
  };

  const handleSaveOutput = async () => {
    if (!skill || !saveTitle.trim()) return;

    setIsSaving(true);
    try {
      const savedOutput: SavedOutput = {
        id: crypto.randomUUID(),
        title: saveTitle.trim(),
        skillId: skill.id,
        skillName: skill.name,
        skillSource: 'static',
        output: output,
        inputs: formState,
        model: selectedApi as 'gemini' | 'claude',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isFavorite: false
      };
      await db.saveOutput(savedOutput);
      setShowSaveDialog(false);
      setSaveTitle('');
      setOutputSaved(true);
      addToast('Output saved to dashboard!', 'success');
    } catch (error) {
      addToast('Failed to save output', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!skill) return;

    try {
      if (isFavorited) {
        await db.removeFavoriteBySkillId(skill.id);
        setIsFavorited(false);
        addToast('Removed from favorites', 'success');
      } else {
        const favorite: FavoriteSkill = {
          id: crypto.randomUUID(),
          skillId: skill.id,
          skillName: skill.name,
          skillDescription: skill.description,
          skillSource: 'static',
          category: skill.category,
          createdAt: new Date().toISOString()
        };
        await db.addFavoriteSkill(favorite);
        setIsFavorited(true);
        addToast('Added to favorites!', 'success');
      }
    } catch (error) {
      addToast('Failed to update favorite', 'error');
    }
  };

  const copyPromptToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    addToast(`${label} copied to clipboard!`, 'success');
  };

  // Load test data into form
  const handleLoadTestData = (inputPayload: Record<string, string>) => {
    setFormState((prev) => ({
      ...prev,
      ...inputPayload,
    }));
    addToast('Test data loaded into form fields', 'success');
  };

  const downloadPrompts = () => {
    if (!skill) return;

    const promptData = skill.generatePrompt(formState);
    const promptExport = {
      skillName: skill.name,
      skillDescription: skill.description,
      exportedAt: new Date().toISOString(),
      prompts: {
        systemInstruction: promptData.systemInstruction,
        userPrompt: promptData.userPrompt,
      },
      inputs: skill.inputs.map(input => ({
        id: input.id,
        label: input.label,
        type: input.type,
        required: input.required || false,
        currentValue: formState[input.id] || '',
      })),
    };

    const blob = new Blob([JSON.stringify(promptExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${skill.id}-prompts.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast('Prompts exported!', 'success');
  };

  // Get current prompts based on form state
  const getCurrentPrompts = () => {
    if (!skill) return { systemInstruction: '', userPrompt: '' };
    return skill.generatePrompt(formState);
  };

  if (!skill) {
    return (
      <div className="container mx-auto max-w-4xl text-center py-20">
        <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
        <h1 className="mt-4 text-3xl font-bold">Skill Not Found</h1>
        <p className="mt-2 text-muted-foreground">The skill you are looking for does not exist.</p>
        <Button onClick={() => navigate('/')} className="mt-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
      </div>
    );
  }

  const renderInput = (input: FormInputType) => {
    const value = formState[input.id] || '';
    const isUploadable = input.type === 'textarea' && ['jobDescription', 'userBackground', 'additionalContext'].includes(input.id);

    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          {input.type !== 'checkbox' && <label htmlFor={input.id} className="text-sm font-medium">{input.label}{input.required && <span className="text-red-500 ml-1">*</span>}</label>}
          {isUploadable && (
            <label className="text-sm font-medium text-primary hover:underline cursor-pointer flex items-center gap-1">
              <Upload className="h-3 w-3" />
              Upload File
              <input type="file" className="hidden" accept=".txt,.md" onChange={(e) => handleFileChange(e, input.id)} />
            </label>
          )}
        </div>
        {(() => {
          switch (input.type) {
            case 'text':
              return <Input id={input.id} placeholder={input.placeholder} value={value} onChange={(e) => handleInputChange(input.id, e.target.value)} required={input.required} />;
            case 'textarea':
              return <Textarea id={input.id} placeholder={input.placeholder} value={value} onChange={(e) => handleInputChange(input.id, e.target.value)} required={input.required} rows={input.rows || 5} />;
            case 'select':
              return <Select id={input.id} value={value} onChange={(e) => handleInputChange(input.id, e.target.value)} required={input.required}>
                {input.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </Select>;
            case 'checkbox':
              return <div className="flex items-center gap-2"><Checkbox id={input.id} checked={!!value} onCheckedChange={(checked) => handleInputChange(input.id, !!checked)} /><label htmlFor={input.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{input.label}</label></div>;
            default:
              return null;
          }
        })()}
      </div>
    );
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <aside className="lg:col-span-1 lg:sticky lg:top-24 self-start">
          <div className="rounded-xl border bg-card text-card-foreground p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${skill.theme.secondary}`}>
                <skill.icon className={`h-6 w-6 ${skill.theme.primary}`} />
              </div>
              <h1 className="text-2xl font-bold">{skill.name}</h1>
            </div>
            <p className="text-muted-foreground text-sm mb-4">{skill.longDescription}</p>
            <h3 className="font-semibold mb-2">What you'll get:</h3>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              {skill.whatYouGet.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
            <div className="mt-4 pt-4 border-t">
              <Button
                variant={isFavorited ? 'secondary' : 'outline'}
                className="w-full"
                onClick={handleToggleFavorite}
              >
                <Star className={`h-4 w-4 mr-2 ${isFavorited ? 'fill-current text-yellow-500' : ''}`} />
                {isFavorited ? 'Favorited' : 'Add to Favorites'}
              </Button>
            </div>

            {/* View Prompts Toggle */}
            <div className="mt-4 pt-4 border-t">
              <button
                onClick={() => setShowPrompts(!showPrompts)}
                className="flex items-center justify-between w-full text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  View Skill Prompts
                </span>
                {showPrompts ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Prompts Panel */}
          {showPrompts && (
            <div className="mt-4 rounded-xl border bg-card p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2">
                  <FileCode className="h-4 w-4" />
                  Skill Prompts
                </h3>
                <Button variant="outline" size="sm" onClick={downloadPrompts}>
                  <Download className="h-3 w-3 mr-1" />
                  Export JSON
                </Button>
              </div>

              {/* System Instruction */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    System Instruction
                  </label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyPromptToClipboard(getCurrentPrompts().systemInstruction, 'System instruction')}
                    className="h-6 text-xs"
                  >
                    <Clipboard className="h-3 w-3 mr-1" />
                    Copy
                  </Button>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 max-h-48 overflow-y-auto">
                  <pre className="text-xs whitespace-pre-wrap font-mono text-muted-foreground">
                    {getCurrentPrompts().systemInstruction}
                  </pre>
                </div>
              </div>

              {/* User Prompt */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    User Prompt (with current inputs)
                  </label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyPromptToClipboard(getCurrentPrompts().userPrompt, 'User prompt')}
                    className="h-6 text-xs"
                  >
                    <Clipboard className="h-3 w-3 mr-1" />
                    Copy
                  </Button>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 max-h-48 overflow-y-auto">
                  <pre className="text-xs whitespace-pre-wrap font-mono text-muted-foreground">
                    {getCurrentPrompts().userPrompt}
                  </pre>
                </div>
                <p className="text-xs text-muted-foreground">
                  This prompt is generated based on your current form inputs. Fill in the form above to see the complete prompt.
                </p>
              </div>

              {/* Copy Both Button */}
              <div className="pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    const prompts = getCurrentPrompts();
                    const fullPrompt = `=== SYSTEM INSTRUCTION ===\n\n${prompts.systemInstruction}\n\n=== USER PROMPT ===\n\n${prompts.userPrompt}`;
                    copyPromptToClipboard(fullPrompt, 'Full prompt');
                  }}
                >
                  <Clipboard className="h-4 w-4 mr-2" />
                  Copy Full Prompt (System + User)
                </Button>
              </div>
            </div>
          )}
        </aside>

        <div className="lg:col-span-2">
          <div className="space-y-6">
            {/* Test Data Banner */}
            <TestDataBanner
              skillId={skillId}
              onLoadTestData={handleLoadTestData}
            />

            <div className="p-4 border rounded-lg bg-card">
                <h3 className="text-lg font-semibold mb-4">Run Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label htmlFor="api-provider" className="text-sm font-medium">AI Provider</label>
                        <Select id="api-provider" value={selectedApi} onChange={(e) => setSelectedApi(e.target.value as ApiProviderType)}>
                            <option value="gemini">Gemini</option>
                            <option value="claude">Claude</option>
                            <option value="chatgpt" disabled>ChatGPT (Coming Soon)</option>
                        </Select>
                        <Link to="/api-keys" className="text-xs text-muted-foreground hover:underline flex items-center gap-1">
                            <HelpCircle className="h-3 w-3" />
                            Get API Key
                        </Link>
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="api-key" className="text-sm font-medium">API Key<span className="text-red-500 ml-1">*</span></label>
                        <div className="relative">
                            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input id="api-key" type="password" placeholder="Enter your API key" value={apiKey} onChange={(e) => setApiKey(e.target.value)} required className="pl-10" />
                        </div>
                    </div>
                    {selectedApi === 'claude' && (
                      <div className="space-y-2 md:col-span-2">
                        <label htmlFor="claude-model" className="text-sm font-medium">Claude Model</label>
                        <Select
                          id="claude-model"
                          value={claudeModel}
                          onChange={(e) => setClaudeModel(e.target.value as 'haiku' | 'sonnet' | 'opus')}
                        >
                          <option value="haiku">Haiku (Fastest, Most Cost-Effective)</option>
                          <option value="sonnet">Sonnet (Balanced Speed & Quality)</option>
                          <option value="opus">Opus (Most Capable, Slowest)</option>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          {claudeModel === 'haiku' && 'Best for quick tasks and high-volume usage.'}
                          {claudeModel === 'sonnet' && 'Great balance of speed and intelligence for most tasks.'}
                          {claudeModel === 'opus' && 'Best for complex reasoning and nuanced outputs.'}
                        </p>
                      </div>
                    )}
                </div>
            </div>

            {skill.inputs.map(input => <div key={input.id}>{renderInput(input)}</div>)}
          </div>

          <div className="my-8 text-center">
            <Button size="lg" onClick={handleRunSkill} disabled={isLoading}>
              {isLoading ? (<><Sparkles className="mr-2 h-5 w-5 animate-pulse" />Generating...</>) : (<><Sparkles className="mr-2 h-5 w-5" />Run Skill</>)}
            </Button>
          </div>

          {(isLoading || output || error) && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Output</h2>
              <div className="relative rounded-xl border bg-muted/50 min-h-[200px] p-1">
                {isLoading && <div className="p-4"><Progress value={progress} className="w-full" /><p className="text-center text-sm text-muted-foreground mt-2">AI is thinking...</p></div>}
                {output && !isLoading && (
                  <div className="absolute top-2 right-2 flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSaveTitle(`${skill.name} - ${new Date().toLocaleDateString()}`);
                        setShowSaveDialog(true);
                      }}
                      title="Save to Dashboard"
                      className={outputSaved ? 'text-green-500' : ''}
                    >
                      {outputSaved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={copyToClipboard} title="Copy to Clipboard"><Clipboard className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={downloadTextFile} title="Download"><Download className="h-4 w-4" /></Button>
                  </div>
                )}
                <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none p-4 overflow-x-auto prose-headings:scroll-mt-4 prose-h2:text-xl prose-h2:font-bold prose-h2:border-b prose-h2:border-border prose-h2:pb-2 prose-h2:mt-8 prose-h2:mb-4 prose-h3:text-lg prose-h3:font-semibold prose-h3:mt-6 prose-h3:mb-3 prose-p:leading-relaxed prose-li:my-1 prose-table:border prose-table:border-border prose-th:bg-muted prose-th:px-4 prose-th:py-2 prose-th:text-left prose-th:font-semibold prose-th:border prose-th:border-border prose-td:px-4 prose-td:py-2 prose-td:border prose-td:border-border prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-muted/50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:not-italic prose-strong:text-primary">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
                      hr: ({...props}) => <hr className="my-8 border-border border-t-2" {...props} />,
                      h2: ({children, ...props}) => <h2 className="flex items-center gap-2 text-xl font-bold border-b border-border pb-2 mt-8 mb-4" {...props}>{children}</h2>,
                      h3: ({children, ...props}) => <h3 className="text-lg font-semibold text-foreground/90 mt-6 mb-3" {...props}>{children}</h3>,
                      table: ({children, ...props}) => <div className="overflow-x-auto my-4"><table className="min-w-full border border-border rounded-md overflow-hidden" {...props}>{children}</table></div>,
                      thead: ({children, ...props}) => <thead className="bg-muted" {...props}>{children}</thead>,
                      th: ({children, ...props}) => <th className="px-4 py-3 text-left text-sm font-semibold text-foreground border-b border-border" {...props}>{children}</th>,
                      td: ({children, ...props}) => <td className="px-4 py-3 text-sm border-b border-border" {...props}>{children}</td>,
                      blockquote: ({children, ...props}) => <blockquote className="border-l-4 border-primary bg-muted/50 py-3 px-4 my-4 rounded-r-md not-italic" {...props}>{children}</blockquote>,
                      ul: ({children, ...props}) => <ul className="list-disc pl-6 space-y-2 my-4" {...props}>{children}</ul>,
                      ol: ({children, ...props}) => <ol className="list-decimal pl-6 space-y-2 my-4" {...props}>{children}</ol>,
                      li: ({children, ...props}) => <li className="leading-relaxed" {...props}>{children}</li>,
                      code({node, className, children, ...props}) {
                        const match = /language-(\w+)/.exec(className || '');
                        const isInline = !match && !className;
                        return isInline
                          ? <code className="bg-muted font-mono text-sm px-1.5 py-0.5 rounded-md text-primary" {...props}>{children}</code>
                          : <code className="block bg-muted font-mono text-sm p-4 rounded-md overflow-x-auto my-4 border border-border" {...props}>{children}</code>;
                      },
                      pre: ({children, ...props}) => <pre className="bg-muted rounded-md overflow-x-auto my-4 border border-border" {...props}>{children}</pre>,
                      strong: ({children, ...props}) => <strong className="font-semibold text-foreground" {...props}>{children}</strong>,
                      a: ({children, href, ...props}) => <a href={href} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer" {...props}>{children}</a>,
                  }}>
                    {output}
                  </ReactMarkdown>
                </div>
                {error && (
                  <div className="p-4 text-red-500 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    <p>Error: {error}</p>
                  </div>
                )}
              </div>
              {citations.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Sources</h3>
                  <div className="p-4 border rounded-lg bg-card text-sm">
                    <ul className="space-y-2">
                      {citations.map((citation, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <LinkIcon className="h-4 w-4 mt-1 text-muted-foreground flex-shrink-0" />
                          <a href={citation.web.uri} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate" title={citation.web.uri}>
                            {citation.web.title || citation.web.uri}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Save Output Dialog */}
      {showSaveDialog && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setShowSaveDialog(false)}
          />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-card rounded-xl border shadow-lg p-6 z-50">
            <h3 className="text-lg font-semibold mb-4">Save Output to Dashboard</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="save-title" className="text-sm font-medium">
                  Title
                </label>
                <Input
                  id="save-title"
                  value={saveTitle}
                  onChange={(e) => setSaveTitle(e.target.value)}
                  placeholder="Enter a title for this output"
                  autoFocus
                />
              </div>
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveOutput} disabled={isSaving || !saveTitle.trim()}>
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SkillRunnerPage;
