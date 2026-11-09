import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useCurrentLocation } from '../lib/currentLocation';

export default function MiniMap({ onOpen }: { onOpen: () => void }) {
  const el = useRef<HTMLDivElement>(null);
  const [cur] = useCurrentLocation();

  useEffect(() => {
    if (!el.current) return;
    const map = L.map(el.current, {
      zoomControl: false, attributionControl: false, dragging: false, scrollWheelZoom: false,
      doubleClickZoom: false, touchZoom: false, boxZoom: false, keyboard: false,
    }).setView([cur.lat, cur.lon], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
    L.marker([cur.lat, cur.lon], {
      interactive: false,
      icon: L.divIcon({ className: '', iconSize: [22, 22], iconAnchor: [11, 11],
        html: '<div style="width:22px;height:22px;border-radius:50%;background:#007AFF;border:3px solid #fff;box-shadow:0 0 0 10px rgba(0,122,255,.18),0 2px 6px rgba(0,0,0,.3)"></div>' }),
    }).addTo(map);
    setTimeout(() => map.invalidateSize(), 0);
    return () => { map.remove(); };
  }, [cur.lat, cur.lon]);

  return (
    <button onClick={onOpen} className="relative block w-full overflow-hidden text-left" style={{ height: 150, borderRadius: 26, boxShadow: '0 8px 24px rgba(7,59,76,0.1)' }}>
      <div ref={el} className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }} />
      <div className="absolute left-3 bottom-3 right-3 glass-bar rounded-full px-4 py-2 flex items-center justify-between" style={{ zIndex: 1000 }}>
        <span className="min-w-0">
          <span className="block text-[11px]" style={{ color: '#6C6C70' }}>You are near</span>
          <span className="block text-[14px] font-semibold truncate" style={{ color: '#000' }}>{cur.name.split(',')[0]}</span>
        </span>
        <span className="text-[13px] font-semibold shrink-0 ml-3" style={{ color: '#19B5A5' }}>Open map ›</span>
      </div>
    </button>
  );
}
