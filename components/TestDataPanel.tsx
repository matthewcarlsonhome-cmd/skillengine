/**
 * TestDataPanel - Enhanced Test Data UI Component
 *
 * Features:
 * - Fixture metadata display (name, description, last_updated)
 * - Auto-fill required fields
 * - Applied fixture indicator with timestamp
 * - Reset to blank functionality
 * - Consistent styling across all runners
 * - ARIA live updates for accessibility
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  FlaskConical,
  Play,
  Loader2,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Check,
  Clock,
  Info,
} from 'lucide-react';
import { Button } from './ui/Button';
import {
  getSkillDefaultTestData,
  getWorkflowDefaultTestData,
  hasSkillDefaultTestData,
  hasWorkflowDefaultTestData,
  type SkillDefaultTestData,
  type WorkflowDefaultTestData,
} from '../lib/testing';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface TestDataPanelProps {
  /** Skill ID to load test data for */
  skillId?: string;
  /** Workflow ID to load test data for */
  workflowId?: string;
  /** Callback to populate form fields with test data */
  onLoadTestData: (inputPayload: Record<string, string>) => void;
  /** Callback to reset form to blank state */
  onReset?: () => void;
  /** Optional callback to trigger execution after loading data */
  onExecute?: () => void;
  /** Whether the parent form is currently executing */
  isExecuting?: boolean;
  /** Show in expanded mode by default */
  defaultExpanded?: boolean;
  /** Additional CSS classes */
  className?: string;
}

interface AppliedFixture {
  name: string;
  appliedAt: Date;
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const TestDataPanel: React.FC<TestDataPanelProps> = ({
  skillId,
  workflowId,
  onLoadTestData,
  onReset,
  onExecute,
  isExecuting = false,
  defaultExpanded = false,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [isLoading, setIsLoading] = useState(false);
  const [appliedFixture, setAppliedFixture] = useState<AppliedFixture | null>(null);
  const liveRegionRef = useRef<HTMLDivElement>(null);

  // Check if test data is available
  const hasTestData = skillId
    ? hasSkillDefaultTestData(skillId)
    : workflowId
    ? hasWorkflowDefaultTestData(workflowId)
    : false;

  // Get the test data
  const testData: SkillDefaultTestData | WorkflowDefaultTestData | undefined = skillId
    ? getSkillDefaultTestData(skillId)
    : workflowId
    ? getWorkflowDefaultTestData(workflowId)
    : undefined;

  // Announce changes to screen readers
  const announce = (message: string) => {
    if (liveRegionRef.current) {
      liveRegionRef.current.textContent = message;
    }
  };

  // Reset applied fixture when skill/workflow changes
  useEffect(() => {
    setAppliedFixture(null);
  }, [skillId, workflowId]);

  // Don't render if no test data available
  if (!hasTestData || !testData) {
    return null;
  }

  const handleLoadTestData = async () => {
    setIsLoading(true);

    try {
      onLoadTestData(testData.inputPayload);
      setAppliedFixture({
        name: testData.description,
        appliedAt: new Date(),
      });
      announce(`Test data loaded: ${testData.description}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadAndExecute = async () => {
    setIsLoading(true);

    try {
      onLoadTestData(testData.inputPayload);
      setAppliedFixture({
        name: testData.description,
        appliedAt: new Date(),
      });
      announce(`Test data loaded: ${testData.description}. Executing...`);

      // Small delay to ensure form state updates before execution
      await new Promise((resolve) => setTimeout(resolve, 100));

      if (onExecute) {
        onExecute();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    if (onReset) {
      onReset();
      setAppliedFixture(null);
      announce('Form reset to blank state');
    }
  };

  const formatAppliedTime = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins === 1) return '1 min ago';
    if (diffMins < 60) return `${diffMins} mins ago`;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const fieldCount = Object.keys(testData.inputPayload).length;

  return (
    <>
      {/* ARIA live region for screen reader announcements */}
      <div
        ref={liveRegionRef}
        role="status"
        aria-live="polite"
        className="sr-only"
      />

      <div
        className={`rounded-lg border transition-all duration-200 ${
          appliedFixture
            ? 'border-green-500/30 bg-green-500/5'
            : 'border-amber-500/30 bg-amber-500/5'
        } ${className}`}
      >
        {/* Header - Always visible */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors rounded-lg"
          aria-expanded={isExpanded}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-md ${
              appliedFixture ? 'bg-green-500/20' : 'bg-amber-500/20'
            }`}>
              {appliedFixture ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <FlaskConical className="h-4 w-4 text-amber-500" />
              )}
            </div>
            <div className="text-left">
              <h4 className={`text-sm font-medium ${
                appliedFixture ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'
              }`}>
                {appliedFixture ? 'Test Data Applied' : 'Test Data Available'}
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                {appliedFixture
                  ? `${appliedFixture.name} - ${formatAppliedTime(appliedFixture.appliedAt)}`
                  : `${fieldCount} fields ready to populate`}
              </p>
            </div>
          </div>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          )}
        </button>

        {/* Expanded content */}
        {isExpanded && (
          <div className="px-4 pb-4 pt-0 space-y-4">
            {/* Fixture info */}
            <div className="rounded-md bg-muted/50 p-3 space-y-2">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium">{testData.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Test Case ID: <code className="bg-muted px-1 py-0.5 rounded text-xs">{testData.defaultTestCaseId}</code>
                  </p>
                </div>
              </div>
            </div>

            {/* Field preview */}
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Fields to populate ({fieldCount})
              </p>
              <div className="rounded-md bg-muted/30 p-2 max-h-28 overflow-y-auto">
                {Object.entries(testData.inputPayload).map(([key, value]) => (
                  <div key={key} className="flex gap-2 text-xs py-0.5">
                    <span className="text-muted-foreground font-medium min-w-[120px]">{key}:</span>
                    <span className="truncate text-foreground/70">
                      {typeof value === 'string' && value.length > 60
                        ? `${value.substring(0, 60)}...`
                        : value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleLoadTestData}
                disabled={isLoading || isExecuting}
                className={appliedFixture
                  ? 'text-green-600 border-green-600/30 hover:bg-green-600/10'
                  : 'text-amber-600 border-amber-600/30 hover:bg-amber-600/10'}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : appliedFixture ? (
                  <RotateCcw className="h-4 w-4 mr-2" />
                ) : (
                  <FlaskConical className="h-4 w-4 mr-2" />
                )}
                {appliedFixture ? 'Reload Test Data' : 'Load Test Data'}
              </Button>

              {onExecute && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleLoadAndExecute}
                  disabled={isLoading || isExecuting}
                  className={appliedFixture
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-amber-600 hover:bg-amber-700'}
                >
                  {isLoading || isExecuting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4 mr-2" />
                  )}
                  Load & Execute
                </Button>
              )}

              {onReset && appliedFixture && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  disabled={isExecuting}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset to Blank
                </Button>
              )}
            </div>

            {/* Applied fixture badge */}
            {appliedFixture && (
              <div className="flex items-center gap-2 pt-2 border-t border-green-500/20">
                <Clock className="h-3 w-3 text-green-500" />
                <span className="text-xs text-green-600 dark:text-green-400">
                  Applied: {appliedFixture.appliedAt.toLocaleString()}
                </span>
              </div>
            )}

            {/* Developer note */}
            <p className="text-xs text-muted-foreground italic">
              This is a developer testing feature. Test data is synthetic and for demo/verification purposes only.
            </p>
          </div>
        )}
      </div>
    </>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// COMPACT BANNER VERSION (for existing TestDataBanner compatibility)
// ═══════════════════════════════════════════════════════════════════════════

interface TestDataBannerProps {
  skillId?: string;
  workflowId?: string;
  onLoadTestData: (inputPayload: Record<string, string>) => void;
}

export const TestDataBannerCompact: React.FC<TestDataBannerProps> = ({
  skillId,
  workflowId,
  onLoadTestData,
}) => {
  const hasTestData = skillId
    ? hasSkillDefaultTestData(skillId)
    : workflowId
    ? hasWorkflowDefaultTestData(workflowId)
    : false;

  const testData = skillId
    ? getSkillDefaultTestData(skillId)
    : workflowId
    ? getWorkflowDefaultTestData(workflowId)
    : undefined;

  if (!hasTestData || !testData) {
    return null;
  }

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
      <FlaskConical className="h-5 w-5 text-amber-500 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-amber-600 dark:text-amber-400">
          <span className="font-medium">Test data available: </span>
          <span className="text-muted-foreground">{testData.description}</span>
        </p>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onLoadTestData(testData.inputPayload)}
        className="text-amber-600 border-amber-500/30 hover:bg-amber-500/10 flex-shrink-0"
      >
        Load Test Data
      </Button>
    </div>
  );
};

export default TestDataPanel;
