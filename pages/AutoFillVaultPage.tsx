import React, { useState, useEffect } from 'react';
import { ArrowLeft, Lock, Copy, Check, Plus, Trash2, Edit2, Eye, EyeOff, FolderOpen, Briefcase, GraduationCap, Users, FileText, Award, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

interface VaultEntry {
  id: string;
  category: string;
  label: string;
  value: string;
  isSensitive?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface VaultCategory {
  id: string;
  name: string;
  icon: React.FC<{ className?: string }>;
  description: string;
  fields: { label: string; placeholder: string; multiline?: boolean; sensitive?: boolean }[];
}

const VAULT_CATEGORIES: VaultCategory[] = [
  {
    id: 'personal',
    name: 'Personal Information',
    icon: Users,
    description: 'Basic contact and demographic information',
    fields: [
      { label: 'Full Legal Name', placeholder: 'John Michael Doe' },
      { label: 'Email Address', placeholder: 'john.doe@email.com' },
      { label: 'Phone Number', placeholder: '(555) 123-4567' },
      { label: 'Address', placeholder: '123 Main St, City, State 12345', multiline: true },
      { label: 'LinkedIn URL', placeholder: 'linkedin.com/in/johndoe' },
      { label: 'Portfolio/Website', placeholder: 'johndoe.com' },
    ],
  },
  {
    id: 'work-history',
    name: 'Work History',
    icon: Briefcase,
    description: 'Previous employment details for quick form filling',
    fields: [
      { label: 'Current/Most Recent Employer', placeholder: 'Company Name' },
      { label: 'Current/Most Recent Title', placeholder: 'Job Title' },
      { label: 'Employment Dates', placeholder: 'Jan 2020 - Present' },
      { label: 'Current Salary', placeholder: '$85,000', sensitive: true },
      { label: 'Reason for Leaving', placeholder: 'Seeking growth opportunities' },
      { label: 'Supervisor Name', placeholder: 'Jane Smith' },
      { label: 'Supervisor Contact', placeholder: 'Can contact: Yes/No', sensitive: true },
      { label: 'Key Responsibilities', placeholder: 'Led team of 5, managed $2M budget...', multiline: true },
    ],
  },
  {
    id: 'education',
    name: 'Education',
    icon: GraduationCap,
    description: 'Academic background and certifications',
    fields: [
      { label: 'Highest Degree', placeholder: "Bachelor's, Master's, PhD, etc." },
      { label: 'University/Institution', placeholder: 'University Name' },
      { label: 'Major/Field of Study', placeholder: 'Computer Science' },
      { label: 'Graduation Date', placeholder: 'May 2018' },
      { label: 'GPA (if applicable)', placeholder: '3.8/4.0' },
      { label: 'Relevant Coursework', placeholder: 'Data Structures, Machine Learning...', multiline: true },
      { label: 'Certifications', placeholder: 'AWS Certified, PMP, etc.', multiline: true },
    ],
  },
  {
    id: 'references',
    name: 'References',
    icon: FileText,
    description: 'Professional references contact information',
    fields: [
      { label: 'Reference 1 - Name', placeholder: 'Full Name' },
      { label: 'Reference 1 - Title & Company', placeholder: 'Senior Manager at Company' },
      { label: 'Reference 1 - Email', placeholder: 'email@company.com', sensitive: true },
      { label: 'Reference 1 - Phone', placeholder: '(555) 123-4567', sensitive: true },
      { label: 'Reference 1 - Relationship', placeholder: 'Former Manager' },
      { label: 'Reference 2 - Name', placeholder: 'Full Name' },
      { label: 'Reference 2 - Title & Company', placeholder: 'Director at Company' },
      { label: 'Reference 2 - Email', placeholder: 'email@company.com', sensitive: true },
      { label: 'Reference 2 - Phone', placeholder: '(555) 987-6543', sensitive: true },
      { label: 'Reference 2 - Relationship', placeholder: 'Colleague' },
    ],
  },
  {
    id: 'eeo',
    name: 'EEO Information',
    icon: Shield,
    description: 'Equal Employment Opportunity demographic data (optional)',
    fields: [
      { label: 'Gender', placeholder: 'Male/Female/Non-binary/Prefer not to say' },
      { label: 'Race/Ethnicity', placeholder: 'As you identify' },
      { label: 'Veteran Status', placeholder: 'Yes/No/Prefer not to say' },
      { label: 'Disability Status', placeholder: 'Yes/No/Prefer not to say' },
    ],
  },
  {
    id: 'common-answers',
    name: 'Common Application Answers',
    icon: Award,
    description: 'Pre-written answers to frequently asked questions',
    fields: [
      { label: 'Why are you interested in this role?', placeholder: 'I am excited about...', multiline: true },
      { label: 'What are your salary expectations?', placeholder: '$X - $Y based on...', multiline: true },
      { label: 'When can you start?', placeholder: '2 weeks notice required' },
      { label: 'Are you authorized to work?', placeholder: 'Yes, US Citizen / Green Card / etc.' },
      { label: 'Willing to relocate?', placeholder: 'Yes/No/Open to discussion' },
      { label: 'How did you hear about us?', placeholder: 'LinkedIn, referral, etc.' },
    ],
  },
];

const AutoFillVaultPage: React.FC = () => {
  const [entries, setEntries] = useState<VaultEntry[]>(() => {
    const saved = localStorage.getItem('skillengine_autofill_vault');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeCategory, setActiveCategory] = useState(VAULT_CATEGORIES[0].id);
  const [showSensitive, setShowSensitive] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    localStorage.setItem('skillengine_autofill_vault', JSON.stringify(entries));
  }, [entries]);

  const getEntry = (category: string, label: string) => {
    return entries.find(e => e.category === category && e.label === label);
  };

  const saveEntry = (category: string, label: string, value: string, isSensitive: boolean = false) => {
    const existing = getEntry(category, label);
    const now = new Date().toISOString();

    if (existing) {
      setEntries(prev => prev.map(e =>
        e.id === existing.id ? { ...e, value, updatedAt: now } : e
      ));
    } else {
      const newEntry: VaultEntry = {
        id: Date.now().toString(),
        category,
        label,
        value,
        isSensitive,
        createdAt: now,
        updatedAt: now,
      };
      setEntries(prev => [...prev, newEntry]);
    }
    setEditingId(null);
    setEditValue('');
  };

  const deleteEntry = (id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const startEditing = (category: string, label: string, currentValue: string) => {
    setEditingId(`${category}-${label}`);
    setEditValue(currentValue);
  };

  const currentCategory = VAULT_CATEGORIES.find(c => c.id === activeCategory)!;
  const CategoryIcon = currentCategory.icon;

  const filledCount = entries.filter(e => e.category === activeCategory && e.value).length;
  const totalFields = currentCategory.fields.length;
  const completionPercent = Math.round((filledCount / totalFields) * 100);

  const totalFilled = entries.filter(e => e.value).length;
  const grandTotal = VAULT_CATEGORIES.reduce((sum, c) => sum + c.fields.length, 0);

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
          <Lock className="h-8 w-8 text-green-500" />
          Application Auto-Fill Vault
        </h1>
        <p className="text-muted-foreground mt-2">
          Store your application data for quick copy-paste into job applications
        </p>
      </div>

      {/* Overall Progress */}
      <div className="bg-card rounded-lg border p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Vault Completion</span>
          <span className="text-sm text-muted-foreground">{totalFilled} / {grandTotal} fields</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 transition-all"
            style={{ width: `${(totalFilled / grandTotal) * 100}%` }}
          />
        </div>
        <div className="flex items-center gap-4 mt-3 text-sm">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSensitive(!showSensitive)}
            className="gap-2"
          >
            {showSensitive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showSensitive ? 'Hide' : 'Show'} Sensitive Data
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        {/* Category Sidebar */}
        <div className="space-y-2">
          {VAULT_CATEGORIES.map((category) => {
            const Icon = category.icon;
            const filled = entries.filter(e => e.category === category.id && e.value).length;
            const total = category.fields.length;

            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                  activeCategory === category.id
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{category.name}</div>
                  <div className={`text-xs ${activeCategory === category.id ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                    {filled}/{total} filled
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Fields Area */}
        <div className="md:col-span-3">
          <div className="bg-card rounded-lg border">
            {/* Category Header */}
            <div className="p-4 border-b">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <CategoryIcon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="font-semibold">{currentCategory.name}</h2>
                  <p className="text-sm text-muted-foreground">{currentCategory.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">{completionPercent}%</div>
                  <div className="text-xs text-muted-foreground">complete</div>
                </div>
              </div>
            </div>

            {/* Fields */}
            <div className="p-4 space-y-4">
              {currentCategory.fields.map((field) => {
                const entry = getEntry(currentCategory.id, field.label);
                const isEditing = editingId === `${currentCategory.id}-${field.label}`;
                const isSensitive = field.sensitive;
                const displayValue = entry?.value || '';
                const maskedValue = isSensitive && !showSensitive && displayValue
                  ? '••••••••'
                  : displayValue;

                return (
                  <div key={field.label} className="group">
                    <label className="block text-sm font-medium mb-1.5 flex items-center gap-2">
                      {field.label}
                      {isSensitive && <Lock className="h-3 w-3 text-muted-foreground" />}
                    </label>

                    {isEditing ? (
                      <div className="flex gap-2">
                        {field.multiline ? (
                          <textarea
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            placeholder={field.placeholder}
                            rows={3}
                            className="flex-1 px-3 py-2 rounded-md border bg-background"
                            autoFocus
                          />
                        ) : (
                          <input
                            type={isSensitive && !showSensitive ? 'password' : 'text'}
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            placeholder={field.placeholder}
                            className="flex-1 px-3 py-2 rounded-md border bg-background"
                            autoFocus
                          />
                        )}
                        <Button
                          size="sm"
                          onClick={() => saveEntry(currentCategory.id, field.label, editValue, isSensitive)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { setEditingId(null); setEditValue(''); }}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2">
                        <div
                          onClick={() => startEditing(currentCategory.id, field.label, displayValue)}
                          className={`flex-1 px-3 py-2 rounded-md border cursor-pointer transition-colors ${
                            displayValue ? 'bg-background hover:bg-muted' : 'bg-muted/50 border-dashed'
                          }`}
                        >
                          {displayValue ? (
                            <span className={field.multiline ? 'whitespace-pre-wrap' : ''}>
                              {maskedValue}
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-sm flex items-center gap-2">
                              <Plus className="h-4 w-4" />
                              Click to add {field.label.toLowerCase()}
                            </span>
                          )}
                        </div>

                        {displayValue && (
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(displayValue, `${currentCategory.id}-${field.label}`)}
                              title="Copy to clipboard"
                            >
                              {copiedId === `${currentCategory.id}-${field.label}` ? (
                                <Check className="h-4 w-4 text-green-500" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => startEditing(currentCategory.id, field.label, displayValue)}
                              title="Edit"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => entry && deleteEntry(entry.id)}
                              className="text-red-500 hover:text-red-600"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tips */}
          <div className="mt-6 bg-muted/50 rounded-lg p-4">
            <h3 className="font-medium mb-2 flex items-center gap-2">
              <FolderOpen className="h-4 w-4" />
              Quick Tips
            </h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Click any field to add or edit its value</li>
              <li>• Use the copy button to quickly paste into applications</li>
              <li>• Sensitive data (marked with lock icon) is hidden by default</li>
              <li>• Your data is stored locally in your browser - never sent to servers</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutoFillVaultPage;
