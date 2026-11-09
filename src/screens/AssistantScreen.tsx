import { useEffect, useRef, useState } from 'react';
import Header from '../components/Header';
import { useCurrentLocation } from '../lib/currentLocation';

type Msg = { from: 'me' | 'bot'; text: string };

const KB: { keys: RegExp; answer: (place: string) => string }[] = [
  { keys: /night|late|dark|after dark/, answer: (p) => `Night safety around ${p}:\n• Stick to well-lit, busy streets and avoid shortcuts.\n• Book a ride from the app instead of hailing one, and share the trip with a contact.\n• Tell someone your plan and set the Safety Timer.\n• Keep your phone charged and your SOS shortcut handy.` },
  { keys: /taxi|cab|auto|rickshaw|uber|ola|ride/, answer: () => `Taxi & ride safety:\n• Prefer app-booked rides; match the plate and driver photo before you get in.\n• Sit in the back, and share live trip status with a trusted contact.\n• Agree the fare up front if there is no meter.\n• If anything feels off, ask to stop in a busy, lit place and get out.` },
  { keys: /scam|cheat|fraud|overcharg|tout/, answer: () => `Avoiding scams:\n• Be wary of strangers who approach you with offers, "closed attraction" stories or free help.\n• Confirm prices before accepting any service.\n• Book only through official apps and sites.\nOpen Local Scam Alerts for what's being reported.` },
  { keys: /passport|visa|document|id lost|lost my/, answer: () => `If you lose your passport or documents:\n1. Report it at the nearest police station and get a copy of the report.\n2. Contact your country's embassy or consulate for an emergency travel document.\n3. Keep digital copies of your documents in a separate place.\nTip: carry photocopies, not originals, when exploring.` },
  { keys: /alone|solo|woman|female|girl/, answer: () => `Solo travel tips:\n• Share your itinerary and live location with trusted contacts.\n• Arrive in daylight and pick well-reviewed stays in busy areas.\n• Trust your instincts. It's fine to leave a situation or refuse politely.\n• Use the Safety Timer so someone is alerted if you miss a check-in.` },
  { keys: /atm|cash|money|wallet|pickpocket|theft|stolen/, answer: () => `Protecting money:\n• Use ATMs inside banks or malls, and cover the keypad.\n• Split cards and cash across bags; keep a small "decoy" wallet.\n• In crowds, wear your bag in front.\nIf something is stolen: block cards immediately and file a police report.` },
  { keys: /food|water|drink|sick|ill|stomach/, answer: () => `Staying healthy:\n• Drink sealed bottled or purified water.\n• Choose busy food stalls with high turnover and freshly cooked food.\n• Carry oral rehydration salts and basic medicines.\nSerious symptoms? Use Safe Place Finder for the nearest hospital.` },
  { keys: /hotel|stay|hostel|accommodation|airbnb/, answer: () => `Choosing a safe stay:\n• Read recent reviews, especially from solo travelers.\n• Check that the area is lit and close to transport.\n• Use the door lock and keep valuables in the safe.\n• Share the address and booking with a contact.` },
  { keys: /harass|follow|stalk|threat|unsafe|scared|danger/, answer: () => `If you feel unsafe right now:\n• Move to a busy, well-lit place such as a shop, hotel or police post.\n• Call local emergency services or tap Emergency SOS.\n• Tell people around you clearly that you need help.\nYour safety comes before politeness.` },
  { keys: /emergency|police|number|ambulance|helpline/, answer: () => `Common emergency numbers:\n• India: 112 (all emergencies), 100 police, 108 ambulance, 1091 women helpline.\n• Elsewhere: 112 works in the EU; 911 in the US & Canada; 999 in the UK.\nUse Safe Place Finder to see the nearest police station and hospital.` },
  { keys: /battery|phone dead|charge/, answer: () => `Keep your phone alive:\n• Carry a power bank and save an offline map.\n• Turn on the Low Battery Alert so your last location is shared at 20%.\n• Write an emergency contact number on paper.` },
  { keys: /language|translate|speak|understand/, answer: () => `Language barrier? Open the Emergency Language Helper for ready-made phrases like "I need a doctor" with audio and a large display you can show to locals.` },
];

const SUGGESTED = ['Is it safe to walk at night?', 'How do I avoid taxi scams?', 'I lost my passport', 'Tips for solo travel', 'Emergency numbers'];

const reply = (q: string, place: string) => {
  const t = q.toLowerCase();
  const hit = KB.find((k) => k.keys.test(t));
  if (hit) return hit.answer(place);
  return `I'm not sure about that one. I can help with night travel, taxis, scams, lost documents, solo travel, money safety, health, hotels and emergency numbers. In an emergency, call your local emergency number right away.`;
};

export default function AssistantScreen() {
  const [cur] = useCurrentLocation();
  const place = cur.name.split(',')[0];
  const [msgs, setMsgs] = useState<Msg[]>([{ from: 'bot', text: `Hi! I'm your GoSure safety guide. Ask me about staying safe while traveling. You're near ${place}.` }]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs, typing]);

  const send = (text: string) => {
    const q = text.trim();
    if (!q || typing) return;
    setMsgs((m) => [...m, { from: 'me', text: q }]); setInput(''); setTyping(true);
    setTimeout(() => { setMsgs((m) => [...m, { from: 'bot', text: reply(q, place) }]); setTyping(false); }, 600);
  };

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: '#F2F2F7' }}>
      <Header title="AI Safety Assistant" dark />
      <div className="flex-1 overflow-y-auto px-4 pt-4 space-y-3">
        {msgs.map((m, i) => (
          <div key={i} className={`flex ${m.from === 'me' ? 'justify-end' : 'justify-start'}`}>
            <div className="max-w-[85%] px-4 py-2.5 text-sm whitespace-pre-line" style={m.from === 'me'
              ? { backgroundColor: '#19B5A5', color: 'white', borderRadius: '20px 20px 6px 20px' }
              : { backgroundColor: 'white', color: '#102A36', borderRadius: '20px 20px 20px 6px', boxShadow: '0 2px 8px rgba(7,59,76,.06)' }}>{m.text}</div>
          </div>
        ))}
        {typing && <div className="text-xs px-2" style={{ color: '#607580' }}>Assistant is typing…</div>}
        {msgs.length === 1 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {SUGGESTED.map((s) => <button key={s} onClick={() => send(s)} className="px-3 py-2 rounded-full text-xs font-medium bg-white" style={{ color: '#19B5A5', border: '1px solid #D9E7EC' }}>{s}</button>)}
          </div>
        )}
        <div ref={end} />
      </div>
      <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex gap-2 p-3 shrink-0 bg-white" style={{ borderTop: '1px solid #D9E7EC' }}>
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask a safety question…" className="flex-1 rounded-full px-4 py-3 text-sm outline-none" style={{ backgroundColor: '#F2F2F7' }} />
        <button type="submit" disabled={!input.trim()} className="px-5 text-sm font-semibold text-white rounded-full disabled:opacity-40" style={{ backgroundColor: '#19B5A5' }}>Send</button>
      </form>
    </div>
  );
}
