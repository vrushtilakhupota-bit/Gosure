import React from 'react';
import { useNav, ScreenName } from '../context/NavContext';

const tabs: { id: ScreenName; label: string; icon: (active: boolean) => React.ReactElement }[] = [
  {
    id: 'home',
    label: 'Home',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M3 9.5L12 3L21 9.5V20C21 20.55 20.55 21 20 21H15V15H9V21H4C3.45 21 3 20.55 3 20V9.5Z"
          fill={active ? '#19B5A5' : '#607580'} />
      </svg>
    ),
  },
  {
    id: 'explore',
    label: 'Explore',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="11" cy="11" r="7" stroke={active ? '#19B5A5' : '#607580'} strokeWidth="2" fill="none" />
        <path d="M16.5 16.5L21 21" stroke={active ? '#19B5A5' : '#607580'} strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'journey',
    label: 'Journey',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z"
          fill={active ? '#19B5A5' : '#607580'} />
      </svg>
    ),
  },
  {
    id: 'emergency',
    label: 'Emergency',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" fill={active ? '#FF3B30' : '#607580'} />
        <text x="12" y="17" textAnchor="middle" fontSize="13" fontWeight="800" fill="white">!</text>
      </svg>
    ),
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8" r="4" fill={active ? '#19B5A5' : '#607580'} />
        <path d="M4 20C4 16.69 7.58 14 12 14C16.42 14 20 16.69 20 20"
          stroke={active ? '#19B5A5' : '#607580'} strokeWidth="2" fill="none" strokeLinecap="round" />
      </svg>
    ),
  },
];

const mainScreens: ScreenName[] = ['home', 'explore', 'journey', 'emergency', 'profile'];

export default function BottomNav() {
  const { screen, navigate } = useNav();

  const activeTab = mainScreens.includes(screen) ? screen : 'home';

  return (
    <div className="glass-bar absolute left-3 right-3 flex items-center rounded-full p-1.5"
      style={{ bottom: 'max(env(safe-area-inset-bottom, 0px), 12px)', height: 64, zIndex: 40 }}>
      {tabs.map((tab) => {
        const active = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => navigate(tab.id)}
            className="flex-1 h-full flex flex-col items-center justify-center gap-0.5 rounded-full"
            style={{ backgroundColor: active ? 'rgba(25,181,165,0.16)' : 'transparent' }}
          >
            {tab.icon(active)}
            <span className="text-[10px] font-medium" style={{ color: active ? '#19B5A5' : '#607580' }}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
