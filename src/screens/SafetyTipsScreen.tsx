import { useState } from 'react';
import Header from '../components/Header';

const categories = [
  {
    id: 'before',
    label: 'Before Travel',
    icon: '🗺',
    color: '#3FC2E5',
    bg: '#E8F8FD',
    tips: [
      'Research your destination safety rating before booking.',
      'Share your itinerary with trusted contacts.',
      'Keep emergency numbers saved offline.',
      'Charge all devices fully before departure.',
      'Carry a physical copy of important documents.',
    ],
  },
  {
    id: 'during',
    label: 'During Travel',
    icon: '✈️',
    color: '#19B5A5',
    bg: '#E6F9F7',
    tips: [
      'Stay on well-lit and populated routes.',
      'Avoid displaying expensive jewelry or gadgets.',
      'Keep your bag close and secure at all times.',
      'Stay alert in crowded places like bus stands.',
      'Check in with contacts at regular intervals.',
    ],
  },
  {
    id: 'night',
    label: 'Night Travel',
    icon: '🌙',
    color: '#073B4C',
    bg: '#E8F4F8',
    tips: [
      'Avoid solo night travel when possible.',
      'Stick to main roads and avoid shortcuts.',
      'Use verified taxi services after dark.',
      'Keep your phone charged and visible.',
      'Let someone know your expected arrival time.',
    ],
  },
  {
    id: 'transport',
    label: 'Public Transport',
    icon: '🚌',
    color: '#FF9F0A',
    bg: '#FFF8E6',
    tips: [
      'Note the bus or train number and route.',
      'Sit near other passengers when possible.',
      'Keep valuables in front pockets.',
      'Avoid sleeping on public transport.',
      'Know the next stop and alternate exits.',
    ],
  },
  {
    id: 'unknown',
    label: 'Unknown Areas',
    icon: '⚠️',
    color: '#FF3B30',
    bg: '#FFF0F0',
    tips: [
      'Use GoSure to check area safety first.',
      'Trust your instincts — leave if uneasy.',
      'Ask locals from official establishments.',
      'Avoid deserted alleys and unmarked roads.',
      'Maintain awareness of your surroundings.',
    ],
  },
  {
    id: 'emergency',
    label: 'Emergency',
    icon: '🚨',
    color: '#FF3B30',
    bg: '#FFF5F5',
    tips: [
      'Use the SOS button in GoSure for instant help.',
      'Call Police: 100, Ambulance: 108, Fire: 101.',
      'Move to a safe, public place immediately.',
      'Yell for help in crowded areas.',
      'Activate live location sharing with contacts.',
    ],
  },
  {
    id: 'language',
    label: 'Language Help',
    icon: '💬',
    color: '#3FC2E5',
    bg: '#E8F8FD',
    tips: [
      'Save key phrases in the local language.',
      'Use Google Translate offline packs.',
      'Note "help", "police", and "hospital" locally.',
      'Show your destination written in local script.',
      'Use visual gestures for basic communication.',
    ],
  },
];

export default function SafetyTipsScreen() {
  const [openId, setOpenId] = useState<string | null>('before');

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: '#F2F2F7' }}>
      <Header title="Safety Tips" />

      <div className="flex-1 overflow-y-auto pb-6 px-4 pt-4 space-y-2">
        {categories.map((cat) => {
          const open = openId === cat.id;
          return (
            <div key={cat.id} className="rounded-2xl overflow-hidden bg-white" style={{ border: '1px solid #D9E7EC' }}>
              <button
                onClick={() => setOpenId(open ? null : cat.id)}
                className="w-full flex items-center gap-3 p-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                  style={{ backgroundColor: cat.bg }}>
                  {cat.icon}
                </div>
                <span className="flex-1 text-sm font-semibold text-left" style={{ color: '#102A36' }}>{cat.label}</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                  <path d="M6 9L12 15L18 9" stroke="#607580" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
              {open && (
                <div className="px-4 pb-4 space-y-2">
                  {cat.tips.map((tip, i) => (
                    <div key={i} className="flex gap-2 items-start">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                        style={{ backgroundColor: cat.bg }}>
                        <span className="text-[10px] font-bold" style={{ color: cat.color }}>{i + 1}</span>
                      </div>
                      <p className="text-xs leading-relaxed" style={{ color: '#607580' }}>{tip}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
