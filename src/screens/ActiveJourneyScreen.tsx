import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useNav } from '../context/NavContext';
import Header from '../components/Header';
import { loadRoutes, type Route } from '../lib/routing';
import { useCurrentLocation } from '../lib/currentLocation';
import { notifyContacts, CONTACTS } from '../lib/alerts';

const DEFAULT_DEST: L.LatLngTuple = [23.012, 72.51];

const dot = (color: string, size: number, pulse = false) =>
  L.divIcon({
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:3px solid #fff;box-shadow:0 0 0 ${pulse ? 8 : 0}px ${color}33,0 2px 6px rgba(0,0,0,.3)"></div>`,
  });

const fmtLeft = (s: number) => {
  const m = Math.max(0, Math.round(s / 60));
  return m < 60 ? `${m} min` : `${Math.floor(m / 60)}h ${m % 60}m`;
};

export default function ActiveJourneyScreen() {
  const { navigate, params } = useNav();
  const [cur] = useCurrentLocation();
  const [shareActive, setShareActive] = useState(true);
  const [route, setRoute] = useState<Route | null>(null);
  const [duration, setDuration] = useState(0);
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading');
  const [progress, setProgress] = useState(0);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [arrivalSent, setArrivalSent] = useState(false);

  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const meRef = useRef<L.Marker | null>(null);
  const doneRef = useRef<L.Polyline | null>(null);

  const START: L.LatLngTuple = [cur.lat, cur.lon];
  const END: L.LatLngTuple = typeof params.lat === 'number' ? [params.lat, params.lon] : DEFAULT_DEST;
  const city = params.city || 'Destination';

  useEffect(() => {
    const ctrl = new AbortController();
    loadRoutes(START, END, ctrl.signal)
      .then((rs) => {
        const r = rs[(params.routeId || 1) - 1] || rs[0];
        setRoute(r);
        setStatus('ok');
      })
      .catch((e) => { if (e.name !== 'AbortError') setStatus('error'); });
    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Route duration in seconds from "Xh Ym" / "N min" label
  useEffect(() => {
    if (!route) return;
    const h = /(\d+)h/.exec(route.time)?.[1];
    const m = /(\d+)\s*m/.exec(route.time)?.[1];
    setDuration((h ? +h * 3600 : 0) + (m ? +m * 60 : 0));
  }, [route]);

  useEffect(() => {
    if (!mapEl.current || !route) return;
    const map = L.map(mapEl.current, { zoomControl: false, attributionControl: false });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
    const line = L.polyline(route.path, { color: '#34C759', weight: 6, opacity: 0.45, lineCap: 'round' }).addTo(map);
    doneRef.current = L.polyline([route.path[0]], { color: '#34C759', weight: 6, lineCap: 'round' }).addTo(map);
    L.marker(END, { icon: dot('#073B4C', 20) }).bindTooltip(city, { permanent: true, direction: 'top', offset: [0, -10] }).addTo(map);
    meRef.current = L.marker(route.path[0], { icon: dot('#19B5A5', 22, true) }).addTo(map);
    map.fitBounds(line.getBounds(), { padding: [30, 30] });
    mapRef.current = map;
    setTimeout(() => map.invalidateSize(), 0);
    return () => { map.remove(); mapRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route]);

  // Simulated live trip: advance along the real route
  useEffect(() => {
    if (!route) return;
    const t = setInterval(() => setProgress((p) => Math.min(100, p + 1)), 1500);
    return () => clearInterval(t);
  }, [route]);

  useEffect(() => {
    if (!route || !meRef.current) return;
    const idx = Math.min(route.path.length - 1, Math.round((progress / 100) * (route.path.length - 1)));
    meRef.current.setLatLng(route.path[idx]);
    doneRef.current?.setLatLngs(route.path.slice(0, idx + 1));
  }, [progress, route]);

  const arrived = progress >= 100;
  const leftSec = duration * (1 - progress / 100);

  const Action = ({ label, icon, onClick, active }: { label: string; icon: string; onClick: () => void; active?: boolean }) => (
    <button onClick={onClick} className="glass-card flex items-center gap-2 p-3"
      style={active ? { backgroundColor: 'rgba(25,181,165,0.9)' } : undefined}>
      <span className="text-base">{icon}</span>
      <span className="text-xs font-semibold" style={{ color: active ? 'white' : '#102A36' }}>{label}</span>
    </button>
  );

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: '#F2F2F7' }}>
      <Header title="Active Journey" dark rightElement={
        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white" style={{ color: arrived ? '#34C759' : '#19B5A5' }}>
          {arrived ? 'ARRIVED' : '● LIVE'}
        </span>
      } />

      <div className="flex-1 overflow-y-auto px-4 pt-3 pb-6 space-y-3">
        <div className="glass-card p-4 flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-medium" style={{ color: '#607580' }}>YOUR JOURNEY</p>
            <h2 className="text-sm font-bold truncate" style={{ color: '#102A36' }}>{cur.name.split(',')[0]} → {city}</h2>
          </div>
          <div className="text-right shrink-0 ml-3">
            <p className="text-[11px]" style={{ color: '#607580' }}>ETA</p>
            <p className="text-lg font-bold" style={{ color: '#073B4C' }}>{arrived ? '—' : status === 'ok' ? fmtLeft(leftSec) : '…'}</p>
          </div>
        </div>

        <div className="relative rounded-3xl overflow-hidden" style={{ height: 260, backgroundColor: '#E8F4F8' }}>
          <div ref={mapEl} className="absolute inset-0" />
          {status === 'loading' && <p className="absolute inset-0 flex items-center justify-center text-sm" style={{ color: '#607580' }}>Loading route…</p>}
          {status === 'error' && <p className="absolute inset-0 flex items-center justify-center px-6 text-center text-sm" style={{ color: '#FF3B30' }}>Could not load the route. Check your connection.</p>}
        </div>

        <div className="glass-card p-4">
          <div className="flex justify-between text-xs mb-2">
            <span style={{ color: '#607580' }}>Journey Progress</span>
            <span className="font-semibold" style={{ color: '#102A36' }}>{progress}%</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#E3EDF1' }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: '#19B5A5' }} />
          </div>
          <div className="flex justify-between text-xs mt-2">
            <span className="truncate" style={{ color: '#607580' }}>{cur.name.split(',')[0]}</span>
            <span className="truncate ml-2" style={{ color: '#607580' }}>{city}</span>
          </div>
        </div>

        {arrived && (
          <div className="glass-card p-4" style={{ border: '2px solid #34C759' }}>
            <p className="text-sm font-bold" style={{ color: '#102A36' }}>🎉 You've reached {city}</p>
            <p className="text-xs mt-1" style={{ color: '#607580' }}>
              {arrivalSent ? `Arrival confirmed. ${CONTACTS.map((c) => c.name).join(', ')} have been notified.` : 'Let your trusted contacts know you arrived safely.'}
            </p>
            <button disabled={arrivalSent} onClick={() => { notifyContacts('Arrived safely', `Reached ${city}.`); setArrivalSent(true); }}
              className="w-full mt-3 py-3.5 text-sm font-semibold text-white disabled:opacity-60" style={{ backgroundColor: '#34C759' }}>
              {arrivalSent ? '✓ Arrival confirmed' : 'Confirm safe arrival'}
            </button>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <Action label={shareActive ? 'Sharing Location' : 'Share Location'} icon="📍" active={shareActive} onClick={() => setShareActive(!shareActive)} />
          <Action label="Change Route" icon="↪️" onClick={() => navigate('safe-route', { city: params.city, lat: params.lat, lon: params.lon })} />
        </div>

        <button onClick={() => navigate('emergency')}
          className="w-full p-4 flex items-center justify-center gap-3 text-white font-bold text-base"
          style={{ backgroundColor: '#FF3B30', borderRadius: 9999 }}>
          Emergency SOS
        </button>

        <div className="grid grid-cols-2 gap-2">
          <Action label="Contact" icon="📞" onClick={() => navigate('live-location')} />
          <Action label={arrived ? 'Finish' : 'End Journey'} icon="🏁" onClick={() => (arrived ? navigate('home') : setConfirmEnd(true))} />
        </div>
      </div>

      {confirmEnd && (
        <div className="absolute inset-0 flex items-end" style={{ backgroundColor: 'rgba(0,0,0,0.45)', zIndex: 50 }} onClick={() => setConfirmEnd(false)}>
          <div className="w-full rounded-t-3xl p-6 bg-white" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-1" style={{ color: '#102A36' }}>End this journey?</h3>
            <p className="text-sm mb-5" style={{ color: '#607580' }}>Live location sharing with your trusted contacts will stop.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmEnd(false)} className="flex-1 py-4 text-sm font-semibold" style={{ border: '2px solid #D9E7EC', color: '#607580' }}>Keep going</button>
              <button onClick={() => navigate('home')} className="flex-1 py-4 text-sm font-semibold text-white" style={{ backgroundColor: '#FF3B30' }}>End journey</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
