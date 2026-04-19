import {
  Problem,
  ProblemStats,
  Settings,
  StatsMap,
  emptyProblemStats,
  problemKey,
} from './types';

export const RECENT_WINDOW = 5;

/** Build every (a, b) pair within the configured range, inclusive. */
export function enumerateProblems(settings: Settings): Problem[] {
  const problems: Problem[] = [];
  for (let a = settings.minA; a <= settings.maxA; a++) {
    for (let b = settings.minB; b <= settings.maxB; b++) {
      problems.push({ a, b });
    }
  }
  return problems;
}

function statsFor(stats: StatsMap, p: Problem): ProblemStats {
  return stats[problemKey(p.a, p.b)] ?? emptyProblemStats();
}

function average(xs: number[]): number {
  if (xs.length === 0) return 0;
  let sum = 0;
  for (const x of xs) sum += x;
  return sum / xs.length;
}

/**
 * Compute a selection weight for a problem. Higher = more likely to be picked.
 *
 * The weight blends four signals, each normalized into [0, 1]-ish:
 *   1. Recent error rate (last up-to-5 answers) — weakest answers surface faster.
 *   2. Best-ever time — slower best times mean it's not yet mastered.
 *   3. Time since last seen — stale problems resurface.
 *   4. Avg response time over recent window — currently-slow problems resurface.
 *
 * Unseen problems get a strong prior weight so every problem gets introduced.
 */
export function problemWeight(
  p: Problem,
  stats: StatsMap,
  now: number,
  globalMedianMs: number,
): number {
  const s = statsFor(stats, p);

  // Unseen: strong prior so the whole table gets introduced quickly.
  if (s.attempts === 0) return 5;

  // 1. Recent error rate — Laplace-smoothed so a single wrong answer lifts it meaningfully.
  const recent = s.recentCorrect.slice(-RECENT_WINDOW);
  const recentWrong = recent.length - recent.reduce((acc, c) => acc + c, 0);
  const errorRate = (recentWrong + 0.5) / (recent.length + 1);

  // 2. Best time — slower best time relative to a reasonable target (3s) weights higher.
  const targetBestMs = 3000;
  const best = s.bestTimeMs ?? targetBestMs * 2;
  const bestScore = Math.min(2, Math.max(0, best / targetBestMs - 1 + 0.2));

  // 3. Staleness — scaled so a problem not seen in 5 minutes gets a noticeable lift.
  const lastSeen = s.lastSeenAt ?? now;
  const minutesSince = Math.max(0, (now - lastSeen) / 60000);
  const staleScore = Math.min(1.5, minutesSince / 5);

  // 4. Recent avg response time — slower than global median adds weight.
  const avgRecent = average(s.recentTimesMs.slice(-RECENT_WINDOW));
  const median = globalMedianMs > 0 ? globalMedianMs : 4000;
  const recentTimeScore = avgRecent > 0
    ? Math.min(2, Math.max(0, avgRecent / median - 0.8))
    : 0.3;

  const weight =
    errorRate * 4 +
    bestScore * 1.2 +
    staleScore * 0.8 +
    recentTimeScore * 1.2 +
    0.2; // floor so everything stays reachable

  return weight;
}

export function globalMedianTimeMs(stats: StatsMap): number {
  const times: number[] = [];
  for (const key of Object.keys(stats)) {
    for (const t of stats[key].recentTimesMs) times.push(t);
  }
  if (times.length === 0) return 0;
  times.sort((x, y) => x - y);
  return times[Math.floor(times.length / 2)];
}

/**
 * Weighted random selection, excluding the immediately previous problem so we
 * never repeat it back-to-back (unless the range has only one problem).
 */
export function pickNextProblem(
  settings: Settings,
  stats: StatsMap,
  previous: Problem | null,
  now: number = Date.now(),
  rand: () => number = Math.random,
): Problem {
  const problems = enumerateProblems(settings);
  if (problems.length === 0) {
    return { a: settings.minA, b: settings.minB };
  }
  if (problems.length === 1) return problems[0];

  const median = globalMedianTimeMs(stats);
  const eligible = previous
    ? problems.filter((p) => !(p.a === previous.a && p.b === previous.b))
    : problems;

  const weights = eligible.map((p) => problemWeight(p, stats, now, median));
  const total = weights.reduce((a, w) => a + w, 0);
  if (total <= 0) {
    return eligible[Math.floor(rand() * eligible.length)];
  }

  let r = rand() * total;
  for (let i = 0; i < eligible.length; i++) {
    r -= weights[i];
    if (r <= 0) return eligible[i];
  }
  return eligible[eligible.length - 1];
}

export function recordAnswer(
  stats: StatsMap,
  p: Problem,
  correct: boolean,
  elapsedMs: number,
  now: number = Date.now(),
): StatsMap {
  const key = problemKey(p.a, p.b);
  const current = stats[key] ?? emptyProblemStats();

  const recentTimesMs = correct
    ? [...current.recentTimesMs, elapsedMs].slice(-RECENT_WINDOW)
    : current.recentTimesMs;

  const recentCorrect = [...current.recentCorrect, correct ? 1 : 0].slice(
    -RECENT_WINDOW,
  );

  const bestTimeMs = correct
    ? current.bestTimeMs === null
      ? elapsedMs
      : Math.min(current.bestTimeMs, elapsedMs)
    : current.bestTimeMs;

  const next: ProblemStats = {
    attempts: current.attempts + 1,
    correct: current.correct + (correct ? 1 : 0),
    recentTimesMs,
    recentCorrect,
    bestTimeMs,
    lastSeenAt: now,
  };

  return { ...stats, [key]: next };
}
