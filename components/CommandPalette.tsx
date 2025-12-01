// Command Palette - Quick navigation with Ctrl+K

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Sparkles,
  Package,
  FolderOpen,
  Users,
  FileSpreadsheet,
  Settings,
  Home,
  Search,
  DollarSign,
  Briefcase,
  ArrowRight,
  MessageSquare,
  Calculator,
  Mail,
  Building2,
  Trophy,
  Target,
  BarChart3,
  Bot,
  Bell,
  Lock,
  TrendingUp,
  Calendar,
  User,
  Wand2,
} from 'lucide-react';

interface Command {
  id: string;
  name: string;
  description: string;
  icon: React.FC<{ className?: string }>;
  action: () => void;
  keywords: string[];
}

const CommandPalette: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: Command[] = [
    {
      id: 'profile',
      name: 'My Profile',
      description: 'Manage your resume and background info',
      icon: User,
      action: () => navigate('/profile'),
      keywords: ['profile', 'resume', 'background', 'info', 'personal', 'me'],
    },
    {
      id: 'dashboard',
      name: 'Dashboard',
      description: 'View your saved outputs and history',
      icon: LayoutDashboard,
      action: () => navigate('/dashboard'),
      keywords: ['home', 'saved', 'history', 'outputs'],
    },
    {
      id: 'skills',
      name: 'AI Skills',
      description: 'Browse AI-powered job search tools',
      icon: Sparkles,
      action: () => navigate('/skills'),
      keywords: ['skills', 'tools', 'resume', 'interview', 'cover letter', 'ai'],
    },
    {
      id: 'roles',
      name: 'Role Templates',
      description: 'Install skill bundles for your profession',
      icon: Package,
      action: () => navigate('/role-templates'),
      keywords: ['roles', 'templates', 'profession', 'career'],
    },
    {
      id: 'analyze',
      name: 'Custom Skills',
      description: 'Generate custom skills from job postings',
      icon: Wand2,
      action: () => navigate('/analyze'),
      keywords: ['analyze', 'job', 'posting', 'custom', 'generate', 'create'],
    },
    {
      id: 'community',
      name: 'Community Skills',
      description: 'Discover and share community skills',
      icon: Users,
      action: () => navigate('/community'),
      keywords: ['community', 'share', 'discover', 'social'],
    },
    {
      id: 'batch',
      name: 'Batch Processing',
      description: 'Process multiple items at once',
      icon: FileSpreadsheet,
      action: () => navigate('/batch'),
      keywords: ['batch', 'csv', 'bulk', 'multiple'],
    },
    {
      id: 'settings',
      name: 'Settings',
      description: 'Manage API keys and preferences',
      icon: Settings,
      action: () => navigate('/settings'),
      keywords: ['settings', 'api', 'keys', 'preferences', 'config'],
    },
    {
      id: 'pricing',
      name: 'Pricing',
      description: 'View pricing plans',
      icon: DollarSign,
      action: () => navigate('/pricing'),
      keywords: ['pricing', 'plans', 'subscription', 'pro'],
    },
    {
      id: 'my-skills',
      name: 'My Skills',
      description: 'View your installed skills',
      icon: Briefcase,
      action: () => navigate('/my-skills'),
      keywords: ['my', 'installed', 'skills', 'custom'],
    },
    {
      id: 'home',
      name: 'Home',
      description: 'Go to homepage',
      icon: Home,
      action: () => navigate('/'),
      keywords: ['home', 'landing', 'start'],
    },
    {
      id: 'job-tracker',
      name: 'Job Tracker',
      description: 'Track your job applications',
      icon: Briefcase,
      action: () => navigate('/job-tracker'),
      keywords: ['job', 'tracker', 'applications', 'track', 'applied'],
    },
    {
      id: 'interview-bank',
      name: 'Interview Questions',
      description: 'Browse interview question bank',
      icon: MessageSquare,
      action: () => navigate('/interview-bank'),
      keywords: ['interview', 'questions', 'practice', 'behavioral'],
    },
    {
      id: 'salary-calculator',
      name: 'Salary Calculator',
      description: 'Calculate and compare salaries',
      icon: Calculator,
      action: () => navigate('/salary-calculator'),
      keywords: ['salary', 'calculator', 'compensation', 'negotiate', 'offer'],
    },
    {
      id: 'networking',
      name: 'Networking Templates',
      description: 'LinkedIn and email templates',
      icon: Mail,
      action: () => navigate('/networking'),
      keywords: ['networking', 'templates', 'linkedin', 'email', 'outreach'],
    },
    {
      id: 'company-notes',
      name: 'Company Notes',
      description: 'Research and track companies',
      icon: Building2,
      action: () => navigate('/company-notes'),
      keywords: ['company', 'notes', 'research', 'track'],
    },
    {
      id: 'skills-gap',
      name: 'Skills Gap Analyzer',
      description: 'Compare your skills to job requirements',
      icon: Target,
      action: () => navigate('/skills-gap'),
      keywords: ['skills', 'gap', 'analyzer', 'compare', 'requirements'],
    },
    {
      id: 'progress',
      name: 'Progress Report',
      description: 'View your weekly job search progress',
      icon: BarChart3,
      action: () => navigate('/progress'),
      keywords: ['progress', 'report', 'weekly', 'stats', 'activity'],
    },
    {
      id: 'achievements',
      name: 'Achievements',
      description: 'View your job search achievements',
      icon: Trophy,
      action: () => navigate('/achievements'),
      keywords: ['achievements', 'badges', 'milestones', 'gamification'],
    },
    {
      id: 'mock-interview',
      name: 'Mock Interview',
      description: 'Practice interviews with AI feedback',
      icon: Bot,
      action: () => navigate('/mock-interview'),
      keywords: ['mock', 'interview', 'practice', 'ai', 'feedback', 'simulator'],
    },
    {
      id: 'follow-ups',
      name: 'Follow-up Reminders',
      description: 'Manage application follow-up reminders',
      icon: Bell,
      action: () => navigate('/follow-ups'),
      keywords: ['follow', 'up', 'reminders', 'notifications', 'schedule'],
    },
    {
      id: 'autofill-vault',
      name: 'Auto-Fill Vault',
      description: 'Store reusable application answers',
      icon: Lock,
      action: () => navigate('/autofill-vault'),
      keywords: ['autofill', 'vault', 'answers', 'store', 'reusable', 'data'],
    },
    {
      id: 'referral-network',
      name: 'Referral Network',
      description: 'Track connections at target companies',
      icon: Users,
      action: () => navigate('/referral-network'),
      keywords: ['referral', 'network', 'connections', 'contacts', 'companies'],
    },
    {
      id: 'market-insights',
      name: 'Market Insights',
      description: 'View job market trends and salary data',
      icon: TrendingUp,
      action: () => navigate('/market-insights'),
      keywords: ['market', 'insights', 'trends', 'salary', 'data', 'analytics'],
    },
    {
      id: 'daily-planner',
      name: 'Daily Planner',
      description: 'Plan your job search activities',
      icon: Calendar,
      action: () => navigate('/daily-planner'),
      keywords: ['daily', 'planner', 'schedule', 'time', 'block', 'activities'],
    },
  ];

  const filteredCommands = commands.filter((cmd) => {
    const searchLower = search.toLowerCase();
    return (
      cmd.name.toLowerCase().includes(searchLower) ||
      cmd.description.toLowerCase().includes(searchLower) ||
      cmd.keywords.some((k) => k.includes(searchLower))
    );
  });

  const handleOpen = useCallback(() => {
    setIsOpen(true);
    setSearch('');
    setSelectedIndex(0);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setSearch('');
    setSelectedIndex(0);
  }, []);

  const executeCommand = useCallback((command: Command) => {
    handleClose();
    command.action();
  }, [handleClose]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Open with Ctrl/Cmd + K
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          handleClose();
        } else {
          handleOpen();
        }
        return;
      }

      if (!isOpen) return;

      // Close with Escape
      if (e.key === 'Escape') {
        handleClose();
        return;
      }

      // Navigate with arrow keys
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, filteredCommands.length - 1));
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
        return;
      }

      // Execute with Enter
      if (e.key === 'Enter' && filteredCommands[selectedIndex]) {
        e.preventDefault();
        executeCommand(filteredCommands[selectedIndex]);
        return;
      }
    };

    const handleCustomOpen = () => handleOpen();

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('openCommandPalette', handleCustomOpen);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('openCommandPalette', handleCustomOpen);
    };
  }, [isOpen, filteredCommands, selectedIndex, handleOpen, handleClose, executeCommand]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Palette */}
      <div className="relative w-full max-w-lg bg-card border rounded-xl shadow-2xl overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center gap-3 p-4 border-b">
          <Search className="h-5 w-5 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search commands..."
            className="flex-1 bg-transparent outline-none text-lg placeholder:text-muted-foreground"
          />
          <kbd className="hidden sm:inline-flex h-6 items-center gap-1 rounded border bg-muted px-2 text-xs text-muted-foreground">
            ESC
          </kbd>
        </div>

        {/* Commands List */}
        <div className="max-h-80 overflow-y-auto p-2">
          {filteredCommands.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No commands found
            </div>
          ) : (
            filteredCommands.map((cmd, index) => {
              const Icon = cmd.icon;
              return (
                <button
                  key={cmd.id}
                  onClick={() => executeCommand(cmd)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                    index === selectedIndex ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{cmd.name}</p>
                    <p className="text-sm text-muted-foreground truncate">{cmd.description}</p>
                  </div>
                  {index === selectedIndex && (
                    <ArrowRight className="h-4 w-4 shrink-0" />
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-2 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <kbd className="inline-flex h-5 items-center rounded border bg-muted px-1.5">↑↓</kbd>
            <span>Navigate</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="inline-flex h-5 items-center rounded border bg-muted px-1.5">↵</kbd>
            <span>Select</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="inline-flex h-5 items-center rounded border bg-muted px-1.5">⌘K</kbd>
            <span>Toggle</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
