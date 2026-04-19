import { StatsMap, problemKey } from '../types';
import { formatMs } from '../utils/format';

interface HeatmapProps {
  stats: StatsMap;
  minA: number;
  maxA: number;
  minB: number;
  maxB: number;
}

/**
 * Colour scale: mastered (fast) = bright green, slow = amber, unseen = neutral.
 * Scale edges: <=1.5s = best, >=6s = worst. We lerp between them on a log scale.
 */
function colorForTime(ms: number | null | undefined): string {
  if (ms === null || ms === undefined || ms <= 0) {
    return 'bg-slate-100 text-slate-400 dark:bg-slate-800/60 dark:text-slate-500';
  }
  if (ms <= 1500) return 'bg-emerald-500/90 text-white';
  if (ms <= 2500) return 'bg-emerald-400/85 text-emerald-950';
  if (ms <= 3500) return 'bg-lime-300/90 text-lime-950';
  if (ms <= 4500) return 'bg-yellow-300/90 text-yellow-950';
  if (ms <= 6000) return 'bg-orange-400/90 text-white';
  return 'bg-rose-500/90 text-white';
}

export function Heatmap({ stats, minA, maxA, minB, maxB }: HeatmapProps) {
  const aValues: number[] = [];
  for (let a = minA; a <= maxA; a++) aValues.push(a);
  const bValues: number[] = [];
  for (let b = minB; b <= maxB; b++) bValues.push(b);

  return (
    <div className="overflow-x-auto -mx-2 px-2">
      <table className="border-separate border-spacing-1 mx-auto">
        <thead>
          <tr>
            <th className="text-xs text-slate-500 dark:text-slate-400 font-medium w-8">
              ×
            </th>
            {bValues.map((b) => (
              <th
                key={b}
                className="text-xs font-semibold text-slate-500 dark:text-slate-400 w-10 sm:w-12"
              >
                {b}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {aValues.map((a) => (
            <tr key={a}>
              <th className="text-xs font-semibold text-slate-500 dark:text-slate-400 pr-1 text-right">
                {a}
              </th>
              {bValues.map((b) => {
                const s = stats[problemKey(a, b)];
                const best = s?.bestTimeMs ?? null;
                const attempts = s?.attempts ?? 0;
                return (
                  <td key={b}>
                    <div
                      title={`${a} × ${b} = ${a * b}\nBeste: ${formatMs(best)}\nForsøk: ${attempts}`}
                      className={`aspect-square w-10 sm:w-12 rounded-lg flex items-center justify-center text-[11px] sm:text-xs font-medium ${colorForTime(best)}`}
                    >
                      {best !== null ? formatMs(best) : '–'}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
