/**
 * InlineProviderSelector - Compact Provider/Model Quick-Switch Component
 *
 * Provides inline dropdowns for:
 * - Provider selection (Gemini, Claude, ChatGPT)
 * - Model selection (filtered by provider)
 * - Key mode indicator with status
 *
 * Features:
 * - Compact inline layout for skill runner pages
 * - Model descriptions and cost hints
 * - Key status indicator with quick link to settings
 * - Accessible with keyboard navigation
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronDown,
  Zap,
  Key,
  Check,
  Sparkles,
  Crown,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/theme';
import type { ApiProvider, KeyMode, ModelOption } from '../lib/platformKeys';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface InlineProviderSelectorProps {
  /** Currently selected provider */
  provider: ApiProvider;
  /** Callback when provider changes */
  onProviderChange: (provider: ApiProvider) => void;
  /** Currently selected model */
  model: string;
  /** Callback when model changes */
  onModelChange: (modelId: string) => void;
  /** Available models for current provider */
  availableModels: ModelOption[];
  /** Current key mode */
  keyMode: KeyMode;
  /** Callback when key mode changes */
  onKeyModeChange: (mode: KeyMode) => void;
  /** Whether platform key is available */
  platformKeyAvailable: boolean;
  /** Platform key balance */
  platformBalance?: number;
  /** Whether personal key is configured */
  personalKeyConfigured: boolean;
  /** Whether the selector is disabled */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
}

interface DropdownOption {
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const PROVIDER_OPTIONS: { id: ApiProvider; label: string; color: string }[] = [
  { id: 'gemini', label: 'Gemini', color: 'bg-blue-500' },
  { id: 'claude', label: 'Claude', color: 'bg-purple-500' },
  { id: 'chatgpt', label: 'ChatGPT', color: 'bg-green-500' },
];

// ═══════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

interface DropdownButtonProps {
  label: string;
  value: string;
  icon?: React.ReactNode;
  open: boolean;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

const DropdownButton: React.FC<DropdownButtonProps> = ({
  label,
  value,
  icon,
  open,
  onClick,
  disabled = false,
  className = '',
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={cn(
      'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-sm transition-all',
      'hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary/50',
      open && 'ring-2 ring-primary/50 bg-muted',
      disabled && 'opacity-50 cursor-not-allowed',
      className
    )}
    aria-expanded={open}
    aria-haspopup="listbox"
  >
    {icon}
    <span className="text-xs text-muted-foreground">{label}:</span>
    <span className="font-medium truncate max-w-[100px]">{value}</span>
    <ChevronDown className={cn(
      'h-3.5 w-3.5 text-muted-foreground transition-transform',
      open && 'rotate-180'
    )} />
  </button>
);

interface DropdownMenuProps {
  options: DropdownOption[];
  selectedId: string;
  onSelect: (id: string) => void;
  onClose: () => void;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({
  options,
  selectedId,
  onSelect,
  onClose,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="absolute top-full left-0 mt-1 min-w-[200px] max-w-[300px] bg-popover border rounded-lg shadow-lg z-50 py-1"
      role="listbox"
    >
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => {
            if (!option.disabled) {
              onSelect(option.id);
              onClose();
            }
          }}
          disabled={option.disabled}
          className={cn(
            'w-full flex items-start gap-2 px-3 py-2 text-left text-sm transition-colors',
            'hover:bg-muted focus:bg-muted focus:outline-none',
            option.id === selectedId && 'bg-primary/10',
            option.disabled && 'opacity-50 cursor-not-allowed'
          )}
          role="option"
          aria-selected={option.id === selectedId}
        >
          <div className="flex-shrink-0 mt-0.5">
            {option.id === selectedId ? (
              <Check className="h-4 w-4 text-primary" />
            ) : (
              <div className="h-4 w-4" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {option.icon}
              <span className="font-medium">{option.label}</span>
            </div>
            {option.description && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                {option.description}
              </p>
            )}
          </div>
        </button>
      ))}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const InlineProviderSelector: React.FC<InlineProviderSelectorProps> = ({
  provider,
  onProviderChange,
  model,
  onModelChange,
  availableModels,
  keyMode,
  onKeyModeChange,
  platformKeyAvailable,
  platformBalance,
  personalKeyConfigured,
  disabled = false,
  className = '',
}) => {
  const [providerOpen, setProviderOpen] = useState(false);
  const [modelOpen, setModelOpen] = useState(false);
  const [keyModeOpen, setKeyModeOpen] = useState(false);

  const currentProvider = PROVIDER_OPTIONS.find(p => p.id === provider);
  const currentModel = availableModels.find(m => m.id === model);

  const providerOptions: DropdownOption[] = PROVIDER_OPTIONS.map(p => ({
    id: p.id,
    label: p.label,
    icon: <span className={cn('h-2.5 w-2.5 rounded-full', p.color)} />,
  }));

  const modelOptions: DropdownOption[] = availableModels.map(m => ({
    id: m.id,
    label: m.name,
    description: m.description,
    icon: m.tier === 'premium' ? (
      <Crown className="h-3.5 w-3.5 text-amber-500" />
    ) : m.tier === 'fast' ? (
      <Zap className="h-3.5 w-3.5 text-blue-500" />
    ) : null,
  }));

  const keyConfigured = keyMode === 'platform' ? platformKeyAvailable : personalKeyConfigured;

  const keyModeOptions: DropdownOption[] = [
    {
      id: 'platform',
      label: 'Platform Key',
      description: platformKeyAvailable
        ? `$${(platformBalance || 0).toFixed(2)} credits available`
        : 'Not configured',
      icon: <Sparkles className="h-3.5 w-3.5 text-primary" />,
      disabled: !platformKeyAvailable,
    },
    {
      id: 'personal',
      label: 'Personal Key',
      description: personalKeyConfigured ? 'Configured' : 'Not set',
      icon: <Key className="h-3.5 w-3.5 text-muted-foreground" />,
    },
  ];

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-2 p-3 rounded-xl border bg-card',
        className
      )}
      role="group"
      aria-label="AI Provider Configuration"
    >
      {/* Provider Dropdown */}
      <div className="relative">
        <DropdownButton
          label="Provider"
          value={currentProvider?.label || provider}
          icon={<span className={cn('h-2 w-2 rounded-full', currentProvider?.color)} />}
          open={providerOpen}
          onClick={() => {
            setProviderOpen(!providerOpen);
            setModelOpen(false);
            setKeyModeOpen(false);
          }}
          disabled={disabled}
        />
        {providerOpen && (
          <DropdownMenu
            options={providerOptions}
            selectedId={provider}
            onSelect={(id) => onProviderChange(id as ApiProvider)}
            onClose={() => setProviderOpen(false)}
          />
        )}
      </div>

      {/* Model Dropdown */}
      <div className="relative">
        <DropdownButton
          label="Model"
          value={currentModel?.name || model}
          icon={currentModel?.tier === 'premium' ? (
            <Crown className="h-3 w-3 text-amber-500" />
          ) : currentModel?.tier === 'fast' ? (
            <Zap className="h-3 w-3 text-blue-500" />
          ) : (
            <Clock className="h-3 w-3 text-muted-foreground" />
          )}
          open={modelOpen}
          onClick={() => {
            setModelOpen(!modelOpen);
            setProviderOpen(false);
            setKeyModeOpen(false);
          }}
          disabled={disabled}
        />
        {modelOpen && (
          <DropdownMenu
            options={modelOptions}
            selectedId={model}
            onSelect={onModelChange}
            onClose={() => setModelOpen(false)}
          />
        )}
      </div>

      {/* Key Mode Dropdown */}
      <div className="relative">
        <DropdownButton
          label="Key"
          value={keyMode === 'platform' ? 'Platform' : 'Personal'}
          icon={keyConfigured ? (
            <Check className="h-3 w-3 text-green-500" />
          ) : (
            <AlertCircle className="h-3 w-3 text-amber-500" />
          )}
          open={keyModeOpen}
          onClick={() => {
            setKeyModeOpen(!keyModeOpen);
            setProviderOpen(false);
            setModelOpen(false);
          }}
          disabled={disabled}
        />
        {keyModeOpen && (
          <DropdownMenu
            options={keyModeOptions}
            selectedId={keyMode}
            onSelect={(id) => onKeyModeChange(id as KeyMode)}
            onClose={() => setKeyModeOpen(false)}
          />
        )}
      </div>

      {/* Settings Link */}
      <Link
        to="/account"
        className="ml-auto text-xs text-muted-foreground hover:text-primary transition-colors"
      >
        Full Settings →
      </Link>
    </div>
  );
};

export default InlineProviderSelector;
