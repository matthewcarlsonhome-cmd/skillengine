
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Skill } from '../types.ts';
import { Button } from './ui/Button.tsx';

interface SkillCardProps {
  skill: Skill;
}

const SkillCard: React.FC<SkillCardProps> = ({ skill }) => {
  const navigate = useNavigate();

  return (
    <div className={`relative group overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md ${skill.theme.secondary}`}>
      <div className={`absolute top-0 left-0 h-full w-full bg-gradient-to-br ${skill.theme.gradient} opacity-50 group-hover:opacity-70 transition-opacity`}></div>
      <div className="relative p-6 flex flex-col h-full">
        <div className={`mb-4 h-10 w-10 rounded-lg flex items-center justify-center ${skill.theme.secondary}`}>
          <skill.icon className={`h-6 w-6 ${skill.theme.primary}`} />
        </div>
        <h3 className="text-xl font-semibold mb-2">{skill.name}</h3>
        <p className="text-muted-foreground text-sm mb-4 flex-grow">{skill.description}</p>
        <Button 
          onClick={() => navigate(`/skill/${skill.id}`)}
          className="mt-auto w-full"
          variant="secondary"
        >
          Launch
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default SkillCard;
