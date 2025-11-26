
import React from 'react';
import { SKILLS } from '../lib/skills.ts';
import SkillCard from '../components/SkillCard.tsx';

const HomePage: React.FC = () => {
  const skills = Object.values(SKILLS);

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12 sm:py-16">
      <section className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight">
          AI-Powered Career Tools
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          Leverage cutting-edge AI to enhance your professional skills, from job hunting to workflow automation.
        </p>
      </section>

      <section>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {skills.map((skill) => (
            <SkillCard key={skill.id} skill={skill} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
