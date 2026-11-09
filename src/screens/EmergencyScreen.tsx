import { useState } from 'react';
import { useNav } from '../context/NavContext';
import BottomNav from '../components/BottomNav';

export default function EmergencyScreen() {
  const { navigate } = useNav();
  const [showModal, setShowModal] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSOS = () => {
    if (!sent) setShowModal(true);
  };

  const confirmSOS = () => {
    setShowModal(false);
    setSent(true);
    setTimeout(() => setSent(false), 5000);
  };

  return (
    <div className="flex flex-col h-full relative" style={{ backgroundColor: '#FFF7F7' }}>
      {/* Header */}
      <div className="hero-red px-5 pt-3 pb-10 flex items-center gap-3">
        <button onClick={() => navigate('home')} className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
        <h1 className="text-lg font-semibold text-white">Emergency</h1>
        {sent && (
          <span className="ml-auto text-xs font-semibold px-2 py-1 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.25)', color: 'white' }}>
            ✓ Alert Sent
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto pb-28 flex flex-col items-center">
        {/* SOS button */}
        <div className="-mt-6 mb-2">
          <button onClick={handleSOS} className="relative flex items-center justify-center" style={{ width: 160, height: 160 }}>
            {/* Pulsing rings */}
            <div className="absolute inset-0 rounded-full animate-ping opacity-25" style={{ backgroundColor: '#FF3B30' }} />
            <div className="absolute rounded-full" style={{ inset: 8, backgroundColor: 'rgba(229,57,53,0.15)' }} />
            <div className="relative w-36 h-36 rounded-full flex items-center justify-center shadow-xl"
              style={{ backgroundColor: '#FF3B30' }}>
              <div className="text-center">
                <p className="text-3xl font-extrabold text-white">SOS</p>
                <p className="text-xs text-white opacity-80 mt-0.5">Hold to activate</p>
              </div>
            </div>
          </button>
        </div>

        <p className="text-base font-semibold mb-1" style={{ color: '#102A36' }}>Are you in danger?</p>
        <p className="text-xs mb-5" style={{ color: '#607580' }}>Tap SOS to start emergency contacts</p>

        {/* Emergency actions */}
        <div className="w-full px-4 space-y-2">
          {[
            { icon: '🚔', label: 'Call Police', sub: '100', color: '#3FC2E5', bg: '#E8F8FD' },
            { icon: '🚑', label: 'Call Ambulance', sub: '108', color: '#FF3B30', bg: '#FFF0F0' },
            { icon: '📍', label: 'Share Live Location', sub: 'Trusted contacts', color: '#19B5A5', bg: '#E6F9F7' },
            { icon: '👤', label: 'Contact Trusted Person', sub: 'Mom · Rohan · Priya', color: '#FF9F0A', bg: '#FFF8E6' },
          ].map((item) => (
            <button key={item.label}
              onClick={item.label === 'Share Live Location' ? () => navigate('live-location') : undefined}
              className="w-full flex items-center gap-4 p-4 rounded-2xl"
              style={{ backgroundColor: item.bg, boxShadow: '0 6px 16px rgba(7,59,76,0.10)' }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 bg-white/70">
                {item.icon}
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold" style={{ color: '#102A36' }}>{item.label}</p>
                <p className="text-xs" style={{ color: item.color }}>{item.sub}</p>
              </div>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M9 18L15 12L9 6" stroke={item.color} strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          ))}
        </div>

        {/* Nearby help */}
        <button onClick={() => navigate('nearby-help')}
          className="mx-4 mt-3 w-[calc(100%-32px)] py-3 rounded-2xl text-sm font-medium"
          style={{ border: '2px solid #FF3B30', color: '#FF3B30', backgroundColor: 'transparent' }}>
          Find Nearby Police & Hospitals
        </button>
      </div>

      <BottomNav />

      {/* Confirmation modal */}
      {showModal && (
        <div className="absolute inset-0 flex items-end justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 50 }}>
          <div className="w-full rounded-t-3xl p-6 bg-white">
            <h3 className="text-lg font-bold mb-1" style={{ color: '#102A36' }}>Send Emergency Alert?</h3>
            <p className="text-sm mb-5" style={{ color: '#607580' }}>
              Your live location will be shared with your emergency contacts and local authorities will be notified.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowModal(false)}
                className="flex-1 py-4 rounded-2xl font-semibold text-sm"
                style={{ border: '2px solid #D9E7EC', color: '#607580' }}>
                Cancel
              </button>
              <button onClick={confirmSOS}
                className="flex-1 py-4 rounded-2xl font-semibold text-sm text-white"
                style={{ backgroundColor: '#FF3B30' }}>
                Send SOS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
