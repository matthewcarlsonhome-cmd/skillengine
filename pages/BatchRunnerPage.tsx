/**
 * BatchRunnerPage.tsx - Batch Workflow Execution
 *
 * Allows users to run workflows with multiple input sets in parallel.
 * Supports CSV upload and provides progress tracking with export.
 */

import React, { useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Upload,
  Play,
  Pause,
  Download,
  CheckCircle,
  Circle,
  Loader2,
  AlertTriangle,
  FileSpreadsheet,
  Trash2,
  Plus,
} from 'lucide-react';
import { WORKFLOWS } from '../lib/workflows';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Progress } from '../components/ui/Progress';
import { useToast } from '../hooks/useToast';
import {
  createBatchExecution,
  parseCSVToInputSets,
  exportBatchResultsToCSV,
  getBatchSummary,
  type BatchExecution,
  type BatchItem,
} from '../lib/workflows/batch';

const BatchRunnerPage: React.FC = () => {
  const { workflowId } = useParams<{ workflowId: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();

  // Get workflow
  const workflow = useMemo(() => {
    return workflowId ? WORKFLOWS[workflowId] : undefined;
  }, [workflowId]);

  // State
  const [inputMode, setInputMode] = useState<'csv' | 'manual'>('manual');
  const [csvText, setCsvText] = useState('');
  const [manualItems, setManualItems] = useState<Record<string, string>[]>([{}]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [batch, setBatch] = useState<BatchExecution | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [concurrency, setConcurrency] = useState(3);

  // Parse CSV preview
  const csvPreview = useMemo(() => {
    if (!csvText) return { headers: [], rows: [] };
    const lines = csvText.split('\n').filter((l) => l.trim());
    if (lines.length === 0) return { headers: [], rows: [] };

    const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
    const rows = lines.slice(1, 6).map((line) => {
      const values = line.split(',').map((v) => v.trim().replace(/^"|"$/g, ''));
      return headers.reduce((acc, h, i) => ({ ...acc, [h]: values[i] || '' }), {});
    });

    return { headers, rows };
  }, [csvText]);

  // Handle CSV file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvText(text);

      // Auto-map columns if names match
      if (workflow) {
        const headers = text.split('\n')[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
        const autoMapping: Record<string, string> = {};
        for (const input of workflow.globalInputs) {
          const matchingHeader = headers.find(
            (h) => h.toLowerCase() === input.label.toLowerCase() ||
                   h.toLowerCase() === input.id.toLowerCase()
          );
          if (matchingHeader) {
            autoMapping[matchingHeader] = input.id;
          }
        }
        setColumnMapping(autoMapping);
      }
    };
    reader.readAsText(file);
  };

  // Add manual item
  const addManualItem = () => {
    setManualItems((prev) => [...prev, {}]);
  };

  // Remove manual item
  const removeManualItem = (index: number) => {
    setManualItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Update manual item
  const updateManualItem = (index: number, inputId: string, value: string) => {
    setManualItems((prev) => {
      const newItems = [...prev];
      newItems[index] = { ...newItems[index], [inputId]: value };
      return newItems;
    });
  };

  // Start batch execution
  const startBatch = useCallback(async () => {
    if (!workflow) return;

    // Get input sets
    let inputSets: Record<string, string>[];
    if (inputMode === 'csv') {
      inputSets = parseCSVToInputSets(csvText, columnMapping);
    } else {
      inputSets = manualItems.filter((item) => Object.values(item).some((v) => v));
    }

    if (inputSets.length === 0) {
      addToast('No valid input items to process', 'error');
      return;
    }

    // Create batch
    const newBatch = createBatchExecution(workflow, inputSets, { concurrency });
    newBatch.status = 'running';
    newBatch.startedAt = new Date().toISOString();
    setBatch(newBatch);
    setIsRunning(true);

    addToast(`Starting batch of ${inputSets.length} items`, 'success');

    // Note: Actual execution would happen here, but for now we just show the UI
    // In a real implementation, you would call the workflow executor for each item
    // with rate limiting based on concurrency

    // Simulate completion for demo
    setTimeout(() => {
      setBatch((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          status: 'completed',
          completedAt: new Date().toISOString(),
          items: prev.items.map((item) => ({
            ...item,
            status: 'completed' as const,
            completedAt: new Date().toISOString(),
          })),
          progress: { ...prev.progress, completed: prev.items.length },
        };
      });
      setIsRunning(false);
      addToast('Batch execution framework ready! Connect to workflow executor for full functionality.', 'info');
    }, 2000);
  }, [workflow, inputMode, csvText, columnMapping, manualItems, concurrency, addToast]);

  // Export results
  const exportResults = () => {
    if (!batch || !workflow) return;
    const csv = exportBatchResultsToCSV(batch, workflow);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `batch-results-${workflow.id}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('Results exported', 'success');
  };

  // 404 if workflow not found
  if (!workflow) {
    return (
      <div className="container mx-auto max-w-4xl text-center py-20">
        <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
        <h1 className="mt-4 text-3xl font-bold">Workflow Not Found</h1>
        <Button onClick={() => navigate('/')} className="mt-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
      </div>
    );
  }

  const summary = batch ? getBatchSummary(batch) : null;

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          to={`/workflow/${workflowId}`}
          className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Workflow
        </Link>
        <h1 className="text-3xl font-bold">Batch Run: {workflow.name}</h1>
        <p className="text-muted-foreground mt-2">
          Run this workflow with multiple input sets in parallel
        </p>
      </div>

      {!batch ? (
        <>
          {/* Input Mode Toggle */}
          <div className="mb-6">
            <div className="flex gap-2">
              <Button
                variant={inputMode === 'manual' ? 'default' : 'outline'}
                onClick={() => setInputMode('manual')}
              >
                Manual Entry
              </Button>
              <Button
                variant={inputMode === 'csv' ? 'default' : 'outline'}
                onClick={() => setInputMode('csv')}
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                CSV Upload
              </Button>
            </div>
          </div>

          {inputMode === 'csv' ? (
            <>
              {/* CSV Upload */}
              <div className="rounded-xl border bg-card p-6 mb-6">
                <h3 className="font-semibold mb-4">Upload CSV File</h3>
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="csv-upload"
                  />
                  <label htmlFor="csv-upload" className="cursor-pointer">
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="font-medium">Click to upload CSV</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Or drag and drop your file here
                    </p>
                  </label>
                </div>

                {csvPreview.headers.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-medium mb-3">Column Mapping</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Map CSV columns to workflow inputs:
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      {workflow.globalInputs.map((input) => (
                        <div key={input.id} className="flex items-center gap-2">
                          <span className="text-sm w-32 truncate">{input.label}:</span>
                          <select
                            value={Object.entries(columnMapping).find(([, v]) => v === input.id)?.[0] || ''}
                            onChange={(e) => {
                              const newMapping = { ...columnMapping };
                              // Remove old mapping for this input
                              for (const key of Object.keys(newMapping)) {
                                if (newMapping[key] === input.id) delete newMapping[key];
                              }
                              if (e.target.value) {
                                newMapping[e.target.value] = input.id;
                              }
                              setColumnMapping(newMapping);
                            }}
                            className="flex-1 bg-background border rounded px-2 py-1 text-sm"
                          >
                            <option value="">-- Select column --</option>
                            {csvPreview.headers.map((h) => (
                              <option key={h} value={h}>{h}</option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Preview ({csvPreview.rows.length} rows shown)</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm border">
                          <thead>
                            <tr className="bg-muted">
                              {csvPreview.headers.map((h) => (
                                <th key={h} className="px-2 py-1 text-left border">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {csvPreview.rows.map((row, i) => (
                              <tr key={i}>
                                {csvPreview.headers.map((h) => (
                                  <td key={h} className="px-2 py-1 border truncate max-w-[200px]">
                                    {row[h]}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Manual Entry */}
              <div className="rounded-xl border bg-card p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Input Items ({manualItems.length})</h3>
                  <Button variant="outline" size="sm" onClick={addManualItem}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Item
                  </Button>
                </div>

                <div className="space-y-4">
                  {manualItems.map((item, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium text-sm">Item #{index + 1}</span>
                        {manualItems.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeManualItem(index)}
                            className="text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {workflow.globalInputs.slice(0, 4).map((input) => (
                          <div key={input.id}>
                            <label className="text-xs text-muted-foreground">{input.label}</label>
                            <Input
                              value={item[input.id] || ''}
                              onChange={(e) => updateManualItem(index, input.id, e.target.value)}
                              placeholder={input.placeholder}
                              className="mt-1"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Settings & Start */}
          <div className="rounded-xl border bg-card p-6">
            <h3 className="font-semibold mb-4">Batch Settings</h3>
            <div className="flex items-center gap-4 mb-6">
              <div>
                <label className="text-sm text-muted-foreground">Concurrency</label>
                <Input
                  type="number"
                  min={1}
                  max={10}
                  value={concurrency}
                  onChange={(e) => setConcurrency(parseInt(e.target.value) || 3)}
                  className="w-20 mt-1"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Process up to {concurrency} items simultaneously
              </p>
            </div>
            <Button onClick={startBatch} disabled={isRunning} className="w-full">
              <Play className="h-4 w-4 mr-2" />
              Start Batch ({inputMode === 'csv' ? parseCSVToInputSets(csvText, columnMapping).length : manualItems.filter((i) => Object.values(i).some((v) => v)).length} items)
            </Button>
          </div>
        </>
      ) : (
        <>
          {/* Batch Progress */}
          <div className="rounded-xl border bg-card p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Batch Progress</h3>
              <span className={`px-2 py-1 rounded text-xs ${
                batch.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                batch.status === 'running' ? 'bg-blue-500/20 text-blue-400' :
                'bg-yellow-500/20 text-yellow-400'
              }`}>
                {batch.status}
              </span>
            </div>

            {summary && (
              <>
                <Progress value={(summary.completed + summary.failed) / summary.totalItems * 100} className="mb-4" />
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold">{summary.totalItems}</p>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-500">{summary.completed}</p>
                    <p className="text-xs text-muted-foreground">Completed</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-red-500">{summary.failed}</p>
                    <p className="text-xs text-muted-foreground">Failed</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-500">{summary.running}</p>
                    <p className="text-xs text-muted-foreground">Running</p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Items List */}
          <div className="rounded-xl border bg-card p-6 mb-6">
            <h3 className="font-semibold mb-4">Items</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {batch.items.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 border rounded-lg"
                >
                  {item.status === 'completed' ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : item.status === 'running' ? (
                    <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                  ) : item.status === 'error' ? (
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-sm">Item #{index + 1}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {Object.entries(item.inputs).slice(0, 2).map(([k, v]) => `${k}: ${v}`).join(' | ')}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">{item.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => {
                setBatch(null);
                setIsRunning(false);
              }}
            >
              New Batch
            </Button>
            {batch.status === 'completed' && (
              <Button onClick={exportResults}>
                <Download className="h-4 w-4 mr-2" />
                Export Results
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default BatchRunnerPage;
