
import React from 'react';
import { SKILLS } from '../lib/skills.ts';
import SkillCard from '../components/SkillCard.tsx';
import { useAppContext } from '../hooks/useAppContext.tsx';
import FileUploader from '../components/FileUploader.tsx';

const HomePage: React.FC = () => {
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
    <div className="container mx-auto max-w-7xl px-4 py-12 sm:py-16">
      <section className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight">
          AI-Powered Career Tools
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          Upload your documents once, then launch any skill below.
        </p>
      </section>

      <section className="mb-12 grid grid-cols-1 md:grid-cols-3 items-start justify-center gap-8">
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
      </section>

      <section>
        <div className="text-center mb-8">
            <h2 className="text-2xl font-bold tracking-tight">4. Launch a Skill</h2>
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
