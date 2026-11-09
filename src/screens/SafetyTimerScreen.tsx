import { useState } from 'react';
import Header from '../components/Header';
import { CONTACTS, useAlerts, locationText } from '../lib/alerts';
import { useTimer, useNow, startTimer, stopTimer, checkIn, resolveAlert, fmtClock } from '../lib/safetyTimer';

const OPTIONS = [
  { label: '15 min', m: 15 },
  { label: '30 min', m: 30 },
  { label: '1 hour', m: 60 },
  { label: '2 hours', m: 120 },
  { label: 'Test · 20 sec', m: 1 / 3 },
];

export default function SafetyTimerScreen() {
  const t = useTimer();
  const now = useNow(500);
  const alerts = useAlerts().filter((a) => /check-in|safe/i.test(a.title)).slice(-3).reverse();
  const [sel, setSel] = useState(t.minutes);
  const active = t.phase !== 'idle';
  const left = t.dueAt - now;
  const total = t.minutes * 60000;
  const pct = t.phase === 'running' ? Math.max(0, Math.min(100, (left / total) * 100)) : 0;
  const R = 70, C = 2 * Math.PI * R;

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: '#F2F2F7' }}>
      <Header title="Smart Safety Timer" dark />
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-8 space-y-4">
        <div className="glass-card p-5 flex flex-col items-center">
          <div className="relative" style={{ width: 170, height: 170 }}>
            <svg width="170" height="170" viewBox="0 0 170 170" className="-rotate-90">
              <circle cx="85" cy="85" r={R} stroke="#E3EDF1" strokeWidth="10" fill="none" />
              <circle cx="85" cy="85" r={R} stroke={t.phase === 'alerted' ? '#FF3B30' : t.phase === 'grace' ? '#FF9F0A' : '#19B5A5'} strokeWidth="10" fill="none" strokeLinecap="round"
                strokeDasharray={C} strokeDashoffset={C * (1 - (t.phase === 'running' ? pct / 100 : t.phase === 'idle' ? 0 : 1))} style={{ transition: 'stroke-dashoffset .5s linear' }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-3xl font-bold" style={{ color: '#073B4C' }}>
                {t.phase === 'running' ? fmtClock(left) : t.phase === 'grace' ? fmtClock(t.graceEnd - now) : t.phase === 'alerted' ? '!' : '--:--'}
              </p>
              <p className="text-[11px] font-medium" style={{ color: '#607580' }}>
                {t.phase === 'running' ? 'until next check-in' : t.phase === 'grace' ? 'respond now' : t.phase === 'alerted' ? 'contacts alerted' : 'timer off'}
              </p>
            </div>
          </div>

          {t.phase === 'idle' && (
            <>
              <p className="text-xs mt-4 mb-2 self-start font-semibold" style={{ color: '#607580' }}>CHECK IN EVERY</p>
              <div className="flex flex-wrap gap-2 self-start">
                {OPTIONS.map((o) => (
                  <button key={o.label} onClick={() => setSel(o.m)} aria-pressed={sel === o.m} className="ios-chip">{o.label}</button>
                ))}
              </div>
              <button onClick={() => startTimer(sel)} className="w-full mt-5 py-4 text-white font-semibold" style={{ backgroundColor: '#19B5A5' }}>Start timer</button>
            </>
          )}
          {(t.phase === 'running' || t.phase === 'grace') && (
            <div className="w-full mt-5 space-y-2">
              <button onClick={checkIn} className="w-full py-4 text-white font-semibold" style={{ backgroundColor: '#19B5A5' }}>Check in now</button>
              <button onClick={stopTimer} className="w-full py-3 text-sm font-semibold" style={{ color: '#607580' }}>Stop timer</button>
            </div>
          )}
          {t.phase === 'alerted' && (
            <div className="w-full mt-5 space-y-2">
              <p className="text-xs text-center" style={{ color: '#FF3B30' }}>You missed a check-in. Last known location sent: {locationText()}</p>
              <button onClick={resolveAlert} className="w-full py-4 text-white font-semibold" style={{ backgroundColor: '#19B5A5' }}>I'm safe: tell my contacts</button>
            </div>
          )}
        </div>

        <div className="glass-card p-4">
          <p className="text-xs font-semibold mb-3" style={{ color: '#607580' }}>WHO GETS ALERTED</p>
          <div className="flex gap-3">
            {CONTACTS.map((c) => (
              <div key={c.name} className="flex flex-col items-center gap-1">
                <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: c.color }}>{c.initials}</div>
                <span className="text-[11px]" style={{ color: '#102A36' }}>{c.name}</span>
              </div>
            ))}
          </div>
          <p className="text-[11px] mt-3" style={{ color: '#607580' }}>If you don't respond within {t.minutes < 1 ? '15 seconds' : '1 minute'} of a check-in prompt, your trusted contacts get a message with your last known location.</p>
        </div>

        {alerts.length > 0 && (
          <div className="glass-card p-4 space-y-2">
            <p className="text-xs font-semibold" style={{ color: '#607580' }}>RECENT ACTIVITY</p>
            {alerts.map((a) => (
              <div key={a.id} className="text-xs"><b style={{ color: '#102A36' }}>{a.title}</b> <span style={{ color: '#607580' }}>· {new Date(a.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
