// Import Skill Page - Create and publish skills to the community

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { publishSkillToCommunity } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Select } from '../components/ui/Select';
import {
  ArrowLeft,
  Upload,
  Plus,
  Trash2,
  Loader2,
  Sparkles,
  LogIn,
  HelpCircle,
} from 'lucide-react';

interface SkillInput {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'number' | 'checkbox';
  placeholder: string;
  required: boolean;
  options?: string[];
  helpText?: string;
}

const CATEGORIES = [
  { value: 'automation', label: 'Automation' },
  { value: 'analysis', label: 'Analysis' },
  { value: 'generation', label: 'Generation' },
  { value: 'optimization', label: 'Optimization' },
  { value: 'communication', label: 'Communication' },
];

const OUTPUT_FORMATS = [
  { value: 'markdown', label: 'Markdown' },
  { value: 'json', label: 'JSON' },
  { value: 'table', label: 'Table' },
];

const MODELS = [
  { value: 'any', label: 'Any Model' },
  { value: 'gemini', label: 'Gemini' },
  { value: 'claude', label: 'Claude' },
];

const INPUT_TYPES = [
  { value: 'text', label: 'Text (single line)' },
  { value: 'textarea', label: 'Text Area (multi-line)' },
  { value: 'select', label: 'Dropdown Select' },
  { value: 'number', label: 'Number' },
  { value: 'checkbox', label: 'Checkbox' },
];

const ImportSkillPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, signInWithGoogle, isConfigured } = useAuth();
  const { addToast } = useToast();

  const [isPublishing, setIsPublishing] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [longDescription, setLongDescription] = useState('');
  const [category, setCategory] = useState('automation');
  const [estimatedTimeSaved, setEstimatedTimeSaved] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [systemInstruction, setSystemInstruction] = useState('');
  const [userPromptTemplate, setUserPromptTemplate] = useState('');
  const [outputFormat, setOutputFormat] = useState('markdown');
  const [recommendedModel, setRecommendedModel] = useState('any');
  const [maxTokens, setMaxTokens] = useState(4096);
  const [temperature, setTemperature] = useState(0.4);
  const [inputs, setInputs] = useState<SkillInput[]>([]);

  // New input form state
  const [showAddInput, setShowAddInput] = useState(false);
  const [newInputLabel, setNewInputLabel] = useState('');
  const [newInputType, setNewInputType] = useState<SkillInput['type']>('text');
  const [newInputPlaceholder, setNewInputPlaceholder] = useState('');
  const [newInputRequired, setNewInputRequired] = useState(true);
  const [newInputOptions, setNewInputOptions] = useState('');
  const [newInputHelpText, setNewInputHelpText] = useState('');

  const handleAddInput = () => {
    if (!newInputLabel.trim()) {
      addToast('Input label is required', 'error');
      return;
    }

    const newInput: SkillInput = {
      id: newInputLabel.toLowerCase().replace(/\s+/g, '_'),
      label: newInputLabel,
      type: newInputType,
      placeholder: newInputPlaceholder,
      required: newInputRequired,
      helpText: newInputHelpText || undefined,
    };

    if (newInputType === 'select' && newInputOptions.trim()) {
      newInput.options = newInputOptions.split(',').map(o => o.trim()).filter(Boolean);
    }

    setInputs([...inputs, newInput]);

    // Reset form
    setNewInputLabel('');
    setNewInputType('text');
    setNewInputPlaceholder('');
    setNewInputRequired(true);
    setNewInputOptions('');
    setNewInputHelpText('');
    setShowAddInput(false);
  };

  const handleRemoveInput = (index: number) => {
    setInputs(inputs.filter((_, i) => i !== index));
  };

  const handlePublish = async () => {
    // Validation
    if (!name.trim()) {
      addToast('Skill name is required', 'error');
      return;
    }
    if (!description.trim()) {
      addToast('Description is required', 'error');
      return;
    }
    if (!systemInstruction.trim()) {
      addToast('System instruction is required', 'error');
      return;
    }
    if (!userPromptTemplate.trim()) {
      addToast('User prompt template is required', 'error');
      return;
    }

    if (!user) {
      addToast('Please sign in to publish skills', 'error');
      return;
    }

    setIsPublishing(true);
    try {
      await publishSkillToCommunity({
        name: name.trim(),
        description: description.trim(),
        longDescription: longDescription.trim() || description.trim(),
        category,
        estimatedTimeSaved: estimatedTimeSaved.trim() || '10-30 minutes',
        roleTitle: roleTitle.trim() || undefined,
        roleDepartment: undefined,
        roleLevel: undefined,
        systemInstruction: systemInstruction.trim(),
        userPromptTemplate: userPromptTemplate.trim(),
        outputFormat,
        recommendedModel,
        maxTokens,
        temperature,
        inputs: inputs.map(input => ({
          id: input.id,
          label: input.label,
          type: input.type,
          placeholder: input.placeholder,
          validation: { required: input.required },
          options: input.options,
          helpText: input.helpText,
        })),
      });

      addToast('Skill published to community!', 'success');
      navigate('/community');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to publish skill';
      addToast(message, 'error');
    } finally {
      setIsPublishing(false);
    }
  };

  if (!isConfigured) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-12 text-center">
        <Sparkles className="mx-auto h-16 w-16 text-muted-foreground" />
        <h1 className="mt-6 text-3xl font-bold">Community Features Not Available</h1>
        <p className="mt-4 text-muted-foreground">
          Supabase configuration is required for community features.
        </p>
        <Button onClick={() => navigate('/')} className="mt-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-12 text-center">
        <LogIn className="mx-auto h-16 w-16 text-muted-foreground" />
        <h1 className="mt-6 text-3xl font-bold">Sign In Required</h1>
        <p className="mt-4 text-muted-foreground">
          Please sign in to create and publish skills to the community.
        </p>
        <Button onClick={signInWithGoogle} className="mt-6">
          <LogIn className="h-4 w-4 mr-2" />
          Sign in with Google
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/community')}
          className="-ml-2 mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Community
        </Button>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Upload className="h-8 w-8 text-primary" />
          Create Community Skill
        </h1>
        <p className="text-muted-foreground mt-2">
          Create a new skill and share it with the community
        </p>
      </div>

      <div className="space-y-8">
        {/* Basic Info */}
        <div className="rounded-xl border bg-card p-6">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Skill Name <span className="text-red-500">*</span>
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Meeting Summary Generator"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Short Description <span className="text-red-500">*</span>
              </label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of what this skill does"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Detailed Description
              </label>
              <Textarea
                value={longDescription}
                onChange={(e) => setLongDescription(e.target.value)}
                placeholder="Detailed explanation of the skill's purpose and usage..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <Select value={category} onChange={(e) => setCategory(e.target.value)}>
                  {CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Time Saved</label>
                <Input
                  value={estimatedTimeSaved}
                  onChange={(e) => setEstimatedTimeSaved(e.target.value)}
                  placeholder="e.g., 30-60 minutes"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Target Role (Optional)
              </label>
              <Input
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                placeholder="e.g., Product Manager, Software Engineer"
              />
            </div>
          </div>
        </div>

        {/* Prompts */}
        <div className="rounded-xl border bg-card p-6">
          <h2 className="text-xl font-semibold mb-4">Prompts</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                System Instruction <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-muted-foreground mb-2">
                The system prompt that defines the AI's role and behavior
              </p>
              <Textarea
                value={systemInstruction}
                onChange={(e) => setSystemInstruction(e.target.value)}
                placeholder="You are an expert assistant that helps with..."
                rows={6}
                className="font-mono text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                User Prompt Template <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-muted-foreground mb-2">
                Use {'{{inputId}}'} to reference form inputs. Example: {'{{meeting_notes}}'}
              </p>
              <Textarea
                value={userPromptTemplate}
                onChange={(e) => setUserPromptTemplate(e.target.value)}
                placeholder="Please analyze the following: {{input_text}}..."
                rows={6}
                className="font-mono text-sm"
              />
            </div>
          </div>
        </div>

        {/* Form Inputs */}
        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold">Form Inputs</h2>
              <p className="text-sm text-muted-foreground">
                Define the inputs users will fill in when running this skill
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddInput(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Input
            </Button>
          </div>

          {inputs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
              <HelpCircle className="h-8 w-8 mx-auto mb-2" />
              <p>No inputs defined yet</p>
              <p className="text-sm">Add inputs that users will fill in when running the skill</p>
            </div>
          ) : (
            <div className="space-y-3">
              {inputs.map((input, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{input.label}</span>
                      <code className="text-xs bg-muted px-1 rounded">{`{{${input.id}}}`}</code>
                      {input.required && (
                        <span className="text-xs text-red-500">required</span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Type: {input.type}
                      {input.placeholder && ` • "${input.placeholder}"`}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveInput(index)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Add Input Form */}
          {showAddInput && (
            <div className="mt-4 p-4 rounded-lg border bg-muted/30">
              <h3 className="font-medium mb-4">Add New Input</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Label *</label>
                    <Input
                      value={newInputLabel}
                      onChange={(e) => setNewInputLabel(e.target.value)}
                      placeholder="e.g., Meeting Notes"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Type</label>
                    <Select
                      value={newInputType}
                      onChange={(e) => setNewInputType(e.target.value as SkillInput['type'])}
                    >
                      {INPUT_TYPES.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Placeholder</label>
                  <Input
                    value={newInputPlaceholder}
                    onChange={(e) => setNewInputPlaceholder(e.target.value)}
                    placeholder="Placeholder text shown in the input"
                  />
                </div>
                {newInputType === 'select' && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Options (comma-separated)</label>
                    <Input
                      value={newInputOptions}
                      onChange={(e) => setNewInputOptions(e.target.value)}
                      placeholder="Option 1, Option 2, Option 3"
                    />
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium mb-2 block">Help Text</label>
                  <Input
                    value={newInputHelpText}
                    onChange={(e) => setNewInputHelpText(e.target.value)}
                    placeholder="Additional instructions for this field"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="required"
                    checked={newInputRequired}
                    onChange={(e) => setNewInputRequired(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="required" className="text-sm">Required field</label>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setShowAddInput(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddInput}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Input
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Configuration */}
        <div className="rounded-xl border bg-card p-6">
          <h2 className="text-xl font-semibold mb-4">Configuration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Output Format</label>
              <Select value={outputFormat} onChange={(e) => setOutputFormat(e.target.value)}>
                {OUTPUT_FORMATS.map(f => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Recommended Model</label>
              <Select value={recommendedModel} onChange={(e) => setRecommendedModel(e.target.value)}>
                {MODELS.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Max Tokens</label>
              <Input
                type="number"
                value={maxTokens}
                onChange={(e) => setMaxTokens(Number(e.target.value))}
                min={100}
                max={32000}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Temperature</label>
              <Input
                type="number"
                value={temperature}
                onChange={(e) => setTemperature(Number(e.target.value))}
                min={0}
                max={1}
                step={0.1}
              />
            </div>
          </div>
        </div>

        {/* Publish Button */}
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => navigate('/community')}>
            Cancel
          </Button>
          <Button onClick={handlePublish} disabled={isPublishing}>
            {isPublishing ? (
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
  );
};

export default ImportSkillPage;
