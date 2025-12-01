// Skills Gap Analyzer - Compare your skills to job requirements

import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Textarea } from '../components/ui/Textarea';
import { useToast } from '../hooks/useToast';
import {
  Target,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  Sparkles,
  FileText,
  Briefcase,
  TrendingUp,
  Book,
  Lightbulb,
} from 'lucide-react';

interface SkillMatch {
  skill: string;
  status: 'match' | 'partial' | 'gap';
  yourLevel?: string;
  requiredLevel?: string;
}

const SkillsGapPage: React.FC = () => {
  const { addToast } = useToast();
  const [resume, setResume] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [analysis, setAnalysis] = useState<{
    matches: SkillMatch[];
    score: number;
    recommendations: string[];
  } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Extract skills from text (simple keyword extraction)
  const extractSkills = (text: string): string[] => {
    const commonSkills = [
      // Programming
      'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'ruby', 'go', 'rust', 'php', 'swift', 'kotlin',
      'react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask', 'spring', 'rails',
      'sql', 'postgresql', 'mysql', 'mongodb', 'redis', 'elasticsearch',
      'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'jenkins', 'ci/cd',
      'git', 'github', 'gitlab', 'jira', 'agile', 'scrum',
      'html', 'css', 'sass', 'tailwind', 'bootstrap',
      'rest', 'graphql', 'api', 'microservices',
      'machine learning', 'deep learning', 'ai', 'nlp', 'computer vision',
      'data analysis', 'data science', 'pandas', 'numpy', 'tensorflow', 'pytorch',
      // Soft skills
      'leadership', 'communication', 'teamwork', 'problem solving', 'critical thinking',
      'project management', 'time management', 'collaboration', 'presentation',
      // Business
      'marketing', 'sales', 'analytics', 'strategy', 'operations', 'finance',
      'product management', 'ux', 'ui', 'design', 'figma', 'sketch',
      'excel', 'powerpoint', 'tableau', 'power bi', 'looker',
      // Certifications
      'pmp', 'scrum master', 'aws certified', 'google certified', 'six sigma',
    ];

    const lowerText = text.toLowerCase();
    return commonSkills.filter(skill =>
      lowerText.includes(skill) ||
      lowerText.includes(skill.replace('.', '')) ||
      lowerText.includes(skill.replace(' ', '-'))
    );
  };

  const analyzeGap = () => {
    if (!resume.trim() || !jobDescription.trim()) {
      addToast('Please enter both your resume and the job description', 'error');
      return;
    }

    setIsAnalyzing(true);

    // Simulate analysis (in production, this would use AI)
    setTimeout(() => {
      const resumeSkills = extractSkills(resume);
      const jobSkills = extractSkills(jobDescription);

      const matches: SkillMatch[] = [];
      const allSkills = new Set([...resumeSkills, ...jobSkills]);

      allSkills.forEach(skill => {
        const inResume = resumeSkills.includes(skill);
        const inJob = jobSkills.includes(skill);

        if (inResume && inJob) {
          matches.push({ skill, status: 'match' });
        } else if (inJob && !inResume) {
          matches.push({ skill, status: 'gap' });
        } else if (inResume && !inJob) {
          // Skill you have but not required - still good to show
          matches.push({ skill, status: 'partial', yourLevel: 'Have', requiredLevel: 'Not required' });
        }
      });

      // Sort: matches first, then gaps
      matches.sort((a, b) => {
        if (a.status === 'match' && b.status !== 'match') return -1;
        if (a.status !== 'match' && b.status === 'match') return 1;
        if (a.status === 'gap' && b.status !== 'gap') return 1;
        return 0;
      });

      const matchCount = matches.filter(m => m.status === 'match').length;
      const requiredCount = matches.filter(m => m.status !== 'partial').length;
      const score = requiredCount > 0 ? Math.round((matchCount / requiredCount) * 100) : 0;

      const gapSkills = matches.filter(m => m.status === 'gap').map(m => m.skill);
      const recommendations = generateRecommendations(gapSkills);

      setAnalysis({ matches, score, recommendations });
      setIsAnalyzing(false);
      addToast('Analysis complete!', 'success');
    }, 1500);
  };

  const generateRecommendations = (gaps: string[]): string[] => {
    const recs: string[] = [];

    if (gaps.length === 0) {
      recs.push('Your skills match well with this role! Focus on highlighting your experience.');
    } else {
      recs.push(`Consider learning or highlighting experience with: ${gaps.slice(0, 3).join(', ')}`);

      if (gaps.some(g => ['python', 'javascript', 'typescript', 'java'].includes(g))) {
        recs.push('Take online courses on platforms like Coursera, Udemy, or freeCodeCamp');
      }
      if (gaps.some(g => ['aws', 'azure', 'gcp'].includes(g))) {
        recs.push('Get cloud certifications - many offer free tiers for learning');
      }
      if (gaps.some(g => ['leadership', 'management'].includes(g))) {
        recs.push('Highlight any team lead or mentorship experience you have');
      }
    }

    recs.push('Tailor your resume to emphasize skills mentioned in the job description');
    recs.push('Use the same keywords from the job posting in your resume');

    return recs;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
          <Target className="h-6 w-6 text-purple-500" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Skills Gap Analyzer</h1>
          <p className="text-muted-foreground">Compare your skills to job requirements</p>
        </div>
      </div>

      {/* Input Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="border rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-500" />
            Your Resume/Skills
          </h2>
          <Textarea
            placeholder="Paste your resume or list your skills here..."
            value={resume}
            onChange={(e) => setResume(e.target.value)}
            rows={12}
          />
        </div>

        <div className="border rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-green-500" />
            Job Description
          </h2>
          <Textarea
            placeholder="Paste the job description here..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={12}
          />
        </div>
      </div>

      <div className="text-center mb-8">
        <Button size="lg" onClick={analyzeGap} disabled={isAnalyzing}>
          {isAnalyzing ? (
            <>
              <Sparkles className="h-5 w-5 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Target className="h-5 w-5 mr-2" />
              Analyze Skills Gap
            </>
          )}
        </Button>
      </div>

      {/* Results */}
      {analysis && (
        <div className="space-y-6">
          {/* Score */}
          <div className="border rounded-xl p-6 text-center bg-gradient-to-br from-primary/5 to-purple-500/5">
            <h3 className="text-lg font-semibold mb-2">Match Score</h3>
            <p className={`text-5xl font-bold ${getScoreColor(analysis.score)}`}>
              {analysis.score}%
            </p>
            <p className="text-muted-foreground mt-2">
              {analysis.score >= 80
                ? "Excellent match! You're well qualified for this role."
                : analysis.score >= 60
                ? "Good match. A few skills to brush up on."
                : "Some gaps to address. Focus on the missing skills."}
            </p>
          </div>

          {/* Skills Breakdown */}
          <div className="border rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Skills Breakdown
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span className="font-medium">Matching Skills</span>
                </div>
                <p className="text-2xl font-bold text-green-500">
                  {analysis.matches.filter(m => m.status === 'match').length}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="h-5 w-5 text-red-500" />
                  <span className="font-medium">Skills Gap</span>
                </div>
                <p className="text-2xl font-bold text-red-500">
                  {analysis.matches.filter(m => m.status === 'gap').length}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                  <span className="font-medium">Extra Skills</span>
                </div>
                <p className="text-2xl font-bold text-yellow-600">
                  {analysis.matches.filter(m => m.status === 'partial').length}
                </p>
              </div>
            </div>

            {/* Skills List */}
            <div className="space-y-2">
              {analysis.matches.filter(m => m.status !== 'partial').map((match, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    match.status === 'match' ? 'bg-green-500/10' : 'bg-red-500/10'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {match.status === 'match' ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="font-medium capitalize">{match.skill}</span>
                  </div>
                  <span className={`text-sm ${match.status === 'match' ? 'text-green-500' : 'text-red-500'}`}>
                    {match.status === 'match' ? 'You have this' : 'Required'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="border rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              Recommendations
            </h3>
            <ul className="space-y-3">
              {analysis.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-3">
                  <ArrowRight className="h-4 w-4 text-primary mt-1 shrink-0" />
                  <span className="text-muted-foreground">{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Learning Resources */}
          <div className="border rounded-xl p-6 bg-blue-500/5">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Book className="h-5 w-5 text-blue-500" />
              Learning Resources
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { name: 'Coursera', url: 'https://coursera.org' },
                { name: 'Udemy', url: 'https://udemy.com' },
                { name: 'LinkedIn Learning', url: 'https://linkedin.com/learning' },
                { name: 'freeCodeCamp', url: 'https://freecodecamp.org' },
              ].map((resource) => (
                <a
                  key={resource.name}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 border rounded-lg hover:border-primary transition-colors text-center"
                >
                  <span className="font-medium">{resource.name}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillsGapPage;
