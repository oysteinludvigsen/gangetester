import { SessionStats, Settings, StatsMap } from '../types';
import { Heatmap } from './Heatmap';
import { formatMs, median } from '../utils/format';

interface DashboardProps {
  stats: StatsMap;
  session: SessionStats;
  settings: Settings;
  onReset: () => void;
  onClose: () => void;
}

export function Dashboard({
  stats,
  session,
  settings,
  onReset,
  onClose,
}: DashboardProps) {
  const accuracy =
    session.answered > 0
      ? Math.round((session.correct / session.answered) * 100)
      : 0;
  const medianMs = median(session.responseTimesMs);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold">Statistikk</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Beste svartid per stykke
          </p>
        </div>
        <button
          onClick={onClose}
          className="rounded-xl bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white font-semibold px-4 py-2 text-sm shadow-sm"
        >
          Øv videre
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Besvart i økt" value={String(session.answered)} />
        <StatCard label="Riktig-andel" value={`${accuracy}%`} />
        <StatCard label="Median svartid" value={formatMs(medianMs)} />
        <StatCard
          label="Streak"
          value={`${session.currentStreak} / ${session.bestStreak}`}
          hint="nåværende / beste"
        />
      </div>

      <div className="rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-4 sm:p-6">
        <Heatmap
          stats={stats}
          minA={settings.minA}
          maxA={settings.maxA}
          minB={settings.minB}
          maxB={settings.maxB}
        />
        <Legend />
      </div>

      <div className="flex justify-end">
        <button
          onClick={onReset}
          className="text-sm text-rose-600 dark:text-rose-400 hover:underline"
        >
          Nullstill alle data
        </button>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-4">
      <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </div>
      <div className="text-2xl font-bold tabular-nums mt-1">{value}</div>
      {hint && (
        <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
          {hint}
        </div>
      )}
    </div>
  );
}

function Legend() {
  const items: Array<{ label: string; cls: string }> = [
    { label: '< 1,5 s', cls: 'bg-emerald-500/90' },
    { label: '~ 2,5 s', cls: 'bg-emerald-400/85' },
    { label: '~ 3,5 s', cls: 'bg-lime-300/90' },
    { label: '~ 4,5 s', cls: 'bg-yellow-300/90' },
    { label: '~ 6 s', cls: 'bg-orange-400/90' },
    { label: '> 6 s', cls: 'bg-rose-500/90' },
    {
      label: 'ikke prøvd',
      cls: 'bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700',
    },
  ];
  return (
    <div className="flex flex-wrap gap-3 mt-4 text-xs text-slate-500 dark:text-slate-400">
      {items.map((it) => (
        <span key={it.label} className="inline-flex items-center gap-1.5">
          <span className={`w-3 h-3 rounded-sm ${it.cls}`} />
          {it.label}
        </span>
      ))}
    </div>
  );
}
