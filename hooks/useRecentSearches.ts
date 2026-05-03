import * as SecureStore from 'expo-secure-store';
import { useCallback, useEffect, useState } from 'react';

export interface RecentSearch {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
}

const RECENT_SEARCHES_KEY = 'parkaddis_recent_searches';
const MAX_RECENT = 5;

/**
 * Shared hook for persistent recent searches.
 * Both the Find screen and Dashboard screen should use this so they
 * always read from and write to the same SecureStore key.
 */
export function useRecentSearches() {
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);

  // Load on mount
  useEffect(() => {
    (async () => {
      try {
        const stored = await SecureStore.getItemAsync(RECENT_SEARCHES_KEY);
        if (stored) {
          setRecentSearches(JSON.parse(stored));
        }
      } catch (e) {
        console.error('[useRecentSearches] Failed to load', e);
      }
    })();
  }, []);

  const saveSearch = useCallback(
    async (location: { id?: string; name: string; address?: string; lat: number; lng: number }) => {
      if (!location.lat || !location.lng || !location.name) return;

      const item: RecentSearch = {
        id: location.id ?? `${location.lat},${location.lng}`,
        name: location.name,
        address: location.address ?? '',
        lat: location.lat,
        lng: location.lng,
      };

      setRecentSearches((prev) => {
        const deduped = [item, ...prev.filter((s) => s.id !== item.id)].slice(0, MAX_RECENT);
        // Persist asynchronously; state is updated synchronously for snappy UI
        SecureStore.setItemAsync(RECENT_SEARCHES_KEY, JSON.stringify(deduped)).catch((e) =>
          console.error('[useRecentSearches] Failed to persist', e),
        );
        return deduped;
      });
    },
    [],
  );

  const clearSearches = useCallback(async () => {
    setRecentSearches([]);
    await SecureStore.deleteItemAsync(RECENT_SEARCHES_KEY).catch(() => {});
  }, []);

  return { recentSearches, saveSearch, clearSearches };
}
