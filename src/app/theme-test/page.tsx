'use client';

import { useEffect, useState } from 'react';
import { ThemeToggle } from '@/components/ThemeToggle';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function ThemeTestPage() {
  const [mounted, setMounted] = useState(false);
  const [theme, setThemeState] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    setMounted(true);
    // Detect current theme
    const currentTheme = document.documentElement.getAttribute('data-theme') as 'light' | 'dark' || 'dark';
    setThemeState(currentTheme);
    console.log('Current theme:', currentTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setThemeState(newTheme);
    applyTheme(newTheme);
  };

  const setTheme = (newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
    applyTheme(newTheme);
  };

  const applyTheme = (newTheme: 'light' | 'dark') => {
    const root = document.documentElement;
    const body = document.body;
    root.setAttribute('data-theme', newTheme);
    body.setAttribute('data-theme', newTheme);
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

  if (!mounted) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen w-full">
      <div className="p-8 space-y-8">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-blue-500 hover:underline">
            <ArrowLeft size={16} />
            Back
          </Link>
          <ThemeToggle />
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-bold">Theme Test Page</h1>

          <div className="space-y-2">
            <p className="text-lg">Current Theme: <strong>{theme.toUpperCase()}</strong></p>
            <p className="text-sm opacity-75">
              HTML data-theme: {typeof document !== 'undefined' ? document.documentElement.getAttribute('data-theme') : 'N/A'}
            </p>
            <p className="text-sm opacity-75">
              Body background-color: {typeof document !== 'undefined' ? window.getComputedStyle(document.body).backgroundColor : 'N/A'}
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Manual Theme Switcher</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setTheme('dark')}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  theme === 'dark'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                }`}
              >
                Dark Mode
              </button>
              <button
                onClick={() => setTheme('light')}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  theme === 'light'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                }`}
              >
                Light Mode
              </button>
              <button
                onClick={toggleTheme}
                className="px-6 py-2 rounded-lg font-medium bg-blue-500 text-white hover:bg-blue-600 transition-colors"
              >
                Toggle
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="p-4 bg-red-100 text-red-900 rounded-lg">
              <p className="font-mono text-sm">--bg-primary</p>
              <p className="text-xs opacity-75">Should be black in dark, white in light</p>
            </div>
            <div className="p-4 bg-blue-100 text-blue-900 rounded-lg">
              <p className="font-mono text-sm">--text-primary</p>
              <p className="text-xs opacity-75">Should be light in dark, dark in light</p>
            </div>
            <div className="p-4 bg-green-100 text-green-900 rounded-lg">
              <p className="font-mono text-sm">--accent-primary</p>
              <p className="text-xs opacity-75">Lime in dark, bright green in light</p>
            </div>
            <div className="p-4 bg-purple-100 text-purple-900 rounded-lg">
              <p className="font-mono text-sm">--border-primary</p>
              <p className="text-xs opacity-75">Gray in both modes</p>
            </div>
          </div>

          <div className="mt-8 p-4 bg-yellow-100 text-yellow-900 rounded-lg">
            <h3 className="font-bold mb-2">Debug Info</h3>
            <pre className="text-xs overflow-auto">
{`Theme: ${theme}
HTML data-theme: ${document.documentElement.getAttribute('data-theme')}
Body background: ${window.getComputedStyle(document.body).backgroundColor}
Body color: ${window.getComputedStyle(document.body).color}
HTML background: ${window.getComputedStyle(document.documentElement).backgroundColor}`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
