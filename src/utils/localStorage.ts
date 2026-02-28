import type { Booth, Visit, Favorite, Thread, Analytics } from '../types';
import { SEED_BOOTHS, SEED_ANALYTICS, SEED_THREADS } from '../data/seed';

const PREFIX = 'bep_';
const KEYS = {
  booths: `${PREFIX}booths`,
  visits: `${PREFIX}visits`,
  favorites: `${PREFIX}favorites`,
  threads: `${PREFIX}threads`,
  analytics: `${PREFIX}analytics`,
  isLoggedIn: `${PREFIX}isLoggedIn`,
  isAdmin: `${PREFIX}isAdmin`,
  seeded: `${PREFIX}seeded`,
};

// ─── Generic ─────────────────────────────────────────────────────────────────

function get<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function set<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

// ─── Seed ─────────────────────────────────────────────────────────────────────

export function initSeedData(): void {
  if (localStorage.getItem(KEYS.seeded)) return;
  set(KEYS.booths, SEED_BOOTHS);
  set(KEYS.analytics, SEED_ANALYTICS);
  set(KEYS.threads, SEED_THREADS);
  set(KEYS.visits, []);
  set(KEYS.favorites, []);
  localStorage.setItem(KEYS.seeded, '1');
}

// ─── Booths ───────────────────────────────────────────────────────────────────

export function getBooths(): Booth[] {
  return get<Booth[]>(KEYS.booths) ?? [];
}

export function getBooth(id: string): Booth | undefined {
  return getBooths().find((b) => b.id === id);
}

export function saveBooth(booth: Booth): void {
  const booths = getBooths();
  const idx = booths.findIndex((b) => b.id === booth.id);
  if (idx >= 0) {
    booths[idx] = booth;
  } else {
    booths.push(booth);
    // initialize analytics
    const analytics = getAnalytics();
    analytics.push({ boothId: booth.id, scans: 0, favorites: 0, inquiries: 0 });
    set(KEYS.analytics, analytics);
  }
  set(KEYS.booths, booths);
}

export function deleteBooth(id: string): void {
  set(KEYS.booths, getBooths().filter((b) => b.id !== id));
}

// ─── Visits ───────────────────────────────────────────────────────────────────

export function getVisits(): Visit[] {
  return get<Visit[]>(KEYS.visits) ?? [];
}

export function addVisit(boothId: string): void {
  const visits = getVisits();
  visits.unshift({ boothId, visitedAt: new Date().toISOString() });
  // keep last 100
  set(KEYS.visits, visits.slice(0, 100));
  incrementScan(boothId);
}

// ─── Favorites ────────────────────────────────────────────────────────────────

export function getFavorites(): Favorite[] {
  return get<Favorite[]>(KEYS.favorites) ?? [];
}

export function isFavorite(boothId: string): boolean {
  return getFavorites().some((f) => f.boothId === boothId);
}

export function toggleFavorite(boothId: string): boolean {
  const favorites = getFavorites();
  const idx = favorites.findIndex((f) => f.boothId === boothId);
  if (idx >= 0) {
    favorites.splice(idx, 1);
    set(KEYS.favorites, favorites);
    syncFavoriteAnalytics(boothId, false);
    return false;
  } else {
    favorites.unshift({ boothId, createdAt: new Date().toISOString() });
    set(KEYS.favorites, favorites);
    syncFavoriteAnalytics(boothId, true);
    return true;
  }
}

// ─── Threads ─────────────────────────────────────────────────────────────────

export function getThreads(): Thread[] {
  return get<Thread[]>(KEYS.threads) ?? [];
}

export function getThread(id: string): Thread | undefined {
  return getThreads().find((t) => t.id === id);
}

export function saveThread(thread: Thread): void {
  const threads = getThreads();
  const idx = threads.findIndex((t) => t.id === thread.id);
  if (idx >= 0) {
    threads[idx] = thread;
  } else {
    threads.unshift(thread);
    incrementInquiry(thread.boothId);
  }
  set(KEYS.threads, threads);
}

export function createThread(boothId: string, text: string, isLoggedIn: boolean): Thread {
  const thread: Thread = {
    id: `thread-${Date.now()}`,
    boothId,
    visitorId: isLoggedIn ? 'user' : 'guest',
    visitorName: isLoggedIn ? '나' : undefined,
    messages: [
      {
        from: 'visitor',
        text,
        at: new Date().toISOString(),
      },
    ],
    status: '미처리',
    tags: [],
    memo: '',
    lastUpdated: new Date().toISOString(),
  };
  saveThread(thread);
  return thread;
}

export function replyToThread(threadId: string, text: string, from: 'visitor' | 'booth'): Thread | null {
  const threads = getThreads();
  const idx = threads.findIndex((t) => t.id === threadId);
  if (idx < 0) return null;
  threads[idx].messages.push({ from, text, at: new Date().toISOString() });
  threads[idx].lastUpdated = new Date().toISOString();
  set(KEYS.threads, threads);
  return threads[idx];
}

// ─── Analytics ───────────────────────────────────────────────────────────────

export function getAnalytics(): Analytics[] {
  return get<Analytics[]>(KEYS.analytics) ?? [];
}

export function getBoothAnalytics(boothId: string): Analytics {
  return (
    getAnalytics().find((a) => a.boothId === boothId) ?? {
      boothId,
      scans: 0,
      favorites: 0,
      inquiries: 0,
    }
  );
}

function updateAnalytics(boothId: string, updater: (a: Analytics) => void): void {
  const all = getAnalytics();
  const idx = all.findIndex((a) => a.boothId === boothId);
  if (idx >= 0) {
    updater(all[idx]);
    set(KEYS.analytics, all);
  }
}

function incrementScan(boothId: string) {
  updateAnalytics(boothId, (a) => { a.scans += 1; });
}

function incrementInquiry(boothId: string) {
  updateAnalytics(boothId, (a) => { a.inquiries += 1; });
}

function syncFavoriteAnalytics(boothId: string, added: boolean) {
  updateAnalytics(boothId, (a) => {
    a.favorites = added ? a.favorites + 1 : Math.max(0, a.favorites - 1);
  });
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export function getIsLoggedIn(): boolean {
  return localStorage.getItem(KEYS.isLoggedIn) === '1';
}

export function setIsLoggedIn(value: boolean): void {
  localStorage.setItem(KEYS.isLoggedIn, value ? '1' : '0');
}

export function getIsAdmin(): boolean {
  return localStorage.getItem(KEYS.isAdmin) === '1';
}

export function setIsAdmin(value: boolean): void {
  localStorage.setItem(KEYS.isAdmin, value ? '1' : '0');
}
