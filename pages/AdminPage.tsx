/**
 * AdminPage.tsx - Admin Control Panel
 *
 * A comprehensive admin dashboard for managing:
 * - User roles and permissions
 * - Captured email list for follow-up
 * - Role configuration (limits and features)
 * - Skill usage analytics
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Users,
  Mail,
  Settings,
  BarChart3,
  Download,
  Trash2,
  Edit2,
  Save,
  X,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Check,
  Crown,
  Zap,
  Building2,
  Star,
  RefreshCw,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Select } from '../components/ui/Select';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../hooks/useAuth';
import {
  getRoleConfigs,
  saveRoleConfigs,
  getCapturedEmails,
  updateCapturedEmail,
  deleteCapturedEmail,
  getSkillUsageRecords,
  getAdminStats,
  exportEmailsToCSV,
  exportSkillUsageToCSV,
  getAdminEmails,
  setAdminEmails,
  isAdminEmail,
  hasAdminSetup,
  getCurrentAppUser,
} from '../lib/admin';
import type {
  RoleConfig,
  UserRole,
  CapturedEmail,
  SkillUsageRecord,
} from '../lib/storage/types';

type TabId = 'overview' | 'emails' | 'roles' | 'usage' | 'settings';

const ROLE_ICONS: Record<UserRole, React.FC<{ className?: string }>> = {
  free: Users,
  pro: Zap,
  team: Building2,
  custom: Crown,
};

const ROLE_COLORS: Record<UserRole, string> = {
  free: 'text-gray-500',
  pro: 'text-blue-500',
  team: 'text-purple-500',
  custom: 'text-amber-500',
};

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { user } = useAuth();

  // Check admin access
  const currentUser = getCurrentAppUser();
  const isAdmin = currentUser?.isAdmin || (user?.email && isAdminEmail(user.email));
  const adminSetupComplete = hasAdminSetup();
  const isBootstrapMode = !adminSetupComplete; // No admins configured yet

  // In bootstrap mode, default to settings tab; otherwise overview
  const [activeTab, setActiveTab] = useState<TabId>(isBootstrapMode ? 'settings' : 'overview');
  const [stats, setStats] = useState(getAdminStats());
  const [roleConfigs, setRoleConfigs] = useState<RoleConfig[]>(getRoleConfigs());
  const [emails, setEmails] = useState<CapturedEmail[]>(getCapturedEmails());
  const [usageRecords, setUsageRecords] = useState<SkillUsageRecord[]>(getSkillUsageRecords());
  const [adminEmailList, setAdminEmailList] = useState<string>(getAdminEmails().join('\n'));
  const [editingRole, setEditingRole] = useState<UserRole | null>(null);

  useEffect(() => {
    // If admin setup is complete and user is not admin, redirect
    if (adminSetupComplete && !isAdmin) {
      navigate('/');
      addToast('Admin access required', 'error');
    }
  }, [adminSetupComplete, isAdmin, navigate, addToast]);

  const refreshData = () => {
    setStats(getAdminStats());
    setRoleConfigs(getRoleConfigs());
    setEmails(getCapturedEmails());
    setUsageRecords(getSkillUsageRecords());
    addToast('Data refreshed', 'success');
  };

  const handleExportEmails = () => {
    const csv = exportEmailsToCSV();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `skillengine-emails-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast('Emails exported', 'success');
  };

  const handleExportUsage = () => {
    const csv = exportSkillUsageToCSV();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `skillengine-usage-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast('Usage data exported', 'success');
  };

  const handleUpdateEmailStatus = (email: string, status: CapturedEmail['followUpStatus']) => {
    updateCapturedEmail(email, { followUpStatus: status });
    setEmails(getCapturedEmails());
    addToast('Status updated', 'success');
  };

  const handleDeleteEmail = (email: string) => {
    if (confirm(`Delete ${email} from the list?`)) {
      deleteCapturedEmail(email);
      setEmails(getCapturedEmails());
      addToast('Email removed', 'success');
    }
  };

  const handleSaveRoleConfig = (config: RoleConfig) => {
    const updatedConfigs = roleConfigs.map(c =>
      c.role === config.role ? config : c
    );
    saveRoleConfigs(updatedConfigs);
    setRoleConfigs(updatedConfigs);
    setEditingRole(null);
    addToast('Role configuration saved', 'success');
  };

  const handleSaveAdminEmails = () => {
    const emails = adminEmailList
      .split('\n')
      .map(e => e.trim().toLowerCase())
      .filter(e => e.length > 0 && e.includes('@'));
    setAdminEmails(emails);
    addToast('Admin emails updated. Refreshing...', 'success');

    // Reload the page to apply new admin status
    // This ensures the user gets full access if they added their email
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  const tabs: { id: TabId; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'emails', label: 'Email List', icon: Mail },
    { id: 'roles', label: 'Role Config', icon: Crown },
    { id: 'usage', label: 'Skill Usage', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
            <Shield className="h-7 w-7 text-amber-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Admin Control Panel</h1>
            <p className="text-muted-foreground">Manage users, roles, and configurations</p>
          </div>
        </div>
        <Button variant="outline" onClick={refreshData}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Bootstrap Mode Notice */}
      {isBootstrapMode && (
        <div className="mb-6 p-4 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-start gap-3">
          <Shield className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-blue-600 dark:text-blue-400">Initial Admin Setup</p>
            <p className="text-sm text-muted-foreground mt-1">
              No admin has been configured yet. Add your email address in the Settings tab below to become the admin.
              Once saved, only admin users will be able to access this panel.
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b mb-6">
        <div className="flex gap-1 -mb-px">
          {tabs.map(tab => {
            // In bootstrap mode, only allow settings tab
            const isDisabled = isBootstrapMode && tab.id !== 'settings';
            return (
              <button
                key={tab.id}
                onClick={() => !isDisabled && setActiveTab(tab.id)}
                disabled={isDisabled}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : isDisabled
                    ? 'border-transparent text-muted-foreground/50 cursor-not-allowed'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[500px]">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="rounded-xl border bg-card p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  <span className="text-sm font-medium text-muted-foreground">Total Users</span>
                </div>
                <p className="text-3xl font-bold">{stats.totalUsers}</p>
              </div>
              <div className="rounded-xl border bg-card p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Zap className="h-5 w-5 text-green-500" />
                  <span className="text-sm font-medium text-muted-foreground">Total Skill Runs</span>
                </div>
                <p className="text-3xl font-bold">{stats.totalSkillRuns}</p>
              </div>
              <div className="rounded-xl border bg-card p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Mail className="h-5 w-5 text-purple-500" />
                  <span className="text-sm font-medium text-muted-foreground">Emails Captured</span>
                </div>
                <p className="text-3xl font-bold">{stats.emailsCaptures}</p>
              </div>
              <div className="rounded-xl border bg-card p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Star className="h-5 w-5 text-amber-500" />
                  <span className="text-sm font-medium text-muted-foreground">Pending Follow-ups</span>
                </div>
                <p className="text-3xl font-bold">{stats.emailsByStatus['pending'] || 0}</p>
              </div>
            </div>

            {/* Users by Role */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-xl border bg-card p-6">
                <h3 className="text-lg font-semibold mb-4">Users by Role</h3>
                <div className="space-y-3">
                  {Object.entries(stats.usersByRole).map(([role, count]) => {
                    const RoleIcon = ROLE_ICONS[role as UserRole];
                    return (
                      <div key={role} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <RoleIcon className={`h-4 w-4 ${ROLE_COLORS[role as UserRole]}`} />
                          <span className="capitalize">{role}</span>
                        </div>
                        <span className="font-medium">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-xl border bg-card p-6">
                <h3 className="text-lg font-semibold mb-4">Top Skills</h3>
                <div className="space-y-3">
                  {stats.topSkills.slice(0, 5).map((skill, i) => (
                    <div key={skill.skillId} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">{i + 1}.</span>
                        <span className="truncate max-w-[200px]">{skill.skillName}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {skill.totalUsage} runs • {skill.uniqueUsers} users
                      </span>
                    </div>
                  ))}
                  {stats.topSkills.length === 0 && (
                    <p className="text-sm text-muted-foreground">No skill usage data yet</p>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Signups */}
            <div className="rounded-xl border bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Recent Signups</h3>
                <Button variant="outline" size="sm" onClick={handleExportEmails}>
                  <Download className="h-4 w-4 mr-2" />
                  Export All
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-2 text-sm font-medium text-muted-foreground">Email</th>
                      <th className="text-left py-2 px-2 text-sm font-medium text-muted-foreground">Name</th>
                      <th className="text-left py-2 px-2 text-sm font-medium text-muted-foreground">First Seen</th>
                      <th className="text-left py-2 px-2 text-sm font-medium text-muted-foreground">Logins</th>
                      <th className="text-left py-2 px-2 text-sm font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentSignups.slice(0, 10).map(email => (
                      <tr key={email.id} className="border-b last:border-0">
                        <td className="py-2 px-2 text-sm">{email.email}</td>
                        <td className="py-2 px-2 text-sm text-muted-foreground">{email.displayName || '-'}</td>
                        <td className="py-2 px-2 text-sm text-muted-foreground">
                          {new Date(email.firstSeenAt).toLocaleDateString()}
                        </td>
                        <td className="py-2 px-2 text-sm">{email.loginCount}</td>
                        <td className="py-2 px-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            email.followUpStatus === 'converted'
                              ? 'bg-green-500/20 text-green-600'
                              : email.followUpStatus === 'contacted'
                              ? 'bg-blue-500/20 text-blue-600'
                              : 'bg-gray-500/20 text-gray-600'
                          }`}>
                            {email.followUpStatus || 'pending'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {stats.recentSignups.length === 0 && (
                  <p className="text-center py-8 text-muted-foreground">No signups yet</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Emails Tab */}
        {activeTab === 'emails' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Captured Emails ({emails.length})</h2>
              <Button variant="outline" onClick={handleExportEmails}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>

            <div className="rounded-xl border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left py-3 px-4 text-sm font-medium">Email</th>
                      <th className="text-left py-3 px-4 text-sm font-medium">Name</th>
                      <th className="text-left py-3 px-4 text-sm font-medium">First Seen</th>
                      <th className="text-left py-3 px-4 text-sm font-medium">Last Seen</th>
                      <th className="text-left py-3 px-4 text-sm font-medium">Logins</th>
                      <th className="text-left py-3 px-4 text-sm font-medium">Skills</th>
                      <th className="text-left py-3 px-4 text-sm font-medium">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {emails.map(email => (
                      <tr key={email.id} className="border-t">
                        <td className="py-3 px-4 text-sm font-medium">{email.email}</td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">{email.displayName || '-'}</td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {new Date(email.firstSeenAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {new Date(email.lastSeenAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-sm">{email.loginCount}</td>
                        <td className="py-3 px-4 text-sm">{email.skillsUsed}</td>
                        <td className="py-3 px-4">
                          <Select
                            value={email.followUpStatus || 'pending'}
                            onChange={(e) => handleUpdateEmailStatus(email.email, e.target.value as CapturedEmail['followUpStatus'])}
                            className="text-xs h-8"
                          >
                            <option value="pending">Pending</option>
                            <option value="contacted">Contacted</option>
                            <option value="converted">Converted</option>
                            <option value="declined">Declined</option>
                          </Select>
                        </td>
                        <td className="py-3 px-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteEmail(email.email)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {emails.length === 0 && (
                  <p className="text-center py-12 text-muted-foreground">No emails captured yet</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Roles Tab */}
        {activeTab === 'roles' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Role Configuration</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {roleConfigs.map(config => {
                const RoleIcon = ROLE_ICONS[config.role];
                const isEditing = editingRole === config.role;

                return (
                  <div
                    key={config.role}
                    className={`rounded-xl border bg-card p-6 ${
                      isEditing ? 'ring-2 ring-primary' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                          config.role === 'free' ? 'bg-gray-500/20' :
                          config.role === 'pro' ? 'bg-blue-500/20' :
                          config.role === 'team' ? 'bg-purple-500/20' :
                          'bg-amber-500/20'
                        }`}>
                          <RoleIcon className={`h-5 w-5 ${ROLE_COLORS[config.role]}`} />
                        </div>
                        <div>
                          <h3 className="font-semibold">{config.displayName}</h3>
                          <p className="text-sm text-muted-foreground">
                            {config.price === 0 ? 'Free' : `$${config.price}/month`}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingRole(isEditing ? null : config.role)}
                      >
                        {isEditing ? <X className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
                      </Button>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4">{config.description}</p>

                    {isEditing ? (
                      <RoleConfigEditor
                        config={config}
                        onSave={handleSaveRoleConfig}
                        onCancel={() => setEditingRole(null)}
                      />
                    ) : (
                      <>
                        {/* Limits Summary */}
                        <div className="space-y-2 mb-4">
                          <h4 className="text-sm font-medium">Limits</h4>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Daily runs:</span>
                              <span>{config.limits.skillRunsPerDay === -1 ? '∞' : config.limits.skillRunsPerDay}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Monthly runs:</span>
                              <span>{config.limits.skillRunsPerMonth === -1 ? '∞' : config.limits.skillRunsPerMonth}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Workspaces:</span>
                              <span>{config.limits.workspacesLimit === -1 ? '∞' : config.limits.workspacesLimit}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Custom skills:</span>
                              <span>{config.limits.customSkillsLimit === -1 ? '∞' : config.limits.customSkillsLimit}</span>
                            </div>
                          </div>
                        </div>

                        {/* Features Summary */}
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium">Features</h4>
                          <div className="flex flex-wrap gap-1">
                            {config.features.canCreateCustomSkills && (
                              <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-600">Custom Skills</span>
                            )}
                            {config.features.canUseBatchProcessing && (
                              <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-600">Batch</span>
                            )}
                            {config.features.canExportPrompts && (
                              <span className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-600">Export</span>
                            )}
                            {config.features.canViewAnalytics && (
                              <span className="text-xs px-2 py-1 rounded-full bg-amber-500/20 text-amber-600">Analytics</span>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Usage Tab */}
        {activeTab === 'usage' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Skill Usage Analytics</h2>
              <Button variant="outline" onClick={handleExportUsage}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>

            {/* Top Skills */}
            <div className="rounded-xl border bg-card p-6">
              <h3 className="text-lg font-semibold mb-4">Most Popular Skills</h3>
              <div className="space-y-3">
                {stats.topSkills.map((skill, i) => (
                  <div key={skill.skillId} className="flex items-center gap-4">
                    <span className="text-2xl font-bold text-muted-foreground w-8">{i + 1}</span>
                    <div className="flex-1">
                      <p className="font-medium">{skill.skillName}</p>
                      <p className="text-sm text-muted-foreground">
                        {skill.totalUsage} total runs • {skill.uniqueUsers} unique users
                      </p>
                    </div>
                    <div className="w-32 bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{
                          width: `${(skill.totalUsage / (stats.topSkills[0]?.totalUsage || 1)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
                {stats.topSkills.length === 0 && (
                  <p className="text-center py-8 text-muted-foreground">No usage data yet</p>
                )}
              </div>
            </div>

            {/* All Usage Records */}
            <div className="rounded-xl border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left py-3 px-4 text-sm font-medium">User</th>
                      <th className="text-left py-3 px-4 text-sm font-medium">Skill</th>
                      <th className="text-left py-3 px-4 text-sm font-medium">Source</th>
                      <th className="text-left py-3 px-4 text-sm font-medium">Uses</th>
                      <th className="text-left py-3 px-4 text-sm font-medium">First Used</th>
                      <th className="text-left py-3 px-4 text-sm font-medium">Last Used</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usageRecords.slice(0, 50).map(record => (
                      <tr key={record.id} className="border-t">
                        <td className="py-3 px-4 text-sm">{record.userEmail}</td>
                        <td className="py-3 px-4 text-sm font-medium">{record.skillName}</td>
                        <td className="py-3 px-4">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            record.skillSource === 'static' ? 'bg-blue-500/20 text-blue-600' :
                            record.skillSource === 'dynamic' ? 'bg-purple-500/20 text-purple-600' :
                            'bg-green-500/20 text-green-600'
                          }`}>
                            {record.skillSource}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm font-medium">{record.usageCount}</td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {new Date(record.firstUsedAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {new Date(record.lastUsedAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {usageRecords.length === 0 && (
                  <p className="text-center py-12 text-muted-foreground">No usage records yet</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6 max-w-2xl">
            <h2 className="text-xl font-semibold">Admin Settings</h2>

            {/* Admin Emails */}
            <div className="rounded-xl border bg-card p-6">
              <h3 className="text-lg font-semibold mb-2">Admin Email Addresses</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Users with these email addresses will have full admin access. One email per line.
              </p>
              <Textarea
                value={adminEmailList}
                onChange={(e) => setAdminEmailList(e.target.value)}
                rows={5}
                placeholder="admin@example.com&#10;another@example.com"
                className="mb-4"
              />
              <Button onClick={handleSaveAdminEmails}>
                <Save className="h-4 w-4 mr-2" />
                Save Admin Emails
              </Button>
            </div>

            {/* Future: More settings */}
            <div className="rounded-xl border bg-card p-6">
              <h3 className="text-lg font-semibold mb-2">Feature Flags</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Global feature toggles (coming soon)
              </p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Prompt export restriction toggle</p>
                <p>• New user default role setting</p>
                <p>• Email opt-in requirements</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// Role Config Editor Component
// ═══════════════════════════════════════════════════════════════════════════

interface RoleConfigEditorProps {
  config: RoleConfig;
  onSave: (config: RoleConfig) => void;
  onCancel: () => void;
}

const RoleConfigEditor: React.FC<RoleConfigEditorProps> = ({ config, onSave, onCancel }) => {
  const [editedConfig, setEditedConfig] = useState<RoleConfig>(JSON.parse(JSON.stringify(config)));

  const updateLimit = (key: keyof typeof config.limits, value: string) => {
    const numValue = value === '' ? -1 : parseInt(value, 10);
    setEditedConfig(prev => ({
      ...prev,
      limits: { ...prev.limits, [key]: isNaN(numValue) ? -1 : numValue },
    }));
  };

  const toggleFeature = (key: keyof typeof config.features) => {
    setEditedConfig(prev => ({
      ...prev,
      features: { ...prev.features, [key]: !prev.features[key] },
    }));
  };

  return (
    <div className="space-y-4 pt-4 border-t">
      {/* Limits */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium">Limits (-1 = unlimited)</h4>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground">Daily Runs</label>
            <Input
              type="number"
              value={editedConfig.limits.skillRunsPerDay === -1 ? '' : editedConfig.limits.skillRunsPerDay}
              onChange={(e) => updateLimit('skillRunsPerDay', e.target.value)}
              placeholder="∞"
              className="h-8"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Monthly Runs</label>
            <Input
              type="number"
              value={editedConfig.limits.skillRunsPerMonth === -1 ? '' : editedConfig.limits.skillRunsPerMonth}
              onChange={(e) => updateLimit('skillRunsPerMonth', e.target.value)}
              placeholder="∞"
              className="h-8"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Workspaces</label>
            <Input
              type="number"
              value={editedConfig.limits.workspacesLimit === -1 ? '' : editedConfig.limits.workspacesLimit}
              onChange={(e) => updateLimit('workspacesLimit', e.target.value)}
              placeholder="∞"
              className="h-8"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Custom Skills</label>
            <Input
              type="number"
              value={editedConfig.limits.customSkillsLimit === -1 ? '' : editedConfig.limits.customSkillsLimit}
              onChange={(e) => updateLimit('customSkillsLimit', e.target.value)}
              placeholder="∞"
              className="h-8"
            />
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium">Features</h4>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(editedConfig.features).map(([key, value]) => (
            <label key={key} className="flex items-center gap-2 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={value}
                onChange={() => toggleFeature(key as keyof typeof config.features)}
                className="rounded"
              />
              <span className="truncate">{key.replace(/^can/, '').replace(/([A-Z])/g, ' $1').trim()}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <Button size="sm" onClick={() => onSave(editedConfig)}>
          <Save className="h-4 w-4 mr-1" />
          Save
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default AdminPage;
