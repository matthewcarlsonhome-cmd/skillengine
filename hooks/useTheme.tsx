
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

type Theme = 'dark' | 'light' | 'system';

interface ThemeProviderState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(undefined);

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'vite-ui-theme',
}: {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    let systemTheme: 'dark' | 'light' = 'light';
    if (theme === 'system') {
        systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    
    const effectiveTheme = theme === 'system' ? systemTheme : theme;

    root.classList.add(effectiveTheme);
    root.style.setProperty('--radius', '0.5rem');
    if (effectiveTheme === 'dark') {
        root.style.setProperty('--background', '0 0% 3.9%');
        root.style.setProperty('--foreground', '0 0% 98%');
        root.style.setProperty('--card', '0 0% 3.9%');
        root.style.setProperty('--card-foreground', '0 0% 98%');
        root.style.setProperty('--popover', '0 0% 3.9%');
        root.style.setProperty('--popover-foreground', '0 0% 98%');
        root.style.setProperty('--primary', '0 0% 98%');
        root.style.setProperty('--primary-foreground', '0 0% 9%');
        root.style.setProperty('--secondary', '0 0% 14.9%');
        root.style.setProperty('--secondary-foreground', '0 0% 98%');
        root.style.setProperty('--muted', '0 0% 14.9%');
        root.style.setProperty('--muted-foreground', '0 0% 63.9%');
        root.style.setProperty('--accent', '0 0% 14.9%');
        root.style.setProperty('--accent-foreground', '0 0% 98%');
        root.style.setProperty('--destructive', '0 62.8% 30.6%');
        root.style.setProperty('--destructive-foreground', '0 0% 98%');
        root.style.setProperty('--border', '0 0% 14.9%');
        root.style.setProperty('--input', '0 0% 14.9%');
        root.style.setProperty('--ring', '0 0% 83.1%');
    } else {
        root.style.setProperty('--background', '0 0% 100%');
        root.style.setProperty('--foreground', '0 0% 3.9%');
        root.style.setProperty('--card', '0 0% 100%');
        root.style.setProperty('--card-foreground', '0 0% 3.9%');
        root.style.setProperty('--popover', '0 0% 100%');
        root.style.setProperty('--popover-foreground', '0 0% 3.9%');
        root.style.setProperty('--primary', '0 0% 9%');
        root.style.setProperty('--primary-foreground', '0 0% 98%');
        root.style.setProperty('--secondary', '0 0% 96.1%');
        root.style.setProperty('--secondary-foreground', '0 0% 9%');
        root.style.setProperty('--muted', '0 0% 96.1%');
        root.style.setProperty('--muted-foreground', '0 0% 45.1%');
        root.style.setProperty('--accent', '0 0% 96.1%');
        root.style.setProperty('--accent-foreground', '0 0% 9%');
        root.style.setProperty('--destructive', '0 84.2% 60.2%');
        root.style.setProperty('--destructive-foreground', '0 0% 98%');
        root.style.setProperty('--border', '0 0% 89.8%');
        root.style.setProperty('--input', '0 0% 89.8%');
        root.style.setProperty('--ring', '0 0% 3.9%');
    }
  }, [theme]);

  const value = useMemo(() => ({
    theme,
    setTheme: (newTheme: Theme) => {
      localStorage.setItem(storageKey, newTheme);
      setTheme(newTheme);
    },
  }), [theme, storageKey]);

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
