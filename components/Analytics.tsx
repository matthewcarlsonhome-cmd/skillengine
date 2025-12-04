/**
 * Analytics Components
 *
 * Reusable analytics visualizations for the Admin panel and dashboard.
 * Provides insights into:
 * - Skill usage patterns
 * - User engagement
 * - API performance
 * - Conversion metrics
 */

import React, { useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Zap,
  Clock,
  Target,
  BarChart3,
  Activity,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.FC<{ className?: string }>;
  iconColor?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export interface BarChartData {
  label: string;
  value: number;
  color?: string;
}

export interface TimeSeriesData {
  date: string;
  value: number;
}

export interface UsageHeatmapData {
  day: string;
  hour: number;
  value: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// METRIC CARD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export function MetricCard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon = Activity,
  iconColor = 'text-primary',
  trend = 'neutral',
}: MetricCardProps): JSX.Element {
  const trendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : null;
  const trendColor =
    trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-muted-foreground';

  return (
    <div className="rounded-xl border bg-card p-6">
      <div className="flex items-center justify-between mb-2">
        <div className={`h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
        {change !== undefined && trendIcon && (
          <div className={`flex items-center gap-1 text-sm ${trendColor}`}>
            {React.createElement(trendIcon, { className: 'h-4 w-4' })}
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </div>
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
      {changeLabel && <p className="text-xs text-muted-foreground mt-1">{changeLabel}</p>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SIMPLE BAR CHART COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export function SimpleBarChart({
  data,
  title,
  maxBars = 10,
  showValues = true,
  height = 200,
}: {
  data: BarChartData[];
  title?: string;
  maxBars?: number;
  showValues?: boolean;
  height?: number;
}): JSX.Element {
  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const displayData = data.slice(0, maxBars);

  return (
    <div className="rounded-xl border bg-card p-6">
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      <div className="space-y-3" style={{ minHeight: height }}>
        {displayData.map((item, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="w-24 text-sm text-muted-foreground truncate" title={item.label}>
              {item.label}
            </div>
            <div className="flex-1 bg-muted rounded-full h-4 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  item.color || 'bg-primary'
                }`}
                style={{ width: `${(item.value / maxValue) * 100}%` }}
              />
            </div>
            {showValues && (
              <div className="w-12 text-sm font-medium text-right">{item.value}</div>
            )}
          </div>
        ))}
        {displayData.length === 0 && (
          <p className="text-center text-muted-foreground py-8">No data available</p>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// DONUT CHART COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export function DonutChart({
  data,
  title,
  centerLabel,
  centerValue,
  size = 200,
}: {
  data: BarChartData[];
  title?: string;
  centerLabel?: string;
  centerValue?: string | number;
  size?: number;
}): JSX.Element {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const radius = size / 2 - 20;
  const circumference = 2 * Math.PI * radius;

  const colors = [
    'stroke-blue-500',
    'stroke-green-500',
    'stroke-purple-500',
    'stroke-amber-500',
    'stroke-red-500',
    'stroke-cyan-500',
  ];

  let currentOffset = 0;

  return (
    <div className="rounded-xl border bg-card p-6">
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      <div className="flex items-center justify-center gap-6">
        <div className="relative" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="transform -rotate-90">
            {/* Background circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              className="stroke-muted"
              strokeWidth="20"
            />
            {/* Data segments */}
            {data.map((item, index) => {
              const percentage = total > 0 ? item.value / total : 0;
              const dashLength = percentage * circumference;
              const segment = (
                <circle
                  key={index}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  className={item.color || colors[index % colors.length]}
                  strokeWidth="20"
                  strokeDasharray={`${dashLength} ${circumference}`}
                  strokeDashoffset={-currentOffset}
                  strokeLinecap="round"
                />
              );
              currentOffset += dashLength;
              return segment;
            })}
          </svg>
          {/* Center text */}
          {(centerLabel || centerValue) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {centerValue !== undefined && (
                <span className="text-2xl font-bold">{centerValue}</span>
              )}
              {centerLabel && (
                <span className="text-xs text-muted-foreground">{centerLabel}</span>
              )}
            </div>
          )}
        </div>
        {/* Legend */}
        <div className="space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  item.color?.replace('stroke-', 'bg-') ||
                  colors[index % colors.length].replace('stroke-', 'bg-')
                }`}
              />
              <span className="text-sm text-muted-foreground">{item.label}</span>
              <span className="text-sm font-medium">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SPARKLINE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export function Sparkline({
  data,
  color = 'stroke-primary',
  width = 100,
  height = 30,
}: {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
}): JSX.Element {
  if (data.length < 2) return <div style={{ width, height }} />;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        className={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ACTIVITY HEATMAP COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export function ActivityHeatmap({
  data,
  title,
}: {
  data: UsageHeatmapData[];
  title?: string;
}): JSX.Element {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const maxValue = Math.max(...data.map((d) => d.value), 1);

  const getIntensity = (day: string, hour: number): number => {
    const entry = data.find((d) => d.day === day && d.hour === hour);
    return entry ? entry.value / maxValue : 0;
  };

  return (
    <div className="rounded-xl border bg-card p-6">
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      <div className="overflow-x-auto">
        <div className="flex gap-1">
          <div className="w-10" />
          {hours.filter((h) => h % 4 === 0).map((hour) => (
            <div key={hour} className="w-4 text-xs text-muted-foreground text-center">
              {hour}
            </div>
          ))}
        </div>
        {days.map((day) => (
          <div key={day} className="flex gap-1 items-center mt-1">
            <div className="w-10 text-xs text-muted-foreground">{day}</div>
            {hours.map((hour) => {
              const intensity = getIntensity(day, hour);
              return (
                <div
                  key={hour}
                  className="w-4 h-4 rounded-sm transition-colors"
                  style={{
                    backgroundColor: `rgba(var(--primary-rgb, 59, 130, 246), ${intensity})`,
                  }}
                  title={`${day} ${hour}:00 - Activity: ${Math.round(intensity * 100)}%`}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// STATS GRID COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export interface StatsGridItem {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.FC<{ className?: string }>;
  trend?: 'up' | 'down' | 'neutral';
  change?: number;
}

export function StatsGrid({
  items,
  columns = 4,
}: {
  items: StatsGridItem[];
  columns?: 2 | 3 | 4;
}): JSX.Element {
  const gridCols = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4',
  };

  const iconMap: Record<string, React.FC<{ className?: string }>> = {
    users: Users,
    zap: Zap,
    clock: Clock,
    target: Target,
    chart: BarChart3,
  };

  return (
    <div className={`grid grid-cols-1 ${gridCols[columns]} gap-4`}>
      {items.map((item, index) => (
        <MetricCard
          key={index}
          title={item.title}
          value={item.value}
          icon={item.icon || Activity}
          change={item.change}
          changeLabel={item.description}
          trend={item.trend}
        />
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY: Generate usage analytics from skill executions
// ═══════════════════════════════════════════════════════════════════════════

export interface SkillExecution {
  skillId: string;
  skillName: string;
  createdAt: string;
  durationMs?: number;
  model?: string;
}

export function generateSkillAnalytics(executions: SkillExecution[]) {
  // Skills by usage
  const skillUsage = executions.reduce(
    (acc, exec) => {
      acc[exec.skillName] = (acc[exec.skillName] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const topSkills: BarChartData[] = Object.entries(skillUsage)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([label, value]) => ({ label, value }));

  // Usage by day
  const usageByDay = executions.reduce(
    (acc, exec) => {
      const day = new Date(exec.createdAt).toLocaleDateString('en-US', { weekday: 'short' });
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  // Usage by hour
  const usageByHour = executions.reduce(
    (acc, exec) => {
      const hour = new Date(exec.createdAt).getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    },
    {} as Record<number, number>
  );

  // Average execution time
  const execTimes = executions.filter((e) => e.durationMs).map((e) => e.durationMs!);
  const avgExecTime = execTimes.length > 0
    ? Math.round(execTimes.reduce((a, b) => a + b, 0) / execTimes.length / 1000)
    : 0;

  // Model usage
  const modelUsage = executions.reduce(
    (acc, exec) => {
      const model = exec.model || 'unknown';
      acc[model] = (acc[model] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const modelData: BarChartData[] = Object.entries(modelUsage).map(([label, value]) => ({
    label: label.charAt(0).toUpperCase() + label.slice(1),
    value,
  }));

  // Daily trend (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split('T')[0];
  });

  const dailyTrend = last7Days.map((date) => {
    const count = executions.filter(
      (e) => e.createdAt.split('T')[0] === date
    ).length;
    return count;
  });

  return {
    topSkills,
    usageByDay,
    usageByHour,
    avgExecTime,
    modelData,
    dailyTrend,
    totalExecutions: executions.length,
  };
}

export default {
  MetricCard,
  SimpleBarChart,
  DonutChart,
  Sparkline,
  ActivityHeatmap,
  StatsGrid,
  generateSkillAnalytics,
};
