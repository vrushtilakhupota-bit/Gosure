import { useSyncExternalStore } from 'react';
import { notifyContacts, locationText } from './alerts';

const KEY = 'gosure.battery';
type Prefs = { enabled: boolean; autoShare: boolean };
export type BatteryState = Prefs & { level: number | null; charging: boolean; supported: boolean; simulated: boolean; prompt: boolean };

const THRESHOLD = 0.2;
let prefs: Prefs = { enabled: true, autoShare: false };
try { prefs = { ...prefs, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch { /* ignore */ }

let s: BatteryState = { ...prefs, level: null, charging: false, supported: false, simulated: false, prompt: false };
let warned = false;
const subs = new Set<() => void>();
const set = (p: Partial<BatteryState>) => { s = { ...s, ...p }; subs.forEach((f) => f()); };

export function shareLastLocation() {
  notifyContacts('Low battery: last known location', `${Math.round((s.level ?? 0) * 100)}% left. ${locationText()}`, 'warn');
  set({ prompt: false });
}
export const dismissBatteryPrompt = () => set({ prompt: false });

function evaluate() {
  const low = s.level !== null && s.level <= THRESHOLD && !s.charging;
  if (!low) { warned = false; if (s.prompt) set({ prompt: false }); return; }
  if (!s.enabled || warned) return;
  warned = true;
  if (s.autoShare) shareLastLocation(); else set({ prompt: true });
}

export function setBatteryPrefs(p: Partial<Prefs>) {
  prefs = { ...prefs, ...p };
  try { localStorage.setItem(KEY, JSON.stringify(prefs)); } catch { /* ignore */ }
  set(p);
  evaluate();
}

export function simulateBattery(level: number | null) {
  if (level === null) { set({ simulated: false, level: realLevel, charging: realCharging }); }
  else set({ simulated: true, level, charging: false });
  warned = false;
  evaluate();
}

let realLevel: number | null = null, realCharging = false;
(navigator as any).getBattery?.().then((b: any) => {
  const upd = () => {
    realLevel = b.level; realCharging = b.charging;
    if (!s.simulated) { set({ level: b.level, charging: b.charging, supported: true }); evaluate(); }
  };
  set({ supported: true });
  upd();
  b.addEventListener('levelchange', upd);
  b.addEventListener('chargingchange', upd);
}).catch(() => { /* unsupported */ });

export const useBattery = () => useSyncExternalStore((f) => { subs.add(f); return () => { subs.delete(f); }; }, () => s);
