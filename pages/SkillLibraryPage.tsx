/**
 * Skill Library Page
 *
 * A unified, browsable skill repository with multi-dimensional filtering.
 * Skills can be filtered by role (optional), category, use case, and more.
 */

import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useDebounce } from '../hooks/useDebounce';
import {
  Search,
  Filter,
  X,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Clock,
  Star,
  Play,
  Briefcase,
  Users,
  BarChart3,
  Zap,
  TrendingUp,
  MessageSquare,
  Calendar,
  Rocket,
  Network,
  Code2,
  FileText,
  Palette,
  LineChart,
  Megaphone,
  ShoppingCart,
  UserCog,
  Calculator,
  PenTool,
  HeartHandshake,
  Server,
  Stethoscope,
  Settings,
  GraduationCap,
  Scale,
  Truck,
  Building,
  Target,
  Heart,
  BookOpen,
  DollarSign,
  ArrowUpRight,
  Download,
  Copy,
  Check,
  Info,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import {
  getAllLibrarySkills,
  filterSkills,
  sortSkills,
  getSkillCountByRole,
  getSkillCountByCategory,
  SKILL_COLLECTIONS,
  ROLE_DEFINITIONS,
  getCollectionSkills,
} from '../lib/skillLibrary';
import {
  SKILL_CATEGORIES,
  SKILL_USE_CASES,
  SKILL_LEVELS,
  DEFAULT_FILTERS,
  type LibraryFilters,
  type LibrarySortOption,
  type LibrarySkill,
  type SkillCategory,
  type SkillUseCase,
  type SkillLevel,
} from '../lib/skillLibrary/types';

// Icon mapping for roles
const ROLE_ICONS: Record<string, React.ElementType> = {
  'software-engineer': Code2,
  'business-analyst': BarChart3,
  'marketing-specialist': Megaphone,
  'marketing-manager': Megaphone,
  'creative-director': Palette,
  'product-manager': Target,
  'data-analyst': LineChart,
  'project-manager': Calendar,
  'ux-designer': Palette,
  'sales-representative': ShoppingCart,
  'hr-professional': UserCog,
  'financial-analyst': Calculator,
  'content-writer': PenTool,
  'customer-success-manager': HeartHandshake,
  'devops-engineer': Server,
  'healthcare-professional': Stethoscope,
  'operations-manager': Settings,
  'teacher-educator': GraduationCap,
  'legal-professional': Scale,
  'supply-chain-manager': Truck,
};

// Icon mapping for categories
const CATEGORY_ICONS: Record<string, React.ElementType> = {
  analysis: BarChart3,
  generation: Sparkles,
  automation: Zap,
  optimization: TrendingUp,
  communication: MessageSquare,
  research: Search,
};

// Icon mapping for use cases
const USE_CASE_ICONS: Record<string, React.ElementType> = {
  'job-search': Briefcase,
  'interview-prep': Users,
  'daily-work': Calendar,
  'onboarding': Rocket,
  'career-growth': TrendingUp,
  'networking': Network,
};

// Icon mapping for collections
const COLLECTION_ICONS: Record<string, React.ElementType> = {
  Briefcase,
  Users,
  TrendingUp,
  DollarSign,
  Rocket,
};

const SkillLibraryPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const fromQuiz = searchParams.get('fromQuiz') === 'true';

  // State
  const [filters, setFilters] = useState<LibraryFilters>(() => {
    // Initialize from URL params (supports comma-separated values from quiz)
    const roleParam = searchParams.get('role');
    const rolesParam = searchParams.get('roles');
    const useCaseParam = searchParams.get('useCase');
    const useCasesParam = searchParams.get('useCases');
    const categoriesParam = searchParams.get('categories');

    // Parse roles (single or multiple)
    const roles: string[] = [];
    if (rolesParam) {
      roles.push(...rolesParam.split(',').filter(Boolean));
    } else if (roleParam) {
      roles.push(roleParam);
    }

    // Parse use cases (single or multiple)
    const useCases: SkillUseCase[] = [];
    if (useCasesParam) {
      useCases.push(...useCasesParam.split(',').filter(Boolean) as SkillUseCase[]);
    } else if (useCaseParam) {
      useCases.push(useCaseParam as SkillUseCase);
    }

    // Parse categories (from quiz)
    const categories: string[] = [];
    if (categoriesParam) {
      categories.push(...categoriesParam.split(',').filter(Boolean));
    }

    return {
      ...DEFAULT_FILTERS,
      roles,
      useCases,
      categories,
    };
  });
  const [showQuizBanner, setShowQuizBanner] = useState(fromQuiz);
  const [sortBy, setSortBy] = useState<LibrarySortOption>('name');
  const [showFilters, setShowFilters] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    roles: true,
    categories: true,
    useCases: fromQuiz, // Expand use cases if coming from quiz
    levels: false,
  });

  // Debounce search for performance
  const debouncedSearch = useDebounce(filters.search, 150);
  const debouncedFilters = useMemo(() => ({
    ...filters,
    search: debouncedSearch,
  }), [filters, debouncedSearch]);

  // Get all skills and apply filters
  const allSkills = useMemo(() => getAllLibrarySkills(), []);
  const filteredSkills = useMemo(
    () => sortSkills(filterSkills(allSkills, debouncedFilters), sortBy),
    [allSkills, debouncedFilters, sortBy]
  );

  // Get counts for sidebar
  const skillCountByRole = useMemo(() => getSkillCountByRole(), []);
  const skillCountByCategory = useMemo(() => getSkillCountByCategory(), []);

  // Update URL when role or useCase filter changes
  useEffect(() => {
    const params: Record<string, string> = {};
    if (filters.roles.length === 1) {
      params.role = filters.roles[0];
    }
    if (filters.useCases.length === 1) {
      params.useCase = filters.useCases[0];
    }
    setSearchParams(params);
  }, [filters.roles, filters.useCases, setSearchParams]);

  // Toggle a filter value
  const toggleFilter = <K extends keyof LibraryFilters>(
    key: K,
    value: LibraryFilters[K] extends (infer T)[] ? T : never
  ) => {
    setFilters((prev) => {
      const current = prev[key] as unknown[];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [key]: updated };
    });
  };

  // Set single role (clears others)
  const selectRole = (roleId: string) => {
    setFilters((prev) => ({
      ...prev,
      roles: prev.roles.includes(roleId) ? [] : [roleId],
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  // Toggle section expansion
  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Check if any filters are active
  const hasActiveFilters =
    filters.search ||
    filters.categories.length > 0 ||
    filters.roles.length > 0 ||
    filters.useCases.length > 0 ||
    filters.levels.length > 0 ||
    filters.skillIds.length > 0;

  // Handle skill launch
  const handleLaunchSkill = (skill: LibrarySkill) => {
    if (skill.source === 'builtin') {
      navigate(`/skill/${skill.id}`);
    } else {
      // For template skills, store in session and navigate to runner
      sessionStorage.setItem('librarySkillToRun', JSON.stringify(skill));
      navigate('/library-skill-runner');
    }
  };

  // Render filter section
  const renderFilterSection = (
    title: string,
    sectionKey: string,
    items: { value: string; label: string; count?: number; icon?: React.ElementType }[],
    filterKey: keyof LibraryFilters,
    isSingleSelect?: boolean
  ) => {
    const isExpanded = expandedSections[sectionKey];
    const currentValues = filters[filterKey] as string[];

    return (
      <div className="border-b border-border pb-4">
        <button
          onClick={() => toggleSection(sectionKey)}
          className="flex items-center justify-between w-full py-2 text-sm font-medium hover:text-primary transition-colors"
        >
          <span>{title}</span>
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
        {isExpanded && (
          <div className="mt-2 space-y-1">
            {items.map((item) => {
              const isSelected = currentValues.includes(item.value);
              const Icon = item.icon;
              return (
                <button
                  key={item.value}
                  onClick={() =>
                    isSingleSelect
                      ? selectRole(item.value)
                      : toggleFilter(filterKey, item.value as never)
                  }
                  className={`flex items-center justify-between w-full px-2 py-1.5 rounded-md text-sm transition-colors ${
                    isSelected
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {Icon && <Icon className="h-4 w-4" />}
                    <span>{item.label}</span>
                  </div>
                  {item.count !== undefined && (
                    <span className={`text-xs ${isSelected ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto max-w-7xl px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <BookOpen className="h-8 w-8 text-primary" />
                Skill Library
              </h1>
              <p className="text-muted-foreground mt-1">
                {allSkills.length} production-ready AI skills across {ROLE_DEFINITIONS.length} professional roles
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search skills..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, search: e.target.value }))
                  }
                  className="pl-10"
                />
              </div>
              <Link to="/export-skills">
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="md:hidden"
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Quick role selector chips */}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => setFilters((prev) => ({ ...prev, roles: [] }))}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filters.roles.length === 0
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground'
              }`}
            >
              All Roles
            </button>
            {ROLE_DEFINITIONS.slice(0, 8).map((role) => {
              const Icon = ROLE_ICONS[role.id] || Briefcase;
              const isSelected = filters.roles.includes(role.id);
              return (
                <button
                  key={role.id}
                  onClick={() => selectRole(role.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    isSelected
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {role.name}
                </button>
              );
            })}
            {ROLE_DEFINITIONS.length > 8 && (
              <button
                onClick={() => toggleSection('roles')}
                className="px-3 py-1.5 rounded-full text-sm text-muted-foreground hover:text-foreground bg-muted/50"
              >
                +{ROLE_DEFINITIONS.length - 8} more
              </button>
            )}
          </div>

          {/* Export Info Banner */}
          <div className="mt-4 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 p-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-500/20 flex items-center justify-center shrink-0">
                <Download className="h-5 w-5 text-green-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm">Export Skills for Any LLM</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Download skill prompts as CSV or TXT files. Use them in ChatGPT, Claude, Gemini, or any AI tool.
                  Each export includes the full system prompt, description, and configuration.
                </p>
              </div>
              <Link to="/export-skills">
                <Button size="sm" variant="outline" className="shrink-0">
                  Export Skills
                  <ArrowUpRight className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quiz Results Banner */}
      {showQuizBanner && (
        <div className="border-b bg-gradient-to-r from-primary/5 to-purple-500/5">
          <div className="container mx-auto max-w-7xl px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Personalized Results</h3>
                  <p className="text-sm text-muted-foreground">
                    Showing {filteredSkills.length} skills based on your quiz answers.{' '}
                    <button
                      onClick={clearFilters}
                      className="text-primary hover:underline"
                    >
                      Clear filters
                    </button>{' '}
                    to see all skills.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowQuizBanner(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto max-w-7xl px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar Filters */}
          {showFilters && (
            <aside className="hidden md:block w-64 flex-shrink-0">
              <div className="sticky top-6 rounded-xl border bg-card p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold">Filters</h2>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="text-xs text-primary hover:text-primary/80 flex items-center gap-1"
                    >
                      <X className="h-3 w-3" />
                      Clear all
                    </button>
                  )}
                </div>

                {/* Role Filter */}
                {renderFilterSection(
                  'Professional Role',
                  'roles',
                  ROLE_DEFINITIONS.map((r) => ({
                    value: r.id,
                    label: r.name,
                    count: skillCountByRole[r.id],
                    icon: ROLE_ICONS[r.id] || Briefcase,
                  })),
                  'roles',
                  true
                )}

                {/* Category Filter */}
                {renderFilterSection(
                  'Category',
                  'categories',
                  SKILL_CATEGORIES.map((c) => ({
                    value: c.value,
                    label: c.label,
                    count: skillCountByCategory[c.value],
                    icon: CATEGORY_ICONS[c.value],
                  })),
                  'categories'
                )}

                {/* Use Case Filter */}
                {renderFilterSection(
                  'Use Case',
                  'useCases',
                  SKILL_USE_CASES.map((uc) => ({
                    value: uc.value,
                    label: uc.label,
                    icon: USE_CASE_ICONS[uc.value],
                  })),
                  'useCases'
                )}

                {/* Level Filter */}
                {renderFilterSection(
                  'Experience Level',
                  'levels',
                  SKILL_LEVELS.map((l) => ({
                    value: l.value,
                    label: l.label,
                  })),
                  'levels'
                )}
              </div>
            </aside>
          )}

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Featured Collections */}
            {!hasActiveFilters && (
              <section className="mb-8">
                <h2 className="text-lg font-semibold mb-4">Featured Collections</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {SKILL_COLLECTIONS.filter((c) => c.featured).map((collection) => {
                    const Icon = COLLECTION_ICONS[collection.icon] || Sparkles;
                    const skills = getCollectionSkills(collection.id);
                    return (
                      <button
                        key={collection.id}
                        onClick={() => {
                          // Filter to show only collection skills
                          setFilters({
                            ...DEFAULT_FILTERS,
                            skillIds: collection.skillIds,
                          });
                        }}
                        className={`group p-4 rounded-xl border bg-card hover:border-primary/50 transition-all text-left`}
                      >
                        <div className={`h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center ${collection.color}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <h3 className="font-semibold mt-3 group-hover:text-primary transition-colors">
                          {collection.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {collection.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {skills.length} skills
                        </p>
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Results Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-muted-foreground">
                  {filteredSkills.length} {filteredSkills.length === 1 ? 'skill' : 'skills'}
                </span>
                {filters.skillIds.length > 0 && (
                  <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 text-xs font-medium flex items-center gap-1">
                    {SKILL_COLLECTIONS.find((c) =>
                      c.skillIds.length === filters.skillIds.length &&
                      c.skillIds.every((id) => filters.skillIds.includes(id))
                    )?.name || `${filters.skillIds.length} selected`}
                    <button
                      onClick={() => setFilters((prev) => ({ ...prev, skillIds: [] }))}
                      className="hover:text-blue-400"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {filters.roles.length === 1 && (
                  <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-medium flex items-center gap-1">
                    {ROLE_DEFINITIONS.find((r) => r.id === filters.roles[0])?.name}
                    <button
                      onClick={() => setFilters((prev) => ({ ...prev, roles: [] }))}
                      className="hover:text-primary/80"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as LibrarySortOption)}
                className="text-sm border rounded-md px-2 py-1 bg-background"
              >
                <option value="name">Sort: A-Z</option>
                <option value="popular">Sort: Most Popular</option>
                <option value="rating">Sort: Highest Rated</option>
                <option value="newest">Sort: Newest</option>
              </select>
            </div>

            {/* Skills Grid */}
            {filteredSkills.length === 0 ? (
              <div className="text-center py-12 rounded-xl border border-dashed">
                <Search className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No Skills Found</h3>
                <p className="text-muted-foreground mt-1">
                  Try adjusting your filters or search query
                </p>
                <Button variant="outline" onClick={clearFilters} className="mt-4">
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSkills.map((skill) => (
                  <SkillCard
                    key={skill.id}
                    skill={skill}
                    onLaunch={() => handleLaunchSkill(skill)}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// SKILL CARD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface SkillCardProps {
  skill: LibrarySkill;
  onLaunch: () => void;
}

const SkillCard: React.FC<SkillCardProps> = ({ skill, onLaunch }) => {
  const [copied, setCopied] = useState(false);
  const avgRating = skill.rating.count > 0 ? skill.rating.sum / skill.rating.count : 0;
  const CategoryIcon = CATEGORY_ICONS[skill.tags.category] || Sparkles;

  // Get role name for display
  const roleName = skill.tags.roles.length > 0
    ? ROLE_DEFINITIONS.find((r) => r.id === skill.tags.roles[0])?.name
    : null;

  // Copy system prompt to clipboard
  const handleCopyPrompt = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const prompt = skill.prompts.systemInstruction;
    if (prompt) {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="group rounded-xl border bg-card p-5 hover:border-primary/50 hover:shadow-md transition-all">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div
          className={`h-10 w-10 rounded-lg flex items-center justify-center ${skill.theme.secondary}`}
        >
          <CategoryIcon className={`h-5 w-5 ${skill.theme.primary}`} />
        </div>
        <div className="flex items-center gap-2">
          {skill.rating.count > 0 && (
            <div className="flex items-center gap-1 text-sm">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              <span>{avgRating.toFixed(1)}</span>
            </div>
          )}
          {skill.prompts.systemInstruction && (
            <button
              onClick={handleCopyPrompt}
              className="p-1.5 rounded-md hover:bg-muted transition-colors"
              title="Copy system prompt"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <h3 className="font-semibold mt-3 group-hover:text-primary transition-colors">
        {skill.name}
      </h3>
      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
        {skill.description}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap items-center gap-2 mt-3">
        <span className="px-2 py-0.5 rounded bg-muted text-xs capitalize">
          {skill.tags.category}
        </span>
        {roleName && (
          <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-xs">
            {roleName}
          </span>
        )}
        {skill.source === 'builtin' && (
          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 text-xs">
            Built-in
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {skill.estimatedTimeSaved && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {skill.estimatedTimeSaved}
            </span>
          )}
        </div>
        <Button size="sm" onClick={onLaunch}>
          <Play className="h-4 w-4 mr-1" />
          Launch
        </Button>
      </div>
    </div>
  );
};

export default SkillLibraryPage;
