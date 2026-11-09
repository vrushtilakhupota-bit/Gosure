import Header from '../components/Header';
import { useBattery, setBatteryPrefs, simulateBattery, shareLastLocation } from '../lib/battery';
import { locationText } from '../lib/alerts';

const Toggle = ({ on, onClick }: { on: boolean; onClick: () => void }) => (
  <button role="switch" aria-checked={on} onClick={onClick} className="ios-switch" />
);

export default function BatteryAlertScreen() {
  const b = useBattery();
  const pct = b.level === null ? null : Math.round(b.level * 100);
  const low = pct !== null && pct <= 20 && !b.charging;

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: '#F2F2F7' }}>
      <Header title="Low Battery Alert" dark />
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-8 space-y-4">
        <div className="glass-card p-5 text-center">
          <div className="mx-auto relative rounded-xl" style={{ width: 120, height: 56, border: '4px solid #073B4C', padding: 4 }}>
            <div className="h-full rounded-md transition-all" style={{ width: `${pct ?? 0}%`, backgroundColor: low ? '#FF3B30' : '#34C759' }} />
            <div className="absolute rounded-r" style={{ right: -10, top: 16, width: 6, height: 16, backgroundColor: '#073B4C' }} />
          </div>
          <p className="text-3xl font-bold mt-3" style={{ color: low ? '#FF3B30' : '#073B4C' }}>{pct === null ? '—' : `${pct}%`}</p>
          <p className="text-xs" style={{ color: '#607580' }}>
            {pct === null ? 'Battery level is not available in this browser. Use the simulator below.' : b.charging ? 'Charging' : b.simulated ? 'Simulated level' : 'Live device battery'}
          </p>
        </div>

        <div className="glass-card p-4 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex-1"><p className="text-sm font-semibold" style={{ color: '#102A36' }}>Warn me at 20%</p><p className="text-xs" style={{ color: '#607580' }}>Show an alert when battery runs low</p></div>
            <Toggle on={b.enabled} onClick={() => setBatteryPrefs({ enabled: !b.enabled })} />
          </div>
          <div className="flex items-center gap-3" style={{ opacity: b.enabled ? 1 : 0.4 }}>
            <div className="flex-1"><p className="text-sm font-semibold" style={{ color: '#102A36' }}>Auto-share last location</p><p className="text-xs" style={{ color: '#607580' }}>Send it to trusted contacts without asking</p></div>
            <Toggle on={b.autoShare} onClick={() => b.enabled && setBatteryPrefs({ autoShare: !b.autoShare })} />
          </div>
        </div>

        <div className="glass-card p-4">
          <p className="text-xs font-semibold mb-1" style={{ color: '#607580' }}>LAST KNOWN LOCATION</p>
          <p className="text-sm" style={{ color: '#102A36' }}>📍 {locationText()}</p>
          <button onClick={shareLastLocation} className="w-full mt-3 py-3.5 text-sm font-semibold text-white" style={{ backgroundColor: '#FF9F0A' }}>Share with trusted contacts now</button>
        </div>

        <div className="glass-card p-4">
          <p className="text-xs font-semibold mb-2" style={{ color: '#607580' }}>TRY IT</p>
          <div className="flex gap-2">
            <button onClick={() => simulateBattery(0.15)} className="flex-1 py-3 rounded-xl text-xs font-semibold text-white" style={{ backgroundColor: '#FF3B30' }}>Simulate 15%</button>
            <button onClick={() => simulateBattery(null)} className="flex-1 py-3 rounded-xl text-xs font-semibold" style={{ backgroundColor: 'rgba(120,120,128,0.12)', color: '#102A36' }}>Use real battery</button>
          </div>
        </div>
      </div>
    </div>
  );
}
