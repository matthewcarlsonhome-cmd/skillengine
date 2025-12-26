/**
 * OnboardingWizard Component
 *
 * A 3-step onboarding flow to capture user interests:
 * 1. What are you using automation for?
 * 2. What roles resonate with you?
 * 3. What workflows interest you?
 */

import React, { useState } from 'react';
import {
  Briefcase,
  Building2,
  GraduationCap,
  Home,
  Compass,
  Megaphone,
  Target,
  PenTool,
  Users,
  BarChart3,
  Code,
  Palette,
  Settings,
  Heart,
  DollarSign,
  Lightbulb,
  MoreHorizontal,
  CheckSquare,
  FileText,
  Shield,
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles,
  X,
} from 'lucide-react';
import { Button } from './ui/Button';
import {
  AUTOMATION_INTEREST_OPTIONS,
  ROLE_CATEGORY_OPTIONS,
  WORKFLOW_CATEGORY_OPTIONS,
  type AutomationInterestOption,
  type RoleCategoryOption,
  type WorkflowCategoryOption,
} from '../lib/onboardingConfig';
import type {
  AutomationInterest,
  RoleCategory,
  WorkflowCategory,
  UserOnboardingProfile,
} from '../lib/storage/types';

// Icon mapping
const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Briefcase,
  Building2,
  GraduationCap,
  Home,
  Compass,
  Megaphone,
  Target,
  PenTool,
  Users,
  BarChart3,
  Code,
  Palette,
  Settings,
  Heart,
  DollarSign,
  Lightbulb,
  MoreHorizontal,
  CheckSquare,
  FileText,
  Shield,
};

interface OnboardingWizardProps {
  onComplete: (profile: UserOnboardingProfile) => void;
  onSkip: () => void;
  userName?: string;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  onComplete,
  onSkip,
  userName,
}) => {
  const [step, setStep] = useState(1);
  const [automationInterest, setAutomationInterest] = useState<AutomationInterest | undefined>();
  const [roleCategories, setRoleCategories] = useState<RoleCategory[]>([]);
  const [workflowInterests, setWorkflowInterests] = useState<WorkflowCategory[]>([]);

  const totalSteps = 3;

  const handleRoleToggle = (role: RoleCategory) => {
    setRoleCategories(prev =>
      prev.includes(role)
        ? prev.filter(r => r !== role)
        : [...prev, role]
    );
  };

  const handleWorkflowToggle = (workflow: WorkflowCategory) => {
    setWorkflowInterests(prev =>
      prev.includes(workflow)
        ? prev.filter(w => w !== workflow)
        : [...prev, workflow]
    );
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = () => {
    const profile: UserOnboardingProfile = {
      automationInterest: automationInterest || 'general',
      roleCategories: roleCategories.length > 0 ? roleCategories : undefined,
      workflowInterests: workflowInterests.length > 0 ? workflowInterests : undefined,
      onboardingCompleted: true,
      onboardingCompletedAt: new Date().toISOString(),
    };
    onComplete(profile);
  };

  const handleSkip = () => {
    onSkip();
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return automationInterest !== undefined;
      case 2:
        return true; // Optional
      case 3:
        return true; // Optional
      default:
        return false;
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-8">
      {[1, 2, 3].map(s => (
        <div
          key={s}
          className={`w-3 h-3 rounded-full transition-colors ${
            s === step
              ? 'bg-blue-500'
              : s < step
              ? 'bg-green-500'
              : 'bg-gray-600'
          }`}
        />
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">
          Welcome{userName ? `, ${userName.split(' ')[0]}` : ''}!
        </h2>
        <p className="text-gray-400">
          What are you primarily interested in automating?
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {AUTOMATION_INTEREST_OPTIONS.map(option => {
          const Icon = ICON_MAP[option.icon] || Compass;
          const isSelected = automationInterest === option.value;

          return (
            <button
              key={option.value}
              onClick={() => setAutomationInterest(option.value)}
              className={`flex items-center gap-4 p-4 rounded-lg border transition-all text-left ${
                isSelected
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
              }`}
            >
              <div
                className={`p-3 rounded-lg ${
                  isSelected ? 'bg-blue-500/20' : 'bg-gray-700'
                }`}
              >
                <Icon
                  className={`w-6 h-6 ${
                    isSelected ? 'text-blue-400' : 'text-gray-400'
                  }`}
                />
              </div>
              <div className="flex-1">
                <div className="font-medium text-white">{option.label}</div>
                <div className="text-sm text-gray-400">{option.description}</div>
              </div>
              {isSelected && (
                <Check className="w-5 h-5 text-blue-400" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">
          What roles resonate with you?
        </h2>
        <p className="text-gray-400">
          Select all that apply (or skip if none)
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {ROLE_CATEGORY_OPTIONS.map(option => {
          const Icon = ICON_MAP[option.icon] || Users;
          const isSelected = roleCategories.includes(option.value);

          return (
            <button
              key={option.value}
              onClick={() => handleRoleToggle(option.value)}
              className={`flex flex-col items-center gap-2 p-4 rounded-lg border transition-all ${
                isSelected
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
              }`}
            >
              <Icon
                className={`w-6 h-6 ${
                  isSelected ? 'text-blue-400' : 'text-gray-400'
                }`}
              />
              <span className="text-sm font-medium text-white text-center">
                {option.label}
              </span>
              {isSelected && (
                <Check className="w-4 h-4 text-blue-400" />
              )}
            </button>
          );
        })}
      </div>

      {roleCategories.length > 0 && (
        <div className="text-center text-sm text-gray-400">
          {roleCategories.length} selected
        </div>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">
          What workflows would help you?
        </h2>
        <p className="text-gray-400">
          Select areas you'd like to automate
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {WORKFLOW_CATEGORY_OPTIONS.map(option => {
          const Icon = ICON_MAP[option.icon] || Settings;
          const isSelected = workflowInterests.includes(option.value);

          return (
            <button
              key={option.value}
              onClick={() => handleWorkflowToggle(option.value)}
              className={`flex items-start gap-3 p-4 rounded-lg border transition-all text-left ${
                isSelected
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
              }`}
            >
              <div
                className={`p-2 rounded-lg shrink-0 ${
                  isSelected ? 'bg-blue-500/20' : 'bg-gray-700'
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${
                    isSelected ? 'text-blue-400' : 'text-gray-400'
                  }`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-white text-sm">{option.label}</div>
                <div className="text-xs text-gray-500 truncate">
                  {option.exampleWorkflows.slice(0, 2).join(', ')}
                </div>
              </div>
              {isSelected && (
                <Check className="w-4 h-4 text-blue-400 shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {workflowInterests.length > 0 && (
        <div className="text-center text-sm text-gray-400">
          {workflowInterests.length} selected
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-gray-900/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-gray-800 rounded-xl border border-gray-700 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-400" />
            <span className="font-semibold text-white">Quick Setup</span>
          </div>
          <button
            onClick={handleSkip}
            className="text-gray-400 hover:text-white transition-colors"
            title="Skip for now"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {renderStepIndicator()}

          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-700 bg-gray-800/50">
          <div>
            {step > 1 ? (
              <Button
                variant="ghost"
                onClick={handleBack}
                className="text-gray-400"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            ) : (
              <Button
                variant="ghost"
                onClick={handleSkip}
                className="text-gray-400"
              >
                Skip for now
              </Button>
            )}
          </div>

          <div className="text-sm text-gray-500">
            Step {step} of {totalSteps}
          </div>

          <div>
            {step < totalSteps ? (
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleComplete}>
                <Check className="w-4 h-4 mr-2" />
                Get Started
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingWizard;
