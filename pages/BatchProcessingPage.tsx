// Batch Processing Page - Upload CSV and run skills on multiple items

import React, { useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '../components/ui/Button';
import { useToast } from '../hooks/useToast';
import { SKILLS } from '../lib/skills';
import { getApiKey } from '../lib/apiKeyStorage';
import { runSkillStream } from '../lib/gemini';
import {
  Upload,
  FileSpreadsheet,
  Play,
  Download,
  Loader2,
  Check,
  X,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Pause,
  RotateCcw,
  Sparkles,
  FileText,
  Copy,
  Info,
} from 'lucide-react';

interface BatchItem {
  id: string;
  data: Record<string, string>;
  status: 'pending' | 'running' | 'completed' | 'error';
  output?: string;
  error?: string;
}

type BatchStatus = 'idle' | 'running' | 'paused' | 'completed';

const BatchProcessingPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const [selectedSkillId, setSelectedSkillId] = useState<string>('');
  const [items, setItems] = useState<BatchItem[]>([]);
  const [batchStatus, setBatchStatus] = useState<BatchStatus>('idle');
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [progress, setProgress] = useState({ completed: 0, total: 0 });

  // Convert SKILLS object to array and filter for batchable skills
  const skillsArray = useMemo(() => Object.values(SKILLS), []);

  // Get skills that work well with batch processing (simpler skills with fewer inputs)
  const batchableSkills = useMemo(() =>
    skillsArray.filter((s) => s.inputs.length <= 5),
    [skillsArray]
  );

  const selectedSkill = selectedSkillId ? SKILLS[selectedSkillId] : null;

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter((line) => line.trim());

        if (lines.length < 2) {
          addToast('CSV must have a header row and at least one data row', 'error');
          return;
        }

        const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
        const newItems: BatchItem[] = [];

        for (let i = 1; i < lines.length; i++) {
          const values = parseCSVLine(lines[i]);
          if (values.length !== headers.length) continue;

          const data: Record<string, string> = {};
          headers.forEach((header, idx) => {
            data[header] = values[idx];
          });

          newItems.push({
            id: `item-${i}`,
            data,
            status: 'pending',
          });
        }

        setItems(newItems);
        setProgress({ completed: 0, total: newItems.length });
        addToast(`Loaded ${newItems.length} items from CSV`, 'success');
      } catch (error) {
        addToast('Failed to parse CSV file', 'error');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const mapDataToInputs = (data: Record<string, string>): Record<string, string> => {
    if (!selectedSkill) return {};

    const mapped: Record<string, string> = {};
    selectedSkill.inputs.forEach((input) => {
      // Try exact match first, then case-insensitive, then by label
      const key = Object.keys(data).find(
        (k) =>
          k === input.id ||
          k.toLowerCase() === input.id.toLowerCase() ||
          k.toLowerCase() === input.label.toLowerCase()
      );
      if (key) {
        mapped[input.id] = data[key];
      }
    });
    return mapped;
  };

  const runBatch = async () => {
    if (!selectedSkill) {
      addToast('Please select a skill first', 'error');
      return;
    }

    const apiKey = getApiKey('gemini');
    if (!apiKey) {
      addToast('Please configure your Gemini API key in Settings', 'error');
      navigate('/settings');
      return;
    }

    setBatchStatus('running');
    abortControllerRef.current = new AbortController();

    const pendingItems = items.filter((item) => item.status === 'pending' || item.status === 'error');

    for (let i = 0; i < pendingItems.length; i++) {
      if (abortControllerRef.current?.signal.aborted) {
        setBatchStatus('paused');
        return;
      }

      const item = pendingItems[i];

      // Update status to running
      setItems((prev) =>
        prev.map((it) => (it.id === item.id ? { ...it, status: 'running' } : it))
      );

      try {
        const formData = mapDataToInputs(item.data);
        const { systemInstruction, userPrompt } = selectedSkill.generatePrompt(formData);

        const response = await runSkillStream(apiKey, {
          systemInstruction,
          userPrompt,
        });

        let output = '';
        const reader = response.body?.getReader();
        if (reader) {
          const decoder = new TextDecoder();
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') continue;
                try {
                  const parsed = JSON.parse(data);
                  const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text || '';
                  output += text;
                } catch {
                  // Ignore parse errors
                }
              }
            }
          }
        }

        setItems((prev) =>
          prev.map((it) =>
            it.id === item.id ? { ...it, status: 'completed', output } : it
          )
        );
        setProgress((prev) => ({ ...prev, completed: prev.completed + 1 }));
      } catch (error) {
        setItems((prev) =>
          prev.map((it) =>
            it.id === item.id
              ? { ...it, status: 'error', error: error instanceof Error ? error.message : 'Unknown error' }
              : it
          )
        );
      }

      // Small delay between items to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    setBatchStatus('completed');
    addToast('Batch processing completed!', 'success');
  };

  const pauseBatch = () => {
    abortControllerRef.current?.abort();
    setBatchStatus('paused');
  };

  const resetBatch = () => {
    setItems((prev) => prev.map((it) => ({ ...it, status: 'pending', output: undefined, error: undefined })));
    setProgress({ completed: 0, total: items.length });
    setBatchStatus('idle');
  };

  const downloadResults = () => {
    const headers = ['ID', ...Object.keys(items[0]?.data || {}), 'Output', 'Status'];
    const rows = items.map((item) => [
      item.id,
      ...Object.values(item.data),
      (item.output || '').replace(/"/g, '""'),
      item.status,
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `batch-results-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast('Results downloaded', 'success');
  };

  const downloadTemplate = () => {
    if (!selectedSkill) {
      addToast('Please select a skill first', 'error');
      return;
    }

    // Create CSV template with skill input IDs as headers
    const headers = selectedSkill.inputs.map((input) => input.id);
    const exampleRow = selectedSkill.inputs.map((input) =>
      input.placeholder || `Enter ${input.label}`
    );

    const csv = [headers.join(','), exampleRow.map((v) => `"${v}"`).join(',')].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `batch-template-${selectedSkillId}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast('Template downloaded', 'success');
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    addToast('Copied to clipboard', 'success');
  };

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
          <FileSpreadsheet className="h-6 w-6 text-blue-500" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Batch Processing</h1>
          <p className="text-muted-foreground">Upload a CSV and run AI skills on multiple items at once</p>
        </div>
      </div>

      {/* Instructions */}
      <div className="mb-8 p-4 border rounded-xl bg-blue-500/5 border-blue-500/20">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-blue-500 mb-1">How to use Batch Processing</p>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>Select an AI skill from the dropdown below</li>
              <li>Download the CSV template to see required columns</li>
              <li>Fill in your data (one row per item to process)</li>
              <li>Upload your CSV and click "Start Batch"</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Setup Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Select Skill */}
        <div className="border rounded-xl p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Select Skill
          </h2>
          <select
            value={selectedSkillId}
            onChange={(e) => setSelectedSkillId(e.target.value)}
            className="w-full p-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Choose a skill...</option>
            {batchableSkills.map((skill) => (
              <option key={skill.id} value={skill.id}>
                {skill.name}
              </option>
            ))}
          </select>
          {selectedSkill && (
            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-3">{selectedSkill.description}</p>
              <p className="text-xs font-medium mb-1">Required CSV columns:</p>
              <ul className="text-xs text-muted-foreground mb-3">
                {selectedSkill.inputs.map((input) => (
                  <li key={input.id} className="flex items-center gap-2">
                    <span className="font-mono bg-muted px-1 rounded">{input.id}</span>
                    <span>- {input.label}</span>
                    {input.required && <span className="text-red-400">*</span>}
                  </li>
                ))}
              </ul>
              <Button variant="outline" size="sm" onClick={downloadTemplate}>
                <Download className="h-3 w-3 mr-1" />
                Download Template CSV
              </Button>
            </div>
          )}
        </div>

        {/* Upload CSV */}
        <div className="border rounded-xl p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Upload className="h-4 w-4 text-primary" />
            Upload CSV
          </h2>
          <input
            type="file"
            accept=".csv"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full p-8 border-2 border-dashed rounded-lg hover:border-primary transition-colors text-center"
          >
            <FileSpreadsheet className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Click to upload CSV file
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              First row should be headers matching skill input IDs
            </p>
          </button>
          {items.length > 0 && (
            <p className="mt-3 text-sm text-center text-muted-foreground">
              {items.length} items loaded
            </p>
          )}
        </div>
      </div>

      {/* Progress & Controls */}
      {items.length > 0 && (
        <div className="border rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold">Progress</h2>
              <p className="text-sm text-muted-foreground">
                {progress.completed} of {progress.total} completed
              </p>
            </div>
            <div className="flex gap-2">
              {batchStatus === 'idle' && (
                <Button onClick={runBatch} disabled={!selectedSkillId}>
                  <Play className="h-4 w-4 mr-2" />
                  Start Batch
                </Button>
              )}
              {batchStatus === 'running' && (
                <Button variant="outline" onClick={pauseBatch}>
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </Button>
              )}
              {batchStatus === 'paused' && (
                <>
                  <Button onClick={runBatch}>
                    <Play className="h-4 w-4 mr-2" />
                    Resume
                  </Button>
                  <Button variant="outline" onClick={resetBatch}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                </>
              )}
              {batchStatus === 'completed' && (
                <>
                  <Button onClick={downloadResults}>
                    <Download className="h-4 w-4 mr-2" />
                    Download Results
                  </Button>
                  <Button variant="outline" onClick={resetBatch}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${(progress.completed / progress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Items List */}
      {items.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-semibold">Items</h2>
          {items.map((item) => (
            <div key={item.id} className="border rounded-xl overflow-hidden">
              <button
                onClick={() => setExpandedItemId(expandedItemId === item.id ? null : item.id)}
                className="w-full p-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {item.status === 'pending' && (
                    <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                      <FileText className="h-3 w-3 text-muted-foreground" />
                    </div>
                  )}
                  {item.status === 'running' && (
                    <Loader2 className="h-6 w-6 text-primary animate-spin" />
                  )}
                  {item.status === 'completed' && (
                    <div className="h-6 w-6 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Check className="h-3 w-3 text-green-500" />
                    </div>
                  )}
                  {item.status === 'error' && (
                    <div className="h-6 w-6 rounded-full bg-red-500/20 flex items-center justify-center">
                      <X className="h-3 w-3 text-red-500" />
                    </div>
                  )}
                  <div className="text-left">
                    <p className="font-medium text-sm">
                      {Object.values(item.data)[0]?.substring(0, 50) || item.id}
                      {(Object.values(item.data)[0]?.length || 0) > 50 ? '...' : ''}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">{item.status}</p>
                  </div>
                </div>
                {expandedItemId === item.id ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </button>

              {expandedItemId === item.id && (
                <div className="border-t p-4 bg-muted/30">
                  {/* Input Data */}
                  <div className="mb-4">
                    <h4 className="text-xs font-medium text-muted-foreground mb-2">Input Data</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      {Object.entries(item.data).map(([key, value]) => (
                        <div key={key} className="p-2 bg-background rounded">
                          <span className="font-medium text-xs text-muted-foreground">{key}:</span>
                          <p className="text-sm truncate">{value.substring(0, 100)}{value.length > 100 ? '...' : ''}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Output */}
                  {item.output && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-xs font-medium text-muted-foreground">Output</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(item.output!)}
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Copy
                        </Button>
                      </div>
                      <div className="prose prose-sm dark:prose-invert max-w-none max-h-64 overflow-y-auto p-3 bg-background rounded-lg">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {item.output}
                        </ReactMarkdown>
                      </div>
                    </div>
                  )}

                  {/* Error */}
                  {item.error && (
                    <div className="flex items-start gap-2 text-red-500 text-sm">
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                      {item.error}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {items.length === 0 && (
        <div className="text-center py-16 border rounded-xl bg-muted/30">
          <FileSpreadsheet className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Data Loaded</h3>
          <p className="text-muted-foreground mb-4">
            Select a skill and upload a CSV to get started with batch processing
          </p>
          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-4 w-4 mr-2" />
            Upload CSV
          </Button>
        </div>
      )}
    </div>
  );
};

export default BatchProcessingPage;
