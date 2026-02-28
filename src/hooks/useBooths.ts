import { useState, useCallback } from 'react';
import type { Booth } from '../types';
import { getBooths, getBooth, saveBooth } from '../utils/localStorage';

export function useBooths() {
  const [booths, setBooths] = useState<Booth[]>(getBooths);

  const refresh = useCallback(() => {
    setBooths(getBooths());
  }, []);

  const addBooth = useCallback((booth: Booth) => {
    saveBooth(booth);
    setBooths(getBooths());
  }, []);

  const updateBooth = useCallback((booth: Booth) => {
    saveBooth(booth);
    setBooths(getBooths());
  }, []);

  return { booths, refresh, addBooth, updateBooth };
}

export function useBooth(id: string) {
  const [booth, setBooth] = useState<Booth | undefined>(() => getBooth(id));

  const refresh = useCallback(() => {
    setBooth(getBooth(id));
  }, [id]);

  return { booth, refresh };
}
