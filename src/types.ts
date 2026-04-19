export interface Problem {
  a: number;
  b: number;
}

export interface ProblemStats {
  attempts: number;
  correct: number;
  /** Rolling window of last N correct response times (ms). */
  recentTimesMs: number[];
  /** Rolling window of last N correctness (1 = correct, 0 = wrong). */
  recentCorrect: number[];
  bestTimeMs: number | null;
  lastSeenAt: number | null;
}

export type StatsMap = Record<string, ProblemStats>;

export interface Settings {
  minA: number;
  maxA: number;
  minB: number;
  maxB: number;
  darkMode: boolean;
}

export interface SessionStats {
  answered: number;
  correct: number;
  responseTimesMs: number[];
  currentStreak: number;
  bestStreak: number;
}

export interface PersistedData {
  version: number;
  stats: StatsMap;
  settings: Settings;
}

export function problemKey(a: number, b: number): string {
  return `${a}x${b}`;
}

export function emptyProblemStats(): ProblemStats {
  return {
    attempts: 0,
    correct: 0,
    recentTimesMs: [],
    recentCorrect: [],
    bestTimeMs: null,
    lastSeenAt: null,
  };
}

export function defaultSettings(): Settings {
  return {
    minA: 1,
    maxA: 10,
    minB: 1,
    maxB: 10,
    darkMode: true,
  };
}

export function emptySessionStats(): SessionStats {
  return {
    answered: 0,
    correct: 0,
    responseTimesMs: [],
    currentStreak: 0,
    bestStreak: 0,
  };
}
