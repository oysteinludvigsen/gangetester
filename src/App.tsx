import { useEffect, useMemo, useState } from 'react';
import { Practice } from './components/Practice';
import { Dashboard } from './components/Dashboard';
import { SettingsPanel } from './components/SettingsPanel';
import { loadPersisted, saveStats, resetAll } from './storage';
import {
  SessionStats,
  Settings,
  StatsMap,
  emptySessionStats,
} from './types';

type View = 'practice' | 'dashboard' | 'settings';

export default function App() {
  const initial = useMemo(() => loadPersisted(), []);
  const [stats, setStats] = useState<StatsMap>(initial.stats);
  const [settings, setSettings] = useState<Settings>(initial.settings);
  const [session, setSession] = useState<SessionStats>(() => emptySessionStats());
  const [view, setView] = useState<View>('practice');

  // Persist whenever stats or settings change.
  useEffect(() => {
    saveStats(stats, settings);
  }, [stats, settings]);

  // Apply dark-mode class at the document level so the whole viewport adapts.
  useEffect(() => {
    const root = document.documentElement;
    if (settings.darkMode) root.classList.add('dark');
    else root.classList.remove('dark');
  }, [settings.darkMode]);

  function handleReset() {
    if (!window.confirm('Nullstille alle data? Dette kan ikke angres.')) return;
    resetAll();
    setStats({});
    setSession(emptySessionStats());
  }

  return (
    <div className="min-h-full flex flex-col">
      <Header
        view={view}
        onNavigate={setView}
        darkMode={settings.darkMode}
        onToggleDark={() =>
          setSettings({ ...settings, darkMode: !settings.darkMode })
        }
      />

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 sm:px-6 pt-4 pb-8 safe-bottom">
        {view === 'practice' && (
          <Practice
            settings={settings}
            stats={stats}
            onStatsChange={setStats}
            session={session}
            onSessionChange={setSession}
          />
        )}
        {view === 'dashboard' && (
          <Dashboard
            stats={stats}
            session={session}
            settings={settings}
            onReset={handleReset}
            onClose={() => setView('practice')}
          />
        )}
        {view === 'settings' && (
          <SettingsPanel
            settings={settings}
            onChange={setSettings}
            onClose={() => setView('practice')}
          />
        )}
      </main>
    </div>
  );
}

interface HeaderProps {
  view: View;
  onNavigate: (v: View) => void;
  darkMode: boolean;
  onToggleDark: () => void;
}

function Header({ view, onNavigate, darkMode, onToggleDark }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 backdrop-blur bg-slate-50/80 dark:bg-slate-950/80 border-b border-slate-200/60 dark:border-slate-800/60">
      <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-2">
        <button
          onClick={() => onNavigate('practice')}
          className="flex items-center gap-2 font-bold text-lg tracking-tight"
          aria-label="Gå til øving"
        >
          <span className="inline-flex w-7 h-7 rounded-lg bg-brand-500 text-white items-center justify-center text-sm font-extrabold">
            ×
          </span>
          Gangetester
        </button>
        <nav className="flex items-center gap-1">
          <NavButton
            active={view === 'dashboard'}
            onClick={() => onNavigate(view === 'dashboard' ? 'practice' : 'dashboard')}
            label="Statistikk"
          />
          <NavButton
            active={view === 'settings'}
            onClick={() => onNavigate(view === 'settings' ? 'practice' : 'settings')}
            label="Innstillinger"
          />
          <button
            onClick={onToggleDark}
            className="ml-1 w-9 h-9 rounded-xl inline-flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800"
            aria-label="Veksle mørk modus"
          >
            {darkMode ? <SunIcon /> : <MoonIcon />}
          </button>
        </nav>
      </div>
    </header>
  );
}

function NavButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
        active
          ? 'bg-brand-500 text-white'
          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800'
      }`}
    >
      {label}
    </button>
  );
}

function SunIcon() {
  return (
    <svg
      className="w-5 h-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      className="w-5 h-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}
