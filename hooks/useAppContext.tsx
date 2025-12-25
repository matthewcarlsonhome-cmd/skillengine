
import React, { createContext, useContext, useState, useMemo, useEffect, useCallback, ReactNode } from 'react';
import { ApiProviderType } from '../types.ts';
import { logger } from '../lib/logger';

// User Profile interface for centralized storage
export interface UserProfile {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedInUrl: string;
  portfolioUrl: string;
  professionalTitle: string;
  yearsExperience: string;
  targetRoles: string;
  targetIndustries: string;
  resumeText: string;
  resumeFilename: string;
  currentCompany: string;
  currentTitle: string;
  keyAchievements: string;
  highestDegree: string;
  university: string;
  graduationYear: string;
  certifications: string;
  technicalSkills: string;
  softSkills: string;
  languages: string;
  careerGoals: string;
  salaryExpectations: string;
  workPreference: string;
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

const PROFILE_STORAGE_KEY = 'skillengine_user_profile';

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
  // User Profile
  userProfile: UserProfile;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  refreshProfileFromStorage: () => void;
  // Helper to get combined background text
  getBackgroundText: () => string;
}

const AppContext = createContext<AppContextState | undefined>(undefined);

// Helper to load profile from localStorage
const loadProfileFromStorage = (): UserProfile => {
  try {
    const saved = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (saved) {
      return { ...DEFAULT_PROFILE, ...JSON.parse(saved) };
    }
  } catch (e) {
    logger.error('Failed to load user profile', { error: e instanceof Error ? e.message : String(e) });
  }
  return DEFAULT_PROFILE;
};

// Helper to save profile to localStorage
const saveProfileToStorage = (profile: UserProfile): void => {
  try {
    profile.lastUpdated = new Date().toISOString();
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  } catch (e) {
    logger.error('Failed to save user profile', { error: e instanceof Error ? e.message : String(e) });
  }
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [selectedApi, setSelectedApi] = useState<ApiProviderType>('gemini');
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_PROFILE);

  // Session-specific overrides (for when user uploads a different resume for a specific job)
  const [sessionResumeText, setSessionResumeText] = useState('');
  const [jobDescriptionText, setJobDescriptionText] = useState('');
  const [sessionResumeFilename, setSessionResumeFilename] = useState('');
  const [jobDescriptionFilename, setJobDescriptionFilename] = useState('');
  const [additionalInfoText, setAdditionalInfoText] = useState('');
  const [additionalInfoFilename, setAdditionalInfoFilename] = useState('');

  // Load profile on mount
  useEffect(() => {
    const profile = loadProfileFromStorage();
    setUserProfile(profile);
  }, []);

  // Computed resume text - use session override if available, otherwise use profile
  const resumeText = sessionResumeText || userProfile.resumeText;
  const resumeFilename = sessionResumeFilename || userProfile.resumeFilename;

  const setResumeText = useCallback((text: string) => {
    setSessionResumeText(text);
  }, []);

  const setResumeFilename = useCallback((name: string) => {
    setSessionResumeFilename(name);
  }, []);

  const updateUserProfile = useCallback((updates: Partial<UserProfile>) => {
    setUserProfile(prev => {
      const updated = { ...prev, ...updates };
      saveProfileToStorage(updated);
      return updated;
    });
  }, []);

  const refreshProfileFromStorage = useCallback(() => {
    const profile = loadProfileFromStorage();
    setUserProfile(profile);
  }, []);

  // Helper to get combined background text for AI prompts
  const getBackgroundText = useCallback(() => {
    const parts: string[] = [];

    // Primary: Resume text
    if (resumeText) {
      parts.push(resumeText);
    }

    // Add structured profile info if resume is sparse
    if (!resumeText && userProfile.fullName) {
      const profileSummary = [
        userProfile.fullName && `Name: ${userProfile.fullName}`,
        userProfile.professionalTitle && `Title: ${userProfile.professionalTitle}`,
        userProfile.currentCompany && `Company: ${userProfile.currentCompany}`,
        userProfile.yearsExperience && `Experience: ${userProfile.yearsExperience}`,
        userProfile.keyAchievements && `Key Achievements:\n${userProfile.keyAchievements}`,
        userProfile.technicalSkills && `Technical Skills: ${userProfile.technicalSkills}`,
        userProfile.softSkills && `Soft Skills: ${userProfile.softSkills}`,
        userProfile.highestDegree && `Education: ${userProfile.highestDegree} from ${userProfile.university}`,
        userProfile.certifications && `Certifications: ${userProfile.certifications}`,
      ].filter(Boolean).join('\n');

      if (profileSummary) {
        parts.push(profileSummary);
      }
    }

    return parts.join('\n\n');
  }, [resumeText, userProfile]);

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
    userProfile,
    updateUserProfile,
    refreshProfileFromStorage,
    getBackgroundText,
  }), [
    selectedApi,
    resumeText,
    jobDescriptionText,
    resumeFilename,
    jobDescriptionFilename,
    additionalInfoText,
    additionalInfoFilename,
    userProfile,
    updateUserProfile,
    refreshProfileFromStorage,
    getBackgroundText,
    setResumeText,
    setResumeFilename,
  ]);

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
