import { useEffect, useState } from 'react';
import { useNav } from '../context/NavContext';
import { useCurrentLocation } from '../lib/currentLocation';
import Header from '../components/Header';

const CATS = [
  { id: 'police', label: 'Police', icon: '🚔', q: ['[amenity=police]'] },
  { id: 'hospital', label: 'Hospitals', icon: '🏥', q: ['[amenity=hospital]', '[amenity=clinic]'] },
  { id: 'pharmacy', label: 'Pharmacy', icon: '💊', q: ['[amenity=pharmacy]'] },
  { id: 'public', label: 'Public places', icon: '🏢', q: ['[shop=mall]', '[railway=station]', '[amenity=bus_station]', '[aeroway=terminal]', '[amenity=fuel]'] },
] as const;

type Place = { id: string; name: string; kind: string; lat: number; lon: number; dist: number; open: boolean | null; hours?: string; phone?: string; verified: boolean };

const hav = (a: number, b: number, c: number, d: number) => {
  const r = Math.PI / 180, x = Math.sin(((c - a) * r) / 2) ** 2 + Math.cos(a * r) * Math.cos(c * r) * Math.sin(((d - b) * r) / 2) ** 2;
  return 12742000 * Math.asin(Math.sqrt(x));
};

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
// Handles the common OSM forms ("24/7", "Mo-Sa 09:00-21:00; Su off"); anything else is "unknown".
function isOpen(h?: string): boolean | null {
  if (!h) return null;
  if (h.trim() === '24/7') return true;
  const d = new Date(), mins = d.getHours() * 60 + d.getMinutes();
  let result: boolean | null = null;
  for (const rule of h.split(';').map((r) => r.trim()).filter(Boolean)) {
    const m = /^((?:[A-Z][a-z](?:-[A-Z][a-z])?,?)+)?\s*(.*)$/.exec(rule);
    if (!m) return null;
    const dayPart = m[1], rest = m[2];
    if (dayPart) {
      const ok = dayPart.split(',').some((seg) => {
        const [a, b] = seg.split('-'); const i = DAYS.indexOf(a); if (i < 0) return false;
        if (!b) return d.getDay() === i;
        const j = DAYS.indexOf(b); const order = (x: number) => (x + 6) % 7;
        return order(d.getDay()) >= order(i) && order(d.getDay()) <= order(j);
      });
      if (!ok) continue;
    }
    if (/^(off|closed)$/i.test(rest)) { result = false; continue; }
    const ranges = [...rest.matchAll(/(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})/g)];
    if (!ranges.length) return null;
    result = ranges.some((r) => {
      const s = +r[1] * 60 + +r[2]; let e = +r[3] * 60 + +r[4]; if (e <= s) e += 1440;
      return (mins >= s && mins < e) || (mins + 1440 >= s && mins + 1440 < e);
    });
  }
  return result;
}

export default function SafePlaceFinderScreen() {
  const { navigate, params } = useNav();
  const [cur] = useCurrentLocation();
  const [cat, setCat] = useState<string>(params.tab === 'hospital' ? 'hospital' : 'police');
  const [openOnly, setOpenOnly] = useState(false);
  const [places, setPlaces] = useState<Place[]>([]);
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading');
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const c = CATS.find((x) => x.id === cat)!;
    const ctrl = new AbortController();
    setStatus('loading');
    const q = `[out:json][timeout:20];(${c.q.map((f) => `nwr(around:4000,${cur.lat},${cur.lon})${f};`).join('')});out center tags 80;`;
    fetch('https://overpass-api.de/api/interpreter', { method: 'POST', body: 'data=' + encodeURIComponent(q), signal: ctrl.signal, headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
      .then((r) => { if (!r.ok) throw new Error('bad'); return r.json(); })
      .then((d) => {
        const list: Place[] = (d.elements || []).map((e: any) => {
          const t = e.tags || {}, lat = e.lat ?? e.center?.lat, lon = e.lon ?? e.center?.lon;
          const phone = t.phone || t['contact:phone'];
          const kind = (t.amenity || t.shop || t.railway || t.aeroway || '').replace(/_/g, ' ');
          return { id: `${e.type}${e.id}`, name: t.name || `Unnamed ${kind || 'place'}`, kind, lat, lon, dist: hav(cur.lat, cur.lon, lat, lon),
            open: isOpen(t.opening_hours), hours: t.opening_hours, phone, verified: !!(t.name && (phone || t.website || t['contact:website'] || t.opening_hours)) };
        }).filter((p: Place) => p.lat && p.lon).sort((a: Place, b: Place) => a.dist - b.dist).slice(0, 25);
        setPlaces(list); setStatus('ok');
      })
      .catch((e) => { if (e.name !== 'AbortError') setStatus('error'); });
    return () => ctrl.abort();
  }, [cat, cur.lat, cur.lon, retry]);

  const shown = openOnly ? places.filter((p) => p.open === true) : places;
  const icon = CATS.find((c) => c.id === cat)!.icon;

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: '#F2F2F7' }}>
      <Header title="Safe Place Finder" dark />
      <div className="flex gap-2 px-4 pt-3 pb-2 overflow-x-auto shrink-0">
        {CATS.map((c) => (
          <button key={c.id} onClick={() => setCat(c.id)} aria-pressed={cat === c.id} className="ios-chip">{c.icon} {c.label}</button>
        ))}
      </div>
      <div className="flex items-center justify-between px-4 pb-2 shrink-0">
        <p className="text-[11px]" style={{ color: '#607580' }}>Near {cur.name.split(',')[0]} · within 4 km</p>
        <label className="flex items-center gap-2 text-xs font-medium" style={{ color: '#102A36' }}>
          Open now
          <button role="switch" aria-checked={openOnly} onClick={() => setOpenOnly(!openOnly)} className="ios-switch" />
        </label>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-2">
        {status === 'loading' && <p className="text-center text-sm py-10" style={{ color: '#607580' }}>Finding places near you…</p>}
        {status === 'error' && (
          <div className="text-center py-10">
            <p className="text-sm mb-3" style={{ color: '#FF3B30' }}>Couldn't load nearby places.</p>
            <button onClick={() => setRetry(retry + 1)} className="px-5 py-2 rounded-full text-xs font-semibold text-white" style={{ backgroundColor: '#19B5A5' }}>Try again</button>
          </div>
        )}
        {status === 'ok' && shown.length === 0 && <p className="text-center text-sm py-10" style={{ color: '#607580' }}>{openOnly ? 'No places confirmed open right now. Turn off "Open now" to see all.' : 'Nothing found nearby. Try changing your current location.'}</p>}
        {status === 'ok' && shown.map((p) => (
          <div key={p.id} className="glass-card p-4">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ backgroundColor: '#E8F8FD' }}>{icon}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: '#102A36' }}>{p.name}</p>
                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                  <span className="text-xs" style={{ color: '#607580' }}>📍 {p.dist < 1000 ? `${Math.round(p.dist)} m` : `${(p.dist / 1000).toFixed(1)} km`}</span>
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: p.open === true ? '#E6F4EE' : p.open === false ? '#FFF0F0' : '#F2F2F7', color: p.open === true ? '#34C759' : p.open === false ? '#FF3B30' : '#607580' }}>
                    {p.open === true ? '● Open now' : p.open === false ? '● Closed' : 'Hours not listed'}
                  </span>
                  {p.verified && <span className="text-[11px] font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: '#E8F8FD', color: '#0A84C6' }}>✓ Verified</span>}
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              {p.phone && <a href={`tel:${p.phone.split(';')[0].replace(/\s/g, '')}`} className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white text-center" style={{ backgroundColor: '#19B5A5' }}>📞 Call</a>}
              <button onClick={() => navigate('safe-route', { city: p.name, lat: p.lat, lon: p.lon })} className="flex-1 py-2.5 rounded-xl text-xs font-semibold" style={{ backgroundColor: 'rgba(120,120,128,0.12)', color: '#102A36' }}>🗺 Safe route</button>
            </div>
          </div>
        ))}
        {status === 'ok' && <p className="text-[11px] text-center pt-2" style={{ color: '#8A9BA5' }}>Data from OpenStreetMap. “Verified” means the place has a name plus contact or opening-hours details listed. In an emergency, call your local emergency number.</p>}
      </div>
    </div>
  );
}
