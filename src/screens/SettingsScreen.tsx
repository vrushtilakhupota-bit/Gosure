import { useState } from 'react';
import Header from '../components/Header';

const settings = [
  {
    title: 'Notifications',
    items: [
      { label: 'Safety Alerts', sub: 'Alert when entering unsafe zones', toggle: true, defaultOn: true },
      { label: 'Journey Reminders', sub: 'Reminders during active journey', toggle: true, defaultOn: true },
      { label: 'News & Updates', sub: 'GoSure app updates', toggle: true, defaultOn: false },
    ],
  },
  {
    title: 'Privacy & Location',
    items: [
      { label: 'Location Permission', sub: 'Always on — required for safety', toggle: false, link: true },
      { label: 'Location History', sub: 'Store journey history locally', toggle: true, defaultOn: true },
      { label: 'Share Usage Data', sub: 'Help improve GoSure', toggle: true, defaultOn: false },
    ],
  },
  {
    title: 'Appearance',
    items: [
      { label: 'Dark Mode', sub: 'Switch to dark theme', toggle: true, defaultOn: false },
    ],
  },
  {
    title: 'Support',
    items: [
      { label: 'Help & Support', sub: 'FAQs, contact us', toggle: false, link: true },
      { label: 'Report an Issue', sub: 'Bugs and feedback', toggle: false, link: true },
      { label: 'Terms of Service', sub: null, toggle: false, link: true },
      { label: 'Privacy Policy', sub: null, toggle: false, link: true },
    ],
  },
];

export default function SettingsScreen() {
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    'Safety Alerts': true,
    'Journey Reminders': true,
    'News & Updates': false,
    'Location History': true,
    'Share Usage Data': false,
    'Dark Mode': false,
  });

  const flip = (label: string) => {
    setToggles(prev => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: '#F2F2F7' }}>
      <Header title="Settings" />

      <div className="flex-1 overflow-y-auto pb-6 px-4 pt-4 space-y-4">
        {settings.map((section) => (
          <div key={section.title}>
            <p className="text-xs font-semibold mb-2" style={{ color: '#607580' }}>{section.title.toUpperCase()}</p>
            <div className="rounded-2xl overflow-hidden bg-white" style={{ border: '1px solid #D9E7EC' }}>
              {section.items.map((item, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3.5"
                  style={{ borderTop: i > 0 ? '1px solid #F2F2F7' : 'none' }}>
                  <div className="flex-1">
                    <p className="text-sm font-medium" style={{ color: '#102A36' }}>{item.label}</p>
                    {item.sub && <p className="text-xs mt-0.5" style={{ color: '#607580' }}>{item.sub}</p>}
                  </div>
                  {item.toggle ? (
                    <button onClick={() => flip(item.label)}
                      className="w-12 h-6 rounded-full transition-all flex items-center px-1 shrink-0"
                      style={{ backgroundColor: toggles[item.label] ? '#19B5A5' : '#D9E7EC' }}>
                      <div className="w-4 h-4 rounded-full bg-white shadow-sm transition-all"
                        style={{ transform: toggles[item.label] ? 'translateX(24px)' : 'translateX(0)' }} />
                    </button>
                  ) : item.link ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M9 18L15 12L9 6" stroke="#D9E7EC" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="text-center py-2">
          <p className="text-xs" style={{ color: '#AABCC3' }}>GoSure v2.1.0 · Made with ❤️ for safe travel</p>
        </div>
      </div>
    </div>
  );
}
