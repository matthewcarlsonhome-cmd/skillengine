
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { SKILLS } from '../lib/skills.ts';
import { Skill, FormInput as FormInputType } from '../types.ts';
import { runSkillStream } from '../lib/gemini.ts';
import { useToast } from '../hooks/useToast.tsx';
import { Button } from '../components/ui/Button.tsx';
import { Input } from '../components/ui/Input.tsx';
import { Textarea } from '../components/ui/Textarea.tsx';
import { Select } from '../components/ui/Select.tsx';
import { Checkbox } from '../components/ui/Checkbox.tsx';
import { Progress } from '../components/ui/Progress.tsx';
import { Sparkles, Clipboard, Download, AlertTriangle, ArrowLeft } from 'lucide-react';

const SkillRunnerPage: React.FC = () => {
  const { skillId } = useParams<{ skillId: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const skill: Skill | undefined = useMemo(() => skillId ? SKILLS[skillId] : undefined, [skillId]);

  const [formState, setFormState] = useState<Record<string, any>>({});
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (skill) {
      const initialFormState = skill.inputs.reduce((acc, input) => {
        acc[input.id] = input.type === 'checkbox' ? false : '';
        if (input.type === 'select' && input.options) {
          acc[input.id] = input.options[0];
        }
        return acc;
      }, {} as Record<string, any>);
      setFormState(initialFormState);
    }
  }, [skill]);

  const handleInputChange = (id: string, value: string | boolean) => {
    setFormState(prev => ({ ...prev, [id]: value }));
  };

  const validateForm = () => {
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
    if (!skill || !validateForm()) return;

    setIsLoading(true);
    setOutput('');
    setError(null);
    setProgress(0);

    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 2;
      });
    }, 200);

    try {
      const prompt = skill.systemPrompt(formState);
      const stream = await runSkillStream(prompt);
      let fullResponse = '';
      for await (const chunk of stream) {
        const text = chunk.text;
        if (text) {
          fullResponse += text;
          setOutput(fullResponse);
        }
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

  const downloadMarkdown = () => {
    const blob = new Blob([output], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${skill?.id || 'skill'}-output.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast('Markdown file downloaded.', 'success');
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
    const value = formState[input.id];
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
        return <div className="flex items-center gap-2"><Checkbox id={input.id} checked={value} onCheckedChange={(checked) => handleInputChange(input.id, !!checked)} /><label htmlFor={input.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{input.label}</label></div>;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Sidebar */}
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
          </div>
        </aside>

        {/* Main Content */}
        <div className="lg:col-span-2">
          <div className="space-y-6">
            {skill.inputs.map(input => (
              <div key={input.id} className="space-y-2">
                {input.type !== 'checkbox' && <label htmlFor={input.id} className="text-sm font-medium">{input.label}{input.required && <span className="text-red-500 ml-1">*</span>}</label>}
                {renderInput(input)}
              </div>
            ))}
          </div>

          <div className="my-8 text-center">
            <Button size="lg" onClick={handleRunSkill} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Sparkles className="mr-2 h-5 w-5 animate-pulse" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Run Skill
                </>
              )}
            </Button>
          </div>

          {(isLoading || output || error) && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Output</h2>
              {/* FIX: Added 'relative' class to correctly position child elements */}
              <div className="relative rounded-xl border bg-muted/50 min-h-[200px] p-1">
                {isLoading && <div className="p-4"><Progress value={progress} className="w-full" />
                <p className="text-center text-sm text-muted-foreground mt-2">AI is thinking... this may take a moment.</p>
                </div>}
                
                {output && !isLoading && (
                  <div className="absolute top-2 right-2 flex gap-2">
                    <Button variant="ghost" size="icon" onClick={copyToClipboard} aria-label="Copy to clipboard">
                      <Clipboard className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={downloadMarkdown} aria-label="Download as Markdown">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none p-4 overflow-x-auto">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SkillRunnerPage;
