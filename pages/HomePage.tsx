
import React from 'react';
import { Link } from 'react-router-dom';
import { SKILLS } from '../lib/skills';
import SkillCard from '../components/SkillCard';
import { useAppContext } from '../hooks/useAppContext';
import { useWorkspaces } from '../hooks/useStorage';
import FileUploader from '../components/FileUploader';
import { Button } from '../components/ui/Button';
import {
  Sparkles,
  Briefcase,
  Clock,
  ChevronRight,
  Plus,
  Trash2
} from 'lucide-react';

const HomePage: React.FC = () => {
  const skills = Object.values(SKILLS);
  const { workspaces, deleteWorkspace, loading: workspacesLoading } = useWorkspaces();
  const {
    setResumeText,
    setJobDescriptionText,
    setAdditionalInfoText,
    resumeFilename,
    setResumeFilename,
    jobDescriptionFilename,
    setJobDescriptionFilename,
    additionalInfoFilename,
    setAdditionalInfoFilename,
  } = useAppContext();

  const handleResumeUpload = (content: string, filename: string) => {
    setResumeText(content);
    setResumeFilename(filename);
  };

  const handleJobDescriptionUpload = (content: string, filename: string) => {
    setJobDescriptionText(content);
    setJobDescriptionFilename(filename);
  };

  const handleAdditionalInfoUpload = (content: string, filename: string) => {
    setAdditionalInfoText(content);
    setAdditionalInfoFilename(filename);
  };

  const clearResume = () => {
    setResumeText('');
    setResumeFilename('');
  };

  const clearJobDescription = () => {
    setJobDescriptionText('');
    setJobDescriptionFilename('');
  };

  const clearAdditionalInfo = () => {
    setAdditionalInfoText('');
    setAdditionalInfoFilename('');
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12 sm:py-16">
      {/* Hero Section */}
      <section className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight">
          AI-Powered Skill Engine
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          Generate custom AI skills for any role, or use our pre-built career tools.
        </p>
      </section>

      {/* Quick Start Cards */}
      <section className="mb-12 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Job Applicant Card */}
        <div className="rounded-xl border bg-card p-6 hover:border-primary/50 transition-colors">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Briefcase className="h-6 w-6 text-blue-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">Job Applicant Tools</h2>
              <p className="text-muted-foreground text-sm mt-1">
                15 pre-built skills for job seekers: resume optimization, interview prep, salary negotiation, and more.
              </p>
              <Link to="/skills" className="inline-flex items-center text-sm font-medium text-primary mt-3 hover:underline">
                Browse Skills <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Role-Based Card */}
        <div className="rounded-xl border bg-card p-6 hover:border-primary/50 transition-colors">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-purple-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">Generate Role-Based Skills</h2>
              <p className="text-muted-foreground text-sm mt-1">
                Paste any job description to generate custom AI skills tailored to that role. Perfect for analysts, marketers, creatives, and more.
              </p>
              <Link to="/analyze" className="inline-flex items-center text-sm font-medium text-primary mt-3 hover:underline">
                Analyze a Role <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
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

      {/* Job Applicant Section */}
      <section id="job-applicant-skills">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold tracking-tight">Job Applicant Skills</h2>
          <p className="text-muted-foreground mt-2">
            Upload your documents once, then launch any skill below.
          </p>
        </div>

        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 items-start justify-center gap-8">
          <FileUploader
            title="1. Upload Your Resume"
            filename={resumeFilename}
            onFileUpload={handleResumeUpload}
            onClear={clearResume}
          />
          <FileUploader
            title="2. Upload Job Description"
            filename={jobDescriptionFilename}
            onFileUpload={handleJobDescriptionUpload}
            onClear={clearJobDescription}
          />
          <FileUploader
            title="3. Add'l Info (Optional)"
            filename={additionalInfoFilename}
            onFileUpload={handleAdditionalInfoUpload}
            onClear={clearAdditionalInfo}
          />
        </div>

        <div className="text-center mb-8">
          <h3 className="text-lg font-semibold text-muted-foreground">4. Launch a Skill</h3>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {skills.map((skill) => (
            <SkillCard key={skill.id} skill={skill} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
