// Networking Templates - LinkedIn and email outreach templates

import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { useToast } from '../hooks/useToast';
import {
  Users,
  Mail,
  Linkedin,
  Copy,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Edit3,
  Check,
  MessageSquare,
  UserPlus,
  Coffee,
  Briefcase,
  GraduationCap,
} from 'lucide-react';

interface Template {
  id: string;
  name: string;
  category: 'linkedin' | 'email' | 'followup';
  scenario: string;
  subject?: string;
  body: string;
  variables: string[];
}

const TEMPLATES: Template[] = [
  // LinkedIn Connection Requests
  {
    id: 'linkedin-mutual',
    name: 'Mutual Connection',
    category: 'linkedin',
    scenario: 'When you share a mutual connection',
    body: `Hi {{name}}, I noticed we're both connected to {{mutual_connection}}. I'm a {{your_role}} interested in {{their_company}}'s work in {{industry}}. Would love to connect and learn more about your experience there!`,
    variables: ['name', 'mutual_connection', 'your_role', 'their_company', 'industry'],
  },
  {
    id: 'linkedin-alumni',
    name: 'Fellow Alumni',
    category: 'linkedin',
    scenario: 'Reaching out to fellow alumni',
    body: `Hi {{name}}, Fellow {{school}} alum here! I'm currently exploring opportunities in {{industry}} and noticed your impressive career at {{their_company}}. Would love to connect and hear about your journey.`,
    variables: ['name', 'school', 'industry', 'their_company'],
  },
  {
    id: 'linkedin-admirer',
    name: 'Admirer of Work',
    category: 'linkedin',
    scenario: 'When you genuinely admire their work',
    body: `Hi {{name}}, I recently came across your {{content_type}} about {{topic}} and found it incredibly insightful. I'm a {{your_role}} working in {{your_industry}} and would love to connect!`,
    variables: ['name', 'content_type', 'topic', 'your_role', 'your_industry'],
  },
  {
    id: 'linkedin-recruiter',
    name: 'To Recruiter',
    category: 'linkedin',
    scenario: 'Reaching out to a recruiter',
    body: `Hi {{name}}, I'm a {{your_role}} with {{years}} years of experience in {{industry}}. I'm actively exploring new opportunities and noticed you recruit for {{their_company}}. Would love to connect and share my background!`,
    variables: ['name', 'your_role', 'years', 'industry', 'their_company'],
  },
  // Cold Emails
  {
    id: 'email-informational',
    name: 'Informational Interview',
    category: 'email',
    scenario: 'Requesting an informational interview',
    subject: 'Quick question about your journey at {{company}}',
    body: `Hi {{name}},

I hope this email finds you well. I'm {{your_name}}, a {{your_role}} with {{years}} years of experience in {{industry}}.

I came across your profile and was impressed by your career trajectory at {{company}}. I'm currently exploring opportunities in {{target_area}} and would love to learn more about your experience.

Would you have 15-20 minutes for a quick call or coffee chat? I'd really value your insights.

Thank you for considering!

Best regards,
{{your_name}}`,
    variables: ['name', 'company', 'your_name', 'your_role', 'years', 'industry', 'target_area'],
  },
  {
    id: 'email-referral',
    name: 'Referral Request',
    category: 'email',
    scenario: 'Asking for a job referral',
    subject: 'Referral for {{position}} at {{company}}',
    body: `Hi {{name}},

I hope you're doing well! I'm reaching out because I recently came across the {{position}} role at {{company}} and I'm very excited about it.

Given your experience at {{company}}, I was hoping you might be willing to refer me for this position. I believe my background in {{your_experience}} aligns well with what they're looking for.

I've attached my resume for your reference. Please let me know if you'd like to chat more about my qualifications.

Thank you so much for considering this!

Best,
{{your_name}}`,
    variables: ['name', 'position', 'company', 'your_experience', 'your_name'],
  },
  {
    id: 'email-hiring-manager',
    name: 'Direct to Hiring Manager',
    category: 'email',
    scenario: 'Reaching out directly to a hiring manager',
    subject: 'Experienced {{your_role}} interested in {{position}}',
    body: `Hi {{name}},

I'm {{your_name}}, a {{your_role}} with {{years}} years of experience in {{industry}}. I recently came across the {{position}} opening on your team and wanted to reach out directly.

What excites me most about this role:
• {{reason_1}}
• {{reason_2}}
• {{reason_3}}

My relevant experience includes {{key_achievement}}, which I believe aligns well with {{company}}'s goals.

I'd love the opportunity to discuss how I can contribute to your team. Would you be open to a brief conversation?

Best regards,
{{your_name}}`,
    variables: ['name', 'your_name', 'your_role', 'years', 'industry', 'position', 'reason_1', 'reason_2', 'reason_3', 'key_achievement', 'company'],
  },
  // Follow-ups
  {
    id: 'followup-after-interview',
    name: 'Post-Interview Thank You',
    category: 'followup',
    scenario: 'After an interview',
    subject: 'Thank you for the interview - {{position}}',
    body: `Hi {{name}},

Thank you so much for taking the time to speak with me today about the {{position}} role at {{company}}.

I really enjoyed learning more about {{topic_discussed}} and I'm even more excited about the opportunity to contribute to {{specific_project}}.

Our conversation reinforced my enthusiasm for this role, and I'm confident that my experience in {{your_strength}} would allow me to make an immediate impact.

Please don't hesitate to reach out if you need any additional information. I look forward to hearing from you!

Best regards,
{{your_name}}`,
    variables: ['name', 'position', 'company', 'topic_discussed', 'specific_project', 'your_strength', 'your_name'],
  },
  {
    id: 'followup-no-response',
    name: 'Gentle Follow-up',
    category: 'followup',
    scenario: 'When you haven\'t heard back',
    subject: 'Following up on {{position}} application',
    body: `Hi {{name}},

I hope you're having a great week! I wanted to follow up on my application for the {{position}} role at {{company}}.

I remain very interested in this opportunity and believe my background in {{your_skill}} would be a great fit. I'd love the chance to discuss how I can contribute to your team.

Is there any additional information I can provide to help with the decision?

Thank you for your consideration!

Best,
{{your_name}}`,
    variables: ['name', 'position', 'company', 'your_skill', 'your_name'],
  },
  {
    id: 'followup-after-coffee',
    name: 'After Coffee Chat',
    category: 'followup',
    scenario: 'After an informational interview',
    subject: 'Thank you for the great conversation!',
    body: `Hi {{name}},

Thank you so much for taking the time to chat with me {{when}}. I really appreciated your insights about {{topic_1}} and {{topic_2}}.

Your advice about {{specific_advice}} was particularly helpful, and I'm going to {{action_item}} based on your suggestion.

I'll keep you posted on my progress, and please let me know if there's ever anything I can do to return the favor!

Best regards,
{{your_name}}`,
    variables: ['name', 'when', 'topic_1', 'topic_2', 'specific_advice', 'action_item', 'your_name'],
  },
];

const CATEGORY_CONFIG = {
  linkedin: { label: 'LinkedIn', icon: Linkedin, color: 'text-blue-500' },
  email: { label: 'Cold Email', icon: Mail, color: 'text-green-500' },
  followup: { label: 'Follow-up', icon: MessageSquare, color: 'text-purple-500' },
};

const NetworkingTemplatesPage: React.FC = () => {
  const { addToast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);
  const [filledVariables, setFilledVariables] = useState<Record<string, Record<string, string>>>({});

  const filteredTemplates = selectedCategory === 'all'
    ? TEMPLATES
    : TEMPLATES.filter((t) => t.category === selectedCategory);

  const fillTemplate = (template: Template): string => {
    let filled = template.body;
    const vars = filledVariables[template.id] || {};
    template.variables.forEach((v) => {
      const value = vars[v] || `{{${v}}}`;
      filled = filled.replace(new RegExp(`{{${v}}}`, 'g'), value);
    });
    return filled;
  };

  const fillSubject = (template: Template): string => {
    if (!template.subject) return '';
    let filled = template.subject;
    const vars = filledVariables[template.id] || {};
    template.variables.forEach((v) => {
      const value = vars[v] || `{{${v}}}`;
      filled = filled.replace(new RegExp(`{{${v}}}`, 'g'), value);
    });
    return filled;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    addToast('Copied to clipboard!', 'success');
  };

  const updateVariable = (templateId: string, variable: string, value: string) => {
    setFilledVariables((prev) => ({
      ...prev,
      [templateId]: {
        ...(prev[templateId] || {}),
        [variable]: value,
      },
    }));
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
          <Users className="h-6 w-6 text-blue-500" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Networking Templates</h1>
          <p className="text-muted-foreground">Professional outreach templates for job seekers</p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        <Button
          variant={selectedCategory === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedCategory('all')}
        >
          All Templates
        </Button>
        {Object.entries(CATEGORY_CONFIG).map(([key, { label, icon: Icon, color }]) => (
          <Button
            key={key}
            variant={selectedCategory === key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(key)}
            className="gap-2"
          >
            <Icon className={`h-4 w-4 ${selectedCategory !== key ? color : ''}`} />
            {label}
          </Button>
        ))}
      </div>

      {/* Templates */}
      <div className="space-y-4">
        {filteredTemplates.map((template) => {
          const { icon: CategoryIcon, color } = CATEGORY_CONFIG[template.category];
          const isExpanded = expandedTemplate === template.id;
          const isEditing = editingTemplate === template.id;
          const filledBody = fillTemplate(template);
          const filledSubject = fillSubject(template);

          return (
            <div key={template.id} className="border rounded-xl overflow-hidden">
              <button
                onClick={() => setExpandedTemplate(isExpanded ? null : template.id)}
                className="w-full p-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <CategoryIcon className={`h-5 w-5 ${color}`} />
                  <div className="text-left">
                    <p className="font-semibold">{template.name}</p>
                    <p className="text-sm text-muted-foreground">{template.scenario}</p>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </button>

              {isExpanded && (
                <div className="border-t p-4 bg-muted/20">
                  {/* Variable Inputs */}
                  {isEditing && (
                    <div className="mb-4 p-4 border rounded-lg bg-background">
                      <p className="text-sm font-medium mb-3">Fill in the blanks:</p>
                      <div className="grid grid-cols-2 gap-3">
                        {template.variables.map((v) => (
                          <div key={v}>
                            <label className="text-xs text-muted-foreground capitalize">
                              {v.replace(/_/g, ' ')}
                            </label>
                            <Input
                              value={filledVariables[template.id]?.[v] || ''}
                              onChange={(e) => updateVariable(template.id, v, e.target.value)}
                              placeholder={v.replace(/_/g, ' ')}
                              className="mt-1"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Template Content */}
                  {template.subject && (
                    <div className="mb-3">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Subject:</p>
                      <p className="text-sm bg-background p-2 rounded border">{filledSubject}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Message:</p>
                    <pre className="text-sm bg-background p-4 rounded border whitespace-pre-wrap font-sans">
                      {filledBody}
                    </pre>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-4">
                    <Button
                      size="sm"
                      onClick={() => copyToClipboard(template.subject ? `Subject: ${filledSubject}\n\n${filledBody}` : filledBody)}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingTemplate(isEditing ? null : template.id)}
                    >
                      {isEditing ? (
                        <>
                          <Check className="h-4 w-4 mr-1" />
                          Done
                        </>
                      ) : (
                        <>
                          <Edit3 className="h-4 w-4 mr-1" />
                          Customize
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Tips */}
      <div className="mt-8 p-6 border rounded-xl bg-blue-500/5">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-blue-500" />
          Networking Tips
        </h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• Personalize every message - generic outreach gets ignored</li>
          <li>• Keep LinkedIn connection requests under 300 characters</li>
          <li>• Follow up once after 5-7 days if no response</li>
          <li>• Give before you ask - share something valuable</li>
          <li>• Be specific about what you're asking for</li>
          <li>• Always thank people for their time</li>
        </ul>
      </div>
    </div>
  );
};

export default NetworkingTemplatesPage;
