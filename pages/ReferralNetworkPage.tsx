import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, Plus, Trash2, Edit2, Check, X, Building2, Mail, Phone, Linkedin, Star, MessageSquare, Calendar, ExternalLink, Search, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

interface Connection {
  id: string;
  name: string;
  company: string;
  title: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  relationship: 'former-colleague' | 'alumni' | 'friend' | 'recruiter' | 'hiring-manager' | 'other';
  strength: 1 | 2 | 3 | 4 | 5;
  notes?: string;
  lastContact?: string;
  referralStatus: 'none' | 'asked' | 'agreed' | 'submitted' | 'declined';
  targetRole?: string;
  createdAt: string;
  updatedAt: string;
}

interface TargetCompany {
  id: string;
  name: string;
  connections: string[];
  priority: 'high' | 'medium' | 'low';
  notes?: string;
}

const RELATIONSHIP_TYPES = [
  { id: 'former-colleague', label: 'Former Colleague' },
  { id: 'alumni', label: 'Alumni' },
  { id: 'friend', label: 'Friend/Personal' },
  { id: 'recruiter', label: 'Recruiter' },
  { id: 'hiring-manager', label: 'Hiring Manager' },
  { id: 'other', label: 'Other' },
];

const REFERRAL_STATUSES = [
  { id: 'none', label: 'Not Asked', color: 'text-gray-500' },
  { id: 'asked', label: 'Asked', color: 'text-yellow-500' },
  { id: 'agreed', label: 'Agreed', color: 'text-blue-500' },
  { id: 'submitted', label: 'Submitted', color: 'text-green-500' },
  { id: 'declined', label: 'Declined', color: 'text-red-500' },
];

const ReferralNetworkPage: React.FC = () => {
  const [connections, setConnections] = useState<Connection[]>(() => {
    const saved = localStorage.getItem('skillengine_referral_network');
    return saved ? JSON.parse(saved) : [];
  });

  const [companies, setCompanies] = useState<TargetCompany[]>(() => {
    const saved = localStorage.getItem('skillengine_target_companies');
    return saved ? JSON.parse(saved) : [];
  });

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCompany, setFilterCompany] = useState('');
  const [view, setView] = useState<'connections' | 'companies'>('connections');

  const [formData, setFormData] = useState<Partial<Connection>>({
    name: '',
    company: '',
    title: '',
    email: '',
    phone: '',
    linkedin: '',
    relationship: 'former-colleague',
    strength: 3,
    notes: '',
    referralStatus: 'none',
    targetRole: '',
  });

  const [companyForm, setCompanyForm] = useState({ name: '', priority: 'medium' as const, notes: '' });
  const [showCompanyForm, setShowCompanyForm] = useState(false);

  useEffect(() => {
    localStorage.setItem('skillengine_referral_network', JSON.stringify(connections));
  }, [connections]);

  useEffect(() => {
    localStorage.setItem('skillengine_target_companies', JSON.stringify(companies));
  }, [companies]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.company || !formData.title) return;

    const now = new Date().toISOString();

    if (editingId) {
      setConnections(prev => prev.map(c =>
        c.id === editingId ? { ...c, ...formData, updatedAt: now } as Connection : c
      ));
      setEditingId(null);
    } else {
      const newConnection: Connection = {
        id: Date.now().toString(),
        ...formData as Connection,
        createdAt: now,
        updatedAt: now,
      };
      setConnections(prev => [newConnection, ...prev]);

      // Auto-add company if new
      if (!companies.find(c => c.name.toLowerCase() === formData.company?.toLowerCase())) {
        setCompanies(prev => [...prev, {
          id: Date.now().toString(),
          name: formData.company!,
          connections: [newConnection.id],
          priority: 'medium',
        }]);
      } else {
        setCompanies(prev => prev.map(c =>
          c.name.toLowerCase() === formData.company?.toLowerCase()
            ? { ...c, connections: [...c.connections, newConnection.id] }
            : c
        ));
      }
    }

    setFormData({
      name: '', company: '', title: '', email: '', phone: '', linkedin: '',
      relationship: 'former-colleague', strength: 3, notes: '', referralStatus: 'none', targetRole: '',
    });
    setShowForm(false);
  };

  const handleEdit = (connection: Connection) => {
    setFormData(connection);
    setEditingId(connection.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setConnections(prev => prev.filter(c => c.id !== id));
  };

  const handleAddCompany = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyForm.name) return;

    setCompanies(prev => [...prev, {
      id: Date.now().toString(),
      name: companyForm.name,
      connections: [],
      priority: companyForm.priority,
      notes: companyForm.notes,
    }]);
    setCompanyForm({ name: '', priority: 'medium', notes: '' });
    setShowCompanyForm(false);
  };

  const updateReferralStatus = (id: string, status: Connection['referralStatus']) => {
    const now = new Date().toISOString();
    setConnections(prev => prev.map(c =>
      c.id === id ? { ...c, referralStatus: status, lastContact: now, updatedAt: now } : c
    ));
  };

  const uniqueCompanies = [...new Set(connections.map(c => c.company))];

  const filteredConnections = connections.filter(c => {
    const matchesSearch = !searchQuery ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCompany = !filterCompany || c.company === filterCompany;
    return matchesSearch && matchesCompany;
  });

  const stats = {
    total: connections.length,
    companies: uniqueCompanies.length,
    referralsAsked: connections.filter(c => c.referralStatus !== 'none').length,
    referralsSubmitted: connections.filter(c => c.referralStatus === 'submitted').length,
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
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
          <Users className="h-8 w-8 text-blue-500" />
          Referral Network Mapper
        </h1>
        <p className="text-muted-foreground mt-2">
          Track connections at target companies and manage referral requests
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-card rounded-lg border p-4">
          <div className="text-2xl font-bold">{stats.total}</div>
          <div className="text-sm text-muted-foreground">Total Connections</div>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="text-2xl font-bold text-blue-500">{stats.companies}</div>
          <div className="text-sm text-muted-foreground">Companies</div>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="text-2xl font-bold text-yellow-500">{stats.referralsAsked}</div>
          <div className="text-sm text-muted-foreground">Referrals Asked</div>
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="text-2xl font-bold text-green-500">{stats.referralsSubmitted}</div>
          <div className="text-sm text-muted-foreground">Referrals Submitted</div>
        </div>
      </div>

      {/* View Toggle and Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex gap-2">
          <Button
            variant={view === 'connections' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setView('connections')}
          >
            <Users className="h-4 w-4 mr-1" />
            Connections
          </Button>
          <Button
            variant={view === 'companies' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setView('companies')}
          >
            <Building2 className="h-4 w-4 mr-1" />
            Target Companies
          </Button>
        </div>

        <div className="flex gap-2">
          {view === 'connections' ? (
            <Button onClick={() => { setShowForm(true); setEditingId(null); }}>
              <Plus className="h-4 w-4 mr-1" />
              Add Connection
            </Button>
          ) : (
            <Button onClick={() => setShowCompanyForm(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Add Target Company
            </Button>
          )}
        </div>
      </div>

      {view === 'connections' && (
        <>
          {/* Search and Filter */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex-1 min-w-64 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search connections..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-md border bg-background"
              />
            </div>
            <select
              value={filterCompany}
              onChange={(e) => setFilterCompany(e.target.value)}
              className="px-3 py-2 rounded-md border bg-background"
            >
              <option value="">All Companies</option>
              {uniqueCompanies.map(company => (
                <option key={company} value={company}>{company}</option>
              ))}
            </select>
          </div>

          {/* Add/Edit Form */}
          {showForm && (
            <div className="bg-card rounded-lg border p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">
                {editingId ? 'Edit Connection' : 'Add New Connection'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Full name"
                      className="w-full px-3 py-2 rounded-md border bg-background"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Company *</label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="Company name"
                      className="w-full px-3 py-2 rounded-md border bg-background"
                      list="companies-list"
                      required
                    />
                    <datalist id="companies-list">
                      {uniqueCompanies.map(c => <option key={c} value={c} />)}
                    </datalist>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Title *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Job title"
                      className="w-full px-3 py-2 rounded-md border bg-background"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="email@example.com"
                      className="w-full px-3 py-2 rounded-md border bg-background"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="(555) 123-4567"
                      className="w-full px-3 py-2 rounded-md border bg-background"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">LinkedIn</label>
                    <input
                      type="url"
                      value={formData.linkedin}
                      onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                      placeholder="linkedin.com/in/..."
                      className="w-full px-3 py-2 rounded-md border bg-background"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Relationship</label>
                    <select
                      value={formData.relationship}
                      onChange={(e) => setFormData({ ...formData, relationship: e.target.value as Connection['relationship'] })}
                      className="w-full px-3 py-2 rounded-md border bg-background"
                    >
                      {RELATIONSHIP_TYPES.map(type => (
                        <option key={type.id} value={type.id}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Connection Strength</label>
                    <div className="flex gap-1 mt-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setFormData({ ...formData, strength: s as 1|2|3|4|5 })}
                          className="p-1"
                        >
                          <Star
                            className={`h-6 w-6 ${s <= (formData.strength || 0) ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'}`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Target Role</label>
                    <input
                      type="text"
                      value={formData.targetRole}
                      onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                      placeholder="Role you're applying for"
                      className="w-full px-3 py-2 rounded-md border bg-background"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="How you know them, conversation topics, etc."
                    rows={2}
                    className="w-full px-3 py-2 rounded-md border bg-background"
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit">
                    {editingId ? 'Update Connection' : 'Add Connection'}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => { setShowForm(false); setEditingId(null); }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Connections List */}
          <div className="space-y-3">
            {filteredConnections.length === 0 ? (
              <div className="bg-card rounded-lg border p-8 text-center">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <h3 className="font-medium mb-1">No connections yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Start building your referral network by adding connections at target companies
                </p>
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Your First Connection
                </Button>
              </div>
            ) : (
              filteredConnections.map((connection) => {
                const statusInfo = REFERRAL_STATUSES.find(s => s.id === connection.referralStatus)!;

                return (
                  <div key={connection.id} className="bg-card rounded-lg border p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-semibold text-primary shrink-0">
                        {connection.name.charAt(0)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-medium">{connection.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {connection.title} at <span className="font-medium">{connection.company}</span>
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`h-3 w-3 ${s <= connection.strength ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground/30'}`}
                              />
                            ))}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 mt-2 text-sm">
                          {connection.email && (
                            <a href={`mailto:${connection.email}`} className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
                              <Mail className="h-3 w-3" />
                              {connection.email}
                            </a>
                          )}
                          {connection.phone && (
                            <a href={`tel:${connection.phone}`} className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
                              <Phone className="h-3 w-3" />
                              {connection.phone}
                            </a>
                          )}
                          {connection.linkedin && (
                            <a href={connection.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
                              <Linkedin className="h-3 w-3" />
                              LinkedIn
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>

                        {connection.notes && (
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                            {connection.notes}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-2 mt-3">
                          <span className="text-xs bg-muted px-2 py-1 rounded">
                            {RELATIONSHIP_TYPES.find(t => t.id === connection.relationship)?.label}
                          </span>

                          <div className="relative group">
                            <button className={`text-xs px-2 py-1 rounded ${statusInfo.color} bg-current/10`}>
                              {statusInfo.label}
                            </button>
                            <div className="absolute bottom-full left-0 mb-1 bg-card border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 min-w-32">
                              {REFERRAL_STATUSES.map(status => (
                                <button
                                  key={status.id}
                                  onClick={() => updateReferralStatus(connection.id, status.id as Connection['referralStatus'])}
                                  className={`block w-full px-3 py-1.5 text-xs text-left hover:bg-muted ${status.color}`}
                                >
                                  {status.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          {connection.targetRole && (
                            <span className="text-xs text-muted-foreground">
                              For: {connection.targetRole}
                            </span>
                          )}

                          <div className="ml-auto flex gap-1">
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(connection)}>
                              <Edit2 className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(connection.id)} className="text-red-500 hover:text-red-600">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      {view === 'companies' && (
        <>
          {/* Add Company Form */}
          {showCompanyForm && (
            <div className="bg-card rounded-lg border p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Add Target Company</h2>
              <form onSubmit={handleAddCompany} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Company Name *</label>
                    <input
                      type="text"
                      value={companyForm.name}
                      onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                      placeholder="e.g., Google"
                      className="w-full px-3 py-2 rounded-md border bg-background"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Priority</label>
                    <select
                      value={companyForm.priority}
                      onChange={(e) => setCompanyForm({ ...companyForm, priority: e.target.value as 'high' | 'medium' | 'low' })}
                      className="w-full px-3 py-2 rounded-md border bg-background"
                    >
                      <option value="high">High Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="low">Low Priority</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Notes</label>
                  <textarea
                    value={companyForm.notes}
                    onChange={(e) => setCompanyForm({ ...companyForm, notes: e.target.value })}
                    placeholder="Why you're interested, open roles, etc."
                    rows={2}
                    className="w-full px-3 py-2 rounded-md border bg-background"
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Add Company</Button>
                  <Button type="button" variant="ghost" onClick={() => setShowCompanyForm(false)}>Cancel</Button>
                </div>
              </form>
            </div>
          )}

          {/* Companies Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {companies.length === 0 ? (
              <div className="md:col-span-2 lg:col-span-3 bg-card rounded-lg border p-8 text-center">
                <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <h3 className="font-medium mb-1">No target companies yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Add companies you're targeting and track your connections there
                </p>
                <Button onClick={() => setShowCompanyForm(true)}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Target Company
                </Button>
              </div>
            ) : (
              companies.map((company) => {
                const companyConnections = connections.filter(c =>
                  c.company.toLowerCase() === company.name.toLowerCase()
                );
                const referralsSubmitted = companyConnections.filter(c => c.referralStatus === 'submitted').length;

                return (
                  <div key={company.id} className="bg-card rounded-lg border p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                          <Building2 className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-medium">{company.name}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            company.priority === 'high' ? 'bg-red-500/10 text-red-500' :
                            company.priority === 'medium' ? 'bg-yellow-500/10 text-yellow-500' :
                            'bg-gray-500/10 text-gray-500'
                          }`}>
                            {company.priority} priority
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCompanies(prev => prev.filter(c => c.id !== company.id))}
                        className="text-red-500"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                      <div className="bg-muted/50 rounded p-2 text-center">
                        <div className="font-bold">{companyConnections.length}</div>
                        <div className="text-xs text-muted-foreground">Connections</div>
                      </div>
                      <div className="bg-muted/50 rounded p-2 text-center">
                        <div className="font-bold text-green-500">{referralsSubmitted}</div>
                        <div className="text-xs text-muted-foreground">Referrals</div>
                      </div>
                    </div>

                    {companyConnections.length > 0 && (
                      <div className="space-y-1">
                        {companyConnections.slice(0, 3).map(c => (
                          <div key={c.id} className="text-sm flex items-center justify-between">
                            <span className="truncate">{c.name}</span>
                            <span className={`text-xs ${REFERRAL_STATUSES.find(s => s.id === c.referralStatus)?.color}`}>
                              {REFERRAL_STATUSES.find(s => s.id === c.referralStatus)?.label}
                            </span>
                          </div>
                        ))}
                        {companyConnections.length > 3 && (
                          <div className="text-xs text-muted-foreground">
                            +{companyConnections.length - 3} more
                          </div>
                        )}
                      </div>
                    )}

                    {company.notes && (
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                        {company.notes}
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ReferralNetworkPage;
