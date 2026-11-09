import { useState } from 'react';
import { useNav } from '../context/NavContext';
import Logo from '../components/Logo';

const slides = [
  {
    title: 'Travel with Confidence',
    description: 'Get safety information before and during your journey.',
    icon: (
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
        <circle cx="60" cy="60" r="56" fill="#E8F8FD" />
        <path d="M60 28C60 28 40 42 40 60C40 76 50 86 60 90C70 86 80 76 80 60C80 42 60 28 60 28Z"
          fill="#87D8EA" />
        <path d="M60 34C60 34 44 46 44 60C44 72 52 81 60 85C68 81 76 72 76 60C76 46 60 34 60 34Z"
          fill="#3FC2E5" />
        <circle cx="60" cy="61" r="13" fill="#073B4C" />
        <circle cx="60" cy="61" r="8" fill="#19B5A5" />
        <circle cx="60" cy="61" r="3" fill="white" />
      </svg>
    ),
  },
  {
    title: 'Find Safer Routes',
    description: 'Check destination safety and choose safer routes.',
    icon: (
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
        <circle cx="60" cy="60" r="56" fill="#E8F8FD" />
        <rect x="28" y="55" width="64" height="10" rx="5" fill="#D9E7EC" />
        <circle cx="35" cy="60" r="10" fill="#34C759" />
        <circle cx="85" cy="60" r="10" fill="#FF3B30" />
        <path d="M45 60 Q60 40 75 60" stroke="#19B5A5" strokeWidth="3" fill="none" strokeLinecap="round" strokeDasharray="5 3" />
        <path d="M45 60 Q60 80 75 60" stroke="#FF9F0A" strokeWidth="3" fill="none" strokeLinecap="round" strokeDasharray="5 3" />
        <text x="35" y="65" textAnchor="middle" fontSize="10" fill="white" fontWeight="700">A</text>
        <text x="85" y="65" textAnchor="middle" fontSize="10" fill="white" fontWeight="700">B</text>
      </svg>
    ),
  },
  {
    title: 'Stay Connected',
    description: 'Share your live location and get emergency help when needed.',
    icon: (
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
        <circle cx="60" cy="60" r="56" fill="#FFF5F5" />
        <circle cx="60" cy="60" r="28" fill="#073B4C" />
        <circle cx="60" cy="60" r="20" fill="#19B5A5" />
        <circle cx="60" cy="60" r="6" fill="white" />
        <path d="M60 32 L60 25 M60 88 L60 95 M32 60 L25 60 M88 60 L95 60"
          stroke="#3FC2E5" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="60" cy="60" r="36" stroke="#87D8EA" strokeWidth="1.5" fill="none" strokeDasharray="4 3" />
      </svg>
    ),
  },
];

export default function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const { navigate } = useNav();

  const next = () => {
    if (step < slides.length - 1) setStep(step + 1);
    else navigate('login');
  };

  const current = slides[step];

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: '#F2F2F7' }}>
      {/* Skip */}
      <div className="flex justify-between items-center px-5 pt-5 pb-2">
        <Logo size={32} />
        <button onClick={() => navigate('login')} className="text-sm font-medium" style={{ color: '#607580' }}>
          Skip
        </button>

      </div>

      {/* Illustration */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 gap-8">
        <div className="rounded-3xl p-6" style={{ backgroundColor: step === 2 ? '#FFF5F5' : '#E8F8FD' }}>
          {current.icon}
        </div>
        <div className="text-center space-y-3">
          <h2 className="text-2xl font-bold leading-tight" style={{ color: '#102A36' }}>{current.title}</h2>
          <p className="text-sm leading-relaxed" style={{ color: '#607580' }}>{current.description}</p>
        </div>
      </div>

      {/* Bottom */}
      <div className="px-6 pb-10 space-y-5">
        {/* Dots */}
        <div className="flex justify-center gap-2">
          {slides.map((_, i) => (
            <button key={i} onClick={() => setStep(i)}>
              <div className="rounded-full transition-all duration-300"
                style={{
                  width: i === step ? 24 : 8,
                  height: 8,
                  backgroundColor: i === step ? '#19B5A5' : '#D9E7EC',
                }} />
            </button>
          ))}
        </div>

        {/* Button */}
        <button onClick={next}
          className="w-full py-4 rounded-2xl font-semibold text-white text-base"
          style={{ backgroundColor: '#19B5A5' }}>
          {step === slides.length - 1 ? 'Get Started' : 'Next'}
        </button>
      </div>
    </div>
  );
}
