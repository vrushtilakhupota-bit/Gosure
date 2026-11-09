import { useEffect, useState } from 'react';
import { fetchPlaces, type Sug } from '../lib/places';
import { useCurrentLocation } from '../lib/currentLocation';
import { useNav } from '../context/NavContext';
import BottomNav from '../components/BottomNav';
import Logo from '../components/Logo';
import MiniMap from '../components/MiniMap';

const quickActions = [
  {
    label: 'Check Destination',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="11" cy="11" r="7" stroke="#19B5A5" strokeWidth="2" />
        <path d="M16.5 16.5L21 21" stroke="#19B5A5" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    screen: 'explore' as const,
    bg: '#E6F9F7',
  },
  {
    label: 'Safe Routes',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M3 12H21M12 3L21 12L12 21" stroke="#3FC2E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    screen: 'safe-route' as const,
    bg: '#E8F8FD',
  },
  {
    label: 'Unsafe Areas',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z" fill="#FF9F0A" />
        <text x="12" y="13" textAnchor="middle" fontSize="9" fill="white" fontWeight="800">!</text>
      </svg>
    ),
    screen: 'map' as const,
    bg: '#FFF8E6',
  },
  {
    label: 'Emergency SOS',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" fill="#FF3B30" />
        <text x="12" y="17" textAnchor="middle" fontSize="11" fill="white" fontWeight="800">!</text>
      </svg>
    ),
    screen: 'emergency' as const,
    bg: '#FFF0F0',
  },
];

export default function HomeScreen() {
  const [curLoc] = useCurrentLocation();
  const { navigate } = useNav();
  const [destination, setDestination] = useState('');
  const [sugs, setSugs] = useState<Sug[]>([]);
  const [picked, setPicked] = useState(false);

  useEffect(() => {
    const term = destination.trim();
    if (picked || term.length < 2) { setSugs([]); return; }
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try { setSugs((await fetchPlaces(term, ctrl.signal, [curLoc.lat, curLoc.lon])).slice(0, 5)); } catch { /* aborted or offline */ }
    }, 250);
    return () => { clearTimeout(t); ctrl.abort(); };
  }, [destination, picked, curLoc.lat, curLoc.lon]);

  const goTo = (s: Sug) => {
    setPicked(true); setSugs([]); setDestination(s.name);
    navigate('destination-safety', { city: s.name, lat: s.lat, lon: s.lon });
  };

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: '#F2F2F7' }}>
      {/* Header */}
      <div className="hero-sky px-5 pt-3 pb-8 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#073B4C' }}>GoSure</h1>
          <p className="text-xs" style={{ color: '#2E6B7E' }}>Travel safe</p>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto pb-28">
        {/* Search card */}
        <div className="glass-card mx-4 -mt-4 p-5">
          <p className="text-xs font-semibold tracking-wide mb-3" style={{ color: '#607580' }}>WHERE ARE YOU GOING?</p>
          <div className="flex items-center gap-3 rounded-xl px-4 py-3.5" style={{ backgroundColor: '#F2F2F7', border: '1px solid #D9E7EC' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="7" stroke="#19B5A5" strokeWidth="2" />
              <path d="M16.5 16.5L21 21" stroke="#19B5A5" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              placeholder="Enter destination"
              value={destination}
              onChange={(e) => { setPicked(false); setDestination(e.target.value); }}
              onKeyDown={(e) => { if (e.key === 'Enter' && sugs[0]) goTo(sugs[0]); }}
              className="flex-1 text-sm bg-transparent outline-none"
              style={{ color: '#102A36' }}
            />
          </div>
          {sugs.length > 0 && (
            <div className="mt-2 rounded-xl overflow-hidden" style={{ border: '1px solid #D9E7EC', backgroundColor: 'white' }}>
              {sugs.map((s, i) => (
                <button key={`${s.name}-${s.lat}-${s.lon}-${i}`} onClick={() => goTo(s)}
                  className="w-full text-left px-3 py-2.5 flex items-start gap-2.5"
                  style={{ borderTop: i ? '1px solid #EEF4F6' : undefined }}>
                  <svg className="mt-0.5 shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z" stroke="#19B5A5" strokeWidth="2" />
                    <circle cx="12" cy="9" r="2.5" fill="#19B5A5" />
                  </svg>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold truncate" style={{ color: '#102A36' }}>{s.name}</span>
                    {s.full && <span className="block text-xs truncate" style={{ color: '#607580' }}>{s.full}</span>}
                  </span>
                </button>
              ))}
            </div>
          )}
          <button onClick={() => (sugs[0] ? goTo(sugs[0]) : navigate('explore'))}
            className="w-full mt-4 py-3.5 rounded-xl font-semibold text-sm text-white"
            style={{ backgroundColor: '#0B1F2A' }}>
            Plan Safe Journey
          </button>
        </div>

        {/* Quick actions */}
        <div className="px-4 mt-7">
          <h2 className="text-sm font-semibold mb-3" style={{ color: '#102A36' }}>Quick Actions</h2>
          <div className="grid grid-cols-4 gap-3">
            {quickActions.map((action) => (
              <button key={action.label} onClick={() => navigate(action.screen)}
                className="flex flex-col items-center gap-2">
                <div className="glass-card w-14 h-14 !rounded-full flex items-center justify-center">
                  {action.icon}
                </div>
                <span className="text-[10px] font-medium text-center leading-tight" style={{ color: '#102A36' }}>
                  {action.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Mini map */}
        <div className="px-4 mt-7">
          <MiniMap onOpen={() => navigate('map')} />
        </div>

        {/* Safety toolkit */}
        <div className="px-4 mt-7">
          <p className="ios-section">Safety Toolkit</p>
          <div className="ios-group">
            {([
              ['#19B5A5', <><circle cx="12" cy="13" r="8" /><path d="M12 9v4l2.5 2M9 2h6" /></>, 'Smart Safety Timer', 'Alerts if you miss a check-in', 'safety-timer'],
              ['#FF9500', <><path d="M12 3L2 20h20L12 3z" /><path d="M12 10v4M12 17h.01" /></>, 'Local Scam Alerts', 'Community-reported scams', 'scam-alerts'],
              ['#5856D6', <path d="M21 12a8 8 0 01-11.5 7.2L4 20l1-4.5A8 8 0 1121 12z" />, 'AI Safety Assistant', 'Ask and get precautions', 'assistant'],
              ['#007AFF', <><path d="M3 5h10M8 3v2M5 12c3-1 5-4 5-7M6 9c1 2 3 3 5 4M12 21l4-9 4 9M13.5 18h5" /></>, 'Emergency Language Helper', 'Phrases in local languages', 'phrases'],
              ['#FF3B30', <><rect x="2" y="8" width="17" height="9" rx="2" /><path d="M22 11v3M6 12h3" /></>, 'Low Battery Alert', 'Share your last location', 'battery'],
              ['#34C759', <><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11z" /><path d="M9 12l2 2 4-4" /></>, 'Safe Place Finder', 'Open and verified help nearby', 'nearby-help'],
            ] as const).map(([color, glyph, label, sub, screen]) => (
              <button key={label} onClick={() => navigate(screen)} className="ios-row">
                <span className="ios-icon" style={{ backgroundColor: color }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{glyph}</svg>
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-[17px] leading-tight" style={{ color: '#000' }}>{label}</span>
                  <span className="block text-[13px] truncate" style={{ color: '#6C6C70' }}>{sub}</span>
                </span>
                <svg width="8" height="14" viewBox="0 0 8 14" fill="none"><path d="M1 1l6 6-6 6" stroke="#C4C4C7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            ))}
          </div>
        </div>

        {/* Safety status */}
        <div className="glass-card mx-4 mt-5 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold" style={{ color: '#102A36' }}>Your Safety Status</h2>
            <span className="text-xs font-medium px-2 py-1 rounded-full" style={{ backgroundColor: '#E6F4EE', color: '#34C759' }}>
              ● Live
            </span>
          </div>
          <div className="flex items-center justify-between rounded-xl p-3" style={{ backgroundColor: '#F2F2F7' }}>
            <div>
              <p className="text-xs" style={{ color: '#607580' }}>Current Area</p>
              <p className="text-sm font-semibold" style={{ color: '#102A36' }}>{curLoc.name}</p>
            </div>
            <span className="text-xs font-bold px-3 py-1.5 rounded-full text-white" style={{ backgroundColor: '#34C759' }}>
              SAFE
            </span>
          </div>
          <div className="mt-3 flex gap-2">
            <div className="flex-1 rounded-xl p-3 text-center" style={{ backgroundColor: '#E6F4EE' }}>
              <p className="text-xs" style={{ color: '#34C759' }}>Safe Areas</p>
              <p className="text-lg font-bold" style={{ color: '#34C759' }}>14</p>
            </div>
            <div className="flex-1 rounded-xl p-3 text-center" style={{ backgroundColor: '#FFF8E6' }}>
              <p className="text-xs" style={{ color: '#FF9F0A' }}>Caution</p>
              <p className="text-lg font-bold" style={{ color: '#FF9F0A' }}>3</p>
            </div>
            <div className="flex-1 rounded-xl p-3 text-center" style={{ backgroundColor: '#FFF0F0' }}>
              <p className="text-xs" style={{ color: '#FF3B30' }}>Unsafe</p>
              <p className="text-lg font-bold" style={{ color: '#FF3B30' }}>2</p>
            </div>
          </div>
        </div>

        {/* Recent trips */}
        <div className="px-4 mt-7">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold" style={{ color: '#102A36' }}>Recent Journeys</h2>
            <button onClick={() => navigate('journey')} className="text-xs font-medium" style={{ color: '#19B5A5' }}>
              See all
            </button>
          </div>
          {[
            { from: 'Ahmedabad', to: 'Mumbai', date: '12 Sept 2026', status: 'safe' },
            { from: 'Ahmedabad', to: 'Surat', date: '5 Sept 2026', status: 'safe' },
          ].map((trip, i) => (
            <div key={i} className="glass-card flex items-center gap-3 p-3 mb-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#E8F8FD' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z" fill="#3FC2E5" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold" style={{ color: '#102A36' }}>{trip.from} → {trip.to}</p>
                <p className="text-xs" style={{ color: '#607580' }}>{trip.date}</p>
              </div>
              <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ backgroundColor: '#E6F4EE', color: '#34C759' }}>
                Complete
              </span>
            </div>
          ))}
        </div>

        {/* Safety tips teaser */}
        <div className="mx-4 mt-4 mb-2 rounded-2xl p-4" style={{ backgroundColor: '#DDF3FA', boxShadow: '0 6px 18px rgba(7,59,76,0.08)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#3FC2E5' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" />
                <path d="M12 8V12M12 16H12.01" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold" style={{ color: '#073B4C' }}>Safety Tips</p>
              <p className="text-xs" style={{ color: '#607580' }}>7 categories of travel safety advice</p>
            </div>
            <button onClick={() => navigate('safety-tips')} className="text-xs font-semibold" style={{ color: '#19B5A5' }}>
              View →
            </button>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
