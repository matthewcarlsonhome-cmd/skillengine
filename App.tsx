/**
 * App.tsx - Main Application Entry Point
 *
 * This is the root component of SkillEngine, an AI-powered job search automation platform.
 * It establishes the application's provider hierarchy and routing configuration.
 *
 * ARCHITECTURE OVERVIEW:
 * =====================
 * The app uses a nested provider pattern where each provider wraps the next,
 * creating a hierarchy of context availability:
 *
 *   AuthProvider (Supabase authentication)
 *     └── AppProvider (Global app state: resume, job description, API selection)
 *           └── Router (HashRouter for Netlify static hosting compatibility)
 *                 └── ThemeProvider (Dark/light mode toggle)
 *                       └── ToastProvider (Notification system)
 *                             └── App Layout & Routes
 *
 * WHY HASHROUTER?
 * ===============
 * We use HashRouter instead of BrowserRouter because this app is deployed
 * on Netlify as a static site. HashRouter uses URL fragments (/#/path)
 * which work without server-side routing configuration.
 *
 * PAGE CATEGORIES:
 * ================
 * 1. Core Pages - Dashboard, Home, Profile, Welcome
 * 2. AI Skills - Browse, Run, and manage the 16 built-in AI skills
 * 3. Custom Skills - Analyze roles and build custom AI skills dynamically
 * 4. Community - Share and discover community-created skills (Supabase)
 * 5. Job Search Tools - Tracker, Interview prep, Networking, etc.
 * 6. Utilities - Batch processing, Export, Settings
 */

import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';

// ─────────────────────────────────────────────────────────────────────────────
// CONTEXT PROVIDERS
// These provide global state and functionality throughout the app
// ─────────────────────────────────────────────────────────────────────────────
import { ThemeProvider } from './hooks/useTheme';       // Dark/light mode management
import { ToastProvider } from './hooks/useToast';       // Toast notification system
import { AppProvider } from './hooks/useAppContext';    // Global app state (resume, JD, etc.)
import { AuthProvider } from './hooks/useAuth';         // Supabase authentication state

// ─────────────────────────────────────────────────────────────────────────────
// LAYOUT COMPONENTS
// Persistent UI elements that appear on every page
// ─────────────────────────────────────────────────────────────────────────────
import Header from './components/Header';               // Navigation bar with menus
import Footer from './components/Footer';               // Footer with links
import CommandPalette from './components/CommandPalette'; // Cmd+K quick navigation

// ─────────────────────────────────────────────────────────────────────────────
// CORE PAGES
// Main entry points and user profile management
// ─────────────────────────────────────────────────────────────────────────────
import HomePage from './pages/HomePage';                // Landing page with file uploads
import DashboardPage from './pages/DashboardPage';      // User dashboard with stats
import WelcomePage from './pages/WelcomePage';          // First-time user onboarding
import UserProfilePage from './pages/UserProfilePage';  // Resume and background storage

// ─────────────────────────────────────────────────────────────────────────────
// AI SKILLS PAGES
// The 16 built-in AI skills for job seekers
// ─────────────────────────────────────────────────────────────────────────────
import BrowseSkillsPage from './pages/BrowseSkillsPage';  // Grid view of all skills
import SkillRunnerPage from './pages/SkillRunnerPage';    // Execute a specific skill
import RoleTemplatesPage from './pages/RoleTemplatesPage'; // Pre-configured role templates
import MySkillsPage from './pages/MySkillsPage';          // User's saved/favorite skills
import SkillLibraryPage from './pages/SkillLibraryPage';  // Unified skill library with filtering
import LibrarySkillRunnerPage from './pages/LibrarySkillRunnerPage'; // Run skills from library

// ─────────────────────────────────────────────────────────────────────────────
// CUSTOM SKILL GENERATION
// Dynamic skill creation based on job description analysis
// ─────────────────────────────────────────────────────────────────────────────
import AnalyzeRolePage from './pages/AnalyzeRolePage';           // Analyze a job description
import WorkspacePage from './pages/WorkspacePage';               // View workspace with recommendations
import BuildSkillsPage from './pages/BuildSkillsPage';           // Build custom skills from recommendations
import DynamicSkillRunnerPage from './pages/DynamicSkillRunnerPage'; // Run user-created skills

// ─────────────────────────────────────────────────────────────────────────────
// COMMUNITY FEATURES
// Supabase-powered skill sharing and discovery
// ─────────────────────────────────────────────────────────────────────────────
import CommunitySkillsPage from './pages/CommunitySkillsPage';       // Browse community skills
import CommunitySkillRunnerPage from './pages/CommunitySkillRunnerPage'; // Run a community skill
import ImportSkillPage from './pages/ImportSkillPage';               // Import skill from JSON

// ─────────────────────────────────────────────────────────────────────────────
// BATCH PROCESSING & EXPORT
// Tools for bulk operations and data export
// ─────────────────────────────────────────────────────────────────────────────
import BatchProcessingPage from './pages/BatchProcessingPage';   // Run skills on CSV data
import SkillExportPage from './pages/SkillExportPage';           // Export skill prompts to CSV/TXT

// ─────────────────────────────────────────────────────────────────────────────
// WORKFLOWS
// Multi-step automated sequences that chain skills together
// ─────────────────────────────────────────────────────────────────────────────
import WorkflowsPage from './pages/WorkflowsPage';               // Browse all workflows by category
import WorkflowRunnerPage from './pages/WorkflowRunnerPage';     // Execute multi-step workflows
import BatchRunnerPage from './pages/BatchRunnerPage';           // Batch workflow execution

// ─────────────────────────────────────────────────────────────────────────────
// JOB SEARCH TOOLS
// Utilities to support the job search process
// ─────────────────────────────────────────────────────────────────────────────
import JobTrackerPage from './pages/JobTrackerPage';             // Track job applications
import InterviewBankPage from './pages/InterviewBankPage';       // Store interview Q&A
import SalaryCalculatorPage from './pages/SalaryCalculatorPage'; // Calculate compensation
import NetworkingTemplatesPage from './pages/NetworkingTemplatesPage'; // Outreach templates
import CompanyNotesPage from './pages/CompanyNotesPage';         // Company research notes
import AchievementsPage from './pages/AchievementsPage';         // Gamification & badges
import SkillsGapPage from './pages/SkillsGapPage';               // Skills gap analysis
import ProgressReportPage from './pages/ProgressReportPage';     // Job search progress
import MockInterviewPage from './pages/MockInterviewPage';       // Practice interviews
import FollowUpRemindersPage from './pages/FollowUpRemindersPage'; // Follow-up scheduling
import AutoFillVaultPage from './pages/AutoFillVaultPage';       // Store common form answers
import ReferralNetworkPage from './pages/ReferralNetworkPage';   // Track referral contacts
import MarketInsightsPage from './pages/MarketInsightsPage';     // Job market data
import DailyPlannerPage from './pages/DailyPlannerPage';         // Daily task planning

// ─────────────────────────────────────────────────────────────────────────────
// UTILITY PAGES
// Settings, configuration, and help
// ─────────────────────────────────────────────────────────────────────────────
import ApiKeyInstructionsPage from './pages/ApiKeyInstructionsPage'; // API key setup guide
import SettingsPage from './pages/SettingsPage';                     // App settings
import PricingPage from './pages/PricingPage';                       // Pricing information
import AdminPage from './pages/AdminPage';                           // Admin control panel
import DevPlaygroundPage from './pages/DevPlaygroundPage';           // Developer test playground

/**
 * Main App Component
 *
 * Renders the entire application with proper provider nesting and routing.
 * The provider order matters - outer providers are available to inner ones.
 */
function App() {
  return (
    // AuthProvider: Manages Supabase authentication state
    // Must be outermost so auth state is available everywhere
    <AuthProvider>
      {/* AppProvider: Global state for resume text, job description, selected API */}
      <AppProvider>
        {/* HashRouter: Client-side routing using URL hash fragments */}
        <Router>
          {/* ThemeProvider: Manages dark/light mode with localStorage persistence */}
          <ThemeProvider>
            {/* ToastProvider: Global toast notification system */}
            <ToastProvider>
              {/* Main app container with full viewport height and flex layout */}
              <div className="min-h-screen bg-background font-sans antialiased flex flex-col">
                {/* Sticky header with navigation */}
                <Header />

                {/* Main content area - grows to fill available space */}
                <main className="flex-1">
                  <Routes>
                    {/* ═══════════════════════════════════════════════════════
                        HOME & CORE PAGES
                        Primary navigation destinations
                    ═══════════════════════════════════════════════════════ */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/welcome" element={<WelcomePage />} />
                    <Route path="/profile" element={<UserProfilePage />} />

                    {/* ═══════════════════════════════════════════════════════
                        ROLE TEMPLATES
                        Pre-configured skill sets for different job roles
                    ═══════════════════════════════════════════════════════ */}
                    <Route path="/role-templates" element={<RoleTemplatesPage />} />
                    <Route path="/my-skills" element={<MySkillsPage />} />
                    <Route path="/library" element={<SkillLibraryPage />} />
                    <Route path="/library/skill/:skillId" element={<LibrarySkillRunnerPage />} />
                    <Route path="/library-skill-runner" element={<LibrarySkillRunnerPage />} />

                    {/* ═══════════════════════════════════════════════════════
                        STATIC AI SKILLS (16 Built-in Skills)
                        Pre-defined skills for job applicants
                        - /skills: Browse all available skills
                        - /skill/:skillId: Run a specific skill (e.g., /skill/resume-customizer)
                    ═══════════════════════════════════════════════════════ */}
                    <Route path="/skills" element={<BrowseSkillsPage />} />
                    <Route path="/skill/:skillId" element={<SkillRunnerPage />} />

                    {/* ═══════════════════════════════════════════════════════
                        DYNAMIC SKILL GENERATION
                        Create custom AI skills by analyzing job descriptions
                        - /analyze: Upload JD and get AI-generated skill recommendations
                        - /workspace/:id: View analysis results and select skills to build
                        - /workspace/:id/build: Configure and generate selected skills
                        - /workspace/:id/skill/:id: Run a custom-built skill
                    ═══════════════════════════════════════════════════════ */}
                    <Route path="/analyze" element={<AnalyzeRolePage />} />
                    <Route path="/workspace/:workspaceId" element={<WorkspacePage />} />
                    <Route path="/workspace/:workspaceId/build" element={<BuildSkillsPage />} />
                    <Route path="/workspace/:workspaceId/skill/:skillId" element={<DynamicSkillRunnerPage />} />

                    {/* ═══════════════════════════════════════════════════════
                        COMMUNITY FEATURES (Supabase Backend)
                        Share and discover community-created skills
                        - /community: Browse public skills from other users
                        - /community/import: Import a skill from JSON
                        - /community-skill-runner: Execute a community skill
                    ═══════════════════════════════════════════════════════ */}
                    <Route path="/community" element={<CommunitySkillsPage />} />
                    <Route path="/community/import" element={<ImportSkillPage />} />
                    <Route path="/community-skill-runner" element={<CommunitySkillRunnerPage />} />

                    {/* ═══════════════════════════════════════════════════════
                        BATCH PROCESSING & EXPORT
                        Bulk operations for power users
                        - /batch: Run any skill on multiple CSV rows
                        - /export-skills: Download skill prompts as CSV/TXT
                    ═══════════════════════════════════════════════════════ */}
                    <Route path="/batch" element={<BatchProcessingPage />} />
                    <Route path="/export-skills" element={<SkillExportPage />} />

                    {/* ═══════════════════════════════════════════════════════
                        WORKFLOWS
                        Multi-step automated sequences that chain skills
                        - /workflows: Browse all workflows by category
                        - /workflow/:id: Run a pre-built workflow (job-application, interview-prep, post-interview)
                        - /workflow/:id/batch: Batch execution with multiple input sets
                    ═══════════════════════════════════════════════════════ */}
                    <Route path="/workflows" element={<WorkflowsPage />} />
                    <Route path="/workflow/:workflowId" element={<WorkflowRunnerPage />} />
                    <Route path="/workflow/:workflowId/batch" element={<BatchRunnerPage />} />

                    {/* ═══════════════════════════════════════════════════════
                        JOB SEARCH TOOLS
                        Comprehensive toolkit for job seekers
                    ═══════════════════════════════════════════════════════ */}
                    <Route path="/job-tracker" element={<JobTrackerPage />} />
                    <Route path="/interview-bank" element={<InterviewBankPage />} />
                    <Route path="/salary-calculator" element={<SalaryCalculatorPage />} />
                    <Route path="/networking" element={<NetworkingTemplatesPage />} />
                    <Route path="/company-notes" element={<CompanyNotesPage />} />
                    <Route path="/skills-gap" element={<SkillsGapPage />} />
                    <Route path="/progress" element={<ProgressReportPage />} />
                    <Route path="/achievements" element={<AchievementsPage />} />
                    <Route path="/mock-interview" element={<MockInterviewPage />} />
                    <Route path="/follow-ups" element={<FollowUpRemindersPage />} />
                    <Route path="/autofill-vault" element={<AutoFillVaultPage />} />
                    <Route path="/referral-network" element={<ReferralNetworkPage />} />
                    <Route path="/market-insights" element={<MarketInsightsPage />} />
                    <Route path="/daily-planner" element={<DailyPlannerPage />} />

                    {/* ═══════════════════════════════════════════════════════
                        UTILITY PAGES
                        Configuration and help resources
                    ═══════════════════════════════════════════════════════ */}
                    <Route path="/api-keys" element={<ApiKeyInstructionsPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/pricing" element={<PricingPage />} />
                    <Route path="/admin" element={<AdminPage />} />
                    <Route path="/dev/playground" element={<DevPlaygroundPage />} />
                  </Routes>
                </main>

                {/* Footer with links and copyright */}
                <Footer />

                {/* Command palette overlay (Cmd+K to open) */}
                <CommandPalette />
              </div>
            </ToastProvider>
          </ThemeProvider>
        </Router>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
