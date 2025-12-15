/**
 * Insights Page
 *
 * Unified observability dashboard showing:
 * - System health status
 * - Execution metrics (latency, success rate)
 * - Cost tracking and budgets
 * - Active alerts
 * - Audit log
 */

import React, { useState, useEffect } from 'react';
import {
  Activity,
  AlertTriangle,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  BarChart3,
  Shield,
  FileText,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Filter,
} from 'lucide-react';
import {
  getHealthStatus,
  getGlobalMetricsSummary,
  getRecentTraces,
  getAllLatencyBudgets,
  getAllErrorBudgets,
  getAlertEvents,
  getCostSummary,
  getCostRecords,
  getAuditLog,
  type HealthStatus,
  type MetricsSummary,
  type ExecutionTrace,
  type LatencyBudget,
  type ErrorBudget,
  type AlertEvent,
  type CostRecord,
  type AuditLogEntry,
} from '../lib/enhanced';

// ═══════════════════════════════════════════════════════════════════════════
// STATUS BADGE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface StatusBadgeProps {
  status: 'healthy' | 'degraded' | 'unhealthy' | 'success' | 'error' | 'pending' | 'running';
  size?: 'sm' | 'md';
}

function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const colors = {
    healthy: 'bg-green-500/20 text-green-400 border-green-500/30',
    success: 'bg-green-500/20 text-green-400 border-green-500/30',
    degraded: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    pending: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    running: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    unhealthy: 'bg-red-500/20 text-red-400 border-red-500/30',
    error: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span className={`inline-flex items-center rounded-full border ${colors[status]} ${sizeClasses} font-medium`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// METRIC CARD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  status?: 'healthy' | 'degraded' | 'unhealthy';
}

function MetricCard({ title, value, subtitle, icon, trend, trendValue, status }: MetricCardProps) {
  const statusColors = {
    healthy: 'border-green-500/30',
    degraded: 'border-yellow-500/30',
    unhealthy: 'border-red-500/30',
  };

  const trendColors = {
    up: 'text-green-400',
    down: 'text-red-400',
    neutral: 'text-gray-400',
  };

  return (
    <div className={`bg-gray-800/50 rounded-xl border ${status ? statusColors[status] : 'border-gray-700/50'} p-6`}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-gray-400 text-sm font-medium">{title}</span>
        <div className="p-2 bg-gray-700/50 rounded-lg">
          {icon}
        </div>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-3xl font-bold text-white">{value}</p>
          {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
        </div>
        {trend && trendValue && (
          <div className={`flex items-center gap-1 ${trendColors[trend]}`}>
            <TrendingUp className={`w-4 h-4 ${trend === 'down' ? 'rotate-180' : ''}`} />
            <span className="text-sm">{trendValue}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN INSIGHTS PAGE
// ═══════════════════════════════════════════════════════════════════════════

export default function InsightsPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'traces' | 'costs' | 'alerts' | 'audit'>('overview');
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [metrics, setMetrics] = useState<MetricsSummary | null>(null);
  const [traces, setTraces] = useState<ExecutionTrace[]>([]);
  const [latencyBudgets, setLatencyBudgets] = useState<LatencyBudget[]>([]);
  const [errorBudgets, setErrorBudgets] = useState<ErrorBudget[]>([]);
  const [alerts, setAlerts] = useState<AlertEvent[]>([]);
  const [costRecords, setCostRecords] = useState<CostRecord[]>([]);
  const [auditEntries, setAuditEntries] = useState<AuditLogEntry[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load data
  const loadData = () => {
    setIsRefreshing(true);
    try {
      setHealth(getHealthStatus());
      setMetrics(getGlobalMetricsSummary());
      setTraces(getRecentTraces({ limit: 50 }));
      setLatencyBudgets(getAllLatencyBudgets());
      setErrorBudgets(getAllErrorBudgets());
      setAlerts(getAlertEvents(50));
      setCostRecords(getCostRecords({ limit: 50 }));
      setAuditEntries(getAuditLog({ limit: 50 }));
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'traces', label: 'Traces', icon: Activity },
    { id: 'costs', label: 'Costs', icon: DollarSign },
    { id: 'alerts', label: 'Alerts', icon: AlertTriangle },
    { id: 'audit', label: 'Audit Log', icon: FileText },
  ] as const;

  const costSummary = getCostSummary();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Insights</h1>
            <p className="text-gray-400 mt-1">Observability, costs, and compliance monitoring</p>
          </div>
          <button
            onClick={loadData}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Health Status Banner */}
        {health && (
          <div className={`mb-8 p-4 rounded-xl border ${
            health.overall === 'healthy' ? 'bg-green-500/10 border-green-500/30' :
            health.overall === 'degraded' ? 'bg-yellow-500/10 border-yellow-500/30' :
            'bg-red-500/10 border-red-500/30'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {health.overall === 'healthy' ? (
                  <CheckCircle className="w-8 h-8 text-green-400" />
                ) : health.overall === 'degraded' ? (
                  <AlertTriangle className="w-8 h-8 text-yellow-400" />
                ) : (
                  <XCircle className="w-8 h-8 text-red-400" />
                )}
                <div>
                  <h2 className="text-xl font-semibold">
                    System {health.overall.charAt(0).toUpperCase() + health.overall.slice(1)}
                  </h2>
                  <p className="text-sm text-gray-400">
                    Last updated: {new Date(health.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                {health.components.map(component => (
                  <div key={component.name} className="text-center">
                    <StatusBadge status={component.status} size="sm" />
                    <p className="text-xs text-gray-400 mt-1">{component.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 border-b border-gray-700/50 pb-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.id === 'alerts' && alerts.filter(a => !a.resolvedAt).length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full">
                  {alerts.filter(a => !a.resolvedAt).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Success Rate"
                value={`${((metrics?.successRate || 0) * 100).toFixed(1)}%`}
                subtitle={`${metrics?.successCount || 0} / ${metrics?.totalExecutions || 0} executions`}
                icon={<CheckCircle className="w-5 h-5 text-green-400" />}
                status={
                  (metrics?.successRate || 0) >= 0.95 ? 'healthy' :
                  (metrics?.successRate || 0) >= 0.90 ? 'degraded' : 'unhealthy'
                }
              />
              <MetricCard
                title="Avg Latency"
                value={`${((metrics?.avgLatencyMs || 0) / 1000).toFixed(1)}s`}
                subtitle={`P95: ${((metrics?.p95LatencyMs || 0) / 1000).toFixed(1)}s`}
                icon={<Clock className="w-5 h-5 text-blue-400" />}
                status={
                  (metrics?.p95LatencyMs || 0) < 15000 ? 'healthy' :
                  (metrics?.p95LatencyMs || 0) < 30000 ? 'degraded' : 'unhealthy'
                }
              />
              <MetricCard
                title="Total Cost"
                value={`$${(costSummary.totalCost).toFixed(2)}`}
                subtitle={`${costSummary.executionCount} executions`}
                icon={<DollarSign className="w-5 h-5 text-yellow-400" />}
              />
              <MetricCard
                title="Active Alerts"
                value={alerts.filter(a => !a.resolvedAt).length}
                subtitle={`${alerts.filter(a => a.severity === 'critical' && !a.resolvedAt).length} critical`}
                icon={<AlertTriangle className="w-5 h-5 text-red-400" />}
                status={
                  alerts.filter(a => !a.resolvedAt).length === 0 ? 'healthy' :
                  alerts.filter(a => a.severity === 'critical' && !a.resolvedAt).length === 0 ? 'degraded' : 'unhealthy'
                }
              />
            </div>

            {/* Budgets */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Latency Budgets */}
              <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-400" />
                  Latency Budgets
                </h3>
                <div className="space-y-4">
                  {latencyBudgets.map(budget => (
                    <div key={budget.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{budget.name}</span>
                        <StatusBadge
                          status={budget.withinBudget ? 'healthy' : 'unhealthy'}
                          size="sm"
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div className="bg-gray-700/30 rounded p-2">
                          <p className="text-gray-400">P50</p>
                          <p className="font-mono">{budget.currentP50Ms?.toFixed(0) || '-'}ms</p>
                        </div>
                        <div className="bg-gray-700/30 rounded p-2">
                          <p className="text-gray-400">P95</p>
                          <p className="font-mono">{budget.currentP95Ms?.toFixed(0) || '-'}ms</p>
                        </div>
                        <div className="bg-gray-700/30 rounded p-2">
                          <p className="text-gray-400">P99</p>
                          <p className="font-mono">{budget.currentP99Ms?.toFixed(0) || '-'}ms</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Error Budgets */}
              <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-purple-400" />
                  Error Budgets
                </h3>
                <div className="space-y-4">
                  {errorBudgets.map(budget => {
                    const remaining = budget.budgetRemaining || 100;
                    return (
                      <div key={budget.id} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{budget.name}</span>
                          <span className="text-sm text-gray-400">
                            {remaining.toFixed(0)}% remaining
                          </span>
                        </div>
                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              remaining > 50 ? 'bg-green-500' :
                              remaining > 20 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${Math.max(0, remaining)}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-gray-400">
                          <span>Target: {((budget.targetSuccessRate || 0) * 100).toFixed(1)}%</span>
                          <span>Current: {((budget.currentSuccessRate || 0) * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-400" />
                Recent Executions
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-gray-400 text-sm border-b border-gray-700/50">
                      <th className="pb-3 font-medium">Entity</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium">Duration</th>
                      <th className="pb-3 font-medium">Cost</th>
                      <th className="pb-3 font-medium">Time</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {traces.slice(0, 10).map(trace => (
                      <tr key={trace.id} className="border-b border-gray-700/30">
                        <td className="py-3">
                          <div>
                            <p className="font-medium">{trace.entityName}</p>
                            <p className="text-gray-400 text-xs">{trace.type}</p>
                          </div>
                        </td>
                        <td className="py-3">
                          <StatusBadge status={trace.status} size="sm" />
                        </td>
                        <td className="py-3 font-mono">
                          {trace.durationMs ? `${(trace.durationMs / 1000).toFixed(1)}s` : '-'}
                        </td>
                        <td className="py-3 font-mono">
                          {trace.actualCost ? `$${trace.actualCost.toFixed(4)}` : '-'}
                        </td>
                        <td className="py-3 text-gray-400">
                          {new Date(trace.startedAt).toLocaleTimeString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'traces' && (
          <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6">
            <h3 className="text-lg font-semibold mb-4">Execution Traces</h3>
            <div className="space-y-3">
              {traces.map(trace => (
                <div
                  key={trace.id}
                  className="p-4 bg-gray-700/30 rounded-lg border border-gray-700/50"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{trace.entityName}</p>
                      <p className="text-sm text-gray-400">
                        {trace.type} • {trace.provider}/{trace.model}
                      </p>
                    </div>
                    <StatusBadge status={trace.status} />
                  </div>
                  <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">Duration</p>
                      <p className="font-mono">{trace.durationMs ? `${(trace.durationMs / 1000).toFixed(2)}s` : '-'}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Input Tokens</p>
                      <p className="font-mono">{trace.inputTokens?.toLocaleString() || '-'}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Output Tokens</p>
                      <p className="font-mono">{trace.outputTokens?.toLocaleString() || '-'}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Cost</p>
                      <p className="font-mono">${trace.actualCost?.toFixed(4) || '-'}</p>
                    </div>
                  </div>
                  {trace.error && (
                    <div className="mt-3 p-2 bg-red-500/10 border border-red-500/20 rounded text-sm">
                      <p className="text-red-400">{trace.error.code}: {trace.error.message}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'costs' && (
          <div className="space-y-6">
            {/* Cost Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MetricCard
                title="Total Cost"
                value={`$${costSummary.totalCost.toFixed(2)}`}
                subtitle={`${costSummary.totalTokens.toLocaleString()} tokens`}
                icon={<DollarSign className="w-5 h-5 text-yellow-400" />}
              />
              <MetricCard
                title="Avg Cost per Run"
                value={`$${costSummary.avgCostPerExecution.toFixed(4)}`}
                subtitle={`${costSummary.executionCount} executions`}
                icon={<BarChart3 className="w-5 h-5 text-blue-400" />}
              />
              <MetricCard
                title="Executions"
                value={costSummary.executionCount}
                icon={<Activity className="w-5 h-5 text-green-400" />}
              />
            </div>

            {/* Cost by Provider */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6">
                <h3 className="text-lg font-semibold mb-4">Cost by Provider</h3>
                <div className="space-y-4">
                  {Object.entries(costSummary.byProvider).map(([provider, data]) => (
                    <div key={provider} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium capitalize">{provider}</p>
                        <p className="text-sm text-gray-400">{data.count} executions</p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono">${data.cost.toFixed(4)}</p>
                        <p className="text-sm text-gray-400">{data.tokens.toLocaleString()} tokens</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6">
                <h3 className="text-lg font-semibold mb-4">Cost by Model</h3>
                <div className="space-y-4">
                  {Object.entries(costSummary.byModel).map(([model, data]) => (
                    <div key={model} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{model}</p>
                        <p className="text-sm text-gray-400">{data.count} executions</p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono">${data.cost.toFixed(4)}</p>
                        <p className="text-sm text-gray-400">{data.tokens.toLocaleString()} tokens</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Cost Records */}
            <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Cost Records</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-gray-400 text-sm border-b border-gray-700/50">
                      <th className="pb-3 font-medium">Execution</th>
                      <th className="pb-3 font-medium">Model</th>
                      <th className="pb-3 font-medium">Tokens</th>
                      <th className="pb-3 font-medium">Cost</th>
                      <th className="pb-3 font-medium">Time</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {costRecords.map(record => (
                      <tr key={record.id} className="border-b border-gray-700/30">
                        <td className="py-3">
                          <p className="font-medium">{record.skillId || record.workflowId}</p>
                        </td>
                        <td className="py-3 text-gray-400">{record.model}</td>
                        <td className="py-3 font-mono">{record.totalTokens.toLocaleString()}</td>
                        <td className="py-3 font-mono">${record.cost.toFixed(4)}</td>
                        <td className="py-3 text-gray-400">
                          {new Date(record.timestamp).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className="space-y-4">
            {alerts.length === 0 ? (
              <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-12 text-center">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Alerts</h3>
                <p className="text-gray-400">All systems operating normally</p>
              </div>
            ) : (
              alerts.map(alert => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-xl border ${
                    alert.severity === 'critical' ? 'bg-red-500/10 border-red-500/30' :
                    alert.severity === 'warning' ? 'bg-yellow-500/10 border-yellow-500/30' :
                    'bg-blue-500/10 border-blue-500/30'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className={`w-5 h-5 mt-0.5 ${
                        alert.severity === 'critical' ? 'text-red-400' :
                        alert.severity === 'warning' ? 'text-yellow-400' : 'text-blue-400'
                      }`} />
                      <div>
                        <p className="font-medium">{alert.ruleName}</p>
                        <p className="text-sm text-gray-400 mt-1">{alert.message}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(alert.triggeredAt).toLocaleString()}
                          {alert.resolvedAt && ` • Resolved: ${new Date(alert.resolvedAt).toLocaleString()}`}
                        </p>
                      </div>
                    </div>
                    <StatusBadge
                      status={alert.resolvedAt ? 'healthy' : alert.severity === 'critical' ? 'unhealthy' : 'degraded'}
                      size="sm"
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6">
            <h3 className="text-lg font-semibold mb-4">Audit Log</h3>
            <div className="space-y-3">
              {auditEntries.map(entry => (
                <div
                  key={entry.id}
                  className="p-4 bg-gray-700/30 rounded-lg border border-gray-700/50"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">
                        {entry.actorEmail} {entry.action} {entry.resourceType}
                      </p>
                      <p className="text-sm text-gray-400">
                        {entry.resourceName || entry.resourceId}
                      </p>
                    </div>
                    <StatusBadge
                      status={entry.result === 'success' ? 'success' : entry.result === 'blocked' ? 'error' : 'degraded'}
                      size="sm"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(entry.timestamp).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
