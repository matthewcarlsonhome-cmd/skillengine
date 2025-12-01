import React, { useState, useEffect } from 'react';
import { ArrowLeft, Bell, BellOff, Plus, Trash2, Edit2, Check, X, Calendar, Clock, Mail, Building2, AlertTriangle, CheckCircle, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

interface Reminder {
  id: string;
  type: 'application' | 'interview' | 'thank-you' | 'networking' | 'offer' | 'custom';
  title: string;
  company: string;
  contact?: string;
  dueDate: string;
  dueTime?: string;
  notes?: string;
  status: 'pending' | 'completed' | 'overdue' | 'snoozed';
  createdAt: string;
  completedAt?: string;
  snoozeUntil?: string;
}

const REMINDER_TYPES = [
  { id: 'application', name: 'Application Follow-up', icon: Mail, color: 'text-blue-500', defaultDays: 7 },
  { id: 'interview', name: 'Interview Follow-up', icon: Calendar, color: 'text-purple-500', defaultDays: 1 },
  { id: 'thank-you', name: 'Thank You Note', icon: Mail, color: 'text-green-500', defaultDays: 1 },
  { id: 'networking', name: 'Networking Check-in', icon: Building2, color: 'text-orange-500', defaultDays: 14 },
  { id: 'offer', name: 'Offer Decision', icon: CheckCircle, color: 'text-yellow-500', defaultDays: 3 },
  { id: 'custom', name: 'Custom Reminder', icon: Bell, color: 'text-gray-500', defaultDays: 7 },
];

const QUICK_TEMPLATES = [
  { type: 'application', title: 'Follow up on application', dayOffset: 7 },
  { type: 'interview', title: 'Send thank you note', dayOffset: 1 },
  { type: 'networking', title: 'Check in with connection', dayOffset: 14 },
  { type: 'offer', title: 'Respond to offer', dayOffset: 3 },
];

const FollowUpRemindersPage: React.FC = () => {
  const [reminders, setReminders] = useState<Reminder[]>(() => {
    const saved = localStorage.getItem('skillengine_followup_reminders');
    return saved ? JSON.parse(saved) : [];
  });

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'overdue' | 'completed'>('all');
  const [formData, setFormData] = useState<Partial<Reminder>>({
    type: 'application',
    title: '',
    company: '',
    contact: '',
    dueDate: '',
    dueTime: '',
    notes: '',
  });

  useEffect(() => {
    localStorage.setItem('skillengine_followup_reminders', JSON.stringify(reminders));
  }, [reminders]);

  // Check for overdue reminders
  useEffect(() => {
    const now = new Date();
    setReminders(prev => prev.map(r => {
      if (r.status === 'pending' && new Date(r.dueDate) < now) {
        return { ...r, status: 'overdue' };
      }
      if (r.status === 'snoozed' && r.snoozeUntil && new Date(r.snoozeUntil) < now) {
        return { ...r, status: new Date(r.dueDate) < now ? 'overdue' : 'pending', snoozeUntil: undefined };
      }
      return r;
    }));
  }, []);

  const addDays = (date: Date, days: number) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result.toISOString().split('T')[0];
  };

  const handleQuickAdd = (template: typeof QUICK_TEMPLATES[0]) => {
    setFormData({
      type: template.type as Reminder['type'],
      title: template.title,
      company: '',
      dueDate: addDays(new Date(), template.dayOffset),
    });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.company || !formData.dueDate) return;

    if (editingId) {
      setReminders(prev => prev.map(r =>
        r.id === editingId ? { ...r, ...formData } as Reminder : r
      ));
      setEditingId(null);
    } else {
      const newReminder: Reminder = {
        id: Date.now().toString(),
        type: formData.type as Reminder['type'],
        title: formData.title!,
        company: formData.company!,
        contact: formData.contact,
        dueDate: formData.dueDate!,
        dueTime: formData.dueTime,
        notes: formData.notes,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      setReminders(prev => [newReminder, ...prev]);
    }

    setFormData({ type: 'application', title: '', company: '', contact: '', dueDate: '', dueTime: '', notes: '' });
    setShowForm(false);
  };

  const handleEdit = (reminder: Reminder) => {
    setFormData(reminder);
    setEditingId(reminder.id);
    setShowForm(true);
  };

  const handleComplete = (id: string) => {
    setReminders(prev => prev.map(r =>
      r.id === id ? { ...r, status: 'completed', completedAt: new Date().toISOString() } : r
    ));
  };

  const handleSnooze = (id: string, days: number) => {
    setReminders(prev => prev.map(r =>
      r.id === id ? { ...r, status: 'snoozed', snoozeUntil: addDays(new Date(), days) } : r
    ));
  };

  const handleDelete = (id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id));
  };

  const getTypeInfo = (type: string) => {
    return REMINDER_TYPES.find(t => t.id === type) || REMINDER_TYPES[5];
  };

  const filteredReminders = reminders.filter(r => {
    if (filter === 'all') return true;
    return r.status === filter;
  }).sort((a, b) => {
    // Sort by status priority (overdue first, then pending, then completed)
    const statusOrder = { overdue: 0, pending: 1, snoozed: 2, completed: 3 };
    if (statusOrder[a.status] !== statusOrder[b.status]) {
      return statusOrder[a.status] - statusOrder[b.status];
    }
    // Then by due date
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  const stats = {
    total: reminders.length,
    pending: reminders.filter(r => r.status === 'pending').length,
    overdue: reminders.filter(r => r.status === 'overdue').length,
    completed: reminders.filter(r => r.status === 'completed').length,
  };

  const getDaysUntil = (date: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(date);
    dueDate.setHours(0, 0, 0, 0);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatDueDate = (date: string) => {
    const days = getDaysUntil(date);
    if (days < 0) return `${Math.abs(days)} day${Math.abs(days) !== 1 ? 's' : ''} overdue`;
    if (days === 0) return 'Due today';
    if (days === 1) return 'Due tomorrow';
    if (days < 7) return `Due in ${days} days`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6">
        <Link to="/dashboard">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Bell className="h-8 w-8 text-orange-500" />
          Follow-up Reminders
        </h1>
        <p className="text-muted-foreground mt-2">
          Never miss an important follow-up with automated reminders
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-card rounded-lg border p-4">
          <div className="text-2xl font-bold">{stats.total}</div>
          <div className="text-sm text-muted-foreground">Total Reminders</div>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="text-2xl font-bold text-blue-500">{stats.pending}</div>
          <div className="text-sm text-muted-foreground">Pending</div>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="text-2xl font-bold text-red-500">{stats.overdue}</div>
          <div className="text-sm text-muted-foreground">Overdue</div>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="text-2xl font-bold text-green-500">{stats.completed}</div>
          <div className="text-sm text-muted-foreground">Completed</div>
        </div>
      </div>

      {/* Quick Add Buttons */}
      <div className="bg-card rounded-lg border p-4 mb-6">
        <h2 className="text-sm font-semibold mb-3">Quick Add</h2>
        <div className="flex flex-wrap gap-2">
          {QUICK_TEMPLATES.map((template, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => handleQuickAdd(template)}
            >
              <Plus className="h-3 w-3 mr-1" />
              {template.title}
            </Button>
          ))}
          <Button
            variant="default"
            size="sm"
            onClick={() => {
              setFormData({ type: 'custom', title: '', company: '', dueDate: addDays(new Date(), 1) });
              setShowForm(true);
            }}
          >
            <Plus className="h-4 w-4 mr-1" />
            Custom Reminder
          </Button>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-card rounded-lg border p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">
            {editingId ? 'Edit Reminder' : 'New Reminder'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as Reminder['type'] })}
                  className="w-full px-3 py-2 rounded-md border bg-background"
                >
                  {REMINDER_TYPES.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Follow up on application"
                  className="w-full px-3 py-2 rounded-md border bg-background"
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Company *</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="e.g., Google"
                  className="w-full px-3 py-2 rounded-md border bg-background"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Contact (Optional)</label>
                <input
                  type="text"
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  placeholder="e.g., Jane Doe, Recruiter"
                  className="w-full px-3 py-2 rounded-md border bg-background"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Due Date *</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-md border bg-background"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Time (Optional)</label>
                <input
                  type="time"
                  value={formData.dueTime}
                  onChange={(e) => setFormData({ ...formData, dueTime: e.target.value })}
                  className="w-full px-3 py-2 rounded-md border bg-background"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Notes (Optional)</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Add any additional notes..."
                rows={2}
                className="w-full px-3 py-2 rounded-md border bg-background"
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit">
                {editingId ? 'Update Reminder' : 'Add Reminder'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setFormData({ type: 'application', title: '', company: '', contact: '', dueDate: '', dueTime: '', notes: '' });
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4">
        {(['all', 'pending', 'overdue', 'completed'] as const).map((f) => (
          <Button
            key={f}
            variant={filter === f ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f === 'overdue' && stats.overdue > 0 && (
              <span className="ml-1 bg-red-500 text-white text-xs px-1.5 rounded-full">
                {stats.overdue}
              </span>
            )}
          </Button>
        ))}
      </div>

      {/* Reminders List */}
      <div className="space-y-3">
        {filteredReminders.length === 0 ? (
          <div className="bg-card rounded-lg border p-8 text-center">
            <BellOff className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <h3 className="font-medium mb-1">No reminders found</h3>
            <p className="text-sm text-muted-foreground">
              {filter === 'all' ? 'Add your first reminder to stay on top of follow-ups' : `No ${filter} reminders`}
            </p>
          </div>
        ) : (
          filteredReminders.map((reminder) => {
            const typeInfo = getTypeInfo(reminder.type);
            const TypeIcon = typeInfo.icon;
            const daysUntil = getDaysUntil(reminder.dueDate);

            return (
              <div
                key={reminder.id}
                className={`bg-card rounded-lg border p-4 transition-colors ${
                  reminder.status === 'overdue' ? 'border-red-500/50 bg-red-500/5' :
                  reminder.status === 'completed' ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    reminder.status === 'completed' ? 'bg-green-500/20' : 'bg-muted'
                  }`}>
                    {reminder.status === 'completed' ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <TypeIcon className={`h-5 w-5 ${typeInfo.color}`} />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className={`font-medium ${reminder.status === 'completed' ? 'line-through' : ''}`}>
                          {reminder.title}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Building2 className="h-3 w-3" />
                          <span>{reminder.company}</span>
                          {reminder.contact && (
                            <>
                              <span>•</span>
                              <span>{reminder.contact}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {reminder.status === 'overdue' && (
                          <span className="flex items-center gap-1 text-xs text-red-500 bg-red-500/10 px-2 py-1 rounded">
                            <AlertTriangle className="h-3 w-3" />
                            Overdue
                          </span>
                        )}
                        {reminder.status === 'snoozed' && (
                          <span className="text-xs text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded">
                            Snoozed
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <span className={`flex items-center gap-1 ${
                        reminder.status === 'overdue' ? 'text-red-500' :
                        daysUntil === 0 ? 'text-orange-500' :
                        daysUntil === 1 ? 'text-yellow-500' :
                        'text-muted-foreground'
                      }`}>
                        <Calendar className="h-3 w-3" />
                        {formatDueDate(reminder.dueDate)}
                      </span>
                      {reminder.dueTime && (
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {reminder.dueTime}
                        </span>
                      )}
                    </div>

                    {reminder.notes && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {reminder.notes}
                      </p>
                    )}

                    {reminder.status !== 'completed' && (
                      <div className="flex items-center gap-2 mt-3">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleComplete(reminder.id)}
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Complete
                        </Button>
                        <div className="relative group">
                          <Button variant="ghost" size="sm">
                            Snooze
                          </Button>
                          <div className="absolute top-full left-0 mt-1 bg-card border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                            <button
                              onClick={() => handleSnooze(reminder.id, 1)}
                              className="block w-full px-3 py-1.5 text-sm text-left hover:bg-muted"
                            >
                              1 day
                            </button>
                            <button
                              onClick={() => handleSnooze(reminder.id, 3)}
                              className="block w-full px-3 py-1.5 text-sm text-left hover:bg-muted"
                            >
                              3 days
                            </button>
                            <button
                              onClick={() => handleSnooze(reminder.id, 7)}
                              className="block w-full px-3 py-1.5 text-sm text-left hover:bg-muted"
                            >
                              1 week
                            </button>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(reminder)}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(reminder.id)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Tips Section */}
      <div className="mt-8 bg-card rounded-lg border p-6">
        <h2 className="font-semibold mb-4">Follow-up Best Practices</h2>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
            <div>
              <div className="font-medium">Application Follow-up</div>
              <div className="text-muted-foreground">Wait 1-2 weeks after applying, then send a brief, professional email expressing continued interest</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-purple-500 shrink-0 mt-0.5" />
            <div>
              <div className="font-medium">Post-Interview</div>
              <div className="text-muted-foreground">Send a thank-you note within 24 hours, referencing specific discussion points</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Building2 className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
            <div>
              <div className="font-medium">Networking</div>
              <div className="text-muted-foreground">Check in with connections every 2-4 weeks during active job search</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
            <div>
              <div className="font-medium">Offer Response</div>
              <div className="text-muted-foreground">Respond to offers within 2-3 business days, even if just to ask for more time</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FollowUpRemindersPage;
