import { useState } from 'react';
import Header from '../components/Header';
import { useCurrentLocation } from '../lib/currentLocation';

type Scam = { id: number; title: string; cat: string; area: string; desc: string; tip: string; seen: number; when: string; mine?: boolean };

const CATS = ['All', 'Transport', 'Money', 'Tourist traps', 'Online', 'Accommodation'];

const SEED: Scam[] = [
  { id: 1, title: 'Meter "broken" taxi & auto rickshaws', cat: 'Transport', area: 'Railway stations, airports', desc: 'Drivers claim the meter is broken and quote a flat fare 3-5x higher, or take a long detour.', tip: 'Use a ride-hailing app or prepaid taxi booth. Agree the price on the app before you get in.', seen: 214, when: '2 days ago' },
  { id: 2, title: 'Fake "tourist office" or closed-attraction story', cat: 'Tourist traps', area: 'Near major monuments', desc: 'A friendly stranger says the attraction is closed today and steers you to a shop or agency.', tip: 'Check opening hours on the official site. Politely decline and keep walking.', seen: 187, when: '5 days ago' },
  { id: 3, title: 'Overcharged currency exchange', cat: 'Money', area: 'Airports, tourist streets', desc: 'Booths advertise a good rate, then add hidden commission or hand back short change.', tip: 'Count your cash at the counter and ask for the final amount in writing before handing over money.', seen: 143, when: '1 week ago' },
  { id: 4, title: 'Fake booking sites & lookalike apps', cat: 'Online', area: 'Online', desc: 'Copycat hotel and ticket sites take payment for bookings that do not exist.', tip: 'Book through official apps. Check the web address and never pay by direct bank or UPI transfer to a stranger.', seen: 305, when: '3 days ago' },
  { id: 5, title: 'Hotel "overbooked, we moved you" swap', cat: 'Accommodation', area: 'Budget hotels near stations', desc: 'A driver or tout says your hotel is full or closed and takes you to a pricier partner place.', tip: 'Call the hotel yourself using the number on your booking confirmation.', seen: 96, when: '2 weeks ago' },
  { id: 6, title: 'Spiked drinks / "friendly" invitations', cat: 'Tourist traps', area: 'Nightlife areas', desc: 'New acquaintances invite you for drinks or tea; victims lose belongings or are overcharged massively.', tip: 'Never leave a drink unattended and avoid accepting food or drink from strangers.', seen: 121, when: '4 days ago' },
  { id: 7, title: 'Distraction theft & "spilled sauce"', cat: 'Money', area: 'Crowded markets, trains', desc: 'Someone stains your clothes or bumps you while a partner lifts your phone or wallet.', tip: 'Keep valuables in front pockets or a cross-body bag. Step away from helpers who approach after a "spill".', seen: 168, when: '1 week ago' },
  { id: 8, title: 'Unlicensed guides & forced "donations"', cat: 'Tourist traps', area: 'Temples, ghats, forts', desc: 'Unofficial guides or priests pressure you for large donations or tips after a short "tour".', tip: 'Use government-approved guides with ID badges and agree the fee first.', seen: 89, when: '3 weeks ago' },
];

export default function ScamAlertsScreen() {
  const [cur] = useCurrentLocation();
  const [cat, setCat] = useState('All');
  const [scams, setScams] = useState<Scam[]>(() => {
    try { return [...JSON.parse(localStorage.getItem('gosure.scams') || '[]'), ...SEED]; } catch { return SEED; }
  });
  const [open, setOpen] = useState<number | null>(null);
  const [confirmed, setConfirmed] = useState<number[]>([]);
  const [form, setForm] = useState(false);
  const [draft, setDraft] = useState({ title: '', cat: 'Transport', desc: '' });

  const list = scams.filter((s) => cat === 'All' || s.cat === cat);

  const submit = () => {
    if (!draft.title.trim()) return;
    const s: Scam = { id: Date.now(), title: draft.title.trim(), cat: draft.cat, area: cur.name.split(',')[0], desc: draft.desc.trim() || 'Reported by a traveler.', tip: 'Stay alert and avoid this if it happens to you. Report to local police if you lost money.', seen: 1, when: 'Just now', mine: true };
    const mine = scams.filter((x) => x.mine);
    try { localStorage.setItem('gosure.scams', JSON.stringify([s, ...mine])); } catch { /* ignore */ }
    setScams([s, ...scams]); setForm(false); setDraft({ title: '', cat: 'Transport', desc: '' });
  };

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: '#F2F2F7' }}>
      <Header title="Local Scam Alerts" dark rightElement={
        <button onClick={() => setForm(true)} className="px-3 h-9 rounded-full text-xs font-semibold" style={{ backgroundColor: 'rgba(255,255,255,0.7)', color: '#073B4C' }}>+ Report</button>
      } />
      <div className="flex gap-2 px-4 pt-3 pb-2 overflow-x-auto shrink-0">
        {CATS.map((c) => (
          <button key={c} onClick={() => setCat(c)} aria-pressed={cat === c} className="ios-chip">{c}</button>
        ))}
      </div>
      <p className="px-4 pb-2 text-[11px]" style={{ color: '#607580' }}>Common travel scams reported by travelers. Staying near {cur.name.split(',')[0]}.</p>

      <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-2">
        {list.length === 0 && <p className="text-center text-sm py-10" style={{ color: '#607580' }}>No reports in this category.</p>}
        {list.map((s) => {
          const isOpen = open === s.id, did = confirmed.includes(s.id);
          return (
            <div key={s.id} className="glass-card p-4">
              <button className="w-full text-left" onClick={() => setOpen(isOpen ? null : s.id)}>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0" style={{ backgroundColor: '#FFF8E6' }}>⚠️</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold" style={{ color: '#102A36' }}>{s.title}</p>
                    <p className="text-[11px] mt-0.5" style={{ color: '#607580' }}>{s.cat} · {s.area} · {s.when}{s.mine ? ' · by you' : ''}</p>
                  </div>
                </div>
              </button>
              {isOpen && (
                <div className="mt-3 space-y-2">
                  <p className="text-xs" style={{ color: '#102A36' }}>{s.desc}</p>
                  <div className="rounded-xl p-3 text-xs" style={{ backgroundColor: '#E6F9F7', color: '#0E6F64' }}><b>How to stay safe:</b> {s.tip}</div>
                </div>
              )}
              <div className="flex items-center justify-between mt-3">
                <span className="text-[11px]" style={{ color: '#607580' }}>{s.seen + (did ? 1 : 0)} travelers reported this</span>
                <button disabled={did} onClick={() => setConfirmed([...confirmed, s.id])} className="px-3 py-1.5 rounded-full text-[11px] font-semibold"
                  style={{ backgroundColor: did ? '#E6F4EE' : 'white', color: did ? '#34C759' : '#19B5A5', border: '1px solid #D9E7EC' }}>{did ? '✓ Thanks' : 'I saw this too'}</button>
              </div>
            </div>
          );
        })}
      </div>

      {form && (
        <div className="absolute inset-0 flex items-end" style={{ backgroundColor: 'rgba(0,0,0,0.45)', zIndex: 50 }} onClick={() => setForm(false)}>
          <div className="w-full rounded-t-3xl p-5 bg-white" onClick={(e) => e.stopPropagation()}>
            <div className="ios-grabber" />
            <h3 className="text-lg font-bold mb-3 text-center" style={{ color: '#102A36' }}>Report a scam</h3>
            <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="What happened? (short title)" className="w-full rounded-xl px-3 py-3 text-sm outline-none mb-2" style={{ backgroundColor: '#F2F2F7' }} />
            <select value={draft.cat} onChange={(e) => setDraft({ ...draft, cat: e.target.value })} className="w-full rounded-xl px-3 py-3 text-sm outline-none mb-2" style={{ backgroundColor: '#F2F2F7' }}>
              {CATS.slice(1).map((c) => <option key={c}>{c}</option>)}
            </select>
            <textarea value={draft.desc} onChange={(e) => setDraft({ ...draft, desc: e.target.value })} placeholder="Details (optional)" rows={3} className="w-full rounded-xl px-3 py-3 text-sm outline-none mb-3" style={{ backgroundColor: '#F2F2F7' }} />
            <div className="flex gap-3">
              <button onClick={() => setForm(false)} className="flex-1 py-3.5 text-sm font-semibold" style={{ backgroundColor: 'rgba(120,120,128,0.12)', color: '#3C3C43' }}>Cancel</button>
              <button onClick={submit} disabled={!draft.title.trim()} className="flex-1 py-3.5 text-sm font-semibold text-white disabled:opacity-40" style={{ backgroundColor: '#19B5A5' }}>Submit</button>
            </div>
            <p className="text-[11px] mt-2 text-center" style={{ color: '#8A9BA5' }}>Reports are saved on this device only for now.</p>
          </div>
        </div>
      )}
    </div>
  );
}
