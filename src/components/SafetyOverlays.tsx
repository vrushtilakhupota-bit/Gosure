import { useEffect, useState } from 'react';
import { useNav } from '../context/NavContext';
import { useAlerts, CONTACTS } from '../lib/alerts';
import { useTimer, useNow, fmtClock, checkIn, resolveAlert } from '../lib/safetyTimer';
import { useBattery, shareLastLocation, dismissBatteryPrompt } from '../lib/battery';

const AUTH = ['splash', 'onboarding', 'login', 'otp', 'create-account', 'forgot-password'];

export default function SafetyOverlays() {
  const { screen, navigate } = useNav();
  const timer = useTimer();
  const bat = useBattery();
  const alerts = useAlerts();
  const now = useNow(500);
  const [toast, setToast] = useState<(typeof alerts)[number] | null>(null);

  useEffect(() => {
    const last = alerts[alerts.length - 1];
    if (!last) return;
    setToast(last);
    const t = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(t);
  }, [alerts.length]);

  if (AUTH.includes(screen)) return null;
  const tone = { ok: '#34C759', warn: '#FF9F0A', danger: '#FF3B30' };

  return (
    <>
      {toast && (
        <div className="absolute left-2 right-2 top-1 glass-bar rounded-[22px] px-4 py-3 flex items-start gap-3" style={{ zIndex: 90 }}>
          <div className="w-9 h-9 rounded-[10px] flex items-center justify-center text-white text-sm font-bold shrink-0" style={{ background: 'linear-gradient(180deg,#3FC2E5,#19B5A5)' }}>G</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline justify-between">
              <p className="text-[15px] font-semibold" style={{ color: tone[toast.tone] === '#34C759' ? '#000' : tone[toast.tone] }}>{toast.title}</p>
              <p className="text-[12px]" style={{ color: '#6C6C70' }}>now</p>
            </div>
            <p className="text-[14px] leading-snug" style={{ color: '#3C3C43' }}>{toast.body}</p>
            <p className="text-[12px] mt-1" style={{ color: '#6C6C70' }}>Sent to {CONTACTS.map((c) => c.name).join(', ')}</p>
          </div>
        </div>
      )}

      {bat.prompt && timer.phase !== 'grace' && (
        <div className="absolute left-3 right-3 bottom-24 glass-bar rounded-[22px] p-4" style={{ zIndex: 80 }}>
          <p className="text-[15px] font-semibold" style={{ color: '#000' }}>🪫 Battery at {Math.round((bat.level ?? 0) * 100)}%</p>
          <p className="text-[13px] mt-1" style={{ color: '#3C3C43' }}>Share your last known location with trusted contacts before your phone dies?</p>
          <div className="flex gap-2 mt-3">
            <button onClick={dismissBatteryPrompt} className="flex-1 py-3 rounded-full text-sm font-semibold" style={{ backgroundColor: 'rgba(120,120,128,0.14)', color: '#3C3C43' }}>Not now</button>
            <button onClick={shareLastLocation} className="flex-1 py-3 rounded-full text-sm font-semibold text-white" style={{ backgroundColor: '#FF9500' }}>Share location</button>
          </div>
        </div>
      )}

      {timer.phase === 'grace' && (
        <div className="absolute inset-0 flex items-center justify-center p-6" style={{ backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 100 }}>
          <div className="ios-alert">
            <div className="px-5 pt-5 pb-4">
              <h3 className="text-[17px] font-semibold" style={{ color: '#000' }}>Safety Check-in</h3>
              <p className="text-[13px] mt-1" style={{ color: '#3C3C43' }}>Are you okay? Your trusted contacts will be alerted in</p>
              <p className="text-3xl font-semibold mt-2 tabular-nums" style={{ color: '#FF3B30' }}>{fmtClock(timer.graceEnd - now)}</p>
            </div>
            <button onClick={checkIn} className="ios-alert-btn font-semibold" style={{ color: '#19B5A5' }}>I'm Safe</button>
            <button onClick={() => navigate('emergency')} className="ios-alert-btn" style={{ color: '#FF3B30' }}>I Need Help</button>
          </div>
        </div>
      )}

      {timer.phase === 'alerted' && screen !== 'safety-timer' && (
        <div className="absolute left-3 right-3 bottom-24 rounded-2xl p-4" style={{ zIndex: 80, backgroundColor: '#FF3B30', color: 'white' }}>
          <p className="text-sm font-bold">Missed check-in: contacts were alerted</p>
          <button onClick={resolveAlert} className="mt-2 w-full py-2.5 rounded-xl text-xs font-semibold bg-white" style={{ color: '#FF3B30' }}>I'm safe: tell them</button>
        </div>
      )}
    </>
  );
}
