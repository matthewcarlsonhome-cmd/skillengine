// Achievements Page - Gamification for job search milestones

import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { useToast } from '../hooks/useToast';
import { logger } from '../lib/logger';
import {
  Trophy,
  Star,
  Target,
  Flame,
  Zap,
  Crown,
  Medal,
  Award,
  Gift,
  Sparkles,
  Check,
  Lock,
  TrendingUp,
  FileText,
  Users,
  MessageSquare,
  Briefcase,
  Calendar,
  Clock,
} from 'lucide-react';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.FC<{ className?: string }>;
  color: string;
  category: 'skills' | 'applications' | 'networking' | 'streak' | 'special';
  requirement: number;
  currentProgress: number;
  unlockedAt?: string;
}

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
}

const STORAGE_KEY = 'skillengine_achievements';
const STREAK_KEY = 'skillengine_streak';

const getAchievements = (): Achievement[] => [
  // Skills
  { id: 'first-skill', name: 'First Steps', description: 'Run your first skill', icon: Sparkles, color: 'text-blue-500', category: 'skills', requirement: 1, currentProgress: 0 },
  { id: 'skill-explorer', name: 'Skill Explorer', description: 'Run 10 different skills', icon: Target, color: 'text-green-500', category: 'skills', requirement: 10, currentProgress: 0 },
  { id: 'skill-master', name: 'Skill Master', description: 'Run 50 skills', icon: Crown, color: 'text-purple-500', category: 'skills', requirement: 50, currentProgress: 0 },
  { id: 'ai-whisperer', name: 'AI Whisperer', description: 'Run 100 skills', icon: Zap, color: 'text-yellow-500', category: 'skills', requirement: 100, currentProgress: 0 },

  // Applications
  { id: 'applicant', name: 'Job Hunter', description: 'Track your first application', icon: Briefcase, color: 'text-blue-500', category: 'applications', requirement: 1, currentProgress: 0 },
  { id: 'serial-applier', name: 'Serial Applier', description: 'Track 10 applications', icon: FileText, color: 'text-green-500', category: 'applications', requirement: 10, currentProgress: 0 },
  { id: 'application-machine', name: 'Application Machine', description: 'Track 50 applications', icon: Medal, color: 'text-orange-500', category: 'applications', requirement: 50, currentProgress: 0 },
  { id: 'interview-getter', name: 'Interview Getter', description: 'Get 5 interviews', icon: MessageSquare, color: 'text-purple-500', category: 'applications', requirement: 5, currentProgress: 0 },

  // Networking
  { id: 'networker', name: 'Networker', description: 'Save 5 company notes', icon: Users, color: 'text-cyan-500', category: 'networking', requirement: 5, currentProgress: 0 },
  { id: 'connector', name: 'Super Connector', description: 'Save 20 company notes', icon: Users, color: 'text-indigo-500', category: 'networking', requirement: 20, currentProgress: 0 },

  // Streaks
  { id: 'consistent', name: 'Consistent', description: '3-day activity streak', icon: Flame, color: 'text-orange-500', category: 'streak', requirement: 3, currentProgress: 0 },
  { id: 'dedicated', name: 'Dedicated', description: '7-day activity streak', icon: Flame, color: 'text-red-500', category: 'streak', requirement: 7, currentProgress: 0 },
  { id: 'unstoppable', name: 'Unstoppable', description: '14-day activity streak', icon: Flame, color: 'text-pink-500', category: 'streak', requirement: 14, currentProgress: 0 },
  { id: 'legendary', name: 'Legendary', description: '30-day activity streak', icon: Crown, color: 'text-yellow-500', category: 'streak', requirement: 30, currentProgress: 0 },

  // Special
  { id: 'early-bird', name: 'Early Bird', description: 'Use SkillEngine before 7am', icon: Star, color: 'text-yellow-500', category: 'special', requirement: 1, currentProgress: 0 },
  { id: 'night-owl', name: 'Night Owl', description: 'Use SkillEngine after 11pm', icon: Star, color: 'text-purple-500', category: 'special', requirement: 1, currentProgress: 0 },
  { id: 'completionist', name: 'Completionist', description: 'Unlock all other achievements', icon: Trophy, color: 'text-yellow-500', category: 'special', requirement: 15, currentProgress: 0 },
];

const CATEGORY_CONFIG = {
  skills: { label: 'Skills', icon: Sparkles, color: 'text-blue-500' },
  applications: { label: 'Applications', icon: Briefcase, color: 'text-green-500' },
  networking: { label: 'Networking', icon: Users, color: 'text-purple-500' },
  streak: { label: 'Streaks', icon: Flame, color: 'text-orange-500' },
  special: { label: 'Special', icon: Star, color: 'text-yellow-500' },
};

const AchievementsPage: React.FC = () => {
  const { addToast } = useToast();
  const [achievements, setAchievements] = useState<Achievement[]>(getAchievements());
  const [streak, setStreak] = useState<StreakData>({ currentStreak: 0, longestStreak: 0, lastActiveDate: '' });
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Load achievements and update progress
  useEffect(() => {
    loadAchievements();
    updateStreak();
    checkSpecialAchievements();
  }, []);

  const loadAchievements = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const savedAchievements = JSON.parse(stored);
        setAchievements(getAchievements().map(a => ({
          ...a,
          ...savedAchievements.find((s: Achievement) => s.id === a.id),
        })));
      }

      // Update progress from various sources
      updateProgressFromStorage();
    } catch (e) {
      logger.error('Failed to load achievements', { error: e instanceof Error ? e.message : String(e) });
    }
  };

  const updateProgressFromStorage = () => {
    // Get execution count
    const executions = JSON.parse(localStorage.getItem('skillengine_executions') || '[]');
    const executionCount = executions.length;

    // Get applications count
    const applications = JSON.parse(localStorage.getItem('skillengine_job_applications') || '[]');
    const applicationCount = applications.length;
    const interviewCount = applications.filter((a: any) => a.status === 'interviewing' || a.status === 'offer').length;

    // Get company notes count
    const companies = JSON.parse(localStorage.getItem('skillengine_company_notes') || '[]');
    const companyCount = companies.length;

    // Get streak
    const storedStreak = JSON.parse(localStorage.getItem(STREAK_KEY) || '{}');
    const currentStreak = storedStreak.currentStreak || 0;

    setAchievements(prev => prev.map(a => {
      let progress = a.currentProgress;

      if (a.id === 'first-skill' || a.id === 'skill-explorer' || a.id === 'skill-master' || a.id === 'ai-whisperer') {
        progress = executionCount;
      } else if (a.id === 'applicant' || a.id === 'serial-applier' || a.id === 'application-machine') {
        progress = applicationCount;
      } else if (a.id === 'interview-getter') {
        progress = interviewCount;
      } else if (a.id === 'networker' || a.id === 'connector') {
        progress = companyCount;
      } else if (a.category === 'streak') {
        progress = currentStreak;
      }

      const isNewlyUnlocked = progress >= a.requirement && !a.unlockedAt;

      return {
        ...a,
        currentProgress: progress,
        unlockedAt: isNewlyUnlocked ? new Date().toISOString() : a.unlockedAt,
      };
    }));
  };

  const updateStreak = () => {
    try {
      const stored = localStorage.getItem(STREAK_KEY);
      const today = new Date().toISOString().split('T')[0];

      let streakData: StreakData;

      if (stored) {
        streakData = JSON.parse(stored);
        const lastDate = new Date(streakData.lastActiveDate);
        const todayDate = new Date(today);
        const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
          // Same day, no change
        } else if (diffDays === 1) {
          // Consecutive day
          streakData.currentStreak += 1;
          streakData.longestStreak = Math.max(streakData.longestStreak, streakData.currentStreak);
          streakData.lastActiveDate = today;
        } else {
          // Streak broken
          streakData.currentStreak = 1;
          streakData.lastActiveDate = today;
        }
      } else {
        streakData = {
          currentStreak: 1,
          longestStreak: 1,
          lastActiveDate: today,
        };
      }

      setStreak(streakData);
      localStorage.setItem(STREAK_KEY, JSON.stringify(streakData));
    } catch (e) {
      logger.error('Failed to update streak', { error: e instanceof Error ? e.message : String(e) });
    }
  };

  const checkSpecialAchievements = () => {
    const hour = new Date().getHours();

    setAchievements(prev => prev.map(a => {
      if (a.id === 'early-bird' && hour < 7 && !a.unlockedAt) {
        return { ...a, currentProgress: 1, unlockedAt: new Date().toISOString() };
      }
      if (a.id === 'night-owl' && hour >= 23 && !a.unlockedAt) {
        return { ...a, currentProgress: 1, unlockedAt: new Date().toISOString() };
      }
      return a;
    }));
  };

  // Save achievements when they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(achievements));
  }, [achievements]);

  const unlockedCount = achievements.filter(a => a.unlockedAt).length;
  const totalPoints = achievements.filter(a => a.unlockedAt).length * 100;

  const filteredAchievements = selectedCategory === 'all'
    ? achievements
    : achievements.filter(a => a.category === selectedCategory);

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center">
          <Trophy className="h-6 w-6 text-yellow-500" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Achievements</h1>
          <p className="text-muted-foreground">Track your job search milestones</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="rounded-xl border bg-gradient-to-br from-yellow-500/10 to-orange-500/10 p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Trophy className="h-4 w-4 text-yellow-500" />
            Unlocked
          </div>
          <p className="text-2xl font-bold mt-1">{unlockedCount}/{achievements.length}</p>
        </div>
        <div className="rounded-xl border bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Star className="h-4 w-4 text-purple-500" />
            Points
          </div>
          <p className="text-2xl font-bold mt-1">{totalPoints}</p>
        </div>
        <div className="rounded-xl border bg-gradient-to-br from-orange-500/10 to-red-500/10 p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Flame className="h-4 w-4 text-orange-500" />
            Current Streak
          </div>
          <p className="text-2xl font-bold mt-1">{streak.currentStreak} days</p>
        </div>
        <div className="rounded-xl border bg-gradient-to-br from-blue-500/10 to-cyan-500/10 p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <TrendingUp className="h-4 w-4 text-blue-500" />
            Best Streak
          </div>
          <p className="text-2xl font-bold mt-1">{streak.longestStreak} days</p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Button
          variant={selectedCategory === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedCategory('all')}
        >
          All
        </Button>
        {Object.entries(CATEGORY_CONFIG).map(([key, { label, icon: Icon, color }]) => (
          <Button
            key={key}
            variant={selectedCategory === key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(key)}
            className="gap-2"
          >
            <Icon className={`h-4 w-4 ${selectedCategory !== key ? color : ''}`} />
            {label}
          </Button>
        ))}
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAchievements.map((achievement) => {
          const Icon = achievement.icon;
          const isUnlocked = !!achievement.unlockedAt;
          const progress = Math.min(achievement.currentProgress / achievement.requirement, 1);

          return (
            <div
              key={achievement.id}
              className={`border rounded-xl p-4 transition-all ${
                isUnlocked
                  ? 'bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30'
                  : 'bg-card opacity-75'
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                    isUnlocked ? 'bg-yellow-500/20' : 'bg-muted'
                  }`}
                >
                  {isUnlocked ? (
                    <Icon className={`h-6 w-6 ${achievement.color}`} />
                  ) : (
                    <Lock className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{achievement.name}</h3>
                    {isUnlocked && <Check className="h-4 w-4 text-green-500" />}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{achievement.description}</p>

                  {/* Progress Bar */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${isUnlocked ? 'bg-yellow-500' : 'bg-primary'}`}
                        style={{ width: `${progress * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {achievement.currentProgress}/{achievement.requirement}
                    </span>
                  </div>

                  {isUnlocked && achievement.unlockedAt && (
                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Motivation */}
      <div className="mt-8 p-6 border rounded-xl bg-gradient-to-r from-primary/10 to-purple-500/10 text-center">
        <Sparkles className="h-8 w-8 mx-auto mb-2 text-primary" />
        <h3 className="font-semibold mb-2">Keep Going!</h3>
        <p className="text-muted-foreground">
          {unlockedCount === 0
            ? "Start using SkillEngine to unlock your first achievement!"
            : unlockedCount < achievements.length / 2
            ? "You're making great progress. Keep up the momentum!"
            : unlockedCount < achievements.length
            ? "You're almost there! Just a few more achievements to unlock."
            : "Congratulations! You've unlocked all achievements. You're a job search champion!"}
        </p>
      </div>
    </div>
  );
};

export default AchievementsPage;
