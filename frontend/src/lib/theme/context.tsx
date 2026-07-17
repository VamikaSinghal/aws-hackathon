'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Get saved theme preference or detect system preference
    const saved = localStorage.getItem('theme') as Theme | null;
    const preferred = saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setThemeState(preferred);
    applyTheme(preferred);
  }, []);

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement;
    const body = document.body;

    // Set on both html and body
    root.setAttribute('data-theme', newTheme);
    body.setAttribute('data-theme', newTheme);

    // Also set class for backwards compatibility
    root.classList.remove('light', 'dark');
    root.classList.add(newTheme);

    // Apply CSS variable based approach
    if (newTheme === 'light') {
      root.style.backgroundColor = '#f8f8f8';
      body.style.backgroundColor = '#f8f8f8';
      body.style.color = '#1a1a1a';
    } else {
      root.style.backgroundColor = '#000000';
      body.style.backgroundColor = '#000000';
      body.style.color = '#8cab87';
    }

    localStorage.setItem('theme', newTheme);

    console.log('Theme applied:', newTheme);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setThemeState(newTheme);
    applyTheme(newTheme);
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    applyTheme(newTheme);
  };

  // Prevent flash of wrong theme
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
