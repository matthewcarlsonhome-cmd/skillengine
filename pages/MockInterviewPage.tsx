import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Mic, MicOff, Play, Pause, RotateCcw, Send, Bot, User, Clock, CheckCircle, AlertCircle, Volume2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

interface Message {
  id: string;
  role: 'interviewer' | 'candidate';
  content: string;
  timestamp: Date;
  feedback?: string;
}

interface InterviewSession {
  id: string;
  role: string;
  company: string;
  type: string;
  messages: Message[];
  status: 'setup' | 'in-progress' | 'completed';
  startedAt?: Date;
  completedAt?: Date;
  overallFeedback?: string;
  score?: number;
}

const INTERVIEW_TYPES = [
  { id: 'behavioral', name: 'Behavioral', description: 'STAR method questions about past experiences' },
  { id: 'technical', name: 'Technical', description: 'Role-specific technical knowledge' },
  { id: 'case', name: 'Case Study', description: 'Problem-solving and analytical thinking' },
  { id: 'culture', name: 'Culture Fit', description: 'Values alignment and team dynamics' },
  { id: 'leadership', name: 'Leadership', description: 'Management and leadership scenarios' },
];

const QUESTION_BANK: Record<string, string[]> = {
  behavioral: [
    "Tell me about a time when you had to deal with a difficult coworker or team member. How did you handle it?",
    "Describe a situation where you had to meet a tight deadline. What was your approach?",
    "Give me an example of a time you failed. What did you learn from it?",
    "Tell me about a project you're most proud of. What was your role?",
    "Describe a time when you had to persuade someone to see things your way.",
  ],
  technical: [
    "Walk me through your approach to solving complex problems in your field.",
    "What tools and technologies are you most proficient with?",
    "How do you stay current with industry trends and best practices?",
    "Describe a technical challenge you faced and how you solved it.",
    "What's your process for debugging or troubleshooting issues?",
  ],
  case: [
    "Our company is seeing declining user engagement. How would you diagnose and address this?",
    "We're considering entering a new market. Walk me through your analysis framework.",
    "A key product launch is behind schedule. How would you get it back on track?",
    "How would you prioritize features for our next product release?",
    "We need to reduce costs by 20% without impacting quality. What's your approach?",
  ],
  culture: [
    "What type of work environment do you thrive in?",
    "How do you handle disagreements with your manager?",
    "What motivates you to do your best work?",
    "Describe your ideal team dynamic.",
    "How do you balance work and personal life?",
  ],
  leadership: [
    "How do you motivate team members who are underperforming?",
    "Describe your leadership style and how it has evolved.",
    "Tell me about a time you had to make an unpopular decision.",
    "How do you handle giving difficult feedback?",
    "What's your approach to developing and mentoring team members?",
  ],
};

const FEEDBACK_TEMPLATES = {
  good: [
    "Strong use of the STAR method with specific examples.",
    "Clear and concise communication.",
    "Good demonstration of relevant skills.",
    "Effective quantification of results.",
  ],
  improve: [
    "Consider adding more specific metrics or outcomes.",
    "Try to be more concise - aim for 2-3 minute responses.",
    "Include more details about your specific contributions.",
    "Connect your answer more directly to the role requirements.",
  ],
};

const MockInterviewPage: React.FC = () => {
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [setupData, setSetupData] = useState({
    role: '',
    company: '',
    type: 'behavioral',
  });
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load saved sessions
  const [savedSessions, setSavedSessions] = useState<InterviewSession[]>(() => {
    const saved = localStorage.getItem('skillengine_mock_interviews');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('skillengine_mock_interviews', JSON.stringify(savedSessions));
  }, [savedSessions]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session?.messages]);

  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimer(t => t + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startInterview = () => {
    if (!setupData.role || !setupData.company) return;

    const questions = QUESTION_BANK[setupData.type] || QUESTION_BANK.behavioral;
    const firstQuestion = questions[0];

    const newSession: InterviewSession = {
      id: Date.now().toString(),
      role: setupData.role,
      company: setupData.company,
      type: setupData.type,
      messages: [
        {
          id: '1',
          role: 'interviewer',
          content: `Hello! Thank you for joining us today. I'm excited to learn more about you and your experience as it relates to the ${setupData.role} position at ${setupData.company}. Let's begin with our first question:\n\n${firstQuestion}`,
          timestamp: new Date(),
        },
      ],
      status: 'in-progress',
      startedAt: new Date(),
    };

    setSession(newSession);
    setQuestionIndex(0);
    setTimer(0);
    setIsTimerRunning(true);
  };

  const submitAnswer = () => {
    if (!currentAnswer.trim() || !session) return;

    setIsThinking(true);
    setIsTimerRunning(false);

    // Add candidate's answer
    const answerMessage: Message = {
      id: Date.now().toString(),
      role: 'candidate',
      content: currentAnswer,
      timestamp: new Date(),
    };

    // Generate feedback
    const answerLength = currentAnswer.split(' ').length;
    const hasNumbers = /\d/.test(currentAnswer);
    const hasActionVerbs = /led|managed|created|developed|improved|increased|reduced|achieved/i.test(currentAnswer);

    let feedbackPoints: string[] = [];
    let score = 70;

    if (answerLength > 50 && answerLength < 200) {
      feedbackPoints.push(FEEDBACK_TEMPLATES.good[1]);
      score += 10;
    } else if (answerLength < 30) {
      feedbackPoints.push("Your answer was quite brief. Consider elaborating with more details.");
    } else if (answerLength > 250) {
      feedbackPoints.push(FEEDBACK_TEMPLATES.improve[1]);
    }

    if (hasNumbers) {
      feedbackPoints.push(FEEDBACK_TEMPLATES.good[3]);
      score += 10;
    } else {
      feedbackPoints.push(FEEDBACK_TEMPLATES.improve[0]);
    }

    if (hasActionVerbs) {
      feedbackPoints.push(FEEDBACK_TEMPLATES.good[0]);
      score += 10;
    } else {
      feedbackPoints.push(FEEDBACK_TEMPLATES.improve[2]);
    }

    answerMessage.feedback = feedbackPoints.join(' ');

    const questions = QUESTION_BANK[session.type] || QUESTION_BANK.behavioral;
    const nextIndex = questionIndex + 1;

    setTimeout(() => {
      let nextMessage: Message;

      if (nextIndex >= questions.length) {
        // End of interview
        nextMessage = {
          id: (Date.now() + 1).toString(),
          role: 'interviewer',
          content: `Thank you for your responses today. That concludes our interview for the ${session.role} position at ${session.company}. We'll be in touch soon with next steps. Do you have any questions for me?`,
          timestamp: new Date(),
        };

        const completedSession = {
          ...session,
          messages: [...session.messages, answerMessage, nextMessage],
          status: 'completed' as const,
          completedAt: new Date(),
          overallFeedback: `You demonstrated strong communication skills throughout the interview. ${feedbackPoints[0]} Continue practicing to improve response timing and specificity.`,
          score: Math.min(score, 100),
        };

        setSession(completedSession);
        setSavedSessions(prev => [completedSession, ...prev.slice(0, 9)]);
      } else {
        nextMessage = {
          id: (Date.now() + 1).toString(),
          role: 'interviewer',
          content: `Thank you for that response. Let's move on to the next question:\n\n${questions[nextIndex]}`,
          timestamp: new Date(),
        };

        setSession({
          ...session,
          messages: [...session.messages, answerMessage, nextMessage],
        });
        setQuestionIndex(nextIndex);
        setTimer(0);
        setIsTimerRunning(true);
      }

      setIsThinking(false);
      setCurrentAnswer('');
    }, 1500);
  };

  const resetInterview = () => {
    setSession(null);
    setCurrentAnswer('');
    setQuestionIndex(0);
    setTimer(0);
    setIsTimerRunning(false);
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
          <Bot className="h-8 w-8 text-purple-500" />
          Mock Interview Simulator
        </h1>
        <p className="text-muted-foreground mt-2">
          Practice interviews with AI-powered feedback to improve your responses
        </p>
      </div>

      {!session ? (
        <div className="grid md:grid-cols-2 gap-8">
          {/* Setup Form */}
          <div className="bg-card rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Start New Interview</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Target Role</label>
                <input
                  type="text"
                  value={setupData.role}
                  onChange={(e) => setSetupData({ ...setupData, role: e.target.value })}
                  placeholder="e.g., Senior Product Manager"
                  className="w-full px-3 py-2 rounded-md border bg-background"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Company</label>
                <input
                  type="text"
                  value={setupData.company}
                  onChange={(e) => setSetupData({ ...setupData, company: e.target.value })}
                  placeholder="e.g., Google"
                  className="w-full px-3 py-2 rounded-md border bg-background"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Interview Type</label>
                <div className="space-y-2">
                  {INTERVIEW_TYPES.map((type) => (
                    <label
                      key={type.id}
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        setupData.type === type.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="interviewType"
                        value={type.id}
                        checked={setupData.type === type.id}
                        onChange={(e) => setSetupData({ ...setupData, type: e.target.value })}
                        className="mt-1"
                      />
                      <div>
                        <div className="font-medium">{type.name}</div>
                        <div className="text-sm text-muted-foreground">{type.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <Button
                onClick={startInterview}
                disabled={!setupData.role || !setupData.company}
                className="w-full mt-4"
              >
                <Play className="mr-2 h-4 w-4" />
                Start Interview
              </Button>
            </div>
          </div>

          {/* Past Sessions */}
          <div className="bg-card rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Sessions</h2>

            {savedSessions.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No practice sessions yet. Start your first mock interview!
              </p>
            ) : (
              <div className="space-y-3">
                {savedSessions.slice(0, 5).map((s) => (
                  <div key={s.id} className="p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium">{s.role}</div>
                        <div className="text-sm text-muted-foreground">{s.company}</div>
                      </div>
                      {s.score && (
                        <div className={`text-lg font-bold ${
                          s.score >= 80 ? 'text-green-500' : s.score >= 60 ? 'text-yellow-500' : 'text-red-500'
                        }`}>
                          {s.score}%
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="capitalize">{s.type}</span>
                      <span>{s.messages.filter(m => m.role === 'candidate').length} answers</span>
                      <span>{new Date(s.startedAt!).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {/* Chat Area */}
          <div className="md:col-span-2 bg-card rounded-lg border flex flex-col h-[600px]">
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between">
              <div>
                <div className="font-semibold">{session.role} Interview</div>
                <div className="text-sm text-muted-foreground">{session.company} - {session.type}</div>
              </div>
              <div className="flex items-center gap-4">
                {session.status === 'in-progress' && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span className="font-mono">{formatTime(timer)}</span>
                  </div>
                )}
                <Button variant="ghost" size="sm" onClick={resetInterview}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {session.messages.map((message) => (
                <div key={message.id}>
                  <div className={`flex gap-3 ${message.role === 'candidate' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      message.role === 'interviewer' ? 'bg-purple-500/20' : 'bg-blue-500/20'
                    }`}>
                      {message.role === 'interviewer' ? (
                        <Bot className="h-4 w-4 text-purple-500" />
                      ) : (
                        <User className="h-4 w-4 text-blue-500" />
                      )}
                    </div>
                    <div className={`max-w-[80%] ${message.role === 'candidate' ? 'text-right' : ''}`}>
                      <div className={`p-3 rounded-lg ${
                        message.role === 'interviewer' ? 'bg-muted' : 'bg-primary text-primary-foreground'
                      }`}>
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      </div>
                      {message.feedback && (
                        <div className="mt-2 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded text-sm text-left">
                          <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400 font-medium mb-1">
                            <AlertCircle className="h-3 w-3" />
                            Feedback
                          </div>
                          <p className="text-muted-foreground">{message.feedback}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {isThinking && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-purple-500" />
                  </div>
                  <div className="bg-muted p-3 rounded-lg">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            {session.status === 'in-progress' && (
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <textarea
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    placeholder="Type your answer here..."
                    rows={3}
                    className="flex-1 px-3 py-2 rounded-md border bg-background resize-none"
                    disabled={isThinking}
                  />
                  <Button
                    onClick={submitAnswer}
                    disabled={!currentAnswer.trim() || isThinking}
                    className="self-end"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Tip: Use the STAR method (Situation, Task, Action, Result) for behavioral questions
                </p>
              </div>
            )}

            {session.status === 'completed' && (
              <div className="p-4 border-t bg-green-500/10">
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Interview Complete!</span>
                  {session.score && <span className="ml-auto text-xl font-bold">{session.score}%</span>}
                </div>
                {session.overallFeedback && (
                  <p className="text-sm text-muted-foreground mt-2">{session.overallFeedback}</p>
                )}
              </div>
            )}
          </div>

          {/* Tips Panel */}
          <div className="space-y-4">
            <div className="bg-card rounded-lg border p-4">
              <h3 className="font-semibold mb-3">Interview Tips</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Use specific examples from your experience</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Quantify results when possible (%, $, time saved)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Keep answers to 2-3 minutes</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>Focus on YOUR contributions, not the team's</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>End with the positive outcome or lesson learned</span>
                </li>
              </ul>
            </div>

            <div className="bg-card rounded-lg border p-4">
              <h3 className="font-semibold mb-3">STAR Method</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-blue-500">S</span>ituation - Set the scene
                </div>
                <div>
                  <span className="font-medium text-green-500">T</span>ask - Describe your responsibility
                </div>
                <div>
                  <span className="font-medium text-yellow-500">A</span>ction - Explain what you did
                </div>
                <div>
                  <span className="font-medium text-purple-500">R</span>esult - Share the outcome
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg border p-4">
              <h3 className="font-semibold mb-3">Progress</h3>
              <div className="text-sm text-muted-foreground">
                <div className="flex justify-between mb-1">
                  <span>Questions Answered</span>
                  <span>{session?.messages.filter(m => m.role === 'candidate').length || 0} / 5</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${((session?.messages.filter(m => m.role === 'candidate').length || 0) / 5) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MockInterviewPage;
