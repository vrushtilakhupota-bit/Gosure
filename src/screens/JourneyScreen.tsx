import { useNav } from '../context/NavContext';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';

const journeys = [
  { from: 'Ahmedabad', to: 'Mumbai', date: '12 Sept 2026', duration: '5h 22m', status: 'safe', km: '531 km' },
  { from: 'Ahmedabad', to: 'Surat', date: '5 Sept 2026', duration: '2h 45m', status: 'safe', km: '262 km' },
  { from: 'Ahmedabad', to: 'Jaipur', date: '28 Aug 2026', duration: '7h 10m', status: 'safe', km: '672 km' },
  { from: 'Ahmedabad', to: 'Delhi', date: '15 Aug 2026', duration: '9h 30m', status: 'caution', km: '943 km' },
  { from: 'Ahmedabad', to: 'Vadodara', date: '2 Aug 2026', duration: '1h 50m', status: 'safe', km: '111 km' },
];

function statusConfig(status: string) {
  if (status === 'safe') return { label: 'Completed Safely', color: '#34C759', bg: '#E6F4EE' };
  if (status === 'caution') return { label: 'Completed – Caution', color: '#FF9F0A', bg: '#FFF8E6' };
  return { label: 'Incomplete', color: '#FF3B30', bg: '#FFF0F0' };
}

export default function JourneyScreen() {
  const { navigate } = useNav();

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: '#F2F2F7' }}>
      <div className="hero-sky pb-2">
        <Header title="Journey History" showBack={false} dark />
        <div className="px-4 pb-4">
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Total', value: '5', color: '#073B4C' },
              { label: 'Safe', value: '4', color: '#34C759' },
              { label: 'Caution', value: '1', color: '#FF9F0A' },
            ].map(stat => (
              <div key={stat.label} className="rounded-2xl p-3 text-center" style={{ backgroundColor: 'rgba(255,255,255,0.6)' }}>
                <p className="text-xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
                <p className="text-xs" style={{ color: '#2E6B7E' }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-28 px-4 pt-4 space-y-2">
        {journeys.map((j, i) => {
          const cfg = statusConfig(j.status);
          return (
            <div key={i} className="rounded-2xl p-4 bg-white" style={{ border: '1px solid #D9E7EC' }}>
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: '#E8F8FD' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z" fill="#3FC2E5" />
                    <circle cx="12" cy="9" r="2.5" fill="white" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold" style={{ color: '#102A36' }}>{j.from} → {j.to}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-xs" style={{ color: '#607580' }}>{j.date}</p>
                    <span className="text-xs" style={{ color: '#D9E7EC' }}>·</span>
                    <p className="text-xs" style={{ color: '#607580' }}>{j.km}</p>
                    <span className="text-xs" style={{ color: '#D9E7EC' }}>·</span>
                    <p className="text-xs" style={{ color: '#607580' }}>{j.duration}</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-1 rounded-full shrink-0"
                  style={{ backgroundColor: cfg.bg, color: cfg.color }}>
                  {cfg.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <BottomNav />
    </div>
  );
}
