import { useEffect } from 'react';
import { useNav } from '../context/NavContext';
import Logo from '../components/Logo';

export default function SplashScreen() {
  const { navigate } = useNav();

  useEffect(() => {
    const t = setTimeout(() => navigate('login'), 2200);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-full" style={{ backgroundColor: '#F2F2F7' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="animate-pulse">
          <Logo size={80} />
        </div>
        <div className="flex flex-col items-center gap-1">
          <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: '#073B4C' }}>GoSure</h1>
          <p className="text-sm font-medium" style={{ color: '#607580' }}>Travel Safe. Go Sure.</p>
        </div>
      </div>
      <div className="absolute bottom-12 flex flex-col items-center gap-2">
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: i === 0 ? '#19B5A5' : '#D9E7EC' }} />
          ))}
        </div>
        <p className="text-xs" style={{ color: '#AABCC3' }}>Loading…</p>
      </div>
    </div>
  );
}
