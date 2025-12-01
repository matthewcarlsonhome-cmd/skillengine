import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, User, Save, FileText, Briefcase, GraduationCap, Award, Upload, Trash2, Check, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { useToast } from '../hooks/useToast';

export interface UserProfile {
  // Personal Information
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedInUrl: string;
  portfolioUrl: string;

  // Professional Summary
  professionalTitle: string;
  yearsExperience: string;
  targetRoles: string;
  targetIndustries: string;

  // Resume & Background (the key content used by skills)
  resumeText: string;
  resumeFilename: string;

  // Work Experience Summary
  currentCompany: string;
  currentTitle: string;
  keyAchievements: string;

  // Education
  highestDegree: string;
  university: string;
  graduationYear: string;
  certifications: string;

  // Skills Summary
  technicalSkills: string;
  softSkills: string;
  languages: string;

  // Career Goals
  careerGoals: string;
  salaryExpectations: string;
  workPreference: string; // remote/hybrid/onsite

  // Meta
  lastUpdated: string;
}

const DEFAULT_PROFILE: UserProfile = {
  fullName: '',
  email: '',
  phone: '',
  location: '',
  linkedInUrl: '',
  portfolioUrl: '',
  professionalTitle: '',
  yearsExperience: '',
  targetRoles: '',
  targetIndustries: '',
  resumeText: '',
  resumeFilename: '',
  currentCompany: '',
  currentTitle: '',
  keyAchievements: '',
  highestDegree: '',
  university: '',
  graduationYear: '',
  certifications: '',
  technicalSkills: '',
  softSkills: '',
  languages: '',
  careerGoals: '',
  salaryExpectations: '',
  workPreference: '',
  lastUpdated: '',
};

const STORAGE_KEY = 'skillengine_user_profile';

export const getUserProfile = (): UserProfile => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return { ...DEFAULT_PROFILE, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error('Failed to load user profile:', e);
  }
  return DEFAULT_PROFILE;
};

export const saveUserProfile = (profile: UserProfile): void => {
  try {
    profile.lastUpdated = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save user profile:', e);
  }
};

const UserProfilePage: React.FC = () => {
  const { addToast } = useToast();
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [activeSection, setActiveSection] = useState('personal');
  const [hasChanges, setHasChanges] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadedProfile = getUserProfile();
    setProfile(loadedProfile);
  }, []);

  const handleChange = (field: keyof UserProfile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    saveUserProfile(profile);
    setHasChanges(false);
    addToast('Profile saved successfully!', 'success');
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      setProfile(prev => ({
        ...prev,
        resumeText: text,
        resumeFilename: file.name,
      }));
      setHasChanges(true);
      addToast('Resume uploaded successfully!', 'success');
    } catch (error) {
      addToast('Failed to read file', 'error');
    }
  };

  const clearResume = () => {
    setProfile(prev => ({
      ...prev,
      resumeText: '',
      resumeFilename: '',
    }));
    setHasChanges(true);
  };

  const sections = [
    { id: 'personal', name: 'Personal Info', icon: User },
    { id: 'professional', name: 'Professional', icon: Briefcase },
    { id: 'resume', name: 'Resume', icon: FileText },
    { id: 'education', name: 'Education', icon: GraduationCap },
    { id: 'skills', name: 'Skills', icon: Award },
    { id: 'goals', name: 'Goals', icon: Briefcase },
  ];

  const completionPercentage = () => {
    const fields = Object.values(profile).filter(v => typeof v === 'string');
    const filled = fields.filter(v => v && v.length > 0).length;
    return Math.round((filled / fields.length) * 100);
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

      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <User className="h-8 w-8 text-blue-500" />
            My Profile
          </h1>
          <p className="text-muted-foreground mt-2">
            Your profile information is automatically used by AI skills for personalized results
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
            {showPreview ? 'Edit' : 'Preview'}
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges}>
            <Save className="h-4 w-4 mr-2" />
            Save Profile
          </Button>
        </div>
      </div>

      {/* Completion Progress */}
      <div className="bg-card rounded-lg border p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Profile Completion</span>
          <span className="text-sm text-muted-foreground">{completionPercentage()}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
            style={{ width: `${completionPercentage()}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Complete your profile to get better personalized results from AI skills
        </p>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        {/* Section Navigation */}
        <div className="space-y-1">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors ${
                  activeSection === section.id
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="text-sm font-medium">{section.name}</span>
              </button>
            );
          })}
        </div>

        {/* Form Content */}
        <div className="md:col-span-3 bg-card rounded-lg border p-6">
          {activeSection === 'personal' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Full Name</label>
                  <input
                    type="text"
                    value={profile.fullName}
                    onChange={(e) => handleChange('fullName', e.target.value)}
                    placeholder="John Doe"
                    className="w-full px-3 py-2 rounded-md border bg-background"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="john@example.com"
                    className="w-full px-3 py-2 rounded-md border bg-background"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="(555) 123-4567"
                    className="w-full px-3 py-2 rounded-md border bg-background"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Location</label>
                  <input
                    type="text"
                    value={profile.location}
                    onChange={(e) => handleChange('location', e.target.value)}
                    placeholder="San Francisco, CA"
                    className="w-full px-3 py-2 rounded-md border bg-background"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">LinkedIn URL</label>
                  <input
                    type="url"
                    value={profile.linkedInUrl}
                    onChange={(e) => handleChange('linkedInUrl', e.target.value)}
                    placeholder="linkedin.com/in/johndoe"
                    className="w-full px-3 py-2 rounded-md border bg-background"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Portfolio/Website</label>
                  <input
                    type="url"
                    value={profile.portfolioUrl}
                    onChange={(e) => handleChange('portfolioUrl', e.target.value)}
                    placeholder="johndoe.com"
                    className="w-full px-3 py-2 rounded-md border bg-background"
                  />
                </div>
              </div>
            </div>
          )}

          {activeSection === 'professional' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold mb-4">Professional Summary</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Professional Title</label>
                  <input
                    type="text"
                    value={profile.professionalTitle}
                    onChange={(e) => handleChange('professionalTitle', e.target.value)}
                    placeholder="Senior Software Engineer"
                    className="w-full px-3 py-2 rounded-md border bg-background"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Years of Experience</label>
                  <input
                    type="text"
                    value={profile.yearsExperience}
                    onChange={(e) => handleChange('yearsExperience', e.target.value)}
                    placeholder="5+ years"
                    className="w-full px-3 py-2 rounded-md border bg-background"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Current Company</label>
                  <input
                    type="text"
                    value={profile.currentCompany}
                    onChange={(e) => handleChange('currentCompany', e.target.value)}
                    placeholder="Tech Corp Inc."
                    className="w-full px-3 py-2 rounded-md border bg-background"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Current Title</label>
                  <input
                    type="text"
                    value={profile.currentTitle}
                    onChange={(e) => handleChange('currentTitle', e.target.value)}
                    placeholder="Lead Developer"
                    className="w-full px-3 py-2 rounded-md border bg-background"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Target Roles</label>
                <input
                  type="text"
                  value={profile.targetRoles}
                  onChange={(e) => handleChange('targetRoles', e.target.value)}
                  placeholder="Senior Engineer, Tech Lead, Staff Engineer"
                  className="w-full px-3 py-2 rounded-md border bg-background"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Target Industries</label>
                <input
                  type="text"
                  value={profile.targetIndustries}
                  onChange={(e) => handleChange('targetIndustries', e.target.value)}
                  placeholder="SaaS, FinTech, Healthcare"
                  className="w-full px-3 py-2 rounded-md border bg-background"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Key Achievements</label>
                <textarea
                  value={profile.keyAchievements}
                  onChange={(e) => handleChange('keyAchievements', e.target.value)}
                  placeholder="• Led team of 8 engineers to deliver $5M project&#10;• Reduced infrastructure costs by 40%&#10;• Mentored 5 junior developers"
                  rows={4}
                  className="w-full px-3 py-2 rounded-md border bg-background"
                />
              </div>
            </div>
          )}

          {activeSection === 'resume' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold mb-4">Resume / Background</h2>
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-4">
                <p className="text-sm">
                  <strong>This is the main content used by AI skills.</strong> Upload your resume or paste your
                  professional background here. It will be automatically used when running skills like Resume
                  Customizer, Interview Prep, and others.
                </p>
              </div>

              {/* File Upload */}
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                {profile.resumeFilename ? (
                  <div className="flex items-center justify-center gap-4">
                    <FileText className="h-8 w-8 text-green-500" />
                    <div className="text-left">
                      <p className="font-medium">{profile.resumeFilename}</p>
                      <p className="text-sm text-muted-foreground">
                        {profile.resumeText.length.toLocaleString()} characters
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={clearResume}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Upload your resume (TXT, PDF text, or paste below)
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".txt,.pdf,.doc,.docx"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Choose File
                    </Button>
                  </>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Resume / Background Text
                </label>
                <textarea
                  value={profile.resumeText}
                  onChange={(e) => handleChange('resumeText', e.target.value)}
                  placeholder="Paste your full resume text here, or describe your professional background in detail...

Example:
JOHN DOE
Senior Software Engineer | john@email.com | (555) 123-4567

SUMMARY
Experienced software engineer with 8+ years building scalable web applications...

EXPERIENCE
Tech Corp Inc. | Senior Engineer | 2020-Present
• Led development of microservices architecture serving 10M users
• Reduced API latency by 60% through optimization...

EDUCATION
BS Computer Science, Stanford University, 2015

SKILLS
Languages: JavaScript, TypeScript, Python, Go
Frameworks: React, Node.js, Django..."
                  rows={15}
                  className="w-full px-3 py-2 rounded-md border bg-background font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {profile.resumeText.length.toLocaleString()} characters
                </p>
              </div>
            </div>
          )}

          {activeSection === 'education' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold mb-4">Education & Certifications</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Highest Degree</label>
                  <input
                    type="text"
                    value={profile.highestDegree}
                    onChange={(e) => handleChange('highestDegree', e.target.value)}
                    placeholder="Master's in Computer Science"
                    className="w-full px-3 py-2 rounded-md border bg-background"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">University/Institution</label>
                  <input
                    type="text"
                    value={profile.university}
                    onChange={(e) => handleChange('university', e.target.value)}
                    placeholder="Stanford University"
                    className="w-full px-3 py-2 rounded-md border bg-background"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Graduation Year</label>
                  <input
                    type="text"
                    value={profile.graduationYear}
                    onChange={(e) => handleChange('graduationYear', e.target.value)}
                    placeholder="2018"
                    className="w-full px-3 py-2 rounded-md border bg-background"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Certifications</label>
                <textarea
                  value={profile.certifications}
                  onChange={(e) => handleChange('certifications', e.target.value)}
                  placeholder="AWS Solutions Architect&#10;Google Cloud Professional&#10;PMP Certified"
                  rows={3}
                  className="w-full px-3 py-2 rounded-md border bg-background"
                />
              </div>
            </div>
          )}

          {activeSection === 'skills' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold mb-4">Skills</h2>
              <div>
                <label className="block text-sm font-medium mb-1">Technical Skills</label>
                <textarea
                  value={profile.technicalSkills}
                  onChange={(e) => handleChange('technicalSkills', e.target.value)}
                  placeholder="JavaScript, TypeScript, React, Node.js, Python, AWS, Docker, Kubernetes, PostgreSQL, MongoDB..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-md border bg-background"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Soft Skills</label>
                <textarea
                  value={profile.softSkills}
                  onChange={(e) => handleChange('softSkills', e.target.value)}
                  placeholder="Leadership, Communication, Problem Solving, Team Collaboration, Project Management..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-md border bg-background"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Languages</label>
                <input
                  type="text"
                  value={profile.languages}
                  onChange={(e) => handleChange('languages', e.target.value)}
                  placeholder="English (Native), Spanish (Fluent), Mandarin (Conversational)"
                  className="w-full px-3 py-2 rounded-md border bg-background"
                />
              </div>
            </div>
          )}

          {activeSection === 'goals' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold mb-4">Career Goals</h2>
              <div>
                <label className="block text-sm font-medium mb-1">Career Goals</label>
                <textarea
                  value={profile.careerGoals}
                  onChange={(e) => handleChange('careerGoals', e.target.value)}
                  placeholder="What are you looking for in your next role? What do you want to achieve in your career?"
                  rows={4}
                  className="w-full px-3 py-2 rounded-md border bg-background"
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Salary Expectations</label>
                  <input
                    type="text"
                    value={profile.salaryExpectations}
                    onChange={(e) => handleChange('salaryExpectations', e.target.value)}
                    placeholder="$150,000 - $180,000"
                    className="w-full px-3 py-2 rounded-md border bg-background"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Work Preference</label>
                  <select
                    value={profile.workPreference}
                    onChange={(e) => handleChange('workPreference', e.target.value)}
                    className="w-full px-3 py-2 rounded-md border bg-background"
                  >
                    <option value="">Select preference...</option>
                    <option value="remote">Remote Only</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="onsite">On-site</option>
                    <option value="flexible">Flexible</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Last Updated */}
          {profile.lastUpdated && (
            <div className="mt-6 pt-4 border-t text-xs text-muted-foreground">
              Last updated: {new Date(profile.lastUpdated).toLocaleString()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
