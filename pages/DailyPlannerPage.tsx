import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Clock, Plus, Trash2, Check, X, ChevronLeft, ChevronRight, Play, Pause, RotateCcw, Target, Briefcase, Users, BookOpen, Coffee, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

interface TimeBlock {
  id: string;
  startTime: string;
  endTime: string;
  category: string;
  task: string;
  completed: boolean;
  notes?: string;
}

interface DayPlan {
  date: string;
  blocks: TimeBlock[];
  dailyGoal?: string;
  reflection?: string;
}

const CATEGORIES = [
  { id: 'apply', name: 'Apply to Jobs', icon: Briefcase, color: 'bg-blue-500', lightColor: 'bg-blue-500/10 text-blue-500' },
  { id: 'network', name: 'Networking', icon: Users, color: 'bg-purple-500', lightColor: 'bg-purple-500/10 text-purple-500' },
  { id: 'learn', name: 'Skill Building', icon: BookOpen, color: 'bg-green-500', lightColor: 'bg-green-500/10 text-green-500' },
  { id: 'interview', name: 'Interview Prep', icon: Target, color: 'bg-orange-500', lightColor: 'bg-orange-500/10 text-orange-500' },
  { id: 'followup', name: 'Follow-ups', icon: Mail, color: 'bg-cyan-500', lightColor: 'bg-cyan-500/10 text-cyan-500' },
  { id: 'break', name: 'Break/Self-care', icon: Coffee, color: 'bg-pink-500', lightColor: 'bg-pink-500/10 text-pink-500' },
];

const TIME_SLOTS = [
  '06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
  '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30',
];

const SUGGESTED_TASKS: Record<string, string[]> = {
  apply: [
    'Search and save 10 relevant job postings',
    'Customize resume for target role',
    'Submit 3-5 applications',
    'Research companies before applying',
  ],
  network: [
    'Send 3 LinkedIn connection requests',
    'Schedule informational interview',
    'Attend virtual networking event',
    'Follow up with recent connection',
  ],
  learn: [
    'Complete online course module',
    'Practice coding challenges',
    'Read industry articles',
    'Work on portfolio project',
  ],
  interview: [
    'Practice STAR method responses',
    'Research company culture',
    'Prepare questions to ask',
    'Mock interview session',
  ],
  followup: [
    'Send thank you notes',
    'Follow up on pending applications',
    'Check application status',
    'Respond to recruiter messages',
  ],
  break: [
    'Take a walk',
    'Meditation/mindfulness',
    'Healthy lunch break',
    'Exercise/stretch',
  ],
};

const DailyPlannerPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [plans, setPlans] = useState<Record<string, DayPlan>>(() => {
    const saved = localStorage.getItem('skillengine_daily_plans');
    return saved ? JSON.parse(saved) : {};
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    startTime: '09:00',
    endTime: '10:00',
    category: 'apply',
    task: '',
  });

  const [focusTimer, setFocusTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('skillengine_daily_plans', JSON.stringify(plans));
  }, [plans]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setFocusTimer(t => t + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const currentPlan = plans[selectedDate] || { date: selectedDate, blocks: [] };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const navigateDate = (direction: number) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + direction);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const goToToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  const addTimeBlock = () => {
    if (!formData.task) return;

    const newBlock: TimeBlock = {
      id: Date.now().toString(),
      startTime: formData.startTime,
      endTime: formData.endTime,
      category: formData.category,
      task: formData.task,
      completed: false,
    };

    setPlans(prev => ({
      ...prev,
      [selectedDate]: {
        ...currentPlan,
        blocks: [...currentPlan.blocks, newBlock].sort((a, b) => a.startTime.localeCompare(b.startTime)),
      },
    }));

    setFormData({ startTime: '09:00', endTime: '10:00', category: 'apply', task: '' });
    setShowAddForm(false);
  };

  const toggleComplete = (blockId: string) => {
    setPlans(prev => ({
      ...prev,
      [selectedDate]: {
        ...currentPlan,
        blocks: currentPlan.blocks.map(b =>
          b.id === blockId ? { ...b, completed: !b.completed } : b
        ),
      },
    }));
  };

  const deleteBlock = (blockId: string) => {
    setPlans(prev => ({
      ...prev,
      [selectedDate]: {
        ...currentPlan,
        blocks: currentPlan.blocks.filter(b => b.id !== blockId),
      },
    }));
  };

  const startFocusSession = (blockId: string) => {
    setActiveBlockId(blockId);
    setFocusTimer(0);
    setIsTimerRunning(true);
  };

  const stopFocusSession = () => {
    setIsTimerRunning(false);
    setActiveBlockId(null);
  };

  const updateDailyGoal = (goal: string) => {
    setPlans(prev => ({
      ...prev,
      [selectedDate]: {
        ...currentPlan,
        dailyGoal: goal,
      },
    }));
  };

  const getCategoryInfo = (categoryId: string) => {
    return CATEGORIES.find(c => c.id === categoryId) || CATEGORIES[0];
  };

  const completedCount = currentPlan.blocks.filter(b => b.completed).length;
  const totalBlocks = currentPlan.blocks.length;
  const completionRate = totalBlocks > 0 ? Math.round((completedCount / totalBlocks) * 100) : 0;

  const totalMinutes = currentPlan.blocks.reduce((sum, block) => {
    const start = block.startTime.split(':').map(Number);
    const end = block.endTime.split(':').map(Number);
    return sum + ((end[0] * 60 + end[1]) - (start[0] * 60 + start[1]));
  }, 0);

  const categoryBreakdown = CATEGORIES.map(cat => ({
    ...cat,
    minutes: currentPlan.blocks
      .filter(b => b.category === cat.id)
      .reduce((sum, block) => {
        const start = block.startTime.split(':').map(Number);
        const end = block.endTime.split(':').map(Number);
        return sum + ((end[0] * 60 + end[1]) - (start[0] * 60 + start[1]));
      }, 0),
  })).filter(c => c.minutes > 0);

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
          <Calendar className="h-8 w-8 text-cyan-500" />
          Daily Job Search Planner
        </h1>
        <p className="text-muted-foreground mt-2">
          Structure your job search with time-blocked activities
        </p>
      </div>

      {/* Date Navigation */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigateDate(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-lg font-semibold min-w-64 text-center">
            {formatDate(selectedDate)}
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigateDate(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button variant="outline" size="sm" onClick={goToToday}>
          Today
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Schedule */}
        <div className="lg:col-span-2 space-y-4">
          {/* Daily Goal */}
          <div className="bg-card rounded-lg border p-4">
            <label className="block text-sm font-medium mb-2">Today's Goal</label>
            <input
              type="text"
              value={currentPlan.dailyGoal || ''}
              onChange={(e) => updateDailyGoal(e.target.value)}
              placeholder="What's your main objective for today?"
              className="w-full px-3 py-2 rounded-md border bg-background"
            />
          </div>

          {/* Time Blocks */}
          <div className="bg-card rounded-lg border">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="font-semibold">Schedule</h2>
              <Button size="sm" onClick={() => setShowAddForm(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Add Block
              </Button>
            </div>

            {showAddForm && (
              <div className="p-4 border-b bg-muted/30">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                  <div>
                    <label className="block text-xs font-medium mb-1">Start</label>
                    <select
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      className="w-full px-2 py-1.5 rounded border bg-background text-sm"
                    >
                      {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">End</label>
                    <select
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      className="w-full px-2 py-1.5 rounded border bg-background text-sm"
                    >
                      {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium mb-1">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-2 py-1.5 rounded border bg-background text-sm"
                    >
                      {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="block text-xs font-medium mb-1">Task</label>
                  <input
                    type="text"
                    value={formData.task}
                    onChange={(e) => setFormData({ ...formData, task: e.target.value })}
                    placeholder="What will you work on?"
                    className="w-full px-3 py-2 rounded border bg-background"
                    list="task-suggestions"
                  />
                  <datalist id="task-suggestions">
                    {SUGGESTED_TASKS[formData.category]?.map((t, i) => (
                      <option key={i} value={t} />
                    ))}
                  </datalist>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={addTimeBlock}>Add Block</Button>
                  <Button size="sm" variant="ghost" onClick={() => setShowAddForm(false)}>Cancel</Button>
                </div>
              </div>
            )}

            <div className="p-4">
              {currentPlan.blocks.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <h3 className="font-medium mb-1">No blocks scheduled</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Plan your day by adding time blocks for different activities
                  </p>
                  <Button size="sm" onClick={() => setShowAddForm(true)}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Your First Block
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {currentPlan.blocks.map((block) => {
                    const categoryInfo = getCategoryInfo(block.category);
                    const CategoryIcon = categoryInfo.icon;
                    const isActive = activeBlockId === block.id;

                    return (
                      <div
                        key={block.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                          block.completed ? 'bg-muted/50 opacity-60' : isActive ? 'bg-primary/5 border-primary' : 'hover:bg-muted/50'
                        }`}
                      >
                        <button
                          onClick={() => toggleComplete(block.id)}
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                            block.completed ? 'bg-green-500 border-green-500 text-white' : 'border-muted-foreground hover:border-primary'
                          }`}
                        >
                          {block.completed && <Check className="h-4 w-4" />}
                        </button>

                        <div className={`w-1 h-10 rounded ${categoryInfo.color}`} />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-mono text-muted-foreground">
                              {block.startTime} - {block.endTime}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded ${categoryInfo.lightColor}`}>
                              {categoryInfo.name}
                            </span>
                          </div>
                          <div className={`font-medium ${block.completed ? 'line-through' : ''}`}>
                            {block.task}
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          {!block.completed && (
                            isActive ? (
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-sm text-primary">
                                  {formatTimer(focusTimer)}
                                </span>
                                <Button variant="ghost" size="sm" onClick={stopFocusSession}>
                                  <Pause className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => startFocusSession(block.id)}
                                title="Start focus timer"
                              >
                                <Play className="h-4 w-4" />
                              </Button>
                            )
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteBlock(block.id)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Progress */}
          <div className="bg-card rounded-lg border p-4">
            <h3 className="font-semibold mb-3">Today's Progress</h3>
            <div className="text-center mb-4">
              <div className="text-4xl font-bold">{completionRate}%</div>
              <div className="text-sm text-muted-foreground">
                {completedCount} of {totalBlocks} blocks completed
              </div>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden mb-4">
              <div
                className="h-full bg-green-500 transition-all"
                style={{ width: `${completionRate}%` }}
              />
            </div>
            <div className="text-center text-sm text-muted-foreground">
              {totalMinutes > 0 ? `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m planned` : 'No time blocked yet'}
            </div>
          </div>

          {/* Category Breakdown */}
          {categoryBreakdown.length > 0 && (
            <div className="bg-card rounded-lg border p-4">
              <h3 className="font-semibold mb-3">Time Allocation</h3>
              <div className="space-y-2">
                {categoryBreakdown.map((cat) => {
                  const CatIcon = cat.icon;
                  const percentage = Math.round((cat.minutes / totalMinutes) * 100);

                  return (
                    <div key={cat.id} className="flex items-center gap-2">
                      <CatIcon className={`h-4 w-4 ${cat.lightColor.split(' ')[1]}`} />
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span>{cat.name}</span>
                          <span className="text-muted-foreground">{cat.minutes}m</span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className={`h-full ${cat.color}`} style={{ width: `${percentage}%` }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick Add Templates */}
          <div className="bg-card rounded-lg border p-4">
            <h3 className="font-semibold mb-3">Quick Templates</h3>
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  const template: TimeBlock[] = [
                    { id: '1', startTime: '09:00', endTime: '10:30', category: 'apply', task: 'Search and apply to jobs', completed: false },
                    { id: '2', startTime: '10:30', endTime: '11:00', category: 'break', task: 'Coffee break', completed: false },
                    { id: '3', startTime: '11:00', endTime: '12:00', category: 'network', task: 'LinkedIn outreach', completed: false },
                    { id: '4', startTime: '13:00', endTime: '14:00', category: 'learn', task: 'Skill building', completed: false },
                    { id: '5', startTime: '14:00', endTime: '15:00', category: 'interview', task: 'Interview prep', completed: false },
                    { id: '6', startTime: '15:00', endTime: '15:30', category: 'followup', task: 'Send follow-ups', completed: false },
                  ].map(b => ({ ...b, id: Date.now().toString() + b.id }));

                  setPlans(prev => ({
                    ...prev,
                    [selectedDate]: { ...currentPlan, blocks: template },
                  }));
                }}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Full Day Template
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  const template: TimeBlock[] = [
                    { id: '1', startTime: '09:00', endTime: '10:00', category: 'apply', task: 'Quick job applications', completed: false },
                    { id: '2', startTime: '10:00', endTime: '10:30', category: 'network', task: 'LinkedIn check-in', completed: false },
                  ].map(b => ({ ...b, id: Date.now().toString() + b.id }));

                  setPlans(prev => ({
                    ...prev,
                    [selectedDate]: { ...currentPlan, blocks: [...currentPlan.blocks, ...template] },
                  }));
                }}
              >
                <Clock className="h-4 w-4 mr-2" />
                Morning Routine (1.5h)
              </Button>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-muted/50 rounded-lg p-4">
            <h3 className="font-medium text-sm mb-2">Planning Tips</h3>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Block 2-3 hours for focused job applications</li>
              <li>• Include breaks to avoid burnout</li>
              <li>• Dedicate time to networking daily</li>
              <li>• Use the focus timer to stay on track</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyPlannerPage;
