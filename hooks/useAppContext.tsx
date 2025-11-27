
import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import { ApiProviderType } from '../types.ts';

interface AppContextState {
  selectedApi: ApiProviderType;
  setSelectedApi: (api: ApiProviderType) => void;
  resumeText: string;
  setResumeText: (text: string) => void;
  jobDescriptionText: string;
  setJobDescriptionText: (text: string) => void;
  resumeFilename: string;
  setResumeFilename: (name: string) => void;
  jobDescriptionFilename: string;
  setJobDescriptionFilename: (name: string) => void;
  additionalInfoText: string;
  setAdditionalInfoText: (text: string) => void;
  additionalInfoFilename: string;
  setAdditionalInfoFilename: (name: string) => void;
}

const AppContext = createContext<AppContextState | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [selectedApi, setSelectedApi] = useState<ApiProviderType>('gemini');
  const [resumeText, setResumeText] = useState('');
  const [jobDescriptionText, setJobDescriptionText] = useState('');
  const [resumeFilename, setResumeFilename] = useState('');
  const [jobDescriptionFilename, setJobDescriptionFilename] = useState('');
  const [additionalInfoText, setAdditionalInfoText] = useState('');
  const [additionalInfoFilename, setAdditionalInfoFilename] = useState('');

  const value = useMemo(() => ({
    selectedApi,
    setSelectedApi,
    resumeText,
    setResumeText,
    jobDescriptionText,
    setJobDescriptionText,
    resumeFilename,
    setResumeFilename,
    jobDescriptionFilename,
    setJobDescriptionFilename,
    additionalInfoText,
    setAdditionalInfoText,
    additionalInfoFilename,
    setAdditionalInfoFilename,
  }), [selectedApi, resumeText, jobDescriptionText, resumeFilename, jobDescriptionFilename, additionalInfoText, additionalInfoFilename]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
