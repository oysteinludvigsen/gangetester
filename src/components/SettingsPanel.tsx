import { Settings } from '../types';

interface SettingsPanelProps {
  settings: Settings;
  onChange: (s: Settings) => void;
  onClose: () => void;
}

export function SettingsPanel({
  settings,
  onChange,
  onClose,
}: SettingsPanelProps) {
  function update<K extends keyof Settings>(key: K, value: Settings[K]) {
    onChange({ ...settings, [key]: value });
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl sm:text-3xl font-bold">Innstillinger</h2>
        <button
          onClick={onClose}
          className="rounded-xl bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white font-semibold px-4 py-2 text-sm shadow-sm"
        >
          Ferdig
        </button>
      </div>

      <div className="rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-5 space-y-4">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Velg hvilke tabeller som skal øves.
        </p>
        <RangeRow
          label="Første faktor (a)"
          min={settings.minA}
          max={settings.maxA}
          onMin={(v) => update('minA', clamp(v, 0, settings.maxA))}
          onMax={(v) => update('maxA', clamp(v, settings.minA, 20))}
        />
        <RangeRow
          label="Andre faktor (b)"
          min={settings.minB}
          max={settings.maxB}
          onMin={(v) => update('minB', clamp(v, 0, settings.maxB))}
          onMax={(v) => update('maxB', clamp(v, settings.minB, 20))}
        />

        <label className="flex items-center justify-between gap-4 pt-2">
          <span className="text-sm font-medium">Mørk modus</span>
          <input
            type="checkbox"
            checked={settings.darkMode}
            onChange={(e) => update('darkMode', e.target.checked)}
            className="h-5 w-10 appearance-none rounded-full bg-slate-300 dark:bg-slate-700 relative transition-colors checked:bg-brand-500 before:content-[''] before:absolute before:top-0.5 before:left-0.5 before:h-4 before:w-4 before:rounded-full before:bg-white before:shadow before:transition-transform checked:before:translate-x-5"
          />
        </label>
      </div>
    </div>
  );
}

function clamp(n: number, lo: number, hi: number): number {
  if (Number.isNaN(n)) return lo;
  return Math.max(lo, Math.min(hi, n));
}

interface RangeRowProps {
  label: string;
  min: number;
  max: number;
  onMin: (v: number) => void;
  onMax: (v: number) => void;
}

function RangeRow({ label, min, max, onMin, onMax }: RangeRowProps) {
  return (
    <div>
      <div className="text-sm font-medium mb-2">{label}</div>
      <div className="flex items-center gap-3">
        <NumberField value={min} onChange={onMin} ariaLabel={`${label} – fra`} />
        <span className="text-slate-400">–</span>
        <NumberField value={max} onChange={onMax} ariaLabel={`${label} – til`} />
      </div>
    </div>
  );
}

function NumberField({
  value,
  onChange,
  ariaLabel,
}: {
  value: number;
  onChange: (v: number) => void;
  ariaLabel: string;
}) {
  return (
    <input
      type="number"
      min={0}
      max={20}
      aria-label={ariaLabel}
      value={value}
      onChange={(e) => onChange(parseInt(e.target.value, 10))}
      className="w-20 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-center text-lg font-semibold tabular-nums focus:outline-none focus:ring-2 focus:ring-brand-500"
    />
  );
}
