// Interview Question Bank - Pre-built questions organized by category

import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useToast } from '../hooks/useToast';
import {
  MessageSquare,
  Search,
  ChevronDown,
  ChevronUp,
  Copy,
  Bookmark,
  BookmarkCheck,
  Sparkles,
  Users,
  Code,
  TrendingUp,
  Brain,
  Target,
  Heart,
  Lightbulb,
} from 'lucide-react';

interface Question {
  id: string;
  question: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tips?: string;
}

interface Category {
  id: string;
  name: string;
  icon: React.FC<{ className?: string }>;
  color: string;
  questions: Question[];
}

const CATEGORIES: Category[] = [
  {
    id: 'behavioral',
    name: 'Behavioral',
    icon: Users,
    color: 'text-blue-500',
    questions: [
      { id: 'b1', question: 'Tell me about yourself.', category: 'behavioral', difficulty: 'easy', tips: 'Keep it professional and relevant. Use the Present-Past-Future formula.' },
      { id: 'b2', question: 'Why are you interested in this role?', category: 'behavioral', difficulty: 'easy', tips: 'Connect your skills and goals to the specific role and company.' },
      { id: 'b3', question: 'Tell me about a time you failed and what you learned.', category: 'behavioral', difficulty: 'medium', tips: 'Be honest, show growth, and focus on the learning outcome.' },
      { id: 'b4', question: 'Describe a situation where you had to work with a difficult colleague.', category: 'behavioral', difficulty: 'medium', tips: 'Focus on communication, professionalism, and resolution.' },
      { id: 'b5', question: 'Give an example of when you went above and beyond.', category: 'behavioral', difficulty: 'medium', tips: 'Quantify impact where possible and show initiative.' },
      { id: 'b6', question: 'Tell me about your greatest professional achievement.', category: 'behavioral', difficulty: 'easy', tips: 'Use STAR method and highlight measurable results.' },
      { id: 'b7', question: 'How do you handle stress and pressure?', category: 'behavioral', difficulty: 'medium', tips: 'Give specific examples and techniques you use.' },
      { id: 'b8', question: 'Describe a time you disagreed with your manager.', category: 'behavioral', difficulty: 'hard', tips: 'Show respect, communication skills, and professional resolution.' },
    ],
  },
  {
    id: 'technical',
    name: 'Technical',
    icon: Code,
    color: 'text-green-500',
    questions: [
      { id: 't1', question: 'Explain a complex technical concept to a non-technical person.', category: 'technical', difficulty: 'medium', tips: 'Use analogies and avoid jargon.' },
      { id: 't2', question: 'Walk me through your approach to debugging a problem.', category: 'technical', difficulty: 'medium', tips: 'Show systematic thinking and tool knowledge.' },
      { id: 't3', question: 'How do you stay current with technology trends?', category: 'technical', difficulty: 'easy', tips: 'Mention specific resources, communities, or learning habits.' },
      { id: 't4', question: 'Describe a technical project you\'re proud of.', category: 'technical', difficulty: 'medium', tips: 'Focus on your role, challenges overcome, and impact.' },
      { id: 't5', question: 'How do you approach learning a new technology?', category: 'technical', difficulty: 'easy', tips: 'Show curiosity and structured learning approach.' },
      { id: 't6', question: 'Tell me about a time you had to make a technical tradeoff.', category: 'technical', difficulty: 'hard', tips: 'Show decision-making process and business awareness.' },
    ],
  },
  {
    id: 'leadership',
    name: 'Leadership',
    icon: TrendingUp,
    color: 'text-purple-500',
    questions: [
      { id: 'l1', question: 'Describe your leadership style.', category: 'leadership', difficulty: 'medium', tips: 'Be authentic and give examples of how you adapt.' },
      { id: 'l2', question: 'Tell me about a time you led a team through change.', category: 'leadership', difficulty: 'hard', tips: 'Show change management skills and empathy.' },
      { id: 'l3', question: 'How do you motivate team members?', category: 'leadership', difficulty: 'medium', tips: 'Show understanding of different motivators.' },
      { id: 'l4', question: 'Describe a difficult decision you had to make as a leader.', category: 'leadership', difficulty: 'hard', tips: 'Show decision-making process and accountability.' },
      { id: 'l5', question: 'How do you handle underperforming team members?', category: 'leadership', difficulty: 'hard', tips: 'Show empathy, clear communication, and growth mindset.' },
      { id: 'l6', question: 'Tell me about a time you had to give difficult feedback.', category: 'leadership', difficulty: 'medium', tips: 'Show constructive approach and follow-through.' },
    ],
  },
  {
    id: 'problem-solving',
    name: 'Problem Solving',
    icon: Brain,
    color: 'text-orange-500',
    questions: [
      { id: 'p1', question: 'Describe a complex problem you solved.', category: 'problem-solving', difficulty: 'medium', tips: 'Use STAR method and show analytical thinking.' },
      { id: 'p2', question: 'How do you approach a problem you\'ve never seen before?', category: 'problem-solving', difficulty: 'medium', tips: 'Show systematic approach and resourcefulness.' },
      { id: 'p3', question: 'Tell me about a time you had to make a decision with incomplete information.', category: 'problem-solving', difficulty: 'hard', tips: 'Show risk assessment and decision-making skills.' },
      { id: 'p4', question: 'Describe a situation where you identified a problem before it became critical.', category: 'problem-solving', difficulty: 'medium', tips: 'Show proactive thinking and attention to detail.' },
      { id: 'p5', question: 'How do you prioritize when everything is urgent?', category: 'problem-solving', difficulty: 'medium', tips: 'Show frameworks and communication with stakeholders.' },
    ],
  },
  {
    id: 'motivation',
    name: 'Motivation & Goals',
    icon: Target,
    color: 'text-red-500',
    questions: [
      { id: 'm1', question: 'Where do you see yourself in 5 years?', category: 'motivation', difficulty: 'easy', tips: 'Show ambition aligned with the role and company.' },
      { id: 'm2', question: 'What motivates you professionally?', category: 'motivation', difficulty: 'easy', tips: 'Be genuine and connect to the role.' },
      { id: 'm3', question: 'Why are you leaving your current job?', category: 'motivation', difficulty: 'medium', tips: 'Stay positive and focus on growth opportunities.' },
      { id: 'm4', question: 'What are you looking for in your next role?', category: 'motivation', difficulty: 'easy', tips: 'Align with what the role offers.' },
      { id: 'm5', question: 'What would make you stay at a company long-term?', category: 'motivation', difficulty: 'medium', tips: 'Show thoughtfulness about career and culture fit.' },
    ],
  },
  {
    id: 'culture',
    name: 'Culture Fit',
    icon: Heart,
    color: 'text-pink-500',
    questions: [
      { id: 'c1', question: 'What type of work environment do you thrive in?', category: 'culture', difficulty: 'easy', tips: 'Research the company culture beforehand.' },
      { id: 'c2', question: 'How do you handle feedback?', category: 'culture', difficulty: 'easy', tips: 'Show openness and growth mindset.' },
      { id: 'c3', question: 'Describe your ideal team.', category: 'culture', difficulty: 'easy', tips: 'Show collaboration skills and flexibility.' },
      { id: 'c4', question: 'How do you balance work and personal life?', category: 'culture', difficulty: 'medium', tips: 'Show self-awareness and healthy boundaries.' },
      { id: 'c5', question: 'What are your values at work?', category: 'culture', difficulty: 'medium', tips: 'Be authentic and connect to company values.' },
    ],
  },
  {
    id: 'situational',
    name: 'Situational',
    icon: Lightbulb,
    color: 'text-yellow-500',
    questions: [
      { id: 's1', question: 'What would you do in your first 30/60/90 days?', category: 'situational', difficulty: 'medium', tips: 'Show planning skills and quick value delivery.' },
      { id: 's2', question: 'How would you handle a missed deadline?', category: 'situational', difficulty: 'medium', tips: 'Show accountability and communication.' },
      { id: 's3', question: 'What would you do if you disagreed with a company policy?', category: 'situational', difficulty: 'hard', tips: 'Show professionalism and constructive approach.' },
      { id: 's4', question: 'How would you handle multiple urgent requests from different stakeholders?', category: 'situational', difficulty: 'medium', tips: 'Show prioritization and communication skills.' },
      { id: 's5', question: 'What would you do if you made a mistake that impacted the team?', category: 'situational', difficulty: 'medium', tips: 'Show accountability, quick action, and learning.' },
    ],
  },
];

const DIFFICULTY_COLORS = {
  easy: 'bg-green-500/20 text-green-500',
  medium: 'bg-yellow-500/20 text-yellow-600',
  hard: 'bg-red-500/20 text-red-500',
};

const STORAGE_KEY = 'skillengine_saved_questions';

const InterviewBankPage: React.FC = () => {
  const { addToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string | null>('behavioral');
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const [savedQuestions, setSavedQuestions] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const toggleSaveQuestion = (id: string) => {
    const updated = savedQuestions.includes(id)
      ? savedQuestions.filter((q) => q !== id)
      : [...savedQuestions, id];
    setSavedQuestions(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    addToast(
      savedQuestions.includes(id) ? 'Question removed from saved' : 'Question saved',
      'success'
    );
  };

  const copyQuestion = (question: string) => {
    navigator.clipboard.writeText(question);
    addToast('Question copied to clipboard', 'success');
  };

  // Filter questions based on search
  const filteredCategories = CATEGORIES.map((cat) => ({
    ...cat,
    questions: cat.questions.filter((q) =>
      q.question.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((cat) => searchQuery === '' || cat.questions.length > 0);

  const totalQuestions = CATEGORIES.reduce((acc, cat) => acc + cat.questions.length, 0);

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
          <MessageSquare className="h-6 w-6 text-purple-500" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Interview Question Bank</h1>
          <p className="text-muted-foreground">{totalQuestions} questions across {CATEGORIES.length} categories</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search questions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Saved Questions Summary */}
      {savedQuestions.length > 0 && (
        <div className="mb-6 p-4 rounded-xl border bg-primary/5">
          <div className="flex items-center gap-2 text-sm">
            <BookmarkCheck className="h-4 w-4 text-primary" />
            <span>{savedQuestions.length} questions saved for practice</span>
          </div>
        </div>
      )}

      {/* Categories */}
      <div className="space-y-4">
        {filteredCategories.map((category) => {
          const Icon = category.icon;
          const isExpanded = expandedCategory === category.id;

          return (
            <div key={category.id} className="border rounded-xl overflow-hidden">
              <button
                onClick={() => setExpandedCategory(isExpanded ? null : category.id)}
                className="w-full p-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-5 w-5 ${category.color}`} />
                  <span className="font-semibold">{category.name}</span>
                  <span className="text-sm text-muted-foreground">
                    ({category.questions.length} questions)
                  </span>
                </div>
                {isExpanded ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </button>

              {isExpanded && (
                <div className="border-t">
                  {category.questions.map((question) => {
                    const isSaved = savedQuestions.includes(question.id);
                    const isQuestionExpanded = expandedQuestion === question.id;

                    return (
                      <div key={question.id} className="border-b last:border-b-0">
                        <div className="p-4 hover:bg-muted/20 transition-colors">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <p className="font-medium mb-2">{question.question}</p>
                              <span className={`text-xs px-2 py-0.5 rounded ${DIFFICULTY_COLORS[question.difficulty]}`}>
                                {question.difficulty}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => copyQuestion(question.question)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => toggleSaveQuestion(question.id)}
                                className={isSaved ? 'text-primary' : ''}
                              >
                                {isSaved ? (
                                  <BookmarkCheck className="h-4 w-4" />
                                ) : (
                                  <Bookmark className="h-4 w-4" />
                                )}
                              </Button>
                              {question.tips && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setExpandedQuestion(isQuestionExpanded ? null : question.id)}
                                >
                                  <Sparkles className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>

                          {isQuestionExpanded && question.tips && (
                            <div className="mt-3 p-3 rounded-lg bg-primary/5 text-sm">
                              <p className="font-medium text-primary mb-1">Tips:</p>
                              <p className="text-muted-foreground">{question.tips}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InterviewBankPage;
