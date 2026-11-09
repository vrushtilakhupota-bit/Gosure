import L from 'leaflet';

export type Route = {
  id: number; label: string; distance: string; time: string; safety: 'HIGH' | 'MEDIUM' | 'LOW';
  safetyScore: number; color: string; bg: string; via: string; tag: string; path: L.LatLngTuple[];
};

const fmtDist = (m: number) => (m >= 100000 ? `${Math.round(m / 1000)} km` : `${(m / 1000).toFixed(1)} km`);
const fmtTime = (s: number) => {
  const m = Math.round(s / 60);
  return m < 60 ? `${m} min` : `${Math.floor(m / 60)}h ${m % 60}m`;
};

export async function loadRoutes(from: L.LatLngTuple, to: L.LatLngTuple, signal: AbortSignal): Promise<Route[]> {
  const url = `https://router.project-osrm.org/route/v1/driving/${from[1]},${from[0]};${to[1]},${to[0]}?alternatives=3&overview=full&geometries=geojson&steps=true`;
  const r = await fetch(url, { signal });
  const d = await r.json();
  if (d.code !== 'Ok' || !d.routes?.length) throw new Error('no route');
  const raw = d.routes.slice(0, 3).map((rt: any) => {
    const byRoad: Record<string, number> = {};
    rt.legs.forEach((l: any) => l.steps.forEach((st: any) => { if (st.name) byRoad[st.name] = (byRoad[st.name] || 0) + st.distance; }));
    const via = Object.entries(byRoad).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([n]) => n).join(' · ') || 'Main roads';
    return {
      distance: rt.distance as number, duration: rt.duration as number, via,
      speed: rt.distance / rt.duration,
      path: rt.geometry.coordinates.map((c: number[]) => [c[1], c[0]] as L.LatLngTuple),
    };
  });
  // Heuristic safety: faster average speed means more arterial roads/highways, which are usually busier and better lit.
  const order = [...raw.keys()].sort((a, b) => raw[b].speed - raw[a].speed);
  const fastest = [...raw.keys()].sort((a, b) => raw[a].duration - raw[b].duration)[0];
  const styles = [
    { safety: 'HIGH' as const, score: 90, color: '#22A06B', bg: '#E6F4EE', label: 'Recommended Safe Route' },
    { safety: 'MEDIUM' as const, score: 72, color: '#F4B740', bg: '#FFF8E6', label: 'Alternative Route' },
    { safety: 'LOW' as const, score: 52, color: '#E53935', bg: '#FFF0F0', label: 'Less Preferred Route' },
  ];
  return order.map((idx, rank) => {
    const x = raw[idx], st = styles[rank];
    return {
      id: rank + 1, label: st.label, distance: fmtDist(x.distance), time: fmtTime(x.duration),
      safety: st.safety, safetyScore: st.score, color: st.color, bg: st.bg, via: x.via,
      tag: rank === 0 ? 'Recommended' : idx === fastest ? 'Fastest' : rank === 2 ? 'Avoid at night' : 'Alternative',
      path: x.path,
    };
  });
}
