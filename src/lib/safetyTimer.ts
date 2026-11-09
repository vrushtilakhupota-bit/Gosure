import { useEffect, useState, useSyncExternalStore } from 'react';
import { notifyContacts, locationText } from './alerts';

export type TimerState = { phase: 'idle' | 'running' | 'grace' | 'alerted'; minutes: number; dueAt: number; graceEnd: number; alertedAt: number };

let s: TimerState = { phase: 'idle', minutes: 30, dueAt: 0, graceEnd: 0, alertedAt: 0 };
const subs = new Set<() => void>();
const set = (p: Partial<TimerState>) => { s = { ...s, ...p }; subs.forEach((f) => f()); };

export const graceMs = (minutes: number) => (minutes < 1 ? 15000 : 60000);

export function startTimer(minutes: number) {
  set({ phase: 'running', minutes, dueAt: Date.now() + minutes * 60000, graceEnd: 0 });
}
export const stopTimer = () => set({ phase: 'idle' });
export const checkIn = () => { if (s.phase === 'running' || s.phase === 'grace') startTimer(s.minutes); };
export function resolveAlert() {
  notifyContacts('Traveler is safe', 'They checked in after the missed alert.');
  set({ phase: 'idle' });
}

setInterval(() => {
  const now = Date.now();
  if (s.phase === 'running' && now >= s.dueAt) set({ phase: 'grace', graceEnd: now + graceMs(s.minutes) });
  else if (s.phase === 'grace' && now >= s.graceEnd) {
    notifyContacts('Missed check-in alert sent', `Last known location: ${locationText()}`, 'danger');
    set({ phase: 'alerted', alertedAt: now });
  }
}, 500);

export const useTimer = () => useSyncExternalStore((f) => { subs.add(f); return () => { subs.delete(f); }; }, () => s);

export function useNow(ms = 1000) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), ms); return () => clearInterval(t); }, [ms]);
  return now;
}

export const fmtClock = (ms: number) => {
  const t = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), sec = t % 60;
  return h ? `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}` : `${m}:${String(sec).padStart(2, '0')}`;
};
