import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useNav } from '../context/NavContext';
import { fetchPlaces, type Sug } from '../lib/places';
import { useCurrentLocation } from '../lib/currentLocation';
import LocationPicker from '../components/LocationPicker';
import BottomNav from '../components/BottomNav';

const popular = [
  { city: 'Mumbai', state: 'Maharashtra', km: '531 km', safety: 82, status: 'safe' },
  { city: 'Jaipur', state: 'Rajasthan', km: '672 km', safety: 78, status: 'safe' },
  { city: 'Delhi', state: 'Delhi NCR', km: '943 km', safety: 65, status: 'caution' },
  { city: 'Surat', state: 'Gujarat', km: '262 km', safety: 88, status: 'safe' },
  { city: 'Bangalore', state: 'Karnataka', km: '1,574 km', safety: 74, status: 'safe' },
];

const recent = [
  { city: 'Mumbai', state: 'Maharashtra', km: '531 km', safety: 82, status: 'safe' },
  { city: 'Surat', state: 'Gujarat', km: '262 km', safety: 88, status: 'safe' },
];

const coords: Record<string, [number, number]> = {
  Mumbai: [19.076, 72.8777], Jaipur: [26.9124, 75.7873], Delhi: [28.6139, 77.209],
  Surat: [21.1702, 72.8311], Bangalore: [12.9716, 77.5946],
};

function safetyColor(status: string) {
  if (status === 'safe') return { text: '#34C759', bg: '#E6F4EE' };
  if (status === 'caution') return { text: '#FF9F0A', bg: '#FFF8E6' };
  return { text: '#FF3B30', bg: '#FFF0F0' };
}

function safetyLabel(status: string) {
  if (status === 'safe') return 'SAFE';
  if (status === 'caution') return 'CAUTION';
  return 'UNSAFE';
}

function DestCard({ city, state, km, safety, status, onPress }: any) {
  const colors = safetyColor(status);
  return (
    <button onClick={onPress}
      className="glass-card w-full flex items-center gap-3 p-3 text-left">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#E8F8FD' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z" fill="#3FC2E5" />
          <circle cx="12" cy="9" r="2.5" fill="white" />
        </svg>
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold" style={{ color: '#102A36' }}>{city}</p>
        <p className="text-xs" style={{ color: '#607580' }}>{state} · {km}</p>
      </div>
      <div className="flex flex-col items-end gap-1">
        <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: colors.bg, color: colors.text }}>
          {safetyLabel(status)}
        </span>
        <span className="text-xs" style={{ color: '#607580' }}>{safety}/100</span>
      </div>
    </button>
  );
}


function MapSearch({ onPick }: { onPick: (name: string, lat: number, lon: number) => void }) {
  const el = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  const [pickedLL, setPickedLL] = useState<L.LatLngTuple | null>(null);
  const [error, setError] = useState('');
  const [sugs, setSugs] = useState<Sug[]>([]);
  const [open, setOpen] = useState(false);
  const skipNext = useRef(false);

  useEffect(() => {
    if (skipNext.current) { skipNext.current = false; return; }
    const term = q.trim();
    if (term.length < 2) { setSugs([]); return; }
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const c = mapRef.current?.getCenter();
        const list = await fetchPlaces(term, ctrl.signal, c && mapRef.current!.getZoom() > 6 ? [c.lat, c.lng] : undefined);
        setSugs(list);
        setOpen(true);
      } catch { /* aborted or offline */ }
    }, 350);
    return () => { clearTimeout(t); ctrl.abort(); };
  }, [q]);

  const choose = (sg: Sug) => {
    skipNext.current = true;
    setQ(sg.name);
    setSugs([]);
    setOpen(false);
    place(sg.lat, sg.lon, sg.name);
    mapRef.current?.flyTo([sg.lat, sg.lon], ['city', 'state', 'country', 'administrative'].includes(sg.kind || '') ? 11 : 16);
  };

  const place = (lat: number, lon: number, name: string) => {
    const map = mapRef.current;
    if (!map) return;
    const ll: L.LatLngTuple = [lat, lon];
    if (markerRef.current) markerRef.current.setLatLng(ll);
    else markerRef.current = L.marker(ll, { icon: L.divIcon({
      className: '', iconSize: [22, 22], iconAnchor: [11, 11],
      html: '<div style="width:22px;height:22px;border-radius:50%;background:#FF3B30;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.35)"></div>',
    }) }).addTo(map);
    setPicked(name);
    setPickedLL(ll);
    setError('');
  };

  useEffect(() => {
    if (!el.current) return;
    const map = L.map(el.current, { zoomControl: false, attributionControl: false }).setView([22.5, 79], 4);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
    L.control.zoom({ position: 'topright' }).addTo(map);
    mapRef.current = map;
    map.on('click', async (e: L.LeafletMouseEvent) => {
      place(e.latlng.lat, e.latlng.lng, 'Dropped pin…');
      try {
        const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&zoom=10&lat=${e.latlng.lat}&lon=${e.latlng.lng}`);
        const d = await r.json();
        const a = d.address || {};
        setPicked(a.city || a.town || a.village || a.county || a.state || d.display_name || 'Selected location');
      } catch {
        setPicked('Selected location');
      }
    });
    setTimeout(() => map.invalidateSize(), 0);
    return () => { map.remove(); mapRef.current = null; markerRef.current = null; };
  }, []);

  const search = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    if (sugs[0]) { choose(sugs[0]); return; }
    setBusy(true);
    setError('');
    setOpen(false);
    try {
      const r = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`);
      const d = await r.json();
      if (!d.length) { setError('Place not found. Try another name or tap the map.'); }
      else {
        place(+d[0].lat, +d[0].lon, d[0].display_name.split(',')[0]);
        mapRef.current?.flyTo([+d[0].lat, +d[0].lon], 11);
      }
    } catch {
      setError('Search failed. Check your connection.');
    }
    setBusy(false);
  };

  return (
    <div className="rounded-2xl bg-white" style={{ border: '1px solid #D9E7EC' }}>
      <div className="relative p-3">
        <form onSubmit={search} className="flex gap-2">
          <input value={q} onChange={(e) => { setQ(e.target.value); setOpen(true); }}
            onFocus={() => sugs.length && setOpen(true)}
            placeholder="Search any place on the map…" autoComplete="off"
            className="flex-1 min-w-0 text-sm rounded-xl px-3 py-2 outline-none"
            style={{ backgroundColor: '#F2F2F7', border: '1px solid #D9E7EC', color: '#102A36' }} />
          <button type="submit" disabled={busy} className="px-4 rounded-xl text-sm font-semibold text-white"
            style={{ backgroundColor: '#19B5A5' }}>{busy ? '…' : 'Go'}</button>
        </form>
        {open && sugs.length > 0 && (
          <ul className="absolute left-3 right-3 top-full -mt-1 rounded-xl bg-white overflow-hidden"
            style={{ zIndex: 1000, border: '1px solid #D9E7EC', boxShadow: '0 8px 24px rgba(7,59,76,0.18)' }}>
            {sugs.map((sg, i) => (
              <li key={i}>
                <button type="button" onClick={() => choose(sg)}
                  className="w-full flex items-start gap-2 px-3 py-2 text-left"
                  style={{ borderTop: i ? '1px solid #EEF4F6' : 'none' }}>
                  <svg className="mt-0.5 shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z" fill="#3FC2E5" />
                  </svg>
                  <span className="min-w-0">
                    <span className="flex items-center gap-2">
                      <span className="text-sm font-semibold truncate" style={{ color: '#102A36' }}>{sg.name}</span>
                      {sg.kind && <span className="shrink-0 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded" style={{ backgroundColor: '#E8F8FD', color: '#19B5A5' }}>{sg.kind}</span>}
                    </span>
                    <span className="block text-[11px] truncate" style={{ color: '#607580' }}>{sg.full}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="relative h-56 overflow-hidden">
        <div ref={el} className="absolute inset-0" />
      </div>
      <div className="p-3">
        {error && <p className="text-xs mb-2" style={{ color: '#FF3B30' }}>{error}</p>}
        <p className="text-xs mb-2" style={{ color: '#607580' }}>
          {picked ? <>Selected: <b style={{ color: '#102A36' }}>{picked}</b></> : 'Search above or tap the map to drop a pin.'}
        </p>
        <button disabled={!picked || picked === 'Dropped pin…'} onClick={() => picked && pickedLL && onPick(picked, pickedLL[0], pickedLL[1])}
          className="w-full py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-40"
          style={{ backgroundColor: '#073B4C' }}>
          Check safety of this place
        </button>
      </div>
    </div>
  );
}

export default function ExploreScreen() {
  const { navigate } = useNav();
  const [query, setQuery] = useState('');
  const [showMap, setShowMap] = useState(false);
  const [pickLoc, setPickLoc] = useState(false);
  const [loc] = useCurrentLocation();
  const [places, setPlaces] = useState<Sug[]>([]);
  const [showSug, setShowSug] = useState(false);

  useEffect(() => {
    const term = query.trim();
    if (term.length < 2) { setPlaces([]); return; }
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try { setPlaces(await fetchPlaces(term, ctrl.signal)); } catch { /* aborted or offline */ }
    }, 350);
    return () => { clearTimeout(t); ctrl.abort(); };
  }, [query]);

  const filtered = popular.filter(d =>
    d.city.toLowerCase().includes(query.toLowerCase()) ||
    d.state.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: '#F2F2F7' }}>
      <div className="hero-sky">
        <div className="px-5 pt-3 pb-3">
          <h1 className="text-xl font-bold" style={{ color: '#073B4C' }}>Explore</h1>
          <p className="text-xs" style={{ color: '#2E6B7E' }}>Where do you want to go?</p>
        </div>
        <div className="px-4 pb-6">
          <div className="relative">
          <div className="flex items-center gap-3 rounded-2xl px-4 py-3 bg-white">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="7" stroke="#19B5A5" strokeWidth="2" />
              <path d="M16.5 16.5L21 21" stroke="#19B5A5" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              className="flex-1 text-sm bg-transparent outline-none"
              style={{ color: '#102A36' }}
              placeholder="Search city, area, street or place…"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setShowSug(true); }}
              onFocus={() => setShowSug(true)}
              onBlur={() => setTimeout(() => setShowSug(false), 150)}
              autoComplete="off"
            />
            {query && (
              <button onClick={() => setQuery('')} style={{ color: '#607580' }}>✕</button>
            )}
          </div>
          {showSug && query.trim().length >= 2 && places.length > 0 && (
            <ul className="absolute left-0 right-0 top-full mt-2 rounded-2xl bg-white overflow-hidden max-h-72 overflow-y-auto"
              style={{ zIndex: 50, boxShadow: '0 12px 28px rgba(7,59,76,0.28)' }}>
              {places.map((sg, i) => (
                <li key={i}>
                  <button type="button" onMouseDown={(e) => e.preventDefault()}
                    onClick={() => navigate('destination-safety', { city: sg.name, lat: sg.lat, lon: sg.lon })}
                    className="w-full flex items-start gap-2 px-4 py-2.5 text-left"
                    style={{ borderTop: i ? '1px solid #EEF4F6' : 'none' }}>
                    <svg className="mt-0.5 shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z" fill="#3FC2E5" />
                    </svg>
                    <span className="min-w-0">
                      <span className="flex items-center gap-2">
                        <span className="text-sm font-semibold truncate" style={{ color: '#102A36' }}>{sg.name}</span>
                        {sg.kind && <span className="shrink-0 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded" style={{ backgroundColor: '#E8F8FD', color: '#19B5A5' }}>{sg.kind}</span>}
                      </span>
                      <span className="block text-[11px] truncate" style={{ color: '#607580' }}>{sg.full}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-28 px-4 pt-4 space-y-5">
        {/* Current location */}
        <div className="glass-card flex items-center gap-3 p-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#E8F8FD' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="4" fill="#19B5A5" />
              <path d="M12 2V6M12 18V22M2 12H6M18 12H22" stroke="#19B5A5" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold" style={{ color: '#102A36' }}>Current Location</p>
            <p className="text-xs truncate" style={{ color: '#607580' }}>{loc.name}</p>
          </div>
          <button onClick={() => setPickLoc(true)} className="ml-auto text-xs font-semibold px-3 py-1.5 rounded-full"
            style={{ backgroundColor: '#E8F8FD', color: '#19B5A5' }}>Change</button>
        </div>

        {/* Manual map search */}
        <div>
          <button onClick={() => setShowMap(v => !v)}
            className="w-full flex items-center gap-3 p-3 rounded-2xl text-left"
            style={{ backgroundColor: showMap ? '#E8F8FD' : 'white', border: '1px solid #D9E7EC' }}>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#E8F8FD' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M9 4L3 6.5V20L9 17.5L15 20L21 17.5V4L15 6.5L9 4Z" stroke="#19B5A5" strokeWidth="2" strokeLinejoin="round" />
                <path d="M9 4V17.5M15 6.5V20" stroke="#19B5A5" strokeWidth="2" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold" style={{ color: '#102A36' }}>Search on map</p>
              <p className="text-xs" style={{ color: '#607580' }}>Find or pin any place manually</p>
            </div>
            <span style={{ color: '#607580' }}>{showMap ? '▲' : '▼'}</span>
          </button>
          {showMap && (
            <div className="mt-2">
              <MapSearch onPick={(city, lat, lon) => navigate('destination-safety', { city, lat, lon })} />
            </div>
          )}
        </div>

        {/* Recent */}
        {!query && (
          <div>
            <p className="text-sm font-semibold mb-2" style={{ color: '#102A36' }}>Recent Destination</p>
            <div className="space-y-2">
              {recent.map((d) => (
                <DestCard key={d.city} {...d} onPress={() => navigate('destination-safety', { city: d.city, lat: coords[d.city]?.[0], lon: coords[d.city]?.[1] })} />
              ))}
            </div>
          </div>
        )}

        {/* Popular / search results */}
        <div>
          <p className="text-xs font-semibold mb-2" style={{ color: '#607580' }}>
            {query ? 'RESULTS' : 'POPULAR DESTINATIONS'}
          </p>
          <div className="space-y-2">
            {filtered.map((d) => (
              <DestCard key={d.city} {...d} onPress={() => navigate('destination-safety', { city: d.city, lat: coords[d.city]?.[0], lon: coords[d.city]?.[1] })} />
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-8">
                <p className="text-sm" style={{ color: '#607580' }}>No destinations found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {pickLoc && <LocationPicker onClose={() => setPickLoc(false)} />}
      <BottomNav />
    </div>
  );
}
