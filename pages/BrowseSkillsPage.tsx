import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { SKILLS } from '../lib/skills';
import {
  getAllLibrarySkills,
  filterSkills,
  sortSkills,
  ROLE_DEFINITIONS,
  SKILL_COLLECTIONS,
} from '../lib/skillLibrary';
import {
  SKILL_CATEGORIES,
  SKILL_USE_CASES,
  DEFAULT_FILTERS,
  type LibraryFilters,
  type LibrarySortOption,
  type SkillCategory,
  type SkillUseCase,
} from '../lib/skillLibrary/types';
import SkillCard from '../components/SkillCard';
import { useAppContext } from '../hooks/useAppContext';
import FileUploader from '../components/FileUploader';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import {
  ArrowLeft,
  Search,
  X,
  Filter,
  Sparkles,
  BarChart3,
  Zap,
  TrendingUp,
  MessageSquare,
  SortAsc,
  ChevronDown,
  Star,
} from 'lucide-react';

// Icon mapping for categories
const CATEGORY_ICONS: Record<string, React.FC<{ className?: string }>> = {
  analysis: BarChart3,
  generation: Sparkles,
  automation: Zap,
  optimization: TrendingUp,
  communication: MessageSquare,
  research: Search,
};

const BrowseSkillsPage: React.FC = () => {
  const allLibrarySkills = useMemo(() => getAllLibrarySkills(), []);
  const staticSkills = Object.values(SKILLS);

  const {
    setResumeText,
    setJobDescriptionText,
    setAdditionalInfoText,
    resumeFilename,
    setResumeFilename,
    jobDescriptionFilename,
    setJobDescriptionFilename,
    additionalInfoFilename,
    setAdditionalInfoFilename,
    userProfile,
  } = useAppContext();

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<SkillCategory[]>([]);
  const [selectedUseCases, setSelectedUseCases] = useState<SkillUseCase[]>([]);
  const [sortBy, setSortBy] = useState<LibrarySortOption>('name');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'library' | 'static'>('library');

  // Build filters
  const filters: LibraryFilters = useMemo(() => ({
    ...DEFAULT_FILTERS,
    search: searchQuery,
    categories: selectedCategories,
    useCases: selectedUseCases,
  }), [searchQuery, selectedCategories, selectedUseCases]);

  // Filter and sort library skills
  const filteredSkills = useMemo(() => {
    let result = filterSkills(allLibrarySkills, filters);
    return sortSkills(result, sortBy);
  }, [allLibrarySkills, filters, sortBy]);

  // Get recommended skills based on user profile
  const recommendedSkills = useMemo(() => {
    if (!userProfile.targetRoles && !userProfile.targetIndustries) {
      return [];
    }

    const profileKeywords = [
      userProfile.targetRoles,
      userProfile.targetIndustries,
      userProfile.professionalTitle,
      userProfile.technicalSkills,
    ].filter(Boolean).join(' ').toLowerCase();

    return allLibrarySkills
      .filter((skill) => {
        const skillText = `${skill.name} ${skill.description} ${skill.longDescription || ''}`.toLowerCase();
        return profileKeywords.split(/\s+/).some((keyword) =>
          keyword.length > 3 && skillText.includes(keyword)
        );
      })
      .slice(0, 6);
  }, [allLibrarySkills, userProfile]);

  // Toggle category filter
  const toggleCategory = (category: SkillCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  // Toggle use case filter
  const toggleUseCase = (useCase: SkillUseCase) => {
    setSelectedUseCases((prev) =>
      prev.includes(useCase)
        ? prev.filter((uc) => uc !== useCase)
        : [...prev, useCase]
    );
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategories([]);
    setSelectedUseCases([]);
  };

  const hasActiveFilters = searchQuery || selectedCategories.length > 0 || selectedUseCases.length > 0;

  // File upload handlers
  const handleResumeUpload = (content: string, filename: string) => {
    setResumeText(content);
    setResumeFilename(filename);
  };

  const handleJobDescriptionUpload = (content: string, filename: string) => {
    setJobDescriptionText(content);
    setJobDescriptionFilename(filename);
  };

  const handleAdditionalInfoUpload = (content: string, filename: string) => {
    setAdditionalInfoText(content);
    setAdditionalInfoFilename(filename);
  };

  const clearResume = () => {
    setResumeText('');
    setResumeFilename('');
  };

  const clearJobDescription = () => {
    setJobDescriptionText('');
    setJobDescriptionFilename('');
  };

  const clearAdditionalInfo = () => {
    setAdditionalInfoText('');
    setAdditionalInfoFilename('');
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link to="/">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">AI Skills Library</h1>
        <p className="text-muted-foreground mt-2">
          {allLibrarySkills.length}+ AI-powered skills to help you in your career. Search, filter, and find the perfect skill.
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-2xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search skills by name, description, or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10 py-3 text-lg"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm font-medium text-muted-foreground mr-2">Categories:</span>
          {SKILL_CATEGORIES.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.value] || Sparkles;
            const isSelected = selectedCategories.includes(cat.value);
            return (
              <button
                key={cat.value}
                onClick={() => toggleCategory(cat.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors ${
                  isSelected
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {cat.label}
              </button>
            );
          })}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm text-red-400 hover:bg-red-500/10"
            >
              <X className="h-3.5 w-3.5" />
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Use Case Filters (Expandable) */}
      <div className="mb-6">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <Filter className="h-4 w-4" />
          More filters
          <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>
        {showFilters && (
          <div className="mt-3 p-4 rounded-lg border bg-card">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm font-medium text-muted-foreground mr-2">Use cases:</span>
              {SKILL_USE_CASES.map((uc) => {
                const isSelected = selectedUseCases.includes(uc.value);
                return (
                  <button
                    key={uc.value}
                    onClick={() => toggleUseCase(uc.value)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                      isSelected
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    {uc.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Recommended Skills Section */}
      {recommendedSkills.length > 0 && !hasActiveFilters && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Star className="h-5 w-5 text-yellow-500" />
            <h2 className="text-xl font-semibold">Recommended for You</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Based on your profile: {userProfile.professionalTitle || 'Career interests'}
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recommendedSkills.map((skill) => (
              <Link
                key={skill.id}
                to={`/library/skill/${skill.id}`}
                className="rounded-lg border bg-card p-4 hover:border-primary/50 transition-colors"
              >
                <h3 className="font-medium mb-1">{skill.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{skill.description}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                    {skill.tags.category}
                  </span>
                  {skill.estimatedTimeSaved && (
                    <span className="text-xs text-muted-foreground">
                      Saves {skill.estimatedTimeSaved}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* File Upload Section */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-3 items-start justify-center gap-6">
        <FileUploader
          title="1. Upload Your Resume"
          filename={resumeFilename}
          onFileUpload={handleResumeUpload}
          onClear={clearResume}
        />
        <FileUploader
          title="2. Upload Job Description"
          filename={jobDescriptionFilename}
          onFileUpload={handleJobDescriptionUpload}
          onClear={clearJobDescription}
        />
        <FileUploader
          title="3. Add'l Info (Optional)"
          filename={additionalInfoFilename}
          onFileUpload={handleAdditionalInfoUpload}
          onClear={clearAdditionalInfo}
        />
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">
            {hasActiveFilters ? `${filteredSkills.length} skills found` : 'All Skills'}
          </h2>
          {searchQuery && (
            <p className="text-sm text-muted-foreground">
              Showing results for "{searchQuery}"
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <SortAsc className="h-4 w-4 text-muted-foreground" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as LibrarySortOption)}
            className="bg-background border rounded-lg px-3 py-1.5 text-sm"
          >
            <option value="name">Alphabetical</option>
            <option value="popular">Most Popular</option>
            <option value="rating">Highest Rated</option>
            <option value="newest">Newest</option>
          </select>
        </div>
      </div>

      {/* Skills Grid */}
      {filteredSkills.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredSkills.map((skill) => (
            <Link
              key={skill.id}
              to={skill.source === 'builtin' ? `/skills/${skill.id}` : `/library/skill/${skill.id}`}
              className="group rounded-xl border bg-card p-6 hover:border-primary/50 transition-all hover:shadow-lg"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold group-hover:text-primary transition-colors">
                  {skill.name}
                </h3>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  skill.source === 'builtin' ? 'bg-blue-500/20 text-blue-400' :
                  skill.source === 'role-template' ? 'bg-purple-500/20 text-purple-400' :
                  'bg-green-500/20 text-green-400'
                }`}>
                  {skill.source === 'builtin' ? 'Core' :
                   skill.source === 'role-template' ? 'Role' : 'Community'}
                </span>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                {skill.description}
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs px-2 py-0.5 rounded-full bg-muted">
                  {skill.tags.category}
                </span>
                {skill.tags.useCases.slice(0, 2).map((uc) => (
                  <span key={uc} className="text-xs px-2 py-0.5 rounded-full bg-muted/50">
                    {uc.replace('-', ' ')}
                  </span>
                ))}
              </div>
              {skill.estimatedTimeSaved && (
                <p className="text-xs text-muted-foreground mt-3">
                  Saves {skill.estimatedTimeSaved}
                </p>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No skills found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search or filters
          </p>
          <Button variant="outline" onClick={clearFilters}>
            Clear all filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default BrowseSkillsPage;
