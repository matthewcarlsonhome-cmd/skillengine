// Workspace Page - Shows a workspace and its generated skills

import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useWorkspace } from '../hooks/useStorage';
import { Button } from '../components/ui/Button';
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Sparkles,
  Clock,
  Trash2,
  Briefcase,
  Building,
  Users,
  ExternalLink,
  FileText,
  BarChart,
  MessageSquare,
  Target,
  Zap
} from 'lucide-react';

// Icon mapping for dynamic skills
const iconMap: Record<string, React.FC<{ className?: string }>> = {
  FileText: (props) => <FileText {...props} />,
  BarChart: (props) => <BarChart {...props} />,
  MessageSquare: (props) => <MessageSquare {...props} />,
  Target: (props) => <Target {...props} />,
  Zap: (props) => <Zap {...props} />,
  CheckCircle: (props) => <Sparkles {...props} />,
  Users: (props) => <Users {...props} />,
  Lightbulb: (props) => <Sparkles {...props} />,
  Clock: (props) => <Clock {...props} />,
  Search: (props) => <Sparkles {...props} />,
};

const WorkspacePage: React.FC = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const navigate = useNavigate();
  const { workspace, skills, loading, deleteSkill } = useWorkspace(workspaceId);

  if (loading) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-12 text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
        <p className="mt-4 text-muted-foreground">Loading workspace...</p>
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-12 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
        <h1 className="mt-4 text-2xl font-bold">Workspace Not Found</h1>
        <Button onClick={() => navigate('/')} className="mt-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
      </div>
    );
  }

  const analysis = workspace.jdAnalysis;

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" onClick={() => navigate('/')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{workspace.name}</h1>
            <p className="text-muted-foreground mt-1">
              Created {new Date(workspace.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate(`/workspace/${workspaceId}/build`)}>
              <Sparkles className="mr-2 h-4 w-4" />
              Add More Skills
            </Button>
          </div>
        </div>
      </div>

      {/* Role Summary */}
      <div className="rounded-xl border bg-card p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Role Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Title</p>
              <p className="font-medium">{analysis.role.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Building className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Department</p>
              <p className="font-medium">{analysis.role.department}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Level</p>
              <p className="font-medium">{analysis.role.level}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Type</p>
              <p className="font-medium">{analysis.role.type}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Skills Grid */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">
          Your Skills ({skills.length})
        </h2>

        {skills.length === 0 ? (
          <div className="text-center py-12 rounded-xl border border-dashed">
            <Sparkles className="mx-auto h-10 w-10 text-muted-foreground" />
            <h3 className="mt-4 font-semibold">No Skills Built Yet</h3>
            <p className="text-muted-foreground text-sm mt-1">
              Build skills from your recommendations to get started.
            </p>
            <Button className="mt-4" onClick={() => navigate(`/workspace/${workspaceId}/build`)}>
              Build Skills
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {skills.map((skill) => {
              const IconComponent = iconMap[skill.theme.iconName] || Sparkles;
              return (
                <div
                  key={skill.id}
                  className="group relative rounded-xl border bg-card overflow-hidden hover:border-primary/50 transition-colors"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${skill.theme.gradient} opacity-50`} />
                  <div className="relative p-5">
                    <div className="flex items-start justify-between">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${skill.theme.secondary}`}>
                        <IconComponent className={`h-6 w-6 ${skill.theme.primary}`} />
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Delete this skill?')) {
                            deleteSkill(skill.id);
                          }
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive/20 rounded"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </button>
                    </div>

                    <h3 className="font-semibold mt-3">{skill.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {skill.description}
                    </p>

                    <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{skill.estimatedTimeSaved}</span>
                      {skill.executionCount > 0 && (
                        <>
                          <span>•</span>
                          <span>Used {skill.executionCount}x</span>
                        </>
                      )}
                    </div>

                    <Link
                      to={`/workspace/${workspaceId}/skill/${skill.id}`}
                      className="mt-4 inline-flex items-center text-sm font-medium text-primary hover:underline"
                    >
                      Launch Skill
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Key Responsibilities */}
      {analysis.responsibilities.length > 0 && (
        <div className="rounded-xl border bg-card p-6">
          <h2 className="text-lg font-semibold mb-4">Key Responsibilities</h2>
          <div className="space-y-2">
            {analysis.responsibilities.slice(0, 8).map((resp, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <span className={`
                  text-xs px-2 py-0.5 rounded-full whitespace-nowrap
                  ${resp.automationPotential === 'high' ? 'bg-green-500/20 text-green-400' :
                    resp.automationPotential === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-gray-500/20 text-gray-400'}
                `}>
                  {resp.automationPotential}
                </span>
                <div className="flex-1">
                  <p className="text-sm">{resp.task}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {resp.frequency} • {resp.category}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkspacePage;
