
import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './hooks/useTheme.tsx';
import { ToastProvider } from './hooks/useToast.tsx';
import Header from './components/Header.tsx';
import HomePage from './pages/HomePage.tsx';
import SkillRunnerPage from './pages/SkillRunnerPage.tsx';

function App() {
  return (
    <Router>
      <ThemeProvider>
        <ToastProvider>
          <div className="min-h-screen bg-background font-sans antialiased">
            <Header />
            <main>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/skill/:skillId" element={<SkillRunnerPage />} />
              </Routes>
            </main>
          </div>
        </ToastProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
