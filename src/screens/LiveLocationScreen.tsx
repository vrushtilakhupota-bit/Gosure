import { useState } from 'react';
import { useNav } from '../context/NavContext';
import Header from '../components/Header';

const contacts = [
  { name: 'Mom', initials: 'M', sharing: true, lastUpdate: '2 min ago', color: '#19B5A5' },
  { name: 'Rohan (Friend)', initials: 'R', sharing: false, lastUpdate: 'Not sharing', color: '#3FC2E5' },
  { name: 'Priya (Sister)', initials: 'P', sharing: true, lastUpdate: '1 min ago', color: '#FF9F0A' },
];

export default function LiveLocationScreen() {
  const { navigate } = useNav();
  const [sharingAll, setSharingAll] = useState(true);
  const [contactStates, setContactStates] = useState(contacts.map(c => c.sharing));

  const toggleContact = (i: number) => {
    setContactStates(prev => {
      const next = [...prev];
      next[i] = !next[i];
      return next;
    });
  };

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: '#F2F2F7' }}>
      <Header title="Share Live Location" />

      <div className="flex-1 overflow-y-auto pb-6">
        {/* Status card */}
        <div className="mx-4 mt-4 rounded-2xl p-4" style={{ backgroundColor: sharingAll ? '#E6F9F7' : '#F2F2F7', border: `2px solid ${sharingAll ? '#19B5A5' : '#D9E7EC'}` }}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: sharingAll ? '#19B5A5' : '#D9E7EC' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="4" fill="white" />
                <path d="M12 2V6M12 18V22M2 12H6M18 12H22" stroke="white" strokeWidth="2" strokeLinecap="round" />
                <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="1.5" fill="none" strokeDasharray="4 3" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold" style={{ color: '#102A36' }}>
                Live Location {sharingAll ? 'Active' : 'Paused'}
              </p>
              <p className="text-xs mt-0.5" style={{ color: '#607580' }}>
                {sharingAll ? 'Sharing with 2 contacts' : 'Location sharing is paused'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {sharingAll && <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#34C759' }} />}
              <button onClick={() => setSharingAll(!sharingAll)}
                className="w-12 h-6 rounded-full transition-all flex items-center px-1"
                style={{ backgroundColor: sharingAll ? '#19B5A5' : '#D9E7EC' }}>
                <div className="w-4 h-4 rounded-full bg-white transition-all shadow-sm"
                  style={{ transform: sharingAll ? 'translateX(24px)' : 'translateX(0)' }} />
              </button>
            </div>
          </div>
        </div>

        {/* Contacts */}
        <div className="px-4 mt-5">
          <p className="text-xs font-semibold mb-3" style={{ color: '#607580' }}>TRUSTED CONTACTS</p>
          <div className="space-y-2">
            {contacts.map((contact, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-white" style={{ border: '1px solid #D9E7EC' }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white"
                  style={{ backgroundColor: contact.color }}>
                  {contact.initials}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold" style={{ color: '#102A36' }}>{contact.name}</p>
                  <p className="text-xs" style={{ color: contactStates[i] ? '#34C759' : '#607580' }}>
                    {contactStates[i] ? `● Location sharing ON · ${contact.lastUpdate}` : 'Location sharing OFF'}
                  </p>
                </div>
                <button onClick={() => toggleContact(i)}
                  className="w-12 h-6 rounded-full transition-all flex items-center px-1"
                  style={{ backgroundColor: contactStates[i] ? '#19B5A5' : '#D9E7EC' }}>
                  <div className="w-4 h-4 rounded-full bg-white shadow-sm transition-all"
                    style={{ transform: contactStates[i] ? 'translateX(24px)' : 'translateX(0)' }} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Add contact */}
        <div className="mx-4 mt-3">
          <button className="w-full py-3 rounded-2xl text-sm font-medium" style={{ border: `2px dashed #D9E7EC`, color: '#19B5A5' }}>
            + Add Trusted Contact
          </button>
        </div>

        {/* Share method */}
        <div className="px-4 mt-5">
          <p className="text-xs font-semibold mb-3" style={{ color: '#607580' }}>SHARE VIA</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'WhatsApp', icon: '💬', color: '#E6F4EE' },
              { label: 'SMS', icon: '📱', color: '#E8F8FD' },
              { label: 'Link', icon: '🔗', color: '#F2F2F7' },
            ].map(item => (
              <button key={item.label}
                className="rounded-2xl p-3 flex flex-col items-center gap-1.5"
                style={{ backgroundColor: item.color, border: '1px solid #D9E7EC' }}>
                <span className="text-xl">{item.icon}</span>
                <span className="text-xs font-medium" style={{ color: '#102A36' }}>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="px-4 pb-6 pt-3 bg-white" style={{ borderTop: '1px solid #D9E7EC' }}>
        <button onClick={() => navigate('active-journey')}
          className="w-full py-4 rounded-2xl font-semibold text-white text-sm"
          style={{ backgroundColor: '#19B5A5' }}>
          Share Location
        </button>
      </div>
    </div>
  );
}
