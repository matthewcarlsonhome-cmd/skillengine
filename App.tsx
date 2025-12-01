
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

                    {/* Batch Processing */}
                    <Route path="/batch" element={<BatchProcessingPage />} />

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
