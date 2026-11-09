import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { fetchPlaces, type Sug } from '../lib/places';
import { setCurrentLocation, useCurrentLocation } from '../lib/currentLocation';

export default function LocationPicker({ onClose }: { onClose: () => void }) {
  const [cur] = useCurrentLocation();
  const el = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const skip = useRef(false);
  const [q, setQ] = useState('');
  const [sugs, setSugs] = useState<Sug[]>([]);
  const [sel, setSel] = useState<{ name: string; lat: number; lon: number } | null>(null);
  const [msg, setMsg] = useState('');

  const put = (lat: number, lon: number, name: string, zoom?: number) => {
    const map = mapRef.current;
    if (!map) return;
    if (markerRef.current) markerRef.current.setLatLng([lat, lon]);
    else markerRef.current = L.marker([lat, lon], { icon: L.divIcon({
      className: '', iconSize: [22, 22], iconAnchor: [11, 11],
      html: '<div style="width:22px;height:22px;border-radius:50%;background:#19B5A5;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.35)"></div>',
    }) }).addTo(map);
    if (zoom) map.flyTo([lat, lon], zoom);
    setSel({ name, lat, lon });
    setMsg('');
  };

  useEffect(() => {
    if (!el.current) return;
    const map = L.map(el.current, { zoomControl: false, attributionControl: false }).setView([cur.lat, cur.lon], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
    mapRef.current = map;
    put(cur.lat, cur.lon, cur.name);
    map.on('click', async (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      put(lat, lng, 'Dropped pin…');
      try {
        const r = await fetch(`https://photon.komoot.io/reverse?lat=${lat}&lon=${lng}`);
        const p = (await r.json()).features?.[0]?.properties;
        const name = p ? [p.name || p.street, p.district || p.locality, p.city].filter(Boolean).join(', ') : '';
        setSel({ name: name || 'Selected location', lat, lon: lng });
      } catch {
        setSel({ name: 'Selected location', lat, lon: lng });
      }
    });
    setTimeout(() => map.invalidateSize(), 0);
    return () => { map.remove(); mapRef.current = null; markerRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (skip.current) { skip.current = false; return; }
    const term = q.trim();
    if (term.length < 2) { setSugs([]); return; }
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try { setSugs(await fetchPlaces(term, ctrl.signal)); } catch { /* aborted */ }
    }, 350);
    return () => { clearTimeout(t); ctrl.abort(); };
  }, [q]);

  const choose = (s: Sug) => {
    skip.current = true;
    setQ(s.name);
    setSugs([]);
    put(s.lat, s.lon, [s.name, s.full.split(',')[0]].filter((x, i, a) => x && a.indexOf(x) === i).join(', '), 15);
  };

  const useGps = () => {
    if (!navigator.geolocation) { setMsg('Location is not supported on this device.'); return; }
    setMsg('Finding you…');
    navigator.geolocation.getCurrentPosition(
      (pos) => put(pos.coords.latitude, pos.coords.longitude, 'My GPS location', 16),
      () => setMsg('Could not get your location. Search or tap the map instead.'),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const save = () => {
    if (!sel) return;
    setCurrentLocation(sel);
    onClose();
  };

  return (
    <div className="absolute inset-0 flex items-end" style={{ zIndex: 2000, backgroundColor: 'rgba(7,59,76,0.55)' }} onClick={onClose}>
      <div className="w-full bg-white rounded-t-3xl p-4 pb-6" style={{ maxHeight: '92%' }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold" style={{ color: '#102A36' }}>Set current location</h3>
          <button onClick={onClose} style={{ color: '#607580' }}>✕</button>
        </div>

        <div className="relative">
          <input value={q} onChange={(e) => setQ(e.target.value)} autoComplete="off"
            placeholder="Search area, street or landmark…"
            className="w-full text-sm rounded-xl px-3 py-2.5 outline-none"
            style={{ backgroundColor: '#F2F2F7', border: '1px solid #D9E7EC', color: '#102A36' }} />
          {sugs.length > 0 && (
            <ul className="absolute left-0 right-0 top-full mt-1 rounded-xl bg-white overflow-y-auto max-h-56"
              style={{ zIndex: 1000, border: '1px solid #D9E7EC', boxShadow: '0 8px 24px rgba(7,59,76,0.18)' }}>
              {sugs.map((s, i) => (
                <li key={i}>
                  <button type="button" onClick={() => choose(s)} className="w-full px-3 py-2 text-left"
                    style={{ borderTop: i ? '1px solid #EEF4F6' : 'none' }}>
                    <span className="block text-sm font-semibold truncate" style={{ color: '#102A36' }}>{s.name}</span>
                    <span className="block text-[11px] truncate" style={{ color: '#607580' }}>{s.full}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button onClick={useGps} className="mt-2 w-full py-2.5 rounded-xl text-sm font-semibold"
          style={{ backgroundColor: '#E8F8FD', color: '#19B5A5' }}>
          Use my GPS location
        </button>

        <div className="relative h-52 mt-3 rounded-2xl overflow-hidden" style={{ border: '1px solid #D9E7EC' }}>
          <div ref={el} className="absolute inset-0" />
        </div>

        <p className="text-xs mt-3" style={{ color: msg ? '#FF3B30' : '#607580' }}>
          {msg || (sel ? <>Selected: <b style={{ color: '#102A36' }}>{sel.name}</b></> : 'Search, use GPS or tap the map.')}
        </p>
        <button onClick={save} disabled={!sel || sel.name === 'Dropped pin…'}
          className="mt-3 w-full py-3.5 rounded-2xl text-sm font-semibold text-white disabled:opacity-40"
          style={{ backgroundColor: '#19B5A5' }}>
          Set as current location
        </button>
      </div>
    </div>
  );
}
