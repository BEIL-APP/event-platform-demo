import { useState, useCallback } from 'react';
import type { Visit } from '../types';
import { getVisits, addVisit as lsAddVisit } from '../utils/localStorage';

export function useVisits() {
  const [visits, setVisits] = useState<Visit[]>(getVisits);

  const recordVisit = useCallback((boothId: string) => {
    lsAddVisit(boothId);
    setVisits(getVisits());
  }, []);

  const refresh = useCallback(() => {
    setVisits(getVisits());
  }, []);

  return { visits, recordVisit, refresh };
}
