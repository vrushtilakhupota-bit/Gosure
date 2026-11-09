import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { loadRoutes } from '../lib/routing';
import { useCurrentLocation } from '../lib/currentLocation';
import { useNav } from '../context/NavContext';
import Header from '../components/Header';

const pin = (color: string, label: string, size = 26) =>
  L.divIcon({
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;color:#fff;font:700 11px Inter,sans-serif">${label}</div>`,
  });

const BASE: L.LatLngTuple = [23.0395, 72.5660];

export default function MapScreen() {
  const mapEl = useRef<HTMLDivElement>(null);
  const { navigate, params } = useNav();
  const [cur] = useCurrentLocation();
  const [showLegend, setShowLegend] = useState(true);
  const hasDest = typeof params.lat === 'number' && typeof params.lon === 'number';

  useEffect(() => {
    if (!mapEl.current) return;
    const hasLL = typeof params.lat === 'number' && typeof params.lon === 'number';
    const YOU: L.LatLngTuple = [cur.lat, cur.lon];
    const DEST: L.LatLngTuple = hasLL ? [params.lat, params.lon] : [YOU[0] - 0.022, YOU[1] + 0.02];
    const p = (lat: number, lon: number): L.LatLngTuple => [lat - BASE[0] + DEST[0], lon - BASE[1] + DEST[1]];
    const map = L.map(mapEl.current, { zoomControl: false }).setView(DEST, 14);
    const view = L.latLngBounds([YOU, ...(hasLL ? [DEST] : []), p(23.0165, 72.5845), p(23.03, 72.561), p(23.035, 72.5775), p(23.027, 72.556), p(23.019, 72.564)]);
    map.fitBounds(view, { padding: [40, 40] });
    L.control.zoom({ position: 'topright' }).addTo(map);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    const zone = (c: L.LatLngTuple, r: number, color: string, label: string, fill: number) =>
      L.circle(c, { radius: r, color, weight: 2, dashArray: '6 4', fillColor: color, fillOpacity: fill })
        .bindTooltip(label, { direction: 'top' }).addTo(map);
    zone(p(23.0165, 72.5845), 450, '#FF3B30', 'Unsafe zone: avoid after dark', 0.25);
    zone(p(23.0300, 72.5610), 380, '#FF9F0A', 'Caution zone: crowded, watch belongings', 0.2);

    const ctrl = new AbortController();
    const bend = (k: number): L.LatLngTuple[] => {
      const mid: L.LatLngTuple = [(YOU[0] + DEST[0]) / 2 + k * (DEST[1] - YOU[1]), (YOU[1] + DEST[1]) / 2 - k * (DEST[0] - YOU[0])];
      return [YOU, mid, DEST];
    };
    const fallback = [{ tag: 'Recommended', path: bend(0.25) }, { tag: 'Fastest', path: bend(-0.1) }] as any[];
    if (hasLL) loadRoutes(YOU, DEST, ctrl.signal).catch(() => fallback).then((rs: any[]) => {
      if (ctrl.signal.aborted) return;
      const safe = rs[0];
      const normal = rs.find((r) => r.tag === 'Fastest' && r !== safe) || rs[1] || { path: bend(-0.1) };
      if (normal) L.polyline(normal.path, { color: '#3FC2E5', weight: 5, opacity: 0.9 }).bindTooltip('Normal route').addTo(map);
      if (safe) L.polyline(safe.path, { color: '#34C759', weight: 6, dashArray: '2 10', lineCap: 'round' }).bindTooltip('Safe route').addTo(map);
      rs.forEach((r) => r.path.forEach((pt: L.LatLngTuple) => view.extend(pt)));
      map.fitBounds(view, { padding: [40, 40] });
    });

    L.marker(p(23.0350, 72.5775), { icon: pin('#3FC2E5', 'P', 24) }).bindTooltip('Police station').addTo(map);
    L.marker(p(23.0270, 72.5560), { icon: pin('#3FC2E5', 'P', 24) }).bindTooltip('Police station').addTo(map);
    L.marker(p(23.0190, 72.5640), { icon: pin('#FF3B30', '+', 24) }).bindTooltip('Hospital').addTo(map);
    if (hasLL) L.marker(DEST, { icon: pin('#FF3B30', '', 28) }).bindTooltip('Destination', { permanent: true, direction: 'top', offset: [0, -14] }).addTo(map);
    L.marker(YOU, { icon: pin('#19B5A5', '', 22) }).bindTooltip('You', { permanent: true, direction: 'bottom', offset: [0, 12] }).addTo(map);

    setTimeout(() => map.invalidateSize(), 0);
    return () => { ctrl.abort(); map.remove(); };
  }, [params.lat, params.lon, cur.lat, cur.lon]);

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: '#F2F2F7' }}>
      <Header title={params.city ? `${params.city} · Unsafe Area Map` : 'Unsafe Area Map'} dark rightElement={
        <button onClick={() => setShowLegend(!showLegend)}
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ backgroundColor: 'rgba(255,255,255,0.6)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="6" width="18" height="2" rx="1" fill="#073B4C" />
            <rect x="3" y="11" width="18" height="2" rx="1" fill="#073B4C" />
            <rect x="3" y="16" width="18" height="2" rx="1" fill="#073B4C" />
          </svg>
        </button>
      } />

      {/* Map area */}
      <div className="relative flex-1">
        <div ref={mapEl} className="absolute inset-0" style={{ zIndex: 0 }} />

        {/* Legend */}
        {showLegend && (
          <div className="absolute bottom-4 left-4 right-4 rounded-2xl p-3 bg-white shadow-lg" style={{ zIndex: 1000, border: '1px solid #D9E7EC' }}>
            <div className="grid grid-cols-2 gap-2">
              {[
                { color: '#34C759', label: 'Safe Route', dashed: true },
                { color: '#3FC2E5', label: 'Normal Route', dashed: false },
                { color: '#FF3B30', label: 'Unsafe Zone', dashed: false, fill: true },
                { color: '#FF9F0A', label: 'Caution Zone', dashed: false, fill: true },
                { color: '#19B5A5', label: 'Your Location', circle: true },
                { color: '#3FC2E5', label: 'Police Station', circle: true },
              ].filter((item) => hasDest || !/Route/.test(item.label)).map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  {item.circle ? (
                    <div className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  ) : item.fill ? (
                    <div className="w-4 h-3 rounded shrink-0 opacity-40" style={{ backgroundColor: item.color, border: `2px dashed ${item.color}` }} />
                  ) : (
                    <div className="w-5 h-0.5 shrink-0 rounded-full" style={{ backgroundColor: item.color, borderTop: item.dashed ? `2px dashed ${item.color}` : 'none' }} />
                  )}
                  <span className="text-[10px]" style={{ color: '#607580' }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="px-4 pb-6 pt-3 bg-white" style={{ borderTop: '1px solid #D9E7EC' }}>
        <button onClick={() => (hasDest ? navigate('safe-route', { city: params.city, lat: params.lat, lon: params.lon }) : navigate('explore'))}
          className="w-full py-4 rounded-2xl font-semibold text-white text-base"
          style={{ backgroundColor: '#19B5A5' }}>
          {hasDest ? 'Choose Safe Route' : 'Search a Destination'}
        </button>
      </div>
    </div>
  );
}
