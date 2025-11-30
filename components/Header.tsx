
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Moon, Sun, Briefcase, Users, Sparkles, FolderOpen } from 'lucide-react';
import { useTheme } from '../hooks/useTheme.tsx';
import { Button } from './ui/Button.tsx';

const Header: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const location = useLocation();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold">SkillEngine</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
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
          </nav>
        </div>

        <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
      </div>
    </header>
  );
};

export default Header;
