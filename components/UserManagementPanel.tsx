/**
 * UserManagementPanel Component
 *
 * Enhanced admin panel for user management with:
 * - User list with onboarding data
 * - Filtering by role, interest, status
 * - Bulk selection for email
 * - Export to CSV with full profile data
 */

import React, { useState, useMemo } from 'react';
import {
  Users,
  Download,
  Search,
  Filter,
  Mail,
  Check,
  X,
  ChevronDown,
  Briefcase,
  Building2,
  GraduationCap,
  Home,
  Compass,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import {
  getCapturedEmails,
  getCurrentAppUser,
  exportUsersWithOnboardingToCSV,
  getOnboardingStats,
} from '../lib/admin';
import {
  AUTOMATION_INTEREST_OPTIONS,
  ROLE_CATEGORY_OPTIONS,
  WORKFLOW_CATEGORY_OPTIONS,
  getAutomationInterestLabel,
  getRoleCategoryLabel,
  getWorkflowCategoryLabel,
  getProfileSummary,
} from '../lib/onboardingConfig';
import type { CapturedEmail, AppUser, AutomationInterest, RoleCategory, WorkflowCategory } from '../lib/storage/types';

interface UserWithProfile extends CapturedEmail {
  onboarding?: AppUser['onboarding'];
  emailPreferences?: AppUser['emailPreferences'];
}

interface UserManagementPanelProps {
  onSelectUsers: (userIds: string[]) => void;
  onSendEmail: () => void;
}

export const UserManagementPanel: React.FC<UserManagementPanelProps> = ({
  onSelectUsers,
  onSendEmail,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterInterest, setFilterInterest] = useState<string>('all');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterRoleCategory, setFilterRoleCategory] = useState<string>('all');
  const [filterWorkflow, setFilterWorkflow] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [viewingUser, setViewingUser] = useState<UserWithProfile | null>(null);

  // Get users with profile data
  // Onboarding data is now stored directly in CapturedEmail
  const users = useMemo((): UserWithProfile[] => {
    const emails = getCapturedEmails();
    const currentUser = getCurrentAppUser();

    return emails.map(email => {
      const isCurrentUser = currentUser &&
        currentUser.email.toLowerCase() === email.email.toLowerCase();

      // Build onboarding object from CapturedEmail fields
      // For current user, fall back to AppUser data if CapturedEmail is missing
      const hasOnboardingData = email.automationInterest ||
        email.roleCategories?.length ||
        email.workflowInterests?.length ||
        email.onboardingCompleted;

      const onboarding = hasOnboardingData || (isCurrentUser && currentUser.onboarding) ? {
        automationInterest: email.automationInterest ||
          (isCurrentUser ? currentUser.onboarding?.automationInterest : undefined),
        roleCategories: email.roleCategories ||
          (isCurrentUser ? currentUser.onboarding?.roleCategories : undefined),
        workflowInterests: email.workflowInterests ||
          (isCurrentUser ? currentUser.onboarding?.workflowInterests : undefined),
        onboardingCompleted: email.onboardingCompleted ||
          (isCurrentUser ? currentUser.onboarding?.onboardingCompleted : false),
        onboardingCompletedAt: email.onboardingCompletedAt ||
          (isCurrentUser ? currentUser.onboarding?.onboardingCompletedAt : undefined),
      } : undefined;

      return {
        ...email,
        onboarding,
        emailPreferences: isCurrentUser ? currentUser.emailPreferences : undefined,
      };
    });
  }, []);

  // Get onboarding stats
  const stats = useMemo(() => getOnboardingStats(), []);

  // Filter users
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          user.email.toLowerCase().includes(query) ||
          (user.displayName?.toLowerCase().includes(query));
        if (!matchesSearch) return false;
      }

      // Automation interest filter
      if (filterInterest !== 'all') {
        if (user.onboarding?.automationInterest !== filterInterest) {
          return false;
        }
      }

      // Role category filter (from onboarding)
      if (filterRoleCategory !== 'all') {
        if (!user.onboarding?.roleCategories?.includes(filterRoleCategory as RoleCategory)) {
          return false;
        }
      }

      // Workflow interest filter
      if (filterWorkflow !== 'all') {
        if (!user.onboarding?.workflowInterests?.includes(filterWorkflow as WorkflowCategory)) {
          return false;
        }
      }

      // User role filter (free/pro/team/custom)
      if (filterRole !== 'all') {
        if (user.role !== filterRole) {
          return false;
        }
      }

      // Status filter
      if (filterStatus !== 'all') {
        if ((user.followUpStatus || 'pending') !== filterStatus) {
          return false;
        }
      }

      return true;
    });
  }, [users, searchQuery, filterInterest, filterRoleCategory, filterWorkflow, filterRole, filterStatus]);

  const handleSelectAll = () => {
    if (selectedUserIds.size === filteredUsers.length) {
      setSelectedUserIds(new Set());
    } else {
      setSelectedUserIds(new Set(filteredUsers.map(u => u.id)));
    }
  };

  const handleSelectUser = (userId: string) => {
    const newSelected = new Set(selectedUserIds);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUserIds(newSelected);
    onSelectUsers(Array.from(newSelected));
  };

  const handleExport = () => {
    const csv = exportUsersWithOnboardingToCSV();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `skillengine-users-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getInterestIcon = (interest?: AutomationInterest) => {
    switch (interest) {
      case 'work': return <Briefcase className="w-4 h-4" />;
      case 'business': return <Building2 className="w-4 h-4" />;
      case 'education': return <GraduationCap className="w-4 h-4" />;
      case 'personal': return <Home className="w-4 h-4" />;
      default: return <Compass className="w-4 h-4" />;
    }
  };

  const allSelected = selectedUserIds.size === filteredUsers.length && filteredUsers.length > 0;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Users className="w-4 h-4" />
            Total Users
          </div>
          <p className="text-2xl font-bold">{users.length}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Check className="w-4 h-4 text-green-500" />
            Onboarding Complete
          </div>
          <p className="text-2xl font-bold">
            {stats.onboardingCompletionRate.toFixed(0)}%
          </p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Briefcase className="w-4 h-4 text-blue-500" />
            Work Users
          </div>
          <p className="text-2xl font-bold">
            {stats.byAutomationInterest['For My Job'] || 0}
          </p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Building2 className="w-4 h-4 text-purple-500" />
            Business Users
          </div>
          <p className="text-2xl font-bold">
            {stats.byAutomationInterest['For My Business'] || 0}
          </p>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by email or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="w-4 h-4 mr-2" />
          Filters
          <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </Button>

        <Button variant="outline" onClick={handleExport}>
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>

        {selectedUserIds.size > 0 && (
          <Button onClick={onSendEmail}>
            <Mail className="w-4 h-4 mr-2" />
            Email ({selectedUserIds.size})
          </Button>
        )}
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="rounded-xl border bg-card p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Automation Interest</label>
              <Select
                value={filterInterest}
                onChange={(e) => setFilterInterest(e.target.value)}
              >
                <option value="all">All Interests</option>
                {AUTOMATION_INTEREST_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Role Category</label>
              <Select
                value={filterRoleCategory}
                onChange={(e) => setFilterRoleCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                {ROLE_CATEGORY_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Workflow Interest</label>
              <Select
                value={filterWorkflow}
                onChange={(e) => setFilterWorkflow(e.target.value)}
              >
                <option value="all">All Workflows</option>
                {WORKFLOW_CATEGORY_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">User Tier</label>
              <Select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
              >
                <option value="all">All Tiers</option>
                <option value="free">Free</option>
                <option value="pro">Pro</option>
                <option value="team">Team</option>
                <option value="custom">Custom</option>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Follow-up Status</label>
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="contacted">Contacted</option>
                <option value="converted">Converted</option>
                <option value="declined">Declined</option>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant="ghost"
                onClick={() => {
                  setFilterInterest('all');
                  setFilterRoleCategory('all');
                  setFilterWorkflow('all');
                  setFilterRole('all');
                  setFilterStatus('all');
                  setSearchQuery('');
                }}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Clear
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="w-10 py-3 px-4">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={handleSelectAll}
                    className="rounded border-gray-600"
                  />
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium">User</th>
                <th className="text-left py-3 px-4 text-sm font-medium">Interest</th>
                <th className="text-left py-3 px-4 text-sm font-medium">Profile</th>
                <th className="text-left py-3 px-4 text-sm font-medium">Activity</th>
                <th className="text-left py-3 px-4 text-sm font-medium">Status</th>
                <th className="w-10 py-3 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id} className="border-t hover:bg-muted/25">
                  <td className="py-3 px-4">
                    <input
                      type="checkbox"
                      checked={selectedUserIds.has(user.id)}
                      onChange={() => handleSelectUser(user.id)}
                      className="rounded border-gray-600"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-sm">{user.email}</p>
                      <p className="text-xs text-muted-foreground">{user.displayName || 'No name'}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {user.onboarding?.automationInterest ? (
                      <div className="flex items-center gap-2">
                        {getInterestIcon(user.onboarding.automationInterest)}
                        <span className="text-sm">
                          {getAutomationInterestLabel(user.onboarding.automationInterest)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">Not set</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm space-y-1">
                      {/* Role Categories */}
                      {user.onboarding?.roleCategories && user.onboarding.roleCategories.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {user.onboarding.roleCategories.slice(0, 2).map(role => (
                            <span
                              key={role}
                              className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400"
                            >
                              {getRoleCategoryLabel(role)}
                            </span>
                          ))}
                          {user.onboarding.roleCategories.length > 2 && (
                            <span className="text-xs text-muted-foreground">
                              +{user.onboarding.roleCategories.length - 2}
                            </span>
                          )}
                        </div>
                      ) : null}
                      {/* Workflow Interests */}
                      {user.onboarding?.workflowInterests && user.onboarding.workflowInterests.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {user.onboarding.workflowInterests.slice(0, 2).map(workflow => (
                            <span
                              key={workflow}
                              className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400"
                            >
                              {getWorkflowCategoryLabel(workflow)}
                            </span>
                          ))}
                          {user.onboarding.workflowInterests.length > 2 && (
                            <span className="text-xs text-muted-foreground">
                              +{user.onboarding.workflowInterests.length - 2}
                            </span>
                          )}
                        </div>
                      ) : null}
                      {/* Show dash if nothing selected */}
                      {(!user.onboarding?.roleCategories?.length && !user.onboarding?.workflowInterests?.length) && (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm">
                      <span className="font-medium">{user.loginCount}</span>
                      <span className="text-muted-foreground"> logins</span>
                      <span className="mx-1">·</span>
                      <span className="font-medium">{user.skillsUsed}</span>
                      <span className="text-muted-foreground"> skills</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      user.followUpStatus === 'converted'
                        ? 'bg-green-500/20 text-green-400'
                        : user.followUpStatus === 'contacted'
                        ? 'bg-blue-500/20 text-blue-400'
                        : user.followUpStatus === 'declined'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {user.followUpStatus || 'pending'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setViewingUser(user)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredUsers.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              {users.length === 0 ? 'No users yet' : 'No users match your filters'}
            </div>
          )}
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredUsers.length} of {users.length} users
        {selectedUserIds.size > 0 && (
          <span> · {selectedUserIds.size} selected</span>
        )}
      </div>

      {/* User Detail Modal */}
      {viewingUser && (
        <UserDetailModal
          user={viewingUser}
          onClose={() => setViewingUser(null)}
        />
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// USER DETAIL MODAL
// ═══════════════════════════════════════════════════════════════════════════

interface UserDetailModalProps {
  user: UserWithProfile;
  onClose: () => void;
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({ user, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-xl border border-gray-700 max-w-lg w-full max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h3 className="font-semibold text-lg">User Details</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Basic Info */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Contact</h4>
            <p className="font-medium">{user.email}</p>
            <p className="text-sm text-muted-foreground">{user.displayName || 'No name'}</p>
          </div>

          {/* Onboarding Info */}
          {user.onboarding && (
            <>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Primary Interest</h4>
                <p>
                  {user.onboarding.automationInterest
                    ? getAutomationInterestLabel(user.onboarding.automationInterest)
                    : 'Not specified'}
                </p>
              </div>

              {user.onboarding.roleCategories && user.onboarding.roleCategories.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Role Interests</h4>
                  <div className="flex flex-wrap gap-2">
                    {user.onboarding.roleCategories.map(role => (
                      <span
                        key={role}
                        className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-400"
                      >
                        {getRoleCategoryLabel(role)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {user.onboarding.workflowInterests && user.onboarding.workflowInterests.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Workflow Interests</h4>
                  <div className="flex flex-wrap gap-2">
                    {user.onboarding.workflowInterests.map(workflow => (
                      <span
                        key={workflow}
                        className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-400"
                      >
                        {getWorkflowCategoryLabel(workflow)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Activity */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Activity</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">First seen:</span>
                <p>{new Date(user.firstSeenAt).toLocaleDateString()}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Last seen:</span>
                <p>{new Date(user.lastSeenAt).toLocaleDateString()}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Logins:</span>
                <p>{user.loginCount}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Skills used:</span>
                <p>{user.skillsUsed}</p>
              </div>
            </div>
          </div>

          {/* Status */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Status</h4>
            <span className={`text-xs px-2 py-1 rounded-full ${
              user.followUpStatus === 'converted'
                ? 'bg-green-500/20 text-green-400'
                : user.followUpStatus === 'contacted'
                ? 'bg-blue-500/20 text-blue-400'
                : 'bg-gray-500/20 text-gray-400'
            }`}>
              {user.followUpStatus || 'pending'}
            </span>
          </div>

          {user.followUpNotes && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Notes</h4>
              <p className="text-sm">{user.followUpNotes}</p>
            </div>
          )}
        </div>

        <div className="flex justify-end p-4 border-t border-gray-700">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserManagementPanel;
