
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWorkspaces } from '../hooks/useStorage';
import { Button } from '../components/ui/Button';
import {
  Sparkles,
  Briefcase,
  Clock,
  ChevronRight,
  Plus,
  Trash2,
  User,
  Package,
  Wand2,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { getUserProfile } from './UserProfilePage';

const HomePage: React.FC = () => {
  const { workspaces, deleteWorkspace, loading: workspacesLoading } = useWorkspaces();
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    const profile = getUserProfile();
    // Check if user has any meaningful profile data
    const hasData = profile.fullName || profile.resumeText || profile.professionalTitle;
    setHasProfile(!!hasData);
  }, []);

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12 sm:py-16">
      {/* Hero Section */}
      <section className="text-center mb-10">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight">
          AI-Powered Career Tools
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          Optimize your job search with AI. Build resumes, prep for interviews, and accelerate your career.
        </p>
      </section>

      {/* Profile Setup Banner - Show if no profile */}
      {!hasProfile && (
        <section className="mb-8">
          <Link to="/profile">
            <div className="rounded-xl border-2 border-dashed border-primary/30 bg-gradient-to-r from-blue-500/5 to-purple-500/5 p-6 hover:border-primary/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <User className="h-7 w-7 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    Set Up Your Profile
                    <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-primary/20 text-primary">Recommended</span>
                  </h2>
                  <p className="text-muted-foreground text-sm mt-1">
                    Add your resume and background info once, then all AI skills will use it automatically for personalized results.
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-primary shrink-0" />
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* Getting Started Steps */}
      <section className="mb-10 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/profile" className="group">
          <div className={`rounded-xl border p-5 h-full transition-colors ${hasProfile ? 'bg-green-500/5 border-green-500/30' : 'hover:border-primary/50'}`}>
            <div className="flex items-center gap-3 mb-2">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${hasProfile ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                {hasProfile ? <CheckCircle2 className="h-5 w-5" /> : '1'}
              </div>
              <h3 className="font-semibold">Set Up Profile</h3>
            </div>
            <p className="text-sm text-muted-foreground pl-11">
              Add your resume and background for personalized AI results
            </p>
          </div>
        </Link>
        <Link to="/skills" className="group">
          <div className="rounded-xl border p-5 h-full hover:border-primary/50 transition-colors">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground">2</div>
              <h3 className="font-semibold">Run AI Skills</h3>
            </div>
            <p className="text-sm text-muted-foreground pl-11">
              Use 16+ AI tools for resumes, cover letters, and interview prep
            </p>
          </div>
        </Link>
        <Link to="/job-tracker" className="group">
          <div className="rounded-xl border p-5 h-full hover:border-primary/50 transition-colors">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground">3</div>
              <h3 className="font-semibold">Track Applications</h3>
            </div>
            <p className="text-sm text-muted-foreground pl-11">
              Manage your job search with tracking, reminders, and progress reports
            </p>
          </div>
        </Link>
      </section>

      {/* Main Feature Cards */}
      <section className="mb-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* AI Skills Card */}
        <div className="rounded-xl border bg-card p-6 hover:border-blue-500/50 transition-colors">
          <div className="h-12 w-12 rounded-lg bg-blue-500/20 flex items-center justify-center mb-4">
            <Sparkles className="h-6 w-6 text-blue-400" />
          </div>
          <h2 className="text-xl font-bold mb-2">AI Skills</h2>
          <p className="text-muted-foreground text-sm mb-4">
            16+ AI-powered tools for job seekers: resume optimization, cover letters, interview prep, salary negotiation.
          </p>
          <Link to="/skills">
            <Button variant="outline" className="w-full">
              Browse Skills <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Role Templates Card */}
        <div className="rounded-xl border bg-card p-6 hover:border-purple-500/50 transition-colors">
          <div className="h-12 w-12 rounded-lg bg-purple-500/20 flex items-center justify-center mb-4">
            <Package className="h-6 w-6 text-purple-400" />
          </div>
          <h2 className="text-xl font-bold mb-2">Role Templates</h2>
          <p className="text-muted-foreground text-sm mb-4">
            Pre-built skill bundles for 20 professions. Install skills designed for your career in one click.
          </p>
          <Link to="/role-templates">
            <Button variant="outline" className="w-full">
              View Templates <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Custom Skills Card */}
        <div className="rounded-xl border bg-card p-6 hover:border-orange-500/50 transition-colors">
          <div className="h-12 w-12 rounded-lg bg-orange-500/20 flex items-center justify-center mb-4">
            <Wand2 className="h-6 w-6 text-orange-400" />
          </div>
          <h2 className="text-xl font-bold mb-2">Custom Skills</h2>
          <p className="text-muted-foreground text-sm mb-4">
            Paste any job description to generate AI skills tailored to that specific role and company.
          </p>
          <Link to="/analyze">
            <Button variant="outline" className="w-full">
              Create Skills <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Workspaces Section */}
      {!workspacesLoading && workspaces.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Your Workspaces</h2>
            <Link to="/analyze">
              <Button variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                New Workspace
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workspaces.slice(0, 6).map((workspace) => (
              <div key={workspace.id} className="group relative rounded-xl border bg-card p-4 hover:border-primary/50 transition-colors">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    if (confirm('Delete this workspace and all its skills?')) {
                      deleteWorkspace(workspace.id);
                    }
                  }}
                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive/20 rounded"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </button>
                <Link to={`/workspace/${workspace.id}`}>
                  <h3 className="font-semibold pr-8">{workspace.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {workspace.jdAnalysis.role.title} • {workspace.jdAnalysis.role.level}
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{new Date(workspace.updatedAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{workspace.selectedSkillIds.length} skills</span>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;
