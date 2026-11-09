import { useSyncExternalStore } from 'react';

export type CurrentLocation = { name: string; lat: number; lon: number };

const KEY = 'gosure.currentLocation';
const DEFAULT: CurrentLocation = { name: 'Navrangpura, Ahmedabad', lat: 23.0395, lon: 72.566 };

let cached: CurrentLocation | null = null;
const listeners = new Set<() => void>();

function read(): CurrentLocation {
  if (cached) return cached;
  try {
    const raw = localStorage.getItem(KEY);
    cached = raw ? JSON.parse(raw) : DEFAULT;
  } catch {
    cached = DEFAULT;
  }
  return cached!;
}

export function setCurrentLocation(l: CurrentLocation) {
  cached = l;
  try { localStorage.setItem(KEY, JSON.stringify(l)); } catch { /* storage unavailable */ }
  listeners.forEach((fn) => fn());
}

export function useCurrentLocation() {
  const loc = useSyncExternalStore(
    (fn) => { listeners.add(fn); return () => { listeners.delete(fn); }; },
    read,
  );
  return [loc, setCurrentLocation] as const;
}
export const getCurrentLocation = read;
