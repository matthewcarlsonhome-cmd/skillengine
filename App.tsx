
import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './hooks/useTheme';
import { ToastProvider } from './hooks/useToast';
import { AppProvider } from './hooks/useAppContext';
import { AuthProvider } from './hooks/useAuth';
import Header from './components/Header';
import Footer from './components/Footer';
import CommandPalette from './components/CommandPalette';
import HomePage from './pages/HomePage';
import BrowseSkillsPage from './pages/BrowseSkillsPage';
import SkillRunnerPage from './pages/SkillRunnerPage';
import ApiKeyInstructionsPage from './pages/ApiKeyInstructionsPage';
import AnalyzeRolePage from './pages/AnalyzeRolePage';
import WorkspacePage from './pages/WorkspacePage';
import BuildSkillsPage from './pages/BuildSkillsPage';
import DynamicSkillRunnerPage from './pages/DynamicSkillRunnerPage';
import CommunitySkillsPage from './pages/CommunitySkillsPage';
import CommunitySkillRunnerPage from './pages/CommunitySkillRunnerPage';
import ImportSkillPage from './pages/ImportSkillPage';
import DashboardPage from './pages/DashboardPage';
import RoleTemplatesPage from './pages/RoleTemplatesPage';
import MySkillsPage from './pages/MySkillsPage';
import PricingPage from './pages/PricingPage';
import SettingsPage from './pages/SettingsPage';
import WelcomePage from './pages/WelcomePage';
import BatchProcessingPage from './pages/BatchProcessingPage';
import JobTrackerPage from './pages/JobTrackerPage';
import InterviewBankPage from './pages/InterviewBankPage';
import SalaryCalculatorPage from './pages/SalaryCalculatorPage';
import NetworkingTemplatesPage from './pages/NetworkingTemplatesPage';
import CompanyNotesPage from './pages/CompanyNotesPage';
import AchievementsPage from './pages/AchievementsPage';
import SkillsGapPage from './pages/SkillsGapPage';
import ProgressReportPage from './pages/ProgressReportPage';
import MockInterviewPage from './pages/MockInterviewPage';
import FollowUpRemindersPage from './pages/FollowUpRemindersPage';
import AutoFillVaultPage from './pages/AutoFillVaultPage';
import ReferralNetworkPage from './pages/ReferralNetworkPage';
import MarketInsightsPage from './pages/MarketInsightsPage';
import DailyPlannerPage from './pages/DailyPlannerPage';
import UserProfilePage from './pages/UserProfilePage';
import SkillExportPage from './pages/SkillExportPage';

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Router>
          <ThemeProvider>
            <ToastProvider>
              <div className="min-h-screen bg-background font-sans antialiased flex flex-col">
                <Header />
                <main className="flex-1">
                  <Routes>
                    {/* Home */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/welcome" element={<WelcomePage />} />
                    <Route path="/profile" element={<UserProfilePage />} />

                    {/* Role Templates */}
                    <Route path="/role-templates" element={<RoleTemplatesPage />} />
                    <Route path="/my-skills" element={<MySkillsPage />} />

                    {/* Static skills (Job Applicant) */}
                    <Route path="/skills" element={<BrowseSkillsPage />} />
                    <Route path="/skill/:skillId" element={<SkillRunnerPage />} />

                    {/* Dynamic skill generation */}
                    <Route path="/analyze" element={<AnalyzeRolePage />} />
                    <Route path="/workspace/:workspaceId" element={<WorkspacePage />} />
                    <Route path="/workspace/:workspaceId/build" element={<BuildSkillsPage />} />
                    <Route path="/workspace/:workspaceId/skill/:skillId" element={<DynamicSkillRunnerPage />} />

                    {/* Community */}
                    <Route path="/community" element={<CommunitySkillsPage />} />
                    <Route path="/community/import" element={<ImportSkillPage />} />
                    <Route path="/community-skill-runner" element={<CommunitySkillRunnerPage />} />

                    {/* Batch Processing & Export */}
                    <Route path="/batch" element={<BatchProcessingPage />} />
                    <Route path="/export-skills" element={<SkillExportPage />} />

                    {/* Job Search Tools */}
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

                    {/* Utility */}
                    <Route path="/api-keys" element={<ApiKeyInstructionsPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/pricing" element={<PricingPage />} />
                  </Routes>
                </main>
                <Footer />
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
