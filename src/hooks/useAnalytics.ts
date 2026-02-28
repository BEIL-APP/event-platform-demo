import { useState, useCallback } from 'react';
import type { Analytics } from '../types';
import { getAnalytics, getBoothAnalytics } from '../utils/localStorage';

export function useAnalytics() {
  const [analytics, setAnalytics] = useState<Analytics[]>(getAnalytics);

  const refresh = useCallback(() => {
    setAnalytics(getAnalytics());
  }, []);

  return { analytics, refresh };
}

export function useBoothAnalytics(boothId: string) {
  const [data, setData] = useState<Analytics>(() => getBoothAnalytics(boothId));

  const refresh = useCallback(() => {
    setData(getBoothAnalytics(boothId));
  }, [boothId]);

  return { data, refresh };
}
