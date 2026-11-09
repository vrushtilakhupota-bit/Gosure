import { useSyncExternalStore } from 'react';
import { getCurrentLocation } from './currentLocation';

export const CONTACTS = [
  { name: 'Mom', initials: 'M', color: '#19B5A5' },
  { name: 'Rohan', initials: 'R', color: '#3FC2E5' },
  { name: 'Priya', initials: 'P', color: '#FF9F0A' },
];

export type AlertItem = { id: number; title: string; body: string; at: number; tone: 'ok' | 'warn' | 'danger' };

let items: AlertItem[] = [];
const subs = new Set<() => void>();
const emit = () => { items = [...items]; subs.forEach((f) => f()); };

export const locationText = () => {
  const l = getCurrentLocation();
  return `${l.name} (${l.lat.toFixed(4)}, ${l.lon.toFixed(4)})`;
};

// Simulated delivery: there is no backend, so contacts are "notified" locally and logged here.
export function notifyContacts(title: string, body: string, tone: AlertItem['tone'] = 'ok') {
  items.push({ id: Date.now() + Math.random(), title, body, at: Date.now(), tone });
  emit();
}

export const useAlerts = () => useSyncExternalStore((f) => { subs.add(f); return () => { subs.delete(f); }; }, () => items);
