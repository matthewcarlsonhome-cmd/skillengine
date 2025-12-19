/**
 * EmailSegmentationPanel - Admin Email Targeting UI
 *
 * Provides filtering, preview, and selection of email recipients
 * based on skill preferences, usage stats, and opt-in status.
 */

import React, { useState, useMemo } from 'react';
import { useDebounce } from '../hooks/useDebounce';
import {
  Filter,
  Users,
  CheckCircle2,
  XCircle,
  Mail,
  Star,
  Zap,
  Clock,
  ChevronDown,
  ChevronUp,
  Search,
  RefreshCw,
  Check,
  X,
  Info,
} from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Checkbox } from './ui/Checkbox';
import { cn } from '../lib/theme';
import {
  DEFAULT_SEGMENTATION_FILTER,
  type EmailRecipient,
  type SegmentationFilter,
} from '../lib/emailSegmentation/types';
import { SKILLS } from '../lib/skills';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface EmailSegmentationPanelProps {
  recipients: EmailRecipient[];
  filteredRecipients: EmailRecipient[];
  selectedRecipientIds: Set<string>;
  filter: SegmentationFilter;
  isLoading: boolean;

  // Stats object (alternative to individual props)
  stats?: {
    totalCount: number;
    filteredCount: number;
    selectedCount: number;
    optedInCount: number;
  };

  // Filter handlers
  onFilterChange: (updates: Partial<SegmentationFilter>) => void;

  // Selection handlers
  onSelectRecipient: (userId: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;

  // Actions
  onRefresh: () => void;
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: number;
  className?: string;
}> = ({ icon, label, value, className }) => (
  <div className={cn(
    'flex items-center gap-3 p-3 rounded-lg bg-muted/50',
    className
  )}>
    <div className="text-muted-foreground">{icon}</div>
    <div>
      <p className="text-2xl font-bold">{value.toLocaleString()}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  </div>
);

const RecipientRow: React.FC<{
  recipient: EmailRecipient;
  isSelected: boolean;
  onToggle: () => void;
}> = ({ recipient, isSelected, onToggle }) => (
  <div
    className={cn(
      'flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer',
      isSelected
        ? 'bg-primary/10 border-primary/30'
        : 'bg-card hover:bg-muted/50 border-border'
    )}
    onClick={onToggle}
  >
    <Checkbox
      checked={isSelected}
      onChange={() => {}}
      className="pointer-events-none"
    />

    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
        <span className="font-medium truncate">{recipient.email}</span>
        {recipient.marketingEmailOptIn ? (
          <span className="flex items-center gap-1 text-xs text-green-600 bg-green-500/10 px-1.5 py-0.5 rounded">
            <Mail className="h-3 w-3" />
            Opted In
          </span>
        ) : (
          <span className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
            <XCircle className="h-3 w-3" />
            Not Opted In
          </span>
        )}
      </div>

      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Zap className="h-3 w-3" />
          {recipient.totalRuns} runs
        </span>

        {recipient.lastActiveAt && (
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Last active: {new Date(recipient.lastActiveAt).toLocaleDateString()}
          </span>
        )}

        {recipient.favoriteSkillIds.length > 0 && (
          <span className="flex items-center gap-1">
            <Star className="h-3 w-3" />
            {recipient.favoriteSkillIds.length} favorites
          </span>
        )}
      </div>

    </div>

    {recipient.matchedSkills && recipient.matchedSkills.length > 0 && (
      <div className="flex items-center gap-1">
        <span className="text-xs text-primary">
          {recipient.matchedSkills.length} matched
        </span>
      </div>
    )}
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const EmailSegmentationPanel: React.FC<EmailSegmentationPanelProps> = ({
  recipients,
  filteredRecipients,
  selectedRecipientIds,
  filter,
  isLoading,
  stats,
  onFilterChange,
  onSelectRecipient,
  onSelectAll,
  onDeselectAll,
  onRefresh,
}) => {
  const [showFilters, setShowFilters] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 150);

  // Derive stats from props or stats object
  const totalCount = stats?.totalCount ?? recipients.length;
  const filteredCount = stats?.filteredCount ?? filteredRecipients.length;
  const selectedCount = stats?.selectedCount ?? selectedRecipientIds.size;
  const optedInCount = stats?.optedInCount ?? recipients.filter(r => r.marketingEmailOptIn).length;

  // Get available skills for filter dropdown
  const availableSkills = useMemo(() => {
    return Object.entries(SKILLS).map(([id, skill]) => ({
      id,
      name: skill.name,
    }));
  }, []);

  // Filter recipients by search query (using debounced value for performance)
  const displayedRecipients = useMemo(() => {
    if (!debouncedSearchQuery.trim()) return filteredRecipients;

    const query = debouncedSearchQuery.toLowerCase();
    return filteredRecipients.filter(r =>
      r.email.toLowerCase().includes(query) ||
      r.displayName?.toLowerCase().includes(query)
    );
  }, [filteredRecipients, debouncedSearchQuery]);

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          icon={<Users className="h-5 w-5" />}
          label="Total Users"
          value={totalCount}
        />
        <StatCard
          icon={<Mail className="h-5 w-5" />}
          label="Opted In"
          value={optedInCount}
          className="border-green-500/20"
        />
        <StatCard
          icon={<Filter className="h-5 w-5" />}
          label="Filtered"
          value={filteredCount}
          className="border-primary/20"
        />
        <StatCard
          icon={<CheckCircle2 className="h-5 w-5" />}
          label="Selected"
          value={selectedCount}
          className="border-blue-500/20"
        />
      </div>

      {/* Filter Panel */}
      <div className="rounded-xl border bg-card">
        <button
          className="flex items-center justify-between w-full p-4"
          onClick={() => setShowFilters(!showFilters)}
        >
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Segmentation Filters</h3>
          </div>
          <div className="flex items-center gap-2">
            {showFilters ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
        </button>

        {showFilters && (
          <div className="border-t p-4 space-y-4">
            {/* Opt-in Filter */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <label className="text-sm font-medium">Require Marketing Opt-In</label>
              </div>
              <Checkbox
                checked={filter.requireOptIn}
                onChange={(e) => onFilterChange({ requireOptIn: e.target.checked })}
              />
            </div>

            {/* Skill Filter */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-muted-foreground" />
                <label className="text-sm font-medium">Filter by Skills</label>
              </div>

              <Select
                value=""
                onChange={(e) => {
                  if (e.target.value) {
                    const currentSkills = filter.skillIds || [];
                    if (!currentSkills.includes(e.target.value)) {
                      onFilterChange({ skillIds: [...currentSkills, e.target.value] });
                    }
                  }
                }}
              >
                <option value="">Add a skill filter...</option>
                {availableSkills.map(skill => (
                  <option key={skill.id} value={skill.id}>
                    {skill.name}
                  </option>
                ))}
              </Select>

              {/* Selected skills */}
              {filter.skillIds && filter.skillIds.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {filter.skillIds.map(skillId => {
                    const skill = availableSkills.find(s => s.id === skillId);
                    return (
                      <span
                        key={skillId}
                        className="flex items-center gap-1 px-2 py-1 rounded bg-primary/10 text-primary text-xs"
                      >
                        {skill?.name || skillId}
                        <button
                          onClick={() => {
                            const updated = filter.skillIds?.filter(id => id !== skillId) || [];
                            onFilterChange({ skillIds: updated });
                          }}
                          className="hover:text-primary/70"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}

              {/* Skill match options */}
              {filter.skillIds && filter.skillIds.length > 0 && (
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground">Match Mode</label>
                    <Select
                      value={filter.skillMatchMode}
                      onChange={(e) => onFilterChange({
                        skillMatchMode: e.target.value as 'any' | 'all'
                      })}
                    >
                      <option value="any">Match ANY skill</option>
                      <option value="all">Match ALL skills</option>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground">Include as</label>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-1 text-xs">
                        <Checkbox
                          checked={filter.includeAsFavorite}
                          onChange={(e) => onFilterChange({ includeAsFavorite: e.target.checked })}
                        />
                        Favorite
                      </label>
                      <label className="flex items-center gap-1 text-xs">
                        <Checkbox
                          checked={filter.includeAsPrimary}
                          onChange={(e) => onFilterChange({ includeAsPrimary: e.target.checked })}
                        />
                        Primary
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Usage Filter */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-muted-foreground" />
                  <label className="text-sm font-medium">Min. Runs in Period</label>
                </div>
                <Input
                  type="number"
                  min={0}
                  value={filter.minRunsInPeriod || ''}
                  onChange={(e) => onFilterChange({
                    minRunsInPeriod: e.target.value ? parseInt(e.target.value) : undefined
                  })}
                  placeholder="e.g., 5"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <label className="text-sm font-medium">Period (days)</label>
                </div>
                <Input
                  type="number"
                  min={1}
                  max={365}
                  value={filter.periodDays}
                  onChange={(e) => onFilterChange({
                    periodDays: parseInt(e.target.value) || 30
                  })}
                />
              </div>
            </div>

            {/* Activity Filter */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <label className="text-sm font-medium">Active in Last N Days</label>
              </div>
              <Input
                type="number"
                min={0}
                value={filter.activeInLastDays || ''}
                onChange={(e) => onFilterChange({
                  activeInLastDays: e.target.value ? parseInt(e.target.value) : undefined
                })}
                placeholder="Leave empty for no activity filter"
              />
            </div>

            {/* Filter Actions */}
            <div className="flex items-center justify-between pt-2 border-t">
              <Button variant="outline" size="sm" onClick={() => onFilterChange(DEFAULT_SEGMENTATION_FILTER)}>
                Reset Filters
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRefresh}
                  disabled={isLoading}
                >
                  <RefreshCw className={cn('h-4 w-4 mr-1', isLoading && 'animate-spin')} />
                  Refresh
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recipients List */}
      <div className="rounded-xl border bg-card">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Recipients ({filteredCount})
          </h3>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search emails..."
                className="pl-9 w-48"
              />
            </div>

            <Button variant="outline" size="sm" onClick={onSelectAll}>
              Select All
            </Button>
            <Button variant="outline" size="sm" onClick={onDeselectAll}>
              Deselect All
            </Button>
          </div>
        </div>

        {/* Recipients List */}
        <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <RefreshCw className="h-5 w-5 animate-spin mr-2" />
              Loading recipients...
            </div>
          ) : displayedRecipients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Users className="h-8 w-8 mb-2 opacity-50" />
              <p>No recipients match your filters</p>
            </div>
          ) : (
            displayedRecipients.map(recipient => (
              <RecipientRow
                key={recipient.userId}
                recipient={recipient}
                isSelected={selectedRecipientIds.has(recipient.userId)}
                onToggle={() => onSelectRecipient(recipient.userId)}
              />
            ))
          )}
        </div>
      </div>

      {/* Selection Summary */}
      <div className="flex items-center gap-2 p-4 rounded-xl border bg-card text-sm text-muted-foreground">
        <Info className="h-4 w-4" />
        <span>
          {selectedCount} recipient{selectedCount !== 1 ? 's' : ''} selected
          {selectedCount > 0 && ' — Use the "Compose Email" button above to send'}
        </span>
      </div>
    </div>
  );
};

export default EmailSegmentationPanel;
