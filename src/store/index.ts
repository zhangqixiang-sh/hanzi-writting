import { useCallback, useSyncExternalStore } from 'react';

// --- Types ---
export interface CharacterProgress {
  character: string;
  bestStars: number; // 0-3
  totalPractices: number;
  totalMistakes: number;
  lastPracticed?: number;
}

export interface AppState {
  characters: string[];          // 家长设置的练字列表
  progress: Record<string, CharacterProgress>;
  totalStars: number;
  streakDays: number;
  lastActiveDate?: string;
}

// --- Storage Keys ---
const STORAGE_KEY = 'ziqu-app-state';

// --- Default State ---
const DEFAULT_STATE: AppState = {
  characters: ['大', '小', '上', '下', '人', '口', '手', '日', '月', '水'],
  progress: {},
  totalStars: 0,
  streakDays: 0,
};

// --- Simple Store ---
let state: AppState = loadState();
let listeners = new Set<() => void>();

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_STATE, ...parsed };
    }
  } catch { /* ignore */ }
  return { ...DEFAULT_STATE };
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch { /* ignore */ }
}

function emitChange() {
  saveState();
  listeners.forEach((l) => l());
}

function getSnapshot(): AppState {
  return state;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// --- Actions ---
export function setCharacters(chars: string[]) {
  // filter to only valid single Chinese characters
  const filtered = chars.filter((c) => /^[\u4e00-\u9fff]$/.test(c));
  state = { ...state, characters: filtered };
  emitChange();
}

export function recordPractice(character: string, stars: number, mistakes: number) {
  const prev = state.progress[character] || {
    character,
    bestStars: 0,
    totalPractices: 0,
    totalMistakes: 0,
  };
  
  const newProgress: CharacterProgress = {
    ...prev,
    character,
    bestStars: Math.max(prev.bestStars, stars),
    totalPractices: prev.totalPractices + 1,
    totalMistakes: prev.totalMistakes + mistakes,
    lastPracticed: Date.now(),
  };

  const starsEarned = stars;
  const today = new Date().toISOString().slice(0, 10);
  const streakDays =
    state.lastActiveDate === today
      ? state.streakDays
      : state.streakDays + 1;

  state = {
    ...state,
    progress: { ...state.progress, [character]: newProgress },
    totalStars: state.totalStars + starsEarned,
    streakDays,
    lastActiveDate: today,
  };
  emitChange();
}

// --- Hook ---
export function useStore(): AppState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function useStoreSelector<T>(selector: (s: AppState) => T): T {
  const selectFn = useCallback(() => selector(getSnapshot()), [selector]);
  return useSyncExternalStore(subscribe, selectFn, selectFn);
}
