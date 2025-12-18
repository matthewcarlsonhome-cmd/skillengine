
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Moon, Sun, Briefcase, Users, LogIn, LogOut, Loader2, ChevronDown, LayoutDashboard, Package, Menu, X, Settings, FileSpreadsheet, MessageSquare, Calculator, Mail, Building2, Trophy, Target, BarChart3, Bot, Bell, Lock, TrendingUp, Calendar, User, Wand2, Download, Shield, BookOpen, Layers } from 'lucide-react';
import { useTheme } from '../hooks/useTheme.tsx';
import { useAuth } from '../hooks/useAuth.tsx';
import { useToast } from '../hooks/useToast.tsx';
import { Button } from './ui/Button.tsx';

const Header: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const { user, loading, isConfigured, isAdmin, signInWithGoogle, signOut } = useAuth();
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
            {/* Core Navigation - 4 primary destinations */}
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
            <Link to="/library">
              <Button
                variant={isActive('/library') ? 'secondary' : 'ghost'}
                size="sm"
                className="gap-2"
              >
                <BookOpen className="h-4 w-4" />
                Skill Library
              </Button>
            </Link>
            <Link to="/workflows">
              <Button
                variant={isActive('/workflows') ? 'secondary' : 'ghost'}
                size="sm"
                className="gap-2"
              >
                <Layers className="h-4 w-4" />
                Workflows
              </Button>
            </Link>

            {/* More Dropdown - Consolidated menu for secondary features */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="gap-2"
                onClick={() => setShowToolsMenu(!showToolsMenu)}
              >
                More
                <ChevronDown className="h-3 w-3" />
              </Button>

              {showToolsMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowToolsMenu(false)}
                  />
                  <div className="absolute left-0 mt-2 w-80 rounded-lg border bg-card shadow-lg z-50 max-h-[80vh] overflow-y-auto">
                    <div className="p-2">
                      {/* Create & Customize */}
                      <p className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Create & Customize</p>
                      <Link to="/role-templates" onClick={() => setShowToolsMenu(false)}>
                        <div className="flex items-center gap-3 px-3 py-2 rounded hover:bg-muted transition-colors">
                          <Package className="h-4 w-4 text-primary" />
                          <div>
                            <span className="text-sm font-medium">Role Templates</span>
                            <p className="text-xs text-muted-foreground">Pre-built skill sets for roles</p>
                          </div>
                        </div>
                      </Link>
                      <Link to="/analyze" onClick={() => setShowToolsMenu(false)}>
                        <div className="flex items-center gap-3 px-3 py-2 rounded hover:bg-muted transition-colors">
                          <Wand2 className="h-4 w-4 text-purple-500" />
                          <div>
                            <span className="text-sm font-medium">Custom Skills</span>
                            <p className="text-xs text-muted-foreground">Create your own AI skills</p>
                          </div>
                        </div>
                      </Link>
                      <Link to="/community" onClick={() => setShowToolsMenu(false)}>
                        <div className="flex items-center gap-3 px-3 py-2 rounded hover:bg-muted transition-colors">
                          <Users className="h-4 w-4 text-blue-500" />
                          <div>
                            <span className="text-sm font-medium">Community</span>
                            <p className="text-xs text-muted-foreground">Share & discover skills</p>
                          </div>
                        </div>
                      </Link>

                      {/* Track Progress */}
                      <div className="border-t my-2" />
                      <p className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Track Progress</p>
                      <Link to="/job-tracker" onClick={() => setShowToolsMenu(false)}>
                        <div className="flex items-center gap-3 px-3 py-2 rounded hover:bg-muted transition-colors">
                          <Briefcase className="h-4 w-4 text-blue-500" />
                          <span className="text-sm">Job Tracker</span>
                        </div>
                      </Link>
                      <Link to="/daily-planner" onClick={() => setShowToolsMenu(false)}>
                        <div className="flex items-center gap-3 px-3 py-2 rounded hover:bg-muted transition-colors">
                          <Calendar className="h-4 w-4 text-sky-500" />
                          <span className="text-sm">Daily Planner</span>
                        </div>
                      </Link>
                      <Link to="/follow-ups" onClick={() => setShowToolsMenu(false)}>
                        <div className="flex items-center gap-3 px-3 py-2 rounded hover:bg-muted transition-colors">
                          <Bell className="h-4 w-4 text-red-500" />
                          <span className="text-sm">Follow-up Reminders</span>
                        </div>
                      </Link>
                      <Link to="/progress" onClick={() => setShowToolsMenu(false)}>
                        <div className="flex items-center gap-3 px-3 py-2 rounded hover:bg-muted transition-colors">
                          <BarChart3 className="h-4 w-4 text-indigo-500" />
                          <span className="text-sm">Progress Report</span>
                        </div>
                      </Link>

                      {/* Interview Prep */}
                      <div className="border-t my-2" />
                      <p className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Interview Prep</p>
                      <Link to="/mock-interview" onClick={() => setShowToolsMenu(false)}>
                        <div className="flex items-center gap-3 px-3 py-2 rounded hover:bg-muted transition-colors">
                          <Bot className="h-4 w-4 text-violet-500" />
                          <span className="text-sm">Mock Interview</span>
                        </div>
                      </Link>
                      <Link to="/interview-bank" onClick={() => setShowToolsMenu(false)}>
                        <div className="flex items-center gap-3 px-3 py-2 rounded hover:bg-muted transition-colors">
                          <MessageSquare className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Interview Q&A Bank</span>
                        </div>
                      </Link>
                      <Link to="/company-notes" onClick={() => setShowToolsMenu(false)}>
                        <div className="flex items-center gap-3 px-3 py-2 rounded hover:bg-muted transition-colors">
                          <Building2 className="h-4 w-4 text-orange-500" />
                          <span className="text-sm">Company Research</span>
                        </div>
                      </Link>

                      {/* Networking & Outreach */}
                      <div className="border-t my-2" />
                      <p className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Networking</p>
                      <Link to="/networking" onClick={() => setShowToolsMenu(false)}>
                        <div className="flex items-center gap-3 px-3 py-2 rounded hover:bg-muted transition-colors">
                          <Mail className="h-4 w-4 text-cyan-500" />
                          <span className="text-sm">Outreach Templates</span>
                        </div>
                      </Link>
                      <Link to="/referral-network" onClick={() => setShowToolsMenu(false)}>
                        <div className="flex items-center gap-3 px-3 py-2 rounded hover:bg-muted transition-colors">
                          <Users className="h-4 w-4 text-blue-400" />
                          <span className="text-sm">Referral Network</span>
                        </div>
                      </Link>

                      {/* Research & Analysis */}
                      <div className="border-t my-2" />
                      <p className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Research</p>
                      <Link to="/salary-calculator" onClick={() => setShowToolsMenu(false)}>
                        <div className="flex items-center gap-3 px-3 py-2 rounded hover:bg-muted transition-colors">
                          <Calculator className="h-4 w-4 text-purple-500" />
                          <span className="text-sm">Salary Calculator</span>
                        </div>
                      </Link>
                      <Link to="/market-insights" onClick={() => setShowToolsMenu(false)}>
                        <div className="flex items-center gap-3 px-3 py-2 rounded hover:bg-muted transition-colors">
                          <TrendingUp className="h-4 w-4 text-teal-500" />
                          <span className="text-sm">Market Insights</span>
                        </div>
                      </Link>
                      <Link to="/skills-gap" onClick={() => setShowToolsMenu(false)}>
                        <div className="flex items-center gap-3 px-3 py-2 rounded hover:bg-muted transition-colors">
                          <Target className="h-4 w-4 text-pink-500" />
                          <span className="text-sm">Skills Gap Analyzer</span>
                        </div>
                      </Link>

                      {/* Utilities */}
                      <div className="border-t my-2" />
                      <p className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Utilities</p>
                      <Link to="/autofill-vault" onClick={() => setShowToolsMenu(false)}>
                        <div className="flex items-center gap-3 px-3 py-2 rounded hover:bg-muted transition-colors">
                          <Lock className="h-4 w-4 text-emerald-500" />
                          <span className="text-sm">Auto-Fill Vault</span>
                        </div>
                      </Link>
                      <Link to="/batch" onClick={() => setShowToolsMenu(false)}>
                        <div className="flex items-center gap-3 px-3 py-2 rounded hover:bg-muted transition-colors">
                          <FileSpreadsheet className="h-4 w-4 text-amber-500" />
                          <span className="text-sm">Batch Processing</span>
                        </div>
                      </Link>
                      <Link to="/export-skills" onClick={() => setShowToolsMenu(false)}>
                        <div className="flex items-center gap-3 px-3 py-2 rounded hover:bg-muted transition-colors">
                          <Download className="h-4 w-4 text-orange-500" />
                          <span className="text-sm">Export Skills</span>
                        </div>
                      </Link>
                      <Link to="/achievements" onClick={() => setShowToolsMenu(false)}>
                        <div className="flex items-center gap-3 px-3 py-2 rounded hover:bg-muted transition-colors">
                          <Trophy className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm">Achievements</span>
                        </div>
                      </Link>

                      {/* Admin - Only visible to logged-in admins */}
                      {isAdmin && (
                        <>
                          <div className="border-t my-2" />
                          <p className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Admin</p>
                          <Link to="/admin" onClick={() => setShowToolsMenu(false)}>
                            <div className="flex items-center gap-3 px-3 py-2 rounded hover:bg-muted transition-colors">
                              <Shield className="h-4 w-4 text-amber-500" />
                              <span className="text-sm">Control Panel</span>
                            </div>
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Settings Icon */}
            <Link to="/settings">
              <Button
                variant={isActive('/settings') ? 'secondary' : 'ghost'}
                size="icon"
                className="ml-1"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </Link>
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
                          <Link
                            to="/profile"
                            onClick={() => setShowUserMenu(false)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-muted transition-colors"
                          >
                            <User className="h-4 w-4" />
                            My Profile
                          </Link>
                          <Link
                            to="/settings"
                            onClick={() => setShowUserMenu(false)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-muted transition-colors"
                          >
                            <Settings className="h-4 w-4" />
                            Settings
                          </Link>
                          {isAdmin && (
                            <Link
                              to="/admin"
                              onClick={() => setShowUserMenu(false)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-muted transition-colors"
                            >
                              <Shield className="h-4 w-4 text-amber-500" />
                              Admin Panel
                            </Link>
                          )}
                          <div className="border-t my-1" />
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
        <div className="md:hidden border-t bg-background/95 backdrop-blur max-h-[80vh] overflow-y-auto">
          <nav className="container mx-auto max-w-7xl px-4 py-4 flex flex-col gap-1">
            {/* Core Navigation */}
            <Link to="/dashboard">
              <Button
                variant={isActive('/dashboard') ? 'secondary' : 'ghost'}
                className="w-full justify-start gap-2"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            <Link to="/library">
              <Button
                variant={isActive('/library') ? 'secondary' : 'ghost'}
                className="w-full justify-start gap-2"
              >
                <BookOpen className="h-4 w-4" />
                Skill Library
              </Button>
            </Link>
            <Link to="/workflows">
              <Button
                variant={isActive('/workflows') ? 'secondary' : 'ghost'}
                className="w-full justify-start gap-2"
              >
                <Layers className="h-4 w-4" />
                Workflows
              </Button>
            </Link>
            <Link to="/settings">
              <Button variant={isActive('/settings') ? 'secondary' : 'ghost'} className="w-full justify-start gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </Button>
            </Link>

            {/* Create & Customize */}
            <div className="border-t my-2" />
            <p className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase">Create & Customize</p>
            <Link to="/role-templates">
              <Button variant={isActive('/role-templates') ? 'secondary' : 'ghost'} className="w-full justify-start gap-2">
                <Package className="h-4 w-4 text-primary" />
                Role Templates
              </Button>
            </Link>
            <Link to="/analyze">
              <Button variant={isActive('/analyze') ? 'secondary' : 'ghost'} className="w-full justify-start gap-2">
                <Wand2 className="h-4 w-4 text-purple-500" />
                Custom Skills
              </Button>
            </Link>
            <Link to="/community">
              <Button variant={isActive('/community') ? 'secondary' : 'ghost'} className="w-full justify-start gap-2">
                <Users className="h-4 w-4 text-blue-500" />
                Community
              </Button>
            </Link>

            {/* Track Progress */}
            <div className="border-t my-2" />
            <p className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase">Track Progress</p>
            <Link to="/job-tracker">
              <Button variant={isActive('/job-tracker') ? 'secondary' : 'ghost'} className="w-full justify-start gap-2">
                <Briefcase className="h-4 w-4 text-blue-500" />
                Job Tracker
              </Button>
            </Link>
            <Link to="/daily-planner">
              <Button variant={isActive('/daily-planner') ? 'secondary' : 'ghost'} className="w-full justify-start gap-2">
                <Calendar className="h-4 w-4 text-sky-500" />
                Daily Planner
              </Button>
            </Link>
            <Link to="/follow-ups">
              <Button variant={isActive('/follow-ups') ? 'secondary' : 'ghost'} className="w-full justify-start gap-2">
                <Bell className="h-4 w-4 text-red-500" />
                Follow-up Reminders
              </Button>
            </Link>
            <Link to="/progress">
              <Button variant={isActive('/progress') ? 'secondary' : 'ghost'} className="w-full justify-start gap-2">
                <BarChart3 className="h-4 w-4 text-indigo-500" />
                Progress Report
              </Button>
            </Link>

            {/* Interview Prep */}
            <div className="border-t my-2" />
            <p className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase">Interview Prep</p>
            <Link to="/mock-interview">
              <Button variant={isActive('/mock-interview') ? 'secondary' : 'ghost'} className="w-full justify-start gap-2">
                <Bot className="h-4 w-4 text-violet-500" />
                Mock Interview
              </Button>
            </Link>
            <Link to="/interview-bank">
              <Button variant={isActive('/interview-bank') ? 'secondary' : 'ghost'} className="w-full justify-start gap-2">
                <MessageSquare className="h-4 w-4 text-green-500" />
                Interview Q&A Bank
              </Button>
            </Link>
            <Link to="/company-notes">
              <Button variant={isActive('/company-notes') ? 'secondary' : 'ghost'} className="w-full justify-start gap-2">
                <Building2 className="h-4 w-4 text-orange-500" />
                Company Research
              </Button>
            </Link>

            {/* Networking */}
            <div className="border-t my-2" />
            <p className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase">Networking</p>
            <Link to="/networking">
              <Button variant={isActive('/networking') ? 'secondary' : 'ghost'} className="w-full justify-start gap-2">
                <Mail className="h-4 w-4 text-cyan-500" />
                Outreach Templates
              </Button>
            </Link>
            <Link to="/referral-network">
              <Button variant={isActive('/referral-network') ? 'secondary' : 'ghost'} className="w-full justify-start gap-2">
                <Users className="h-4 w-4 text-blue-400" />
                Referral Network
              </Button>
            </Link>

            {/* Research */}
            <div className="border-t my-2" />
            <p className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase">Research</p>
            <Link to="/salary-calculator">
              <Button variant={isActive('/salary-calculator') ? 'secondary' : 'ghost'} className="w-full justify-start gap-2">
                <Calculator className="h-4 w-4 text-purple-500" />
                Salary Calculator
              </Button>
            </Link>
            <Link to="/market-insights">
              <Button variant={isActive('/market-insights') ? 'secondary' : 'ghost'} className="w-full justify-start gap-2">
                <TrendingUp className="h-4 w-4 text-teal-500" />
                Market Insights
              </Button>
            </Link>
            <Link to="/skills-gap">
              <Button variant={isActive('/skills-gap') ? 'secondary' : 'ghost'} className="w-full justify-start gap-2">
                <Target className="h-4 w-4 text-pink-500" />
                Skills Gap Analyzer
              </Button>
            </Link>

            {/* Utilities */}
            <div className="border-t my-2" />
            <p className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase">Utilities</p>
            <Link to="/autofill-vault">
              <Button variant={isActive('/autofill-vault') ? 'secondary' : 'ghost'} className="w-full justify-start gap-2">
                <Lock className="h-4 w-4 text-emerald-500" />
                Auto-Fill Vault
              </Button>
            </Link>
            <Link to="/batch">
              <Button variant={isActive('/batch') ? 'secondary' : 'ghost'} className="w-full justify-start gap-2">
                <FileSpreadsheet className="h-4 w-4 text-amber-500" />
                Batch Processing
              </Button>
            </Link>
            <Link to="/export-skills">
              <Button variant={isActive('/export-skills') ? 'secondary' : 'ghost'} className="w-full justify-start gap-2">
                <Download className="h-4 w-4 text-orange-500" />
                Export Skills
              </Button>
            </Link>
            <Link to="/achievements">
              <Button variant={isActive('/achievements') ? 'secondary' : 'ghost'} className="w-full justify-start gap-2">
                <Trophy className="h-4 w-4 text-yellow-500" />
                Achievements
              </Button>
            </Link>

            {/* Admin - Only visible to logged-in admins */}
            {isAdmin && (
              <>
                <div className="border-t my-2" />
                <p className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase">Admin</p>
                <Link to="/admin">
                  <Button variant={isActive('/admin') ? 'secondary' : 'ghost'} className="w-full justify-start gap-2">
                    <Shield className="h-4 w-4 text-amber-500" />
                    Control Panel
                  </Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
