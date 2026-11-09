export type Sug = { name: string; full: string; kind?: string; lat: number; lon: number };


export async function fetchPlaces(term: string, signal: AbortSignal, bias?: [number, number]): Promise<Sug[]> {
  const b = bias ? `&lat=${bias[0]}&lon=${bias[1]}` : '';
  const r = await fetch(`https://photon.komoot.io/api/?limit=10&q=${encodeURIComponent(term)}${b}`, { signal });
  const d = await r.json();
  const seen = new Set<string>();
  return (d.features || []).map((f: any) => {
    const p = f.properties || {};
    const street = [p.housenumber, p.street].filter(Boolean).join(' ');
    const title = p.name || street || p.district || p.city || 'Unnamed place';
    const parts = [p.name ? street : '', p.district, p.locality, p.city, p.county, p.state, p.country].filter((x: string, i: number, arr: string[]) => x && x !== title && arr.indexOf(x) === i);
    const kind = (p.osm_value || p.type || '').replace(/_/g, ' ');
    return { name: title, full: parts.join(', '), kind, lat: f.geometry.coordinates[1], lon: f.geometry.coordinates[0] };
  }).filter((x: Sug) => { const k = `${x.name}|${x.full}`; if (seen.has(k)) return false; seen.add(k); return true; });
}
