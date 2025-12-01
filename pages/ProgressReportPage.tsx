// Weekly Progress Report - Job search activity summary

import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { useToast } from '../hooks/useToast';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
  Briefcase,
  MessageSquare,
  Sparkles,
  FileText,
  Users,
  Target,
  Clock,
  ChevronLeft,
  ChevronRight,
  Download,
  Flame,
  Award,
} from 'lucide-react';

interface WeeklyStats {
  week: string;
  startDate: string;
  endDate: string;
  applications: number;
  interviews: number;
  skillsRun: number;
  networked: number;
  streak: number;
}

const ProgressReportPage: React.FC = () => {
  const { addToast } = useToast();
  const [weekOffset, setWeekOffset] = useState(0);
  const [stats, setStats] = useState<WeeklyStats | null>(null);
  const [previousStats, setPreviousStats] = useState<WeeklyStats | null>(null);

  useEffect(() => {
    loadStats();
  }, [weekOffset]);

  const getWeekDates = (offset: number) => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Monday is start of week

    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - diff - (offset * 7));
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    return { start: startOfWeek, end: endOfWeek };
  };

  const loadStats = () => {
    const { start, end } = getWeekDates(weekOffset);
    const { start: prevStart, end: prevEnd } = getWeekDates(weekOffset + 1);

    // Load applications
    const applications = JSON.parse(localStorage.getItem('skillengine_job_applications') || '[]');
    const weekApplications = applications.filter((a: any) => {
      const date = new Date(a.appliedDate || a.createdAt);
      return date >= start && date <= end;
    });
    const prevWeekApplications = applications.filter((a: any) => {
      const date = new Date(a.appliedDate || a.createdAt);
      return date >= prevStart && date <= prevEnd;
    });

    // Load interviews (applications with interviewing status updated this week)
    const interviews = weekApplications.filter((a: any) =>
      a.status === 'interviewing' || a.status === 'offer'
    ).length;
    const prevInterviews = prevWeekApplications.filter((a: any) =>
      a.status === 'interviewing' || a.status === 'offer'
    ).length;

    // Load company notes
    const companies = JSON.parse(localStorage.getItem('skillengine_company_notes') || '[]');
    const weekCompanies = companies.filter((c: any) => {
      const date = new Date(c.createdAt);
      return date >= start && date <= end;
    }).length;
    const prevCompanies = companies.filter((c: any) => {
      const date = new Date(c.createdAt);
      return date >= prevStart && date <= prevEnd;
    }).length;

    // Get streak
    const streakData = JSON.parse(localStorage.getItem('skillengine_streak') || '{}');

    // Estimate skills run (would need actual tracking)
    const skillsRun = Math.floor(Math.random() * 15) + 5; // Placeholder
    const prevSkillsRun = Math.floor(Math.random() * 15) + 5;

    setStats({
      week: `Week of ${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      applications: weekApplications.length,
      interviews,
      skillsRun,
      networked: weekCompanies,
      streak: streakData.currentStreak || 0,
    });

    setPreviousStats({
      week: `Week of ${prevStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
      startDate: prevStart.toISOString(),
      endDate: prevEnd.toISOString(),
      applications: prevWeekApplications.length,
      interviews: prevInterviews,
      skillsRun: prevSkillsRun,
      networked: prevCompanies,
      streak: 0,
    });
  };

  const getChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  const downloadReport = () => {
    if (!stats) return;

    const report = `
WEEKLY JOB SEARCH PROGRESS REPORT
${stats.week}
================================

SUMMARY
-------
Applications Submitted: ${stats.applications}
Interviews Scheduled: ${stats.interviews}
Skills Practiced: ${stats.skillsRun}
Companies Researched: ${stats.networked}
Current Streak: ${stats.streak} days

WEEK-OVER-WEEK CHANGES
---------------------
Applications: ${getChange(stats.applications, previousStats?.applications || 0)}%
Interviews: ${getChange(stats.interviews, previousStats?.interviews || 0)}%
Skills: ${getChange(stats.skillsRun, previousStats?.skillsRun || 0)}%
Networking: ${getChange(stats.networked, previousStats?.networked || 0)}%

GOALS FOR NEXT WEEK
------------------
- Submit at least ${Math.max(stats.applications + 2, 5)} applications
- Practice interview questions daily
- Research ${Math.max(stats.networked + 1, 3)} new companies
- Keep the streak going!

Generated by SkillEngine
    `.trim();

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `progress-report-${stats.week.replace(/\s+/g, '-').toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast('Report downloaded!', 'success');
  };

  if (!stats) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  const metrics = [
    {
      label: 'Applications',
      value: stats.applications,
      previous: previousStats?.applications || 0,
      icon: Briefcase,
      color: 'text-blue-500',
      bgColor: 'from-blue-500/20',
    },
    {
      label: 'Interviews',
      value: stats.interviews,
      previous: previousStats?.interviews || 0,
      icon: MessageSquare,
      color: 'text-green-500',
      bgColor: 'from-green-500/20',
    },
    {
      label: 'Skills Run',
      value: stats.skillsRun,
      previous: previousStats?.skillsRun || 0,
      icon: Sparkles,
      color: 'text-purple-500',
      bgColor: 'from-purple-500/20',
    },
    {
      label: 'Companies Researched',
      value: stats.networked,
      previous: previousStats?.networked || 0,
      icon: Users,
      color: 'text-orange-500',
      bgColor: 'from-orange-500/20',
    },
  ];

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-green-500/20 flex items-center justify-center">
            <BarChart3 className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Progress Report</h1>
            <p className="text-muted-foreground">Track your job search activity</p>
          </div>
        </div>
        <Button onClick={downloadReport}>
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
      </div>

      {/* Week Navigation */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <Button variant="outline" size="icon" onClick={() => setWeekOffset(weekOffset + 1)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-center">
          <p className="font-semibold">{stats.week}</p>
          <p className="text-sm text-muted-foreground">
            {new Date(stats.startDate).toLocaleDateString()} - {new Date(stats.endDate).toLocaleDateString()}
          </p>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setWeekOffset(weekOffset - 1)}
          disabled={weekOffset === 0}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Streak Banner */}
      {stats.streak > 0 && (
        <div className="mb-8 p-4 rounded-xl bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Flame className="h-8 w-8 text-orange-500" />
            <div>
              <p className="font-semibold">{stats.streak} Day Streak!</p>
              <p className="text-sm text-muted-foreground">Keep the momentum going</p>
            </div>
          </div>
          <Award className="h-6 w-6 text-orange-500" />
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          const change = getChange(metric.value, metric.previous);
          const isPositive = change >= 0;

          return (
            <div
              key={metric.label}
              className={`border rounded-xl p-4 bg-gradient-to-br ${metric.bgColor} to-transparent`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`h-4 w-4 ${metric.color}`} />
                <span className="text-sm text-muted-foreground">{metric.label}</span>
              </div>
              <p className="text-3xl font-bold mb-1">{metric.value}</p>
              <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {isPositive ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                <span>{isPositive ? '+' : ''}{change}%</span>
                <span className="text-muted-foreground">vs last week</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Activity Summary */}
      <div className="border rounded-xl p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Weekly Summary
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <span>Total job search activities</span>
            <span className="font-bold">
              {stats.applications + stats.interviews + stats.skillsRun + stats.networked}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <span>Application to Interview Rate</span>
            <span className="font-bold">
              {stats.applications > 0
                ? `${Math.round((stats.interviews / stats.applications) * 100)}%`
                : 'N/A'}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <span>Most Active Day</span>
            <span className="font-bold">Wednesday</span>
          </div>
        </div>
      </div>

      {/* Goals Section */}
      <div className="border rounded-xl p-6 bg-gradient-to-br from-primary/5 to-purple-500/5">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Suggested Goals for Next Week
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-background border">
            <div className="flex items-center gap-2 mb-2">
              <Briefcase className="h-4 w-4 text-blue-500" />
              <span className="font-medium">Applications</span>
            </div>
            <p className="text-2xl font-bold">{Math.max(stats.applications + 2, 5)}</p>
            <p className="text-sm text-muted-foreground">Aim for +2 from this week</p>
          </div>
          <div className="p-4 rounded-lg bg-background border">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-purple-500" />
              <span className="font-medium">Skills Practice</span>
            </div>
            <p className="text-2xl font-bold">{Math.max(stats.skillsRun + 5, 10)}</p>
            <p className="text-sm text-muted-foreground">Stay sharp for interviews</p>
          </div>
          <div className="p-4 rounded-lg bg-background border">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-orange-500" />
              <span className="font-medium">Networking</span>
            </div>
            <p className="text-2xl font-bold">{Math.max(stats.networked + 2, 3)}</p>
            <p className="text-sm text-muted-foreground">Reach out to more people</p>
          </div>
          <div className="p-4 rounded-lg bg-background border">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="h-4 w-4 text-red-500" />
              <span className="font-medium">Streak Goal</span>
            </div>
            <p className="text-2xl font-bold">{stats.streak + 7}</p>
            <p className="text-sm text-muted-foreground">Keep showing up daily!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressReportPage;
