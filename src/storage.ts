import {
  PersistedData,
  Settings,
  StatsMap,
  defaultSettings,
} from './types';

const STORAGE_KEY = 'gangetester.v1';
const CURRENT_VERSION = 1;

export function loadPersisted(): PersistedData {
  if (typeof localStorage === 'undefined') {
    return { version: CURRENT_VERSION, stats: {}, settings: defaultSettings() };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { version: CURRENT_VERSION, stats: {}, settings: defaultSettings() };
    }
    const parsed = JSON.parse(raw) as Partial<PersistedData>;
    return {
      version: CURRENT_VERSION,
      stats: (parsed.stats ?? {}) as StatsMap,
      settings: { ...defaultSettings(), ...(parsed.settings ?? {}) },
    };
  } catch {
    return { version: CURRENT_VERSION, stats: {}, settings: defaultSettings() };
  }
}

export function savePersisted(data: PersistedData): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage might be full or disabled — ignore.
  }
}

export function saveStats(stats: StatsMap, settings: Settings): void {
  savePersisted({ version: CURRENT_VERSION, stats, settings });
}

export function resetAll(): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}
