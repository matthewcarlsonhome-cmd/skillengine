// Job Application Tracker - Track job applications, status, and follow-ups

import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { useToast } from '../hooks/useToast';
import {
  Briefcase,
  Plus,
  Search,
  Calendar,
  Building2,
  MapPin,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Trash2,
  Edit3,
  ExternalLink,
  Filter,
  ChevronDown,
  ChevronUp,
  Star,
  Send,
  Phone,
  FileText,
} from 'lucide-react';

interface JobApplication {
  id: string;
  company: string;
  position: string;
  location: string;
  salary?: string;
  url?: string;
  status: 'saved' | 'applied' | 'interviewing' | 'offer' | 'rejected' | 'withdrawn';
  appliedDate?: string;
  notes: string;
  nextStep?: string;
  nextStepDate?: string;
  contacts: { name: string; role: string; email?: string }[];
  createdAt: string;
  updatedAt: string;
  isFavorite: boolean;
}

const STATUS_CONFIG = {
  saved: { label: 'Saved', color: 'bg-gray-500', icon: Star },
  applied: { label: 'Applied', color: 'bg-blue-500', icon: Send },
  interviewing: { label: 'Interviewing', color: 'bg-yellow-500', icon: Phone },
  offer: { label: 'Offer', color: 'bg-green-500', icon: CheckCircle2 },
  rejected: { label: 'Rejected', color: 'bg-red-500', icon: XCircle },
  withdrawn: { label: 'Withdrawn', color: 'bg-gray-400', icon: XCircle },
};

const STORAGE_KEY = 'skillengine_job_applications';

const JobTrackerPage: React.FC = () => {
  const { addToast } = useToast();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    company: '',
    position: '',
    location: '',
    salary: '',
    url: '',
    status: 'saved' as JobApplication['status'],
    appliedDate: '',
    notes: '',
    nextStep: '',
    nextStepDate: '',
  });

  // Load applications from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setApplications(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load applications:', e);
    }
  }, []);

  // Save applications to localStorage
  const saveApplications = (apps: JobApplication[]) => {
    setApplications(apps);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
  };

  const handleSubmit = () => {
    if (!formData.company || !formData.position) {
      addToast('Company and position are required', 'error');
      return;
    }

    if (editingId) {
      // Update existing
      const updated = applications.map((app) =>
        app.id === editingId
          ? { ...app, ...formData, updatedAt: new Date().toISOString() }
          : app
      );
      saveApplications(updated);
      addToast('Application updated', 'success');
      setEditingId(null);
    } else {
      // Add new
      const newApp: JobApplication = {
        id: crypto.randomUUID(),
        ...formData,
        contacts: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isFavorite: false,
      };
      saveApplications([newApp, ...applications]);
      addToast('Application added', 'success');
    }

    setFormData({
      company: '',
      position: '',
      location: '',
      salary: '',
      url: '',
      status: 'saved',
      appliedDate: '',
      notes: '',
      nextStep: '',
      nextStepDate: '',
    });
    setShowAddForm(false);
  };

  const handleEdit = (app: JobApplication) => {
    setFormData({
      company: app.company,
      position: app.position,
      location: app.location,
      salary: app.salary || '',
      url: app.url || '',
      status: app.status,
      appliedDate: app.appliedDate || '',
      notes: app.notes,
      nextStep: app.nextStep || '',
      nextStepDate: app.nextStepDate || '',
    });
    setEditingId(app.id);
    setShowAddForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this application?')) {
      saveApplications(applications.filter((app) => app.id !== id));
      addToast('Application deleted', 'success');
    }
  };

  const handleToggleFavorite = (id: string) => {
    const updated = applications.map((app) =>
      app.id === id ? { ...app, isFavorite: !app.isFavorite } : app
    );
    saveApplications(updated);
  };

  const handleStatusChange = (id: string, status: JobApplication['status']) => {
    const updated = applications.map((app) =>
      app.id === id
        ? {
            ...app,
            status,
            appliedDate: status === 'applied' && !app.appliedDate ? new Date().toISOString().split('T')[0] : app.appliedDate,
            updatedAt: new Date().toISOString(),
          }
        : app
    );
    saveApplications(updated);
    addToast(`Status updated to ${STATUS_CONFIG[status].label}`, 'success');
  };

  // Filter applications
  const filteredApplications = applications
    .filter((app) => {
      const matchesSearch =
        app.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

  // Stats
  const stats = {
    total: applications.length,
    applied: applications.filter((a) => a.status === 'applied').length,
    interviewing: applications.filter((a) => a.status === 'interviewing').length,
    offers: applications.filter((a) => a.status === 'offer').length,
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
            <Briefcase className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Job Tracker</h1>
            <p className="text-muted-foreground">Track your job applications and progress</p>
          </div>
        </div>
        <Button onClick={() => { setShowAddForm(true); setEditingId(null); }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Application
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="rounded-xl border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-sm text-muted-foreground">Applied</p>
          <p className="text-2xl font-bold text-blue-500">{stats.applied}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-sm text-muted-foreground">Interviewing</p>
          <p className="text-2xl font-bold text-yellow-500">{stats.interviewing}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-sm text-muted-foreground">Offers</p>
          <p className="text-2xl font-bold text-green-500">{stats.offers}</p>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="border rounded-xl p-6 mb-8 bg-card">
          <h2 className="text-lg font-semibold mb-4">
            {editingId ? 'Edit Application' : 'Add New Application'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Company Name *"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            />
            <Input
              placeholder="Position *"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
            />
            <Input
              placeholder="Location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
            <Input
              placeholder="Salary Range"
              value={formData.salary}
              onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
            />
            <Input
              placeholder="Job URL"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            />
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as JobApplication['status'] })}
              className="p-2 rounded-lg border bg-background"
            >
              {Object.entries(STATUS_CONFIG).map(([key, { label }]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            <Input
              type="date"
              placeholder="Applied Date"
              value={formData.appliedDate}
              onChange={(e) => setFormData({ ...formData, appliedDate: e.target.value })}
            />
            <Input
              placeholder="Next Step"
              value={formData.nextStep}
              onChange={(e) => setFormData({ ...formData, nextStep: e.target.value })}
            />
          </div>
          <Textarea
            placeholder="Notes..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="mt-4"
            rows={3}
          />
          <div className="flex gap-2 mt-4">
            <Button onClick={handleSubmit}>
              {editingId ? 'Update' : 'Add'} Application
            </Button>
            <Button variant="outline" onClick={() => { setShowAddForm(false); setEditingId(null); }}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search applications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 rounded-lg border bg-background"
          >
            <option value="all">All Status</option>
            {Object.entries(STATUS_CONFIG).map(([key, { label }]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        <div className="text-center py-16 border rounded-xl bg-muted/30">
          <Briefcase className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Applications Yet</h3>
          <p className="text-muted-foreground mb-4">
            Start tracking your job applications to stay organized
          </p>
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Application
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredApplications.map((app) => {
            const StatusIcon = STATUS_CONFIG[app.status].icon;
            return (
              <div key={app.id} className="border rounded-xl bg-card overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <button onClick={() => handleToggleFavorite(app.id)}>
                          <Star className={`h-4 w-4 ${app.isFavorite ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'}`} />
                        </button>
                        <h3 className="font-semibold truncate">{app.position}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs text-white ${STATUS_CONFIG[app.status].color}`}>
                          {STATUS_CONFIG[app.status].label}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {app.company}
                        </span>
                        {app.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {app.location}
                          </span>
                        )}
                        {app.salary && (
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            {app.salary}
                          </span>
                        )}
                        {app.appliedDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Applied {app.appliedDate}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {app.url && (
                        <a href={app.url} target="_blank" rel="noopener noreferrer">
                          <Button variant="ghost" size="icon">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </a>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(app)}>
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(app.id)} className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setExpandedId(expandedId === app.id ? null : app.id)}>
                        {expandedId === app.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  {/* Quick Status Change */}
                  <div className="flex gap-1 mt-3">
                    {Object.entries(STATUS_CONFIG).map(([key, { label, color }]) => (
                      <button
                        key={key}
                        onClick={() => handleStatusChange(app.id, key as JobApplication['status'])}
                        className={`px-2 py-1 rounded text-xs transition-colors ${
                          app.status === key
                            ? `${color} text-white`
                            : 'bg-muted hover:bg-muted/80'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedId === app.id && (
                  <div className="border-t p-4 bg-muted/30">
                    {app.nextStep && (
                      <div className="mb-3">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Next Step</p>
                        <p className="text-sm">{app.nextStep}</p>
                      </div>
                    )}
                    {app.notes && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Notes</p>
                        <p className="text-sm whitespace-pre-wrap">{app.notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default JobTrackerPage;
