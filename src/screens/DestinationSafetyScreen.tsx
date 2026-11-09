import { useNav } from '../context/NavContext';
import Header from '../components/Header';

const safeAreas = ['Navrangpura', 'Satellite', 'Prahlad Nagar', 'Bodakdev', 'Vastrapur'];
const cautionAreas = ['Kalupur', 'Dariapur', 'Gomtipur'];
const unsafeAreas = ['Raipur Gate'];

const tips = [
  'Avoid isolated areas after dark',
  'Keep emergency contacts updated',
  'Share journey with trusted contacts',
  'Stay on well-lit main roads at night',
];

export default function DestinationSafetyScreen() {
  const { navigate, params } = useNav();
  const city = params.city || 'Ahmedabad';

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: '#F2F2F7' }}>
      <div className="hero-sky pb-2">
        <Header title={city} dark />
        <div className="px-5 pb-5">
          <div className="flex items-end gap-4">
            <div>
              <p className="text-xs" style={{ color: '#2E6B7E' }}>Safety Score</p>
              <p className="text-4xl font-extrabold text-[#073B4C]">82<span className="text-lg font-medium" style={{ color: '#2E6B7E' }}>/100</span></p>
            </div>
            <div className="mb-1">
              <span className="text-sm font-bold px-4 py-2 rounded-full text-[#073B4C]" style={{ backgroundColor: '#34C759' }}>
                Generally Safe
              </span>
            </div>
          </div>
          {/* Score bar */}
          <div className="mt-4 rounded-full overflow-hidden h-2" style={{ backgroundColor: 'rgba(255,255,255,0.6)' }}>
            <div className="h-full rounded-full" style={{ width: '82%', backgroundColor: '#34C759' }} />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-6">
        {/* Area breakdown */}
        <div className="px-4 mt-4 space-y-3">
          {/* Safe areas */}
          <div className="rounded-2xl p-4 bg-white" style={{ border: '1px solid #D9E7EC' }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#34C759' }} />
              <p className="text-sm font-semibold" style={{ color: '#102A36' }}>Safe Areas ({safeAreas.length})</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {safeAreas.map(area => (
                <span key={area} className="text-xs px-3 py-1 rounded-full font-medium"
                  style={{ backgroundColor: '#E6F4EE', color: '#34C759' }}>{area}</span>
              ))}
            </div>
          </div>

          {/* Caution areas */}
          <div className="rounded-2xl p-4 bg-white" style={{ border: '1px solid #D9E7EC' }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#FF9F0A' }} />
              <p className="text-sm font-semibold" style={{ color: '#102A36' }}>Caution Areas ({cautionAreas.length})</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {cautionAreas.map(area => (
                <span key={area} className="text-xs px-3 py-1 rounded-full font-medium"
                  style={{ backgroundColor: '#FFF8E6', color: '#FF9F0A' }}>{area}</span>
              ))}
            </div>
          </div>

          {/* Unsafe areas */}
          <div className="rounded-2xl p-4 bg-white" style={{ border: '1px solid #D9E7EC' }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#FF3B30' }} />
              <p className="text-sm font-semibold" style={{ color: '#102A36' }}>Unsafe Areas ({unsafeAreas.length})</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {unsafeAreas.map(area => (
                <span key={area} className="text-xs px-3 py-1 rounded-full font-medium"
                  style={{ backgroundColor: '#FFF0F0', color: '#FF3B30' }}>{area}</span>
              ))}
            </div>
          </div>

          {/* Services */}
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => navigate('nearby-help', { tab: 'police' })}
              className="rounded-2xl p-4 bg-white text-left" style={{ border: '1px solid #D9E7EC' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-2" style={{ backgroundColor: '#E8F8FD' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L3 7V12C3 16.55 6.84 20.74 12 22C17.16 20.74 21 16.55 21 12V7L12 2Z"
                    fill="#3FC2E5" />
                  <path d="M9 12L11 14L15 10" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <p className="text-sm font-semibold" style={{ color: '#102A36' }}>Police</p>
              <p className="text-xs" style={{ color: '#607580' }}>4 stations nearby</p>
            </button>
            <button onClick={() => navigate('nearby-help', { tab: 'hospital' })}
              className="rounded-2xl p-4 bg-white text-left" style={{ border: '1px solid #D9E7EC' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-2" style={{ backgroundColor: '#FFF0F0' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="18" height="18" rx="3" fill="#FF3B30" />
                  <path d="M12 8V16M8 12H16" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
              <p className="text-sm font-semibold" style={{ color: '#102A36' }}>Hospitals</p>
              <p className="text-xs" style={{ color: '#607580' }}>7 hospitals nearby</p>
            </button>
          </div>

          {/* Safety tips */}
          <div className="rounded-2xl p-4 bg-white" style={{ border: '1px solid #D9E7EC' }}>
            <p className="text-sm font-semibold mb-3" style={{ color: '#102A36' }}>Safety Tips</p>
            <div className="space-y-2">
              {tips.map((tip, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                    style={{ backgroundColor: '#E6F9F7' }}>
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5L4 7L8 3" stroke="#19B5A5" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: '#607580' }}>{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="px-4 pb-6 pt-3 bg-white" style={{ borderTop: '1px solid #D9E7EC' }}>
        <button onClick={() => navigate('map', { city, lat: params.lat, lon: params.lon })}
          className="w-full py-4 rounded-2xl font-semibold text-white text-base"
          style={{ backgroundColor: '#19B5A5' }}>
          View Unsafe Area Map
        </button>
      </div>
    </div>
  );
}
