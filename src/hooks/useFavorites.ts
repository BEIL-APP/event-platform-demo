import { useState, useCallback } from 'react';
import type { Favorite } from '../types';
import { getFavorites, isFavorite, toggleFavorite as lsToggle } from '../utils/localStorage';

export function useFavorites() {
  const [favorites, setFavorites] = useState<Favorite[]>(getFavorites);

  const toggleFav = useCallback((boothId: string): boolean => {
    const result = lsToggle(boothId);
    setFavorites(getFavorites());
    return result;
  }, []);

  const checkFav = useCallback((boothId: string) => {
    return isFavorite(boothId);
  }, []);

  const refresh = useCallback(() => {
    setFavorites(getFavorites());
  }, []);

  return { favorites, toggleFav, checkFav, refresh };
}
