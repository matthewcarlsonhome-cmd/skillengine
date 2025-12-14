/**
 * TestOutputButton.tsx - Test Output Button Component
 *
 * A developer/testing component that:
 * 1. Loads default test data for a skill or workflow
 * 2. Populates the form with test values
 * 3. Optionally triggers execution
 *
 * This component is designed for developer testing and should be
 * hidden in production or shown only to authorized users.
 */

import React, { useState } from 'react';
import { FlaskConical, Play, Loader2, ChevronDown, ChevronUp, TestTube2 } from 'lucide-react';
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

interface TestOutputButtonProps {
  /** The skill or workflow ID to load test data for */
  skillId?: string;
  workflowId?: string;
  /** Callback to populate form fields with test data */
  onLoadTestData: (inputPayload: Record<string, string>) => void;
  /** Optional callback to trigger execution after loading data */
  onExecute?: () => void;
  /** Whether to automatically execute after loading (default: false) */
  autoExecute?: boolean;
  /** Whether the parent form is currently executing */
  isExecuting?: boolean;
  /** Optional custom button label */
  label?: string;
  /** Show as expanded panel with test case details */
  showDetails?: boolean;
  /** Additional CSS classes */
  className?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const TestOutputButton: React.FC<TestOutputButtonProps> = ({
  skillId,
  workflowId,
  onLoadTestData,
  onExecute,
  autoExecute = false,
  isExecuting = false,
  label,
  showDetails = false,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(showDetails);
  const [isLoading, setIsLoading] = useState(false);

  // Determine if we have test data available
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

  // Don't render if no test data available
  if (!hasTestData || !testData) {
    return null;
  }

  const handleLoadAndExecute = async () => {
    setIsLoading(true);

    try {
      // Load test data into form
      onLoadTestData(testData.inputPayload);

      // Small delay to ensure form state updates
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Execute if requested
      if (autoExecute && onExecute) {
        onExecute();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadOnly = () => {
    onLoadTestData(testData.inputPayload);
  };

  const buttonLabel = label || (autoExecute ? 'Load & Test' : 'Load Test Data');

  // Simple button mode
  if (!isExpanded && !showDetails) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Button
          variant="outline"
          size="sm"
          onClick={handleLoadAndExecute}
          disabled={isLoading || isExecuting}
          className="text-amber-600 border-amber-600/30 hover:bg-amber-600/10"
        >
          {isLoading || isExecuting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <FlaskConical className="h-4 w-4 mr-2" />
          )}
          {buttonLabel}
        </Button>
        <button
          onClick={() => setIsExpanded(true)}
          className="text-xs text-muted-foreground hover:text-foreground"
          title="Show test case details"
        >
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>
    );
  }

  // Expanded panel mode with details
  return (
    <div className={`rounded-lg border border-amber-600/30 bg-amber-600/5 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium flex items-center gap-2 text-amber-600">
          <TestTube2 className="h-4 w-4" />
          Developer Test Mode
        </h4>
        <button
          onClick={() => setIsExpanded(false)}
          className="text-muted-foreground hover:text-foreground"
        >
          <ChevronUp className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-3">
        {/* Test case description */}
        <div className="text-sm">
          <span className="text-muted-foreground">Test Case: </span>
          <span className="font-medium">{testData.description}</span>
        </div>

        {/* Test case ID */}
        <div className="text-xs text-muted-foreground">
          ID: <code className="bg-muted px-1 py-0.5 rounded">{testData.defaultTestCaseId}</code>
        </div>

        {/* Input preview */}
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">Input fields:</span>
          <div className="text-xs bg-muted/50 rounded p-2 max-h-32 overflow-y-auto">
            {Object.keys(testData.inputPayload).map((key) => (
              <div key={key} className="flex gap-2">
                <span className="text-muted-foreground">{key}:</span>
                <span className="truncate">
                  {testData.inputPayload[key].substring(0, 50)}
                  {testData.inputPayload[key].length > 50 && '...'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleLoadOnly}
            disabled={isLoading || isExecuting}
            className="text-amber-600 border-amber-600/30 hover:bg-amber-600/10"
          >
            <FlaskConical className="h-4 w-4 mr-2" />
            Load Test Data
          </Button>

          {onExecute && (
            <Button
              variant="default"
              size="sm"
              onClick={handleLoadAndExecute}
              disabled={isLoading || isExecuting}
              className="bg-amber-600 hover:bg-amber-700"
            >
              {isLoading || isExecuting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              Load & Execute
            </Button>
          )}
        </div>

        {/* Developer note */}
        <p className="text-xs text-muted-foreground mt-2">
          This is a developer testing feature. Test data is synthetic and for verification purposes only.
        </p>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// SIMPLE INLINE VERSION
// ═══════════════════════════════════════════════════════════════════════════

interface TestDataBannerProps {
  skillId?: string;
  workflowId?: string;
  onLoadTestData: (inputPayload: Record<string, string>) => void;
}

/**
 * A minimal banner that appears at the top of forms when test data is available
 */
export const TestDataBanner: React.FC<TestDataBannerProps> = ({
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
    <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-600/10 border border-amber-600/20 mb-4">
      <FlaskConical className="h-5 w-5 text-amber-600 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-amber-700 dark:text-amber-500">
          <span className="font-medium">Test data available: </span>
          <span className="text-muted-foreground">{testData.description}</span>
        </p>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onLoadTestData(testData.inputPayload)}
        className="text-amber-600 border-amber-600/30 hover:bg-amber-600/10 flex-shrink-0"
      >
        Load Test Data
      </Button>
    </div>
  );
};

export default TestOutputButton;
