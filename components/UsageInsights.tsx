/**
 * UsageInsights - Dashboard component showing productivity metrics
 *
 * Features:
 * - Weekly/monthly usage stats
 * - Most used skills chart
 * - Time saved calculator
 * - Streak tracking
 * - Trend indicators
 */

import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../lib/storage/indexeddb';
import type { SkillExecution } from '../lib/storage/types';
import { Card, StatCard } from './ui/Card';
import { logger } from '../lib/logger';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  Sparkles,
  Calendar,
  Flame,
  Target,
  Award,
  BarChart3,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { Link } from 'react-router-dom';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface InsightStats {
  totalExecutions: number;
  thisWeek: number;
  lastWeek: number;
  weeklyChange: number;
  timeSaved: number; // in minutes
  streak: number;
  topSkills: { name: string; count: number }[];
  dailyActivity: { day: string; count: number }[];
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

const calculateTimeSaved = (executions: SkillExecution[]): number => {
  // Assume each skill execution saves ~15 minutes on average
  const MINUTES_SAVED_PER_SKILL = 15;
  return executions.length * MINUTES_SAVED_PER_SKILL;
};

const calculateStreak = (executions: SkillExecution[]): number => {
  if (executions.length === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dates = executions
    .map((e) => {
      const d = new Date(e.createdAt);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    })
    .filter((d, i, arr) => arr.indexOf(d) === i) // unique dates
    .sort((a, b) => b - a); // newest first

  let streak = 0;
  let currentDate = today.getTime();

  for (const date of dates) {
    if (date === currentDate || date === currentDate - 86400000) {
      streak++;
      currentDate = date;
    } else {
      break;
    }
  }

  return streak;
};

const getDailyActivity = (executions: SkillExecution[]): { day: string; count: number }[] => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const counts: Record<string, number> = {};

  // Get last 7 days
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    counts[days[d.getDay()]] = 0;
  }

  // Count executions per day
  executions.forEach((e) => {
    const d = new Date(e.createdAt);
    const daysSinceToday = Math.floor((Date.now() - d.getTime()) / 86400000);
    if (daysSinceToday < 7) {
      const day = days[d.getDay()];
      counts[day] = (counts[day] || 0) + 1;
    }
  });

  return Object.entries(counts).map(([day, count]) => ({ day, count }));
};

// ═══════════════════════════════════════════════════════════════════════════
// USAGE INSIGHTS COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export interface UsageInsightsProps {
  className?: string;
  compact?: boolean;
}

export const UsageInsights: React.FC<UsageInsightsProps> = ({
  className,
  compact = false,
}) => {
  const [stats, setStats] = useState<InsightStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        await db.init();
        const executions = await db.getRecentExecutions(1000);

        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

        const thisWeekExecs = executions.filter(
          (e) => new Date(e.createdAt) >= weekAgo
        );
        const lastWeekExecs = executions.filter(
          (e) =>
            new Date(e.createdAt) >= twoWeeksAgo &&
            new Date(e.createdAt) < weekAgo
        );

        // Calculate top skills
        const skillCounts: Record<string, number> = {};
        executions.forEach((e) => {
          const name = e.skillName || e.skillId;
          skillCounts[name] = (skillCounts[name] || 0) + 1;
        });
        const topSkills = Object.entries(skillCounts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        const weeklyChange = lastWeekExecs.length > 0
          ? ((thisWeekExecs.length - lastWeekExecs.length) / lastWeekExecs.length) * 100
          : thisWeekExecs.length > 0 ? 100 : 0;

        setStats({
          totalExecutions: executions.length,
          thisWeek: thisWeekExecs.length,
          lastWeek: lastWeekExecs.length,
          weeklyChange: Math.round(weeklyChange),
          timeSaved: calculateTimeSaved(executions),
          streak: calculateStreak(executions),
          topSkills,
          dailyActivity: getDailyActivity(executions),
        });
      } catch (error) {
        logger.error('Failed to load usage stats', { error: error instanceof Error ? error.message : String(error) });
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) {
    return (
      <div className={`animate-pulse space-y-4 ${className || ''}`}>
        <div className="h-32 bg-muted rounded-xl" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-24 bg-muted rounded-xl" />
          <div className="h-24 bg-muted rounded-xl" />
        </div>
      </div>
    );
  }

  if (!stats) return null;

  // Compact version for sidebar/widgets
  if (compact) {
    return (
      <Card size="sm" className={className}>
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm">Your Activity</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-2 rounded-lg bg-muted/50">
            <p className="text-2xl font-bold">{stats.thisWeek}</p>
            <p className="text-xs text-muted-foreground">This week</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted/50">
            <p className="text-2xl font-bold text-amber-500 flex items-center justify-center gap-1">
              <Flame className="h-4 w-4" />
              {stats.streak}
            </p>
            <p className="text-xs text-muted-foreground">Day streak</p>
          </div>
        </div>
        <Link
          to="/progress"
          className="flex items-center justify-center gap-1 mt-3 text-xs text-primary hover:underline"
        >
          View full report
          <ChevronRight className="h-3 w-3" />
        </Link>
      </Card>
    );
  }

  // Full version
  return (
    <div className={`space-y-6 ${className || ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Usage Insights
          </h2>
          <p className="text-sm text-muted-foreground">
            Your productivity metrics at a glance
          </p>
        </div>
        <Link to="/progress">
          <button className="text-sm text-primary hover:underline flex items-center gap-1">
            Full Report
            <ChevronRight className="h-4 w-4" />
          </button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Sparkles className="h-5 w-5 text-primary" />}
          iconBg="bg-primary/10"
          label="Total Runs"
          value={stats.totalExecutions}
        />
        <StatCard
          icon={<Calendar className="h-5 w-5 text-blue-500" />}
          iconBg="bg-blue-500/10"
          label="This Week"
          value={stats.thisWeek}
          change={stats.weeklyChange !== 0 ? {
            value: `${Math.abs(stats.weeklyChange)}%`,
            positive: stats.weeklyChange > 0,
          } : undefined}
        />
        <StatCard
          icon={<Clock className="h-5 w-5 text-emerald-500" />}
          iconBg="bg-emerald-500/10"
          label="Time Saved"
          value={stats.timeSaved >= 60
            ? `${Math.round(stats.timeSaved / 60)}h`
            : `${stats.timeSaved}m`}
        />
        <StatCard
          icon={<Flame className="h-5 w-5 text-amber-500" />}
          iconBg="bg-amber-500/10"
          label="Day Streak"
          value={stats.streak}
        />
      </div>

      {/* Activity Chart */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            Daily Activity
          </h3>
          <span className="text-xs text-muted-foreground">Last 7 days</span>
        </div>
        <div className="flex items-end justify-between h-24 gap-2">
          {stats.dailyActivity.map((day, i) => {
            const maxCount = Math.max(...stats.dailyActivity.map((d) => d.count), 1);
            const height = (day.count / maxCount) * 100;
            const isToday = i === stats.dailyActivity.length - 1;

            return (
              <div key={day.day} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex flex-col items-center">
                  <span className="text-xs text-muted-foreground mb-1">
                    {day.count > 0 && day.count}
                  </span>
                  <div
                    className={`w-full rounded-t transition-all duration-500 ${
                      isToday ? 'bg-primary' : 'bg-primary/30'
                    }`}
                    style={{ height: `${Math.max(height, 4)}%` }}
                  />
                </div>
                <span className={`text-xs ${isToday ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                  {day.day}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Top Skills */}
      {stats.topSkills.length > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Award className="h-4 w-4 text-primary" />
              Top Skills
            </h3>
          </div>
          <div className="space-y-3">
            {stats.topSkills.map((skill, i) => {
              const maxCount = stats.topSkills[0].count;
              const width = (skill.count / maxCount) * 100;

              return (
                <div key={skill.name} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                        {i + 1}
                      </span>
                      <span className="truncate">{skill.name}</span>
                    </span>
                    <span className="text-muted-foreground">{skill.count} runs</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all duration-500"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Motivational message based on stats */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
            <Target className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold mb-1">
              {stats.streak >= 7
                ? "You're on fire! 🔥"
                : stats.thisWeek > stats.lastWeek
                ? 'Great progress this week!'
                : stats.thisWeek > 0
                ? 'Keep up the momentum!'
                : 'Ready to get started?'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {stats.streak >= 7
                ? `${stats.streak}-day streak! You've saved ${Math.round(stats.timeSaved / 60)} hours with AI skills.`
                : stats.thisWeek > stats.lastWeek
                ? `You've run ${stats.thisWeek} skills this week, up ${stats.weeklyChange}% from last week.`
                : stats.thisWeek > 0
                ? `You've run ${stats.thisWeek} skills this week. Try to beat last week's ${stats.lastWeek}!`
                : 'Run your first skill to start tracking your productivity.'}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// MINI INSIGHTS WIDGET - For header or sidebar
// ═══════════════════════════════════════════════════════════════════════════

export const MiniInsights: React.FC<{ className?: string }> = ({ className }) => {
  const [thisWeek, setThisWeek] = useState(0);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const loadStats = async () => {
      try {
        await db.init();
        const executions = await db.getRecentExecutions(100);
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        setThisWeek(
          executions.filter((e) => new Date(e.createdAt) >= weekAgo).length
        );
        setStreak(calculateStreak(executions));
      } catch {
        // Ignore errors
      }
    };

    loadStats();
  }, []);

  if (thisWeek === 0 && streak === 0) return null;

  return (
    <div className={`flex items-center gap-3 text-sm ${className || ''}`}>
      {streak > 0 && (
        <span className="flex items-center gap-1 text-amber-500">
          <Flame className="h-4 w-4" />
          {streak}
        </span>
      )}
      {thisWeek > 0 && (
        <span className="flex items-center gap-1 text-muted-foreground">
          <Sparkles className="h-4 w-4" />
          {thisWeek} this week
        </span>
      )}
    </div>
  );
};

export default UsageInsights;
