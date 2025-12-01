// Company Research Notes - Save notes about companies you're researching

import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { useToast } from '../hooks/useToast';
import {
  Building2,
  Plus,
  Search,
  Trash2,
  Edit3,
  ExternalLink,
  Star,
  Users,
  DollarSign,
  MapPin,
  Globe,
  Calendar,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Target,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

interface CompanyNote {
  id: string;
  name: string;
  website?: string;
  industry?: string;
  size?: string;
  location?: string;
  culture?: string;
  pros: string[];
  cons: string[];
  contacts: string;
  interviewNotes: string;
  salaryRange?: string;
  status: 'researching' | 'interested' | 'applied' | 'interviewing' | 'not-interested';
  rating: number;
  createdAt: string;
  updatedAt: string;
}

const STATUS_CONFIG = {
  researching: { label: 'Researching', color: 'bg-gray-500' },
  interested: { label: 'Interested', color: 'bg-blue-500' },
  applied: { label: 'Applied', color: 'bg-yellow-500' },
  interviewing: { label: 'Interviewing', color: 'bg-green-500' },
  'not-interested': { label: 'Not Interested', color: 'bg-red-500' },
};

const STORAGE_KEY = 'skillengine_company_notes';

const CompanyNotesPage: React.FC = () => {
  const { addToast } = useToast();
  const [companies, setCompanies] = useState<CompanyNote[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    website: '',
    industry: '',
    size: '',
    location: '',
    culture: '',
    pros: '',
    cons: '',
    contacts: '',
    interviewNotes: '',
    salaryRange: '',
    status: 'researching' as CompanyNote['status'],
    rating: 0,
  });

  // Load from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setCompanies(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load company notes:', e);
    }
  }, []);

  const saveCompanies = (data: CompanyNote[]) => {
    setCompanies(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const handleSubmit = () => {
    if (!formData.name) {
      addToast('Company name is required', 'error');
      return;
    }

    if (editingId) {
      const updated = companies.map((c) =>
        c.id === editingId
          ? {
              ...c,
              ...formData,
              pros: formData.pros.split('\n').filter(Boolean),
              cons: formData.cons.split('\n').filter(Boolean),
              updatedAt: new Date().toISOString(),
            }
          : c
      );
      saveCompanies(updated);
      addToast('Company updated', 'success');
      setEditingId(null);
    } else {
      const newCompany: CompanyNote = {
        id: crypto.randomUUID(),
        ...formData,
        pros: formData.pros.split('\n').filter(Boolean),
        cons: formData.cons.split('\n').filter(Boolean),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      saveCompanies([newCompany, ...companies]);
      addToast('Company added', 'success');
    }

    resetForm();
    setShowAddForm(false);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      website: '',
      industry: '',
      size: '',
      location: '',
      culture: '',
      pros: '',
      cons: '',
      contacts: '',
      interviewNotes: '',
      salaryRange: '',
      status: 'researching',
      rating: 0,
    });
  };

  const handleEdit = (company: CompanyNote) => {
    setFormData({
      name: company.name,
      website: company.website || '',
      industry: company.industry || '',
      size: company.size || '',
      location: company.location || '',
      culture: company.culture || '',
      pros: company.pros.join('\n'),
      cons: company.cons.join('\n'),
      contacts: company.contacts,
      interviewNotes: company.interviewNotes,
      salaryRange: company.salaryRange || '',
      status: company.status,
      rating: company.rating,
    });
    setEditingId(company.id);
    setShowAddForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this company note?')) {
      saveCompanies(companies.filter((c) => c.id !== id));
      addToast('Company deleted', 'success');
    }
  };

  const filteredCompanies = companies
    .filter((c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.industry?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => b.rating - a.rating || new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
            <Building2 className="h-6 w-6 text-indigo-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Company Notes</h1>
            <p className="text-muted-foreground">Research and track companies</p>
          </div>
        </div>
        <Button onClick={() => { setShowAddForm(true); setEditingId(null); resetForm(); }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Company
        </Button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="border rounded-xl p-6 mb-8 bg-card">
          <h2 className="text-lg font-semibold mb-4">
            {editingId ? 'Edit Company' : 'Add New Company'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Company Name *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <Input
              placeholder="Website"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            />
            <Input
              placeholder="Industry"
              value={formData.industry}
              onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
            />
            <Input
              placeholder="Company Size (e.g., 100-500)"
              value={formData.size}
              onChange={(e) => setFormData({ ...formData, size: e.target.value })}
            />
            <Input
              placeholder="Location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
            <Input
              placeholder="Salary Range"
              value={formData.salaryRange}
              onChange={(e) => setFormData({ ...formData, salaryRange: e.target.value })}
            />
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as CompanyNote['status'] })}
              className="p-2 rounded-lg border bg-background"
            >
              {Object.entries(STATUS_CONFIG).map(([key, { label }]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Rating:</span>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setFormData({ ...formData, rating: star })}
                  className="focus:outline-none"
                >
                  <Star
                    className={`h-5 w-5 ${
                      star <= formData.rating ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          <div className="mt-4">
            <Input
              placeholder="Culture & Values"
              value={formData.culture}
              onChange={(e) => setFormData({ ...formData, culture: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Pros (one per line)</label>
              <Textarea
                placeholder="Great benefits&#10;Remote friendly&#10;Good growth"
                value={formData.pros}
                onChange={(e) => setFormData({ ...formData, pros: e.target.value })}
                rows={3}
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Cons (one per line)</label>
              <Textarea
                placeholder="Long hours&#10;Limited PTO&#10;Low salary"
                value={formData.cons}
                onChange={(e) => setFormData({ ...formData, cons: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <Textarea
            placeholder="Contacts (names, roles, emails...)"
            value={formData.contacts}
            onChange={(e) => setFormData({ ...formData, contacts: e.target.value })}
            className="mt-4"
            rows={2}
          />
          <Textarea
            placeholder="Interview notes and insights..."
            value={formData.interviewNotes}
            onChange={(e) => setFormData({ ...formData, interviewNotes: e.target.value })}
            className="mt-4"
            rows={3}
          />
          <div className="flex gap-2 mt-4">
            <Button onClick={handleSubmit}>
              {editingId ? 'Update' : 'Add'} Company
            </Button>
            <Button variant="outline" onClick={() => { setShowAddForm(false); setEditingId(null); }}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search companies..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Companies List */}
      {filteredCompanies.length === 0 ? (
        <div className="text-center py-16 border rounded-xl bg-muted/30">
          <Building2 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Companies Yet</h3>
          <p className="text-muted-foreground mb-4">
            Start researching companies and save your notes
          </p>
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Company
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCompanies.map((company) => (
            <div key={company.id} className="border rounded-xl bg-card overflow-hidden">
              <div className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold truncate">{company.name}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs text-white ${STATUS_CONFIG[company.status].color}`}>
                        {STATUS_CONFIG[company.status].label}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      {company.industry && (
                        <span className="flex items-center gap-1">
                          <Target className="h-3 w-3" />
                          {company.industry}
                        </span>
                      )}
                      {company.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {company.location}
                        </span>
                      )}
                      {company.size && (
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {company.size}
                        </span>
                      )}
                      {company.salaryRange && (
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {company.salaryRange}
                        </span>
                      )}
                    </div>
                    {company.rating > 0 && (
                      <div className="flex items-center gap-1 mt-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= company.rating ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground/30'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {company.website && (
                      <a href={company.website.startsWith('http') ? company.website : `https://${company.website}`} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="icon">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </a>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(company)}>
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(company.id)} className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setExpandedId(expandedId === company.id ? null : company.id)}>
                      {expandedId === company.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>

              {expandedId === company.id && (
                <div className="border-t p-4 bg-muted/30 space-y-4">
                  {company.culture && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Culture & Values</p>
                      <p className="text-sm">{company.culture}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    {company.pros.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-green-500 mb-2 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Pros
                        </p>
                        <ul className="text-sm space-y-1">
                          {company.pros.map((pro, i) => (
                            <li key={i} className="text-muted-foreground">• {pro}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {company.cons.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-red-500 mb-2 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" /> Cons
                        </p>
                        <ul className="text-sm space-y-1">
                          {company.cons.map((con, i) => (
                            <li key={i} className="text-muted-foreground">• {con}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  {company.contacts && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Contacts</p>
                      <p className="text-sm whitespace-pre-wrap">{company.contacts}</p>
                    </div>
                  )}
                  {company.interviewNotes && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Interview Notes</p>
                      <p className="text-sm whitespace-pre-wrap">{company.interviewNotes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CompanyNotesPage;
