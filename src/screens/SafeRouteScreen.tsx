import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useNav } from '../context/NavContext';
import { loadRoutes, type Route } from '../lib/routing';
import { useCurrentLocation } from '../lib/currentLocation';
import Header from '../components/Header';

const DEFAULT_DEST: L.LatLngTuple = [23.012, 72.51];

const dot = (color: string, size: number) =>
  L.divIcon({
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.3)"></div>`,
  });

export default function SafeRouteScreen() {
  const { navigate, params } = useNav();
  const [cur] = useCurrentLocation();
  const [selected, setSelected] = useState(1);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading');
  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const routeLayer = useRef<L.LayerGroup | null>(null);

  const START: L.LatLngTuple = [cur.lat, cur.lon];
  const END: L.LatLngTuple = typeof params.lat === 'number' ? [params.lat, params.lon] : DEFAULT_DEST;

  useEffect(() => {
    if (!mapEl.current) return;
    const map = L.map(mapEl.current, { zoomControl: false, attributionControl: false }).setView(START, 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
    L.marker(START, { icon: dot('#19B5A5', 20) }).bindTooltip('You', { permanent: true, direction: 'bottom', offset: [0, 10] }).addTo(map);
    L.marker(END, { icon: dot('#073B4C', 20) }).bindTooltip(params.city || 'Destination', { permanent: true, direction: 'bottom', offset: [0, 10] }).addTo(map);
    routeLayer.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    setTimeout(() => map.invalidateSize(), 0);
    return () => { map.remove(); mapRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cur.lat, cur.lon, END[0], END[1]]);

  useEffect(() => {
    const ctrl = new AbortController();
    setStatus('loading');
    loadRoutes(START, END, ctrl.signal)
      .then((r) => { setRoutes(r); setSelected(1); setStatus('ok'); })
      .catch((e) => { if (e.name !== 'AbortError') { setRoutes([]); setStatus('error'); } });
    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cur.lat, cur.lon, END[0], END[1]]);

  const selectedRoute = routes.find(r => r.id === selected);

  useEffect(() => {
    const map = mapRef.current;
    const layer = routeLayer.current;
    if (!map || !layer) return;
    layer.clearLayers();
    if (!routes.length) return;
    [...routes].sort((a) => (a.id === selected ? 1 : -1)).forEach((r) => {
      const on = r.id === selected;
      L.polyline(r.path, { color: on ? r.color : '#9FB3BB', weight: on ? 6 : 4, opacity: on ? 0.95 : 0.7, lineCap: 'round' })
        .addTo(layer).on('click', () => setSelected(r.id));
    });
    const sel = routes.find(r => r.id === selected)!;
    map.fitBounds(L.polyline(sel.path).getBounds(), { padding: [30, 30] });
  }, [selected, routes]);

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: '#F2F2F7' }}>
      <Header title="Safe Routes" dark />

      {/* Mini map preview */}
      <div className="relative h-44 shrink-0" style={{ backgroundColor: '#E8F4F8' }}>
        <div ref={mapEl} className="absolute inset-0" />
      </div>

      <div className="flex-1 overflow-y-auto pb-6 px-4 pt-4 space-y-3">
        <p className="text-xs font-semibold" style={{ color: '#607580' }}>SELECT YOUR ROUTE</p>
        {status === 'loading' && <p className="text-sm py-6 text-center" style={{ color: '#607580' }}>Finding real routes…</p>}
        {status === 'error' && <p className="text-sm py-6 text-center" style={{ color: '#FF3B30' }}>No drivable route found between these places, or you are offline.</p>}

        {routes.map((route) => {
          const active = selected === route.id;
          return (
            <button key={route.id} onClick={() => setSelected(route.id)}
              className="w-full rounded-2xl p-4 text-left transition-all"
              style={{
                backgroundColor: active ? route.bg : 'white',
                border: `2px solid ${active ? route.color : '#D9E7EC'}`,
              }}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <p className="text-sm font-semibold" style={{ color: '#102A36' }}>{route.label}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#607580' }}>via {route.via}</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-1 rounded-full text-white shrink-0 ml-2"
                  style={{ backgroundColor: route.color }}>
                  {route.tag}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-base font-bold" style={{ color: '#102A36' }}>{route.distance}</p>
                  <p className="text-xs" style={{ color: '#607580' }}>distance</p>
                </div>
                <div>
                  <p className="text-base font-bold" style={{ color: '#102A36' }}>{route.time}</p>
                  <p className="text-xs" style={{ color: '#607580' }}>estimated</p>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-semibold" style={{ color: route.color }}>Safety: {route.safety}</p>
                    <p className="text-xs" style={{ color: '#607580' }}>{route.safetyScore}%</p>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#D9E7EC' }}>
                    <div className="h-full rounded-full" style={{ width: `${route.safetyScore}%`, backgroundColor: route.color }} />
                  </div>
                </div>
              </div>
            </button>
          );
        })}

        {selectedRoute?.safety === 'LOW' && (
          <div className="rounded-2xl p-3 flex gap-3 items-start" style={{ backgroundColor: '#FFF0F0', border: '1px solid #FF3B30' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" fill="#FF3B30" />
              <text x="12" y="17" textAnchor="middle" fontSize="11" fill="white" fontWeight="800">!</text>
            </svg>
            <p className="text-xs leading-relaxed" style={{ color: '#FF3B30' }}>
              This route is estimated to be less safe at night. Consider choosing a safer route.
            </p>
          </div>
        )}
      </div>

      <div className="px-4 pb-6 pt-3 bg-white" style={{ borderTop: '1px solid #D9E7EC' }}>
        <button onClick={() => navigate('active-journey', { city: params.city, lat: params.lat, lon: params.lon, routeId: selected })} disabled={status !== 'ok'}
          className="w-full py-4 rounded-2xl font-semibold text-white text-base disabled:opacity-40"
          style={{ backgroundColor: '#19B5A5' }}>
          Choose Route → Start Journey
        </button>
      </div>
    </div>
  );
}
