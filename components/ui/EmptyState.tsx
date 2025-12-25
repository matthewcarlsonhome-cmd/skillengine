/**
 * EmptyState - Beautiful empty state components with illustrations
 *
 * Features:
 * - SVG illustrations for different contexts
 * - Action buttons
 * - Animated entrance
 * - Various preset types
 */

import React from 'react';
import { Button } from './Button';
import {
  FileText,
  Search,
  Star,
  FolderOpen,
  Inbox,
  Calendar,
  Users,
  Sparkles,
  Plus,
  ArrowRight,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════
// SVG ILLUSTRATIONS
// ═══════════════════════════════════════════════════════════════════════════

const illustrations = {
  // Empty folder/documents
  documents: (
    <svg viewBox="0 0 200 160" className="w-full h-full">
      <defs>
        <linearGradient id="doc-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      {/* Background circle */}
      <circle cx="100" cy="80" r="60" fill="url(#doc-grad)" className="animate-pulse" />
      {/* Folder */}
      <rect x="55" y="50" width="90" height="70" rx="4" fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth="2" />
      <path d="M55 60 L55 55 Q55 50 60 50 L85 50 L90 55 L145 55 Q150 55 150 60" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="2" />
      {/* Document pages */}
      <rect x="70" y="65" width="35" height="45" rx="2" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="1.5" className="opacity-60" />
      <rect x="80" y="70" width="35" height="45" rx="2" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="1.5" className="opacity-80" />
      <rect x="90" y="75" width="35" height="45" rx="2" fill="hsl(var(--card))" stroke="hsl(var(--primary))" strokeWidth="1.5" />
      {/* Document lines */}
      <line x1="95" y1="85" x2="120" y2="85" stroke="hsl(var(--muted-foreground))" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <line x1="95" y1="92" x2="115" y2="92" stroke="hsl(var(--muted-foreground))" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
      <line x1="95" y1="99" x2="118" y2="99" stroke="hsl(var(--muted-foreground))" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
    </svg>
  ),

  // Search/not found
  search: (
    <svg viewBox="0 0 200 160" className="w-full h-full">
      <defs>
        <linearGradient id="search-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <circle cx="100" cy="80" r="60" fill="url(#search-grad)" className="animate-pulse" />
      {/* Magnifying glass */}
      <circle cx="90" cy="70" r="30" fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="6" opacity="0.3" />
      <circle cx="90" cy="70" r="30" fill="none" stroke="hsl(var(--primary))" strokeWidth="4" />
      <line x1="112" y1="92" x2="135" y2="115" stroke="hsl(var(--primary))" strokeWidth="6" strokeLinecap="round" />
      {/* Question mark inside */}
      <text x="90" y="80" textAnchor="middle" fontSize="24" fill="hsl(var(--muted-foreground))" fontWeight="bold">?</text>
    </svg>
  ),

  // Empty favorites/stars
  favorites: (
    <svg viewBox="0 0 200 160" className="w-full h-full">
      <defs>
        <linearGradient id="fav-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <circle cx="100" cy="80" r="60" fill="url(#fav-grad)" className="animate-pulse" />
      {/* Large star */}
      <path
        d="M100 35 L108 60 L135 60 L114 77 L122 102 L100 87 L78 102 L86 77 L65 60 L92 60 Z"
        fill="none"
        stroke="hsl(var(--muted-foreground))"
        strokeWidth="3"
        strokeDasharray="8 4"
        opacity="0.4"
      />
      {/* Small stars */}
      <path d="M50 50 L52 55 L58 55 L54 59 L56 64 L50 60 L44 64 L46 59 L42 55 L48 55 Z" fill="#fbbf24" opacity="0.6" />
      <path d="M150 45 L151.5 49 L156 49 L152.5 52 L154 56 L150 53 L146 56 L147.5 52 L144 49 L148.5 49 Z" fill="#fbbf24" opacity="0.4" />
      <path d="M145 95 L146 98 L149 98 L147 100 L148 103 L145 101 L142 103 L143 100 L141 98 L144 98 Z" fill="#fbbf24" opacity="0.5" />
    </svg>
  ),

  // Empty inbox
  inbox: (
    <svg viewBox="0 0 200 160" className="w-full h-full">
      <defs>
        <linearGradient id="inbox-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <circle cx="100" cy="80" r="60" fill="url(#inbox-grad)" className="animate-pulse" />
      {/* Inbox tray */}
      <path d="M50 70 L60 50 L140 50 L150 70 L150 110 Q150 115 145 115 L55 115 Q50 115 50 110 Z" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="2" />
      <path d="M50 70 L70 70 Q75 70 77 75 L83 90 L117 90 L123 75 Q125 70 130 70 L150 70" fill="none" stroke="hsl(var(--border))" strokeWidth="2" />
      {/* Dotted lines for empty content */}
      <line x1="70" y1="80" x2="130" y2="80" stroke="hsl(var(--muted-foreground))" strokeWidth="2" strokeDasharray="4 4" opacity="0.3" />
    </svg>
  ),

  // AI/Sparkles
  ai: (
    <svg viewBox="0 0 200 160" className="w-full h-full">
      <defs>
        <linearGradient id="ai-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#ec4899" stopOpacity="0.1" />
        </linearGradient>
      </defs>
      <circle cx="100" cy="80" r="60" fill="url(#ai-grad)" className="animate-pulse" />
      {/* Central sparkle */}
      <path d="M100 50 Q100 80 100 80 Q100 80 130 80 Q100 80 100 80 Q100 80 100 110 Q100 80 100 80 Q100 80 70 80 Q100 80 100 80 Z" fill="none" stroke="url(#ai-line)" strokeWidth="3" />
      <defs>
        <linearGradient id="ai-line" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
      </defs>
      {/* Orbiting dots */}
      <circle cx="100" cy="50" r="4" fill="#8b5cf6">
        <animateTransform attributeName="transform" type="rotate" from="0 100 80" to="360 100 80" dur="8s" repeatCount="indefinite" />
      </circle>
      <circle cx="130" cy="80" r="3" fill="#ec4899">
        <animateTransform attributeName="transform" type="rotate" from="120 100 80" to="480 100 80" dur="8s" repeatCount="indefinite" />
      </circle>
      <circle cx="70" cy="80" r="3" fill="#8b5cf6" opacity="0.6">
        <animateTransform attributeName="transform" type="rotate" from="240 100 80" to="600 100 80" dur="8s" repeatCount="indefinite" />
      </circle>
    </svg>
  ),

  // Calendar/schedule
  calendar: (
    <svg viewBox="0 0 200 160" className="w-full h-full">
      <defs>
        <linearGradient id="cal-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <circle cx="100" cy="80" r="60" fill="url(#cal-grad)" className="animate-pulse" />
      {/* Calendar */}
      <rect x="55" y="45" width="90" height="75" rx="6" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="2" />
      <rect x="55" y="45" width="90" height="20" rx="6" fill="hsl(var(--primary))" opacity="0.2" />
      <rect x="55" y="55" width="90" height="10" fill="hsl(var(--primary))" opacity="0.2" />
      {/* Calendar rings */}
      <rect x="70" y="40" width="6" height="12" rx="2" fill="hsl(var(--muted-foreground))" />
      <rect x="124" y="40" width="6" height="12" rx="2" fill="hsl(var(--muted-foreground))" />
      {/* Grid dots */}
      <circle cx="75" cy="80" r="4" fill="hsl(var(--muted-foreground))" opacity="0.2" />
      <circle cx="92" cy="80" r="4" fill="hsl(var(--muted-foreground))" opacity="0.2" />
      <circle cx="109" cy="80" r="4" fill="hsl(var(--muted-foreground))" opacity="0.2" />
      <circle cx="126" cy="80" r="4" fill="hsl(var(--muted-foreground))" opacity="0.2" />
      <circle cx="75" cy="97" r="4" fill="hsl(var(--muted-foreground))" opacity="0.2" />
      <circle cx="92" cy="97" r="4" fill="hsl(var(--muted-foreground))" opacity="0.2" />
      <circle cx="109" cy="97" r="4" fill="hsl(var(--muted-foreground))" opacity="0.2" />
      <circle cx="126" cy="97" r="4" fill="hsl(var(--muted-foreground))" opacity="0.2" />
    </svg>
  ),

  // Team/users
  team: (
    <svg viewBox="0 0 200 160" className="w-full h-full">
      <defs>
        <linearGradient id="team-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <circle cx="100" cy="80" r="60" fill="url(#team-grad)" className="animate-pulse" />
      {/* Center person */}
      <circle cx="100" cy="60" r="15" fill="hsl(var(--card))" stroke="hsl(var(--primary))" strokeWidth="2" />
      <path d="M75 105 Q75 85 100 85 Q125 85 125 105" fill="hsl(var(--card))" stroke="hsl(var(--primary))" strokeWidth="2" />
      {/* Left person */}
      <circle cx="55" cy="70" r="10" fill="hsl(var(--card))" stroke="hsl(var(--muted-foreground))" strokeWidth="1.5" opacity="0.5" />
      <path d="M40 100 Q40 85 55 85 Q70 85 70 100" fill="hsl(var(--card))" stroke="hsl(var(--muted-foreground))" strokeWidth="1.5" opacity="0.5" />
      {/* Right person */}
      <circle cx="145" cy="70" r="10" fill="hsl(var(--card))" stroke="hsl(var(--muted-foreground))" strokeWidth="1.5" opacity="0.5" />
      <path d="M130 100 Q130 85 145 85 Q160 85 160 100" fill="hsl(var(--card))" stroke="hsl(var(--muted-foreground))" strokeWidth="1.5" opacity="0.5" />
    </svg>
  ),
};

// ═══════════════════════════════════════════════════════════════════════════
// EMPTY STATE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export type IllustrationType = keyof typeof illustrations;

export interface EmptyStateProps {
  illustration?: IllustrationType;
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
    icon?: React.ReactNode;
  };
  secondaryAction?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  className?: string;
  compact?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  illustration = 'documents',
  icon,
  title,
  description,
  action,
  secondaryAction,
  className = '',
  compact = false,
}) => {
  const ActionWrapper = action?.href ? 'a' : 'div';
  const SecondaryWrapper = secondaryAction?.href ? 'a' : 'button';

  return (
    <div
      className={`flex flex-col items-center justify-center text-center ${
        compact ? 'py-8 px-4' : 'py-16 px-6'
      } ${className}`}
    >
      {/* Illustration */}
      <div className={`${compact ? 'w-32 h-24 mb-4' : 'w-48 h-36 mb-6'}`}>
        {icon ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center">
              {icon}
            </div>
          </div>
        ) : (
          illustrations[illustration]
        )}
      </div>

      {/* Text */}
      <h3 className={`font-semibold mb-2 ${compact ? 'text-lg' : 'text-xl'}`}>
        {title}
      </h3>
      <p className={`text-muted-foreground max-w-md ${compact ? 'text-sm mb-4' : 'mb-6'}`}>
        {description}
      </p>

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {action && (
            <ActionWrapper
              href={action.href}
              onClick={action.onClick}
            >
              <Button size={compact ? 'default' : 'lg'}>
                {action.icon || <Plus className="h-4 w-4 mr-2" />}
                {action.label}
              </Button>
            </ActionWrapper>
          )}
          {secondaryAction && (
            <SecondaryWrapper
              href={secondaryAction.href}
              onClick={secondaryAction.onClick}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {secondaryAction.label}
              <ArrowRight className="inline h-4 w-4 ml-1" />
            </SecondaryWrapper>
          )}
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// PRESET EMPTY STATES
// ═══════════════════════════════════════════════════════════════════════════

export const EmptyNoResults: React.FC<{ searchQuery?: string; onClear?: () => void }> = ({
  searchQuery,
  onClear,
}) => (
  <EmptyState
    illustration="search"
    title={searchQuery ? `No results for "${searchQuery}"` : 'No results found'}
    description="Try adjusting your search or filters to find what you're looking for."
    action={onClear ? { label: 'Clear search', onClick: onClear, icon: <Search className="h-4 w-4 mr-2" /> } : undefined}
  />
);

export const EmptyNoSavedOutputs: React.FC<{ onBrowseSkills?: () => void }> = ({
  onBrowseSkills,
}) => (
  <EmptyState
    illustration="documents"
    title="No saved outputs yet"
    description="Run a skill and save the output to see it here. Your saved work will be organized and easy to find."
    action={onBrowseSkills ? { label: 'Browse Skills', onClick: onBrowseSkills, icon: <Sparkles className="h-4 w-4 mr-2" /> } : undefined}
  />
);

export const EmptyNoFavorites: React.FC<{ onBrowseSkills?: () => void }> = ({
  onBrowseSkills,
}) => (
  <EmptyState
    illustration="favorites"
    title="No favorite skills yet"
    description="Star your most-used skills for quick access. They'll appear here for easy one-click running."
    action={onBrowseSkills ? { label: 'Browse Skills', onClick: onBrowseSkills, icon: <Star className="h-4 w-4 mr-2" /> } : undefined}
  />
);

export const EmptyNoHistory: React.FC<{ onRunSkill?: () => void }> = ({
  onRunSkill,
}) => (
  <EmptyState
    illustration="calendar"
    title="No execution history"
    description="Your skill execution history will appear here. Run your first skill to get started."
    action={onRunSkill ? { label: 'Run Your First Skill', onClick: onRunSkill, icon: <Sparkles className="h-4 w-4 mr-2" /> } : undefined}
  />
);

export const EmptyNoWorkflows: React.FC<{ onCreate?: () => void }> = ({
  onCreate,
}) => (
  <EmptyState
    illustration="ai"
    title="No workflows yet"
    description="Create multi-step workflows to automate complex tasks. Chain skills together for powerful automation."
    action={onCreate ? { label: 'Create Workflow', onClick: onCreate, icon: <Plus className="h-4 w-4 mr-2" /> } : undefined}
  />
);

export const EmptyNoTeamMembers: React.FC<{ onInvite?: () => void }> = ({
  onInvite,
}) => (
  <EmptyState
    illustration="team"
    title="No team members"
    description="Invite colleagues to collaborate on skills and workflows. Share outputs and work together."
    action={onInvite ? { label: 'Invite Team', onClick: onInvite, icon: <Users className="h-4 w-4 mr-2" /> } : undefined}
  />
);

export default EmptyState;
