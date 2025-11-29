
import React from 'react';
import { Link } from 'react-router-dom';
import { SKILLS } from '../lib/skills';
import SkillCard from '../components/SkillCard';
import { useAppContext } from '../hooks/useAppContext';
import FileUploader from '../components/FileUploader';
import { Button } from '../components/ui/Button';
import { ArrowLeft } from 'lucide-react';

const BrowseSkillsPage: React.FC = () => {
  const skills = Object.values(SKILLS);
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
    <div className="container mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link to="/">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Job Applicant Skills</h1>
        <p className="text-muted-foreground mt-2">
          15 AI-powered skills to help you land your dream job. Upload your documents, then launch any skill.
        </p>
      </div>

      {/* File Upload Section */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-3 items-start justify-center gap-6">
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

      {/* Skills Grid */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Choose a Skill to Launch</h2>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {skills.map((skill) => (
          <SkillCard key={skill.id} skill={skill} />
        ))}
      </div>
    </div>
  );
};

export default BrowseSkillsPage;
