/**
 * AuthGate Component
 *
 * Forces users to authenticate before accessing the app.
 * Shows onboarding wizard for new users who haven't completed setup.
 *
 * Flow:
 * 1. Not logged in → Show login screen
 * 2. Logged in, no onboarding → Show onboarding wizard
 * 3. Logged in + onboarding complete → Show children
 */

import React, { useState, useEffect } from 'react';
import { Loader2, Sparkles, LogIn, Mail, Shield, Zap, Target, ChevronRight } from 'lucide-react';
import { Button } from './ui/Button';
import { OnboardingWizard } from './OnboardingWizard';
import { useAuth } from '../hooks/useAuth';
import { getCurrentAppUser, saveCurrentAppUser } from '../lib/admin';
import type { UserOnboardingProfile, AppUser } from '../lib/storage/types';

interface AuthGateProps {
  children: React.ReactNode;
  /** If true, allows anonymous access (skips login requirement) */
  allowAnonymous?: boolean;
}

export const AuthGate: React.FC<AuthGateProps> = ({
  children,
  allowAnonymous = false,
}) => {
  const { user, loading, isConfigured, signInWithGoogle, appUser } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

  // Check if user needs onboarding
  useEffect(() => {
    if (loading) return;

    if (user && appUser) {
      // User is logged in, check if they need onboarding
      const needsOnboarding = !appUser.onboarding?.onboardingCompleted &&
                              !appUser.onboarding?.onboardingSkippedAt;
      setShowOnboarding(needsOnboarding);
    }
    setCheckingOnboarding(false);
  }, [user, appUser, loading]);

  const handleOnboardingComplete = (profile: UserOnboardingProfile) => {
    // Save the onboarding profile to the user
    const currentUser = getCurrentAppUser();
    if (currentUser) {
      const updatedUser: AppUser = {
        ...currentUser,
        onboarding: profile,
      };
      saveCurrentAppUser(updatedUser);
    }
    setShowOnboarding(false);
  };

  const handleOnboardingSkip = () => {
    // Mark onboarding as skipped
    const currentUser = getCurrentAppUser();
    if (currentUser) {
      const updatedUser: AppUser = {
        ...currentUser,
        onboarding: {
          onboardingCompleted: false,
          onboardingSkippedAt: new Date().toISOString(),
        },
      };
      saveCurrentAppUser(updatedUser);
    }
    setShowOnboarding(false);
  };

  // Show loading state
  if (loading || checkingOnboarding) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Allow anonymous access if configured
  if (allowAnonymous && !user) {
    return <>{children}</>;
  }

  // Supabase not configured - show warning but allow access
  if (!isConfigured) {
    return <>{children}</>;
  }

  // Not logged in - show login screen
  if (!user) {
    return (
      <LoginScreen onSignIn={signInWithGoogle} />
    );
  }

  // Show onboarding for new users
  if (showOnboarding) {
    return (
      <>
        {children}
        <OnboardingWizard
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
          userName={appUser?.displayName}
        />
      </>
    );
  }

  // User is authenticated and onboarded
  return <>{children}</>;
};

// ═══════════════════════════════════════════════════════════════════════════
// LOGIN SCREEN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface LoginScreenProps {
  onSignIn: () => Promise<void>;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onSignIn }) => {
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await onSignIn();
    } catch {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 p-12 flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-white/10 rounded-lg">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">SkillEngine</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            AI-Powered Workflow Automation
          </h1>
          <p className="text-xl text-blue-100">
            Transform hours of work into minutes with intelligent automation tools.
          </p>
        </div>

        <div className="space-y-6">
          <FeatureItem
            icon={<Zap className="w-5 h-5" />}
            title="50+ Professional Skills"
            description="Ready-to-use AI prompts for marketing, sales, analysis, and more"
          />
          <FeatureItem
            icon={<Target className="w-5 h-5" />}
            title="Automated Workflows"
            description="Chain multiple skills together for complete task automation"
          />
          <FeatureItem
            icon={<Shield className="w-5 h-5" />}
            title="Free Tier Available"
            description="Get started with 10 skill runs per day, no credit card required"
          />
        </div>

        <div className="text-blue-200 text-sm">
          Trusted by professionals at leading companies
        </div>
      </div>

      {/* Right side - Login */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Sparkles className="w-8 h-8 text-blue-400" />
              </div>
              <span className="text-2xl font-bold text-white">SkillEngine</span>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl border border-gray-700 p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">
                Welcome Back
              </h2>
              <p className="text-gray-400">
                Sign in to access your AI automation tools
              </p>
            </div>

            <Button
              onClick={handleSignIn}
              disabled={isSigningIn}
              className="w-full py-3 bg-white hover:bg-gray-100 text-gray-900 font-medium"
            >
              {isSigningIn ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <GoogleIcon className="w-5 h-5 mr-2" />
              )}
              Continue with Google
            </Button>

            <div className="mt-6 pt-6 border-t border-gray-700">
              <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                <Mail className="w-4 h-4" />
                <span>Your email will be used for:</span>
              </div>
              <ul className="space-y-2 text-sm text-gray-500">
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-3 h-3" />
                  Account identification
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-3 h-3" />
                  Saving your work and preferences
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="w-3 h-3" />
                  Optional product updates (you can opt out)
                </li>
              </ul>
            </div>
          </div>

          <p className="text-center text-gray-500 text-sm mt-6">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// HELPER COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

const FeatureItem: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
}> = ({ icon, title, description }) => (
  <div className="flex items-start gap-4">
    <div className="p-2 bg-white/10 rounded-lg shrink-0">
      {icon}
    </div>
    <div>
      <h3 className="font-semibold text-white">{title}</h3>
      <p className="text-blue-200 text-sm">{description}</p>
    </div>
  </div>
);

const GoogleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

export default AuthGate;
