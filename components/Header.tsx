
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Moon, Sun, Briefcase, Users, Sparkles, FolderOpen, LogIn, LogOut, Loader2, ChevronDown, LayoutDashboard, Package, Menu, X, Settings, FileSpreadsheet, DollarSign, Wrench, MessageSquare, Calculator, Mail, Building2, Trophy, Target, BarChart3, Bot, Bell, Lock, TrendingUp, Calendar } from 'lucide-react';
import { useTheme } from '../hooks/useTheme.tsx';
import { useAuth } from '../hooks/useAuth.tsx';
import { useToast } from '../hooks/useToast.tsx';
import { Button } from './ui/Button.tsx';

const Header: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const { user, loading, isConfigured, signInWithGoogle, signOut } = useAuth();
  const { addToast } = useToast();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showToolsMenu, setShowToolsMenu] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const isActive = (path: string) => location.pathname === path;

  const handleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      addToast('Failed to sign in with Google', 'error');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setShowUserMenu(false);
      addToast('Signed out successfully', 'success');
    } catch (err) {
      addToast('Failed to sign out', 'error');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold">SkillEngine</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <Link to="/dashboard">
              <Button
                variant={isActive('/dashboard') ? 'secondary' : 'ghost'}
                size="sm"
                className="gap-2"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            <Link to="/role-templates">
              <Button
                variant={isActive('/role-templates') ? 'secondary' : 'ghost'}
                size="sm"
                className="gap-2"
              >
                <Package className="h-4 w-4" />
                Roles
              </Button>
            </Link>
            <Link to="/skills">
              <Button
                variant={isActive('/skills') ? 'secondary' : 'ghost'}
                size="sm"
                className="gap-2"
              >
                <Sparkles className="h-4 w-4" />
                Job Tools
              </Button>
            </Link>
            <Link to="/analyze">
              <Button
                variant={isActive('/analyze') ? 'secondary' : 'ghost'}
                size="sm"
                className="gap-2"
              >
                <FolderOpen className="h-4 w-4" />
                Analyze Role
              </Button>
            </Link>
            <Link to="/community">
              <Button
                variant={isActive('/community') ? 'secondary' : 'ghost'}
                size="sm"
                className="gap-2"
              >
                <Users className="h-4 w-4" />
                Community
              </Button>
            </Link>

            {/* Tools Dropdown */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="gap-2"
                onClick={() => setShowToolsMenu(!showToolsMenu)}
              >
                <Wrench className="h-4 w-4" />
                Tools
                <ChevronDown className="h-3 w-3" />
              </Button>

              {showToolsMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowToolsMenu(false)}
                  />
                  <div className="absolute left-0 mt-2 w-64 rounded-lg border bg-card shadow-lg z-50">
                    <div className="p-2 grid grid-cols-1 gap-1">
                      <Link to="/job-tracker" onClick={() => setShowToolsMenu(false)}>
                        <div className="flex items-center gap-2 px-3 py-2 rounded hover:bg-muted transition-colors">
                          <Briefcase className="h-4 w-4 text-blue-500" />
                          <span className="text-sm">Job Tracker</span>
                        </div>
                      </Link>
                      <Link to="/interview-bank" onClick={() => setShowToolsMenu(false)}>
                        <div className="flex items-center gap-2 px-3 py-2 rounded hover:bg-muted transition-colors">
                          <MessageSquare className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Interview Bank</span>
                        </div>
                      </Link>
                      <Link to="/salary-calculator" onClick={() => setShowToolsMenu(false)}>
                        <div className="flex items-center gap-2 px-3 py-2 rounded hover:bg-muted transition-colors">
                          <Calculator className="h-4 w-4 text-purple-500" />
                          <span className="text-sm">Salary Calculator</span>
                        </div>
                      </Link>
                      <Link to="/networking" onClick={() => setShowToolsMenu(false)}>
                        <div className="flex items-center gap-2 px-3 py-2 rounded hover:bg-muted transition-colors">
                          <Mail className="h-4 w-4 text-cyan-500" />
                          <span className="text-sm">Networking Templates</span>
                        </div>
                      </Link>
                      <Link to="/company-notes" onClick={() => setShowToolsMenu(false)}>
                        <div className="flex items-center gap-2 px-3 py-2 rounded hover:bg-muted transition-colors">
                          <Building2 className="h-4 w-4 text-orange-500" />
                          <span className="text-sm">Company Notes</span>
                        </div>
                      </Link>
                      <Link to="/skills-gap" onClick={() => setShowToolsMenu(false)}>
                        <div className="flex items-center gap-2 px-3 py-2 rounded hover:bg-muted transition-colors">
                          <Target className="h-4 w-4 text-pink-500" />
                          <span className="text-sm">Skills Gap Analyzer</span>
                        </div>
                      </Link>
                      <Link to="/progress" onClick={() => setShowToolsMenu(false)}>
                        <div className="flex items-center gap-2 px-3 py-2 rounded hover:bg-muted transition-colors">
                          <BarChart3 className="h-4 w-4 text-indigo-500" />
                          <span className="text-sm">Progress Report</span>
                        </div>
                      </Link>
                      <Link to="/achievements" onClick={() => setShowToolsMenu(false)}>
                        <div className="flex items-center gap-2 px-3 py-2 rounded hover:bg-muted transition-colors">
                          <Trophy className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm">Achievements</span>
                        </div>
                      </Link>
                      <div className="border-t my-1" />
                      <Link to="/mock-interview" onClick={() => setShowToolsMenu(false)}>
                        <div className="flex items-center gap-2 px-3 py-2 rounded hover:bg-muted transition-colors">
                          <Bot className="h-4 w-4 text-violet-500" />
                          <span className="text-sm">Mock Interview</span>
                        </div>
                      </Link>
                      <Link to="/follow-ups" onClick={() => setShowToolsMenu(false)}>
                        <div className="flex items-center gap-2 px-3 py-2 rounded hover:bg-muted transition-colors">
                          <Bell className="h-4 w-4 text-red-500" />
                          <span className="text-sm">Follow-up Reminders</span>
                        </div>
                      </Link>
                      <Link to="/autofill-vault" onClick={() => setShowToolsMenu(false)}>
                        <div className="flex items-center gap-2 px-3 py-2 rounded hover:bg-muted transition-colors">
                          <Lock className="h-4 w-4 text-emerald-500" />
                          <span className="text-sm">Auto-Fill Vault</span>
                        </div>
                      </Link>
                      <Link to="/referral-network" onClick={() => setShowToolsMenu(false)}>
                        <div className="flex items-center gap-2 px-3 py-2 rounded hover:bg-muted transition-colors">
                          <Users className="h-4 w-4 text-blue-400" />
                          <span className="text-sm">Referral Network</span>
                        </div>
                      </Link>
                      <Link to="/market-insights" onClick={() => setShowToolsMenu(false)}>
                        <div className="flex items-center gap-2 px-3 py-2 rounded hover:bg-muted transition-colors">
                          <TrendingUp className="h-4 w-4 text-teal-500" />
                          <span className="text-sm">Market Insights</span>
                        </div>
                      </Link>
                      <Link to="/daily-planner" onClick={() => setShowToolsMenu(false)}>
                        <div className="flex items-center gap-2 px-3 py-2 rounded hover:bg-muted transition-colors">
                          <Calendar className="h-4 w-4 text-sky-500" />
                          <span className="text-sm">Daily Planner</span>
                        </div>
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          {/* Auth Section */}
          {isConfigured && (
            <>
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              ) : user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 p-1 rounded-lg hover:bg-muted transition-colors"
                  >
                    {user.user_metadata?.avatar_url ? (
                      <img
                        src={user.user_metadata.avatar_url}
                        alt=""
                        className="h-8 w-8 rounded-full"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-sm font-medium">
                          {(user.user_metadata?.full_name || user.email || 'U')[0].toUpperCase()}
                        </span>
                      </div>
                    )}
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </button>

                  {showUserMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowUserMenu(false)}
                      />
                      <div className="absolute right-0 mt-2 w-56 rounded-lg border bg-card shadow-lg z-50">
                        <div className="p-3 border-b">
                          <p className="font-medium text-sm truncate">
                            {user.user_metadata?.full_name || 'User'}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {user.email}
                          </p>
                        </div>
                        <div className="p-1">
                          <button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-muted transition-colors text-left"
                          >
                            <LogOut className="h-4 w-4" />
                            Sign out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignIn}
                  disabled={isSigningIn}
                  className="gap-2"
                >
                  {isSigningIn ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <LogIn className="h-4 w-4" />
                  )}
                  Sign in
                </Button>
              )}
            </>
          )}

          {/* Theme Toggle */}
          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background/95 backdrop-blur">
          <nav className="container mx-auto max-w-7xl px-4 py-4 flex flex-col gap-1">
            <Link to="/dashboard">
              <Button
                variant={isActive('/dashboard') ? 'secondary' : 'ghost'}
                className="w-full justify-start gap-2"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            <Link to="/role-templates">
              <Button
                variant={isActive('/role-templates') ? 'secondary' : 'ghost'}
                className="w-full justify-start gap-2"
              >
                <Package className="h-4 w-4" />
                Role Templates
              </Button>
            </Link>
            <Link to="/skills">
              <Button
                variant={isActive('/skills') ? 'secondary' : 'ghost'}
                className="w-full justify-start gap-2"
              >
                <Sparkles className="h-4 w-4" />
                Job Tools
              </Button>
            </Link>
            <Link to="/analyze">
              <Button
                variant={isActive('/analyze') ? 'secondary' : 'ghost'}
                className="w-full justify-start gap-2"
              >
                <FolderOpen className="h-4 w-4" />
                Analyze Role
              </Button>
            </Link>
            <Link to="/community">
              <Button
                variant={isActive('/community') ? 'secondary' : 'ghost'}
                className="w-full justify-start gap-2"
              >
                <Users className="h-4 w-4" />
                Community
              </Button>
            </Link>
            <Link to="/batch">
              <Button
                variant={isActive('/batch') ? 'secondary' : 'ghost'}
                className="w-full justify-start gap-2"
              >
                <FileSpreadsheet className="h-4 w-4" />
                Batch Processing
              </Button>
            </Link>
            <div className="border-t my-2" />
            <p className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase">Job Search Tools</p>
            <Link to="/job-tracker">
              <Button
                variant={isActive('/job-tracker') ? 'secondary' : 'ghost'}
                className="w-full justify-start gap-2"
              >
                <Briefcase className="h-4 w-4" />
                Job Tracker
              </Button>
            </Link>
            <Link to="/interview-bank">
              <Button
                variant={isActive('/interview-bank') ? 'secondary' : 'ghost'}
                className="w-full justify-start gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                Interview Bank
              </Button>
            </Link>
            <Link to="/salary-calculator">
              <Button
                variant={isActive('/salary-calculator') ? 'secondary' : 'ghost'}
                className="w-full justify-start gap-2"
              >
                <Calculator className="h-4 w-4" />
                Salary Calculator
              </Button>
            </Link>
            <Link to="/networking">
              <Button
                variant={isActive('/networking') ? 'secondary' : 'ghost'}
                className="w-full justify-start gap-2"
              >
                <Mail className="h-4 w-4" />
                Networking Templates
              </Button>
            </Link>
            <Link to="/company-notes">
              <Button
                variant={isActive('/company-notes') ? 'secondary' : 'ghost'}
                className="w-full justify-start gap-2"
              >
                <Building2 className="h-4 w-4" />
                Company Notes
              </Button>
            </Link>
            <Link to="/skills-gap">
              <Button
                variant={isActive('/skills-gap') ? 'secondary' : 'ghost'}
                className="w-full justify-start gap-2"
              >
                <Target className="h-4 w-4" />
                Skills Gap Analyzer
              </Button>
            </Link>
            <Link to="/progress">
              <Button
                variant={isActive('/progress') ? 'secondary' : 'ghost'}
                className="w-full justify-start gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                Progress Report
              </Button>
            </Link>
            <Link to="/achievements">
              <Button
                variant={isActive('/achievements') ? 'secondary' : 'ghost'}
                className="w-full justify-start gap-2"
              >
                <Trophy className="h-4 w-4" />
                Achievements
              </Button>
            </Link>
            <Link to="/mock-interview">
              <Button
                variant={isActive('/mock-interview') ? 'secondary' : 'ghost'}
                className="w-full justify-start gap-2"
              >
                <Bot className="h-4 w-4" />
                Mock Interview
              </Button>
            </Link>
            <Link to="/follow-ups">
              <Button
                variant={isActive('/follow-ups') ? 'secondary' : 'ghost'}
                className="w-full justify-start gap-2"
              >
                <Bell className="h-4 w-4" />
                Follow-up Reminders
              </Button>
            </Link>
            <Link to="/autofill-vault">
              <Button
                variant={isActive('/autofill-vault') ? 'secondary' : 'ghost'}
                className="w-full justify-start gap-2"
              >
                <Lock className="h-4 w-4" />
                Auto-Fill Vault
              </Button>
            </Link>
            <Link to="/referral-network">
              <Button
                variant={isActive('/referral-network') ? 'secondary' : 'ghost'}
                className="w-full justify-start gap-2"
              >
                <Users className="h-4 w-4" />
                Referral Network
              </Button>
            </Link>
            <Link to="/market-insights">
              <Button
                variant={isActive('/market-insights') ? 'secondary' : 'ghost'}
                className="w-full justify-start gap-2"
              >
                <TrendingUp className="h-4 w-4" />
                Market Insights
              </Button>
            </Link>
            <Link to="/daily-planner">
              <Button
                variant={isActive('/daily-planner') ? 'secondary' : 'ghost'}
                className="w-full justify-start gap-2"
              >
                <Calendar className="h-4 w-4" />
                Daily Planner
              </Button>
            </Link>
            <div className="border-t my-2" />
            <Link to="/settings">
              <Button
                variant={isActive('/settings') ? 'secondary' : 'ghost'}
                className="w-full justify-start gap-2"
              >
                <Settings className="h-4 w-4" />
                Settings
              </Button>
            </Link>
            <Link to="/pricing">
              <Button
                variant={isActive('/pricing') ? 'secondary' : 'ghost'}
                className="w-full justify-start gap-2"
              >
                <DollarSign className="h-4 w-4" />
                Pricing
              </Button>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
