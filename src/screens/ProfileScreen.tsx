import { useNav } from '../context/NavContext';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';

const sections = [
  {
    title: 'Safety',
    items: [
      { icon: '🚨', label: 'Emergency Contacts', sub: '3 contacts added', screen: null },
      { icon: '👥', label: 'Trusted Contacts', sub: '3 contacts', screen: null },
    ],
  },
  {
    title: 'Account',
    items: [
      { icon: '🗺', label: 'Journey History', sub: '5 journeys', screen: 'journey' },
      { icon: '🔔', label: 'Notifications', sub: 'Enabled', screen: null },
      { icon: '🔒', label: 'Privacy Settings', sub: 'Location: Always', screen: null },
    ],
  },
  {
    title: 'Preferences',
    items: [
      { icon: '🌐', label: 'Language & Region', sub: 'English · India', screen: null },
      { icon: '⚙️', label: 'Settings', sub: null, screen: 'settings' },
      { icon: '❓', label: 'Help & Support', sub: null, screen: null },
      { icon: '📄', label: 'Terms & Privacy', sub: null, screen: null },
    ],
  },
];

export default function ProfileScreen() {
  const { navigate } = useNav();

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: '#F2F2F7' }}>
      {/* Profile header */}
      <div className="hero-sky px-5 pt-3 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold text-white border-2 border-white"
            style={{ backgroundColor: '#073B4C' }}>
            YG
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold" style={{ color: '#073B4C' }}>Yashraj Gohil</h2>
            <p className="text-xs font-medium" style={{ color: '#2E6B7E' }}>+91 8128799911</p>
          </div>
          <button className="w-9 h-9 rounded-full flex items-center justify-center bg-white/60">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
                stroke="#073B4C" strokeWidth="2" strokeLinecap="round" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
                stroke="#073B4C" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-28 px-4 pt-4 space-y-4">
        {sections.map((section) => (
          <div key={section.title}>
            <p className="text-xs font-semibold mb-2" style={{ color: '#607580' }}>{section.title.toUpperCase()}</p>
            <div className="glass-card overflow-hidden">
              {section.items.map((item, i) => (
                <button
                  key={i}
                  onClick={() => item.screen && navigate(item.screen as any)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
                  style={{ borderTop: i > 0 ? '1px solid #EEF4F6' : 'none' }}>
                  <span className="text-lg w-8 text-center">{item.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium" style={{ color: '#102A36' }}>{item.label}</p>
                    {item.sub && <p className="text-xs" style={{ color: '#607580' }}>{item.sub}</p>}
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M9 18L15 12L9 6" stroke="#D9E7EC" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Sign out */}
        <button className="w-full py-4 rounded-2xl font-semibold text-sm" style={{ border: '1px solid #FF3B30', color: '#FF3B30' }}>
          Sign Out
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
