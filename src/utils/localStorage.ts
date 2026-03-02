import type { Booth, Visit, Favorite, Thread, Analytics, Lead, BoothPolicy, Attachment, SurveyResponse } from '../types';
import { SEED_BOOTHS, SEED_ANALYTICS, SEED_THREADS, SEED_LEADS, SEED_POLICIES, SEED_ATTACHMENTS, SEED_SURVEYS } from '../data/seed';

const PREFIX = 'bep_';
const KEYS = {
  booths: `${PREFIX}booths`,
  visits: `${PREFIX}visits`,
  favorites: `${PREFIX}favorites`,
  threads: `${PREFIX}threads`,
  analytics: `${PREFIX}analytics`,
  leads: `${PREFIX}leads`,
  policies: `${PREFIX}policies`,
  attachments: `${PREFIX}attachments`,
  surveys: `${PREFIX}surveys`,
  isLoggedIn: `${PREFIX}isLoggedIn`,
  isAdmin: `${PREFIX}isAdmin`,
  userEmail: `${PREFIX}userEmail`,
  seeded: `${PREFIX}seeded`,
  guestId: `${PREFIX}guestId`,
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

// ─── Guest ID (persistent anonymous visitor ID) ───────────────────────────────

export function getGuestId(): string {
  let id = localStorage.getItem(KEYS.guestId);
  if (!id) {
    id = `guest-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    localStorage.setItem(KEYS.guestId, id);
  }
  return id;
}

// ─── Seed ─────────────────────────────────────────────────────────────────────

export function initSeedData(): void {
  if (localStorage.getItem(KEYS.seeded)) return;
  set(KEYS.booths, SEED_BOOTHS);
  set(KEYS.analytics, SEED_ANALYTICS);
  set(KEYS.threads, SEED_THREADS);
  set(KEYS.leads, SEED_LEADS);
  set(KEYS.policies, SEED_POLICIES);
  set(KEYS.attachments, SEED_ATTACHMENTS);
  set(KEYS.surveys, SEED_SURVEYS);
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
  const visitorId = getGuestId();
  const visits = getVisits();
  visits.unshift({ boothId, visitedAt: new Date().toISOString(), visitorId });
  // keep last 100
  set(KEYS.visits, visits.slice(0, 100));
  incrementScan(boothId);
}

export function getUniqueVisitorCount(boothId: string): number {
  const visits = getVisits().filter((v) => v.boothId === boothId);
  const ids = new Set(visits.map((v) => v.visitorId ?? 'unknown'));
  return ids.size;
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

export function createThread(
  boothId: string,
  text: string,
  isLoggedIn: boolean,
  options?: { email?: string; consent?: boolean; visitorName?: string }
): Thread {
  const thread: Thread = {
    id: `thread-${Date.now()}`,
    boothId,
    visitorId: isLoggedIn ? 'user' : 'guest',
    visitorName: isLoggedIn ? (options?.visitorName ?? '나') : undefined,
    visitorEmail: options?.email,
    consentGiven: options?.consent ?? false,
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

  // If consent given, save as lead
  if (options?.consent && (options?.email || isLoggedIn)) {
    const lead: Lead = {
      id: `lead-${Date.now()}`,
      boothId,
      source: 'inquiry',
      email: options?.email,
      memo: `문의 스레드: ${thread.id}`,
      consent: true,
      createdAt: new Date().toISOString(),
    };
    saveLead(lead);
  }

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

// ─── Leads ────────────────────────────────────────────────────────────────────

export function getLeads(): Lead[] {
  return get<Lead[]>(KEYS.leads) ?? [];
}

export function getBoothLeads(boothId: string): Lead[] {
  return getLeads().filter((l) => l.boothId === boothId);
}

export function saveLead(lead: Lead): void {
  const leads = getLeads();
  const idx = leads.findIndex((l) => l.id === lead.id);
  if (idx >= 0) {
    leads[idx] = lead;
  } else {
    leads.unshift(lead);
  }
  set(KEYS.leads, leads);
}

export function deleteLead(id: string): void {
  set(KEYS.leads, getLeads().filter((l) => l.id !== id));
}

// ─── Booth Policies ────────────────────────────────────────────────────────────

export function getPolicies(): BoothPolicy[] {
  return get<BoothPolicy[]>(KEYS.policies) ?? [];
}

export function getBoothPolicy(boothId: string): BoothPolicy | undefined {
  return getPolicies().find((p) => p.boothId === boothId);
}

export function saveBoothPolicy(policy: BoothPolicy): void {
  const policies = getPolicies();
  const idx = policies.findIndex((p) => p.boothId === policy.boothId);
  if (idx >= 0) {
    policies[idx] = policy;
  } else {
    policies.push(policy);
  }
  set(KEYS.policies, policies);
}

// ─── Attachments ──────────────────────────────────────────────────────────────

export function getAttachments(): Attachment[] {
  return get<Attachment[]>(KEYS.attachments) ?? [];
}

export function getBoothAttachments(boothId: string): Attachment[] {
  return getAttachments().filter((a) => a.boothId === boothId);
}

export function saveAttachment(attachment: Attachment): void {
  const attachments = getAttachments();
  attachments.unshift(attachment);
  set(KEYS.attachments, attachments);
}

export function deleteAttachment(id: string): void {
  set(KEYS.attachments, getAttachments().filter((a) => a.id !== id));
}

// ─── Survey Responses ────────────────────────────────────────────────────────

export function getSurveys(): SurveyResponse[] {
  return get<SurveyResponse[]>(KEYS.surveys) ?? [];
}

export function getBoothSurveys(boothId: string): SurveyResponse[] {
  return getSurveys().filter((s) => s.boothId === boothId);
}

export function saveSurvey(survey: SurveyResponse): void {
  const surveys = getSurveys();
  surveys.unshift(survey);
  set(KEYS.surveys, surveys);
}

export function getSurveyAggregate(boothId: string): {
  total: number;
  interests: Record<string, number>;
  purposes: Record<string, number>;
  wantsContact: number;
} {
  const surveys = getBoothSurveys(boothId);
  const interests: Record<string, number> = {};
  const purposes: Record<string, number> = {};
  let wantsContact = 0;

  for (const s of surveys) {
    (s.answers.interests ?? []).forEach((tag) => {
      interests[tag] = (interests[tag] ?? 0) + 1;
    });
    if (s.answers.purpose) {
      purposes[s.answers.purpose] = (purposes[s.answers.purpose] ?? 0) + 1;
    }
    if (s.answers.wantsContact) wantsContact++;
  }

  return { total: surveys.length, interests, purposes, wantsContact };
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

export function getUserEmail(): string {
  return localStorage.getItem(KEYS.userEmail) ?? '';
}

export function setUserEmail(email: string): void {
  localStorage.setItem(KEYS.userEmail, email);
}
