import { useState, useCallback } from 'react';
import type { Thread } from '../types';
import {
  getThreads,
  getThread,
  saveThread,
  createThread as lsCreate,
  replyToThread as lsReply,
} from '../utils/localStorage';

export function useThreads() {
  const [threads, setThreads] = useState<Thread[]>(getThreads);

  const refresh = useCallback(() => {
    setThreads(getThreads());
  }, []);

  const createInquiry = useCallback(
    (boothId: string, text: string, isLoggedIn: boolean): Thread => {
      const t = lsCreate(boothId, text, isLoggedIn);
      setThreads(getThreads());
      return t;
    },
    [],
  );

  const reply = useCallback((threadId: string, text: string, from: 'visitor' | 'booth') => {
    const updated = lsReply(threadId, text, from);
    if (updated) setThreads(getThreads());
    return updated;
  }, []);

  const updateStatus = useCallback(
    (threadId: string, status: Thread['status']) => {
      const t = getThread(threadId);
      if (!t) return;
      saveThread({ ...t, status });
      setThreads(getThreads());
    },
    [],
  );

  const updateMemo = useCallback((threadId: string, memo: string) => {
    const t = getThread(threadId);
    if (!t) return;
    saveThread({ ...t, memo });
    setThreads(getThreads());
  }, []);

  const addTag = useCallback((threadId: string, tag: string) => {
    const t = getThread(threadId);
    if (!t) return;
    if (!t.tags.includes(tag)) {
      saveThread({ ...t, tags: [...t.tags, tag] });
      setThreads(getThreads());
    }
  }, []);

  const removeTag = useCallback((threadId: string, tag: string) => {
    const t = getThread(threadId);
    if (!t) return;
    saveThread({ ...t, tags: t.tags.filter((tg) => tg !== tag) });
    setThreads(getThreads());
  }, []);

  return { threads, refresh, createInquiry, reply, updateStatus, updateMemo, addTag, removeTag };
}
