
import React from 'react';

export type InputType = 'text' | 'textarea' | 'select' | 'checkbox';

export interface FormInput {
  id: string;
  label: string;
  type: InputType;
  placeholder?: string;
  options?: string[];
  required?: boolean;
  rows?: number;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  whatYouGet: string[];
  theme: {
    primary: string;
    secondary: string;
    gradient: string;
  };
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  inputs: FormInput[];
  systemPrompt: (inputs: Record<string, any>) => string;
}
