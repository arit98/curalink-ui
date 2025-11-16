import { useState, useEffect } from 'react';

export type FavoriteType = 'trial' | 'expert' | 'publication' | 'forum';

interface FavoriteItem {
  id: string | number;
  type: FavoriteType;
  data: any;
}

const STORAGE_KEY = 'medresearch_favorites';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setFavorites(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse favorites', e);
      }
    }
  }, []);

  const saveFavorites = (newFavorites: FavoriteItem[]) => {
    setFavorites(newFavorites);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newFavorites));
  };

  const toggleFavorite = (id: string | number, type: FavoriteType, data: any) => {
    const exists = favorites.some(f => f.id === id && f.type === type);
    
    if (exists) {
      saveFavorites(favorites.filter(f => !(f.id === id && f.type === type)));
    } else {
      saveFavorites([...favorites, { id, type, data }]);
    }
  };

  const isFavorite = (id: string | number, type: FavoriteType) => {
    return favorites.some(f => f.id === id && f.type === type);
  };

  const getFavoritesByType = (type: FavoriteType) => {
    return favorites.filter(f => f.type === type).map(f => f.data);
  };

  return {
    favorites,
    toggleFavorite,
    isFavorite,
    getFavoritesByType,
  };
};
