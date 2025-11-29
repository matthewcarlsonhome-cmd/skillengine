
import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './hooks/useTheme';
import { ToastProvider } from './hooks/useToast';
import { AppProvider } from './hooks/useAppContext';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import BrowseSkillsPage from './pages/BrowseSkillsPage';
import SkillRunnerPage from './pages/SkillRunnerPage';
import ApiKeyInstructionsPage from './pages/ApiKeyInstructionsPage';
import AnalyzeRolePage from './pages/AnalyzeRolePage';
import WorkspacePage from './pages/WorkspacePage';
import BuildSkillsPage from './pages/BuildSkillsPage';
import DynamicSkillRunnerPage from './pages/DynamicSkillRunnerPage';

function App() {
  return (
    <AppProvider>
      <Router>
        <ThemeProvider>
          <ToastProvider>
            <div className="min-h-screen bg-background font-sans antialiased">
              <Header />
              <main>
                <Routes>
                  {/* Home */}
                  <Route path="/" element={<HomePage />} />

                  {/* Static skills (Job Applicant) */}
                  <Route path="/skills" element={<BrowseSkillsPage />} />
                  <Route path="/skill/:skillId" element={<SkillRunnerPage />} />

                  {/* Dynamic skill generation */}
                  <Route path="/analyze" element={<AnalyzeRolePage />} />
                  <Route path="/workspace/:workspaceId" element={<WorkspacePage />} />
                  <Route path="/workspace/:workspaceId/build" element={<BuildSkillsPage />} />
                  <Route path="/workspace/:workspaceId/skill/:skillId" element={<DynamicSkillRunnerPage />} />

                  {/* Utility */}
                  <Route path="/api-keys" element={<ApiKeyInstructionsPage />} />
                </Routes>
              </main>
            </div>
          </ToastProvider>
        </ThemeProvider>
      </Router>
    </AppProvider>
  );
}

export default App;
