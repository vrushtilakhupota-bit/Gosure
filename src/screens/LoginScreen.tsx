import { useState } from 'react';
import { useNav } from '../context/NavContext';
import Logo from '../components/Logo';

const countryCodes = [
  { flag: '🇮🇳', code: '+91', country: 'India' },
  { flag: '🇺🇸', code: '+1', country: 'USA' },
  { flag: '🇬🇧', code: '+44', country: 'UK' },
  { flag: '🇦🇪', code: '+971', country: 'UAE' },
];

export default function LoginScreen() {
  const { navigate } = useNav();
  const [tab, setTab] = useState<'phone' | 'email'>('phone');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [countryCode, setCountryCode] = useState(countryCodes[0]);
  const [showPicker, setShowPicker] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  const canContinue = tab === 'phone' ? phone.length >= 8 : (email.length > 3 && password.length >= 6);

  const handleContinue = () => {
    if (!canContinue) return;
    if (tab === 'phone') {
      navigate('otp', { phone: `${countryCode.code} ${phone}` });
    } else {
      navigate('home');
    }
  };

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: '#F2F2F7' }}>
      {/* Hero top */}
      <div className="px-6 pt-8 pb-8" style={{ backgroundColor: '#073B4C' }}>
        <div className="flex flex-col items-center gap-3 mb-2">
          <Logo size={52} />
          <div className="text-center">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">GoSure</h1>
            <p className="text-sm mt-0.5" style={{ color: '#87D8EA' }}>Travel Safe. Go Sure.</p>
          </div>
        </div>
      </div>

      {/* Card */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-4 -mt-5 rounded-3xl bg-white shadow-lg overflow-hidden" style={{ border: '1px solid #D9E7EC' }}>
          <div className="p-5">
            <h2 className="text-lg font-bold mb-1" style={{ color: '#102A36' }}>Welcome back</h2>
            <p className="text-sm mb-5" style={{ color: '#607580' }}>Sign in to continue your safe journey</p>

            {/* Tab switcher */}
            <div className="flex rounded-2xl p-1 mb-5" style={{ backgroundColor: '#F2F2F7' }}>
              {(['phone', 'email'] as const).map((t) => (
                <button key={t} onClick={() => setTab(t)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    backgroundColor: tab === t ? 'white' : 'transparent',
                    color: tab === t ? '#102A36' : '#607580',
                    boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                  }}>
                  {t === 'phone' ? '📱 Phone' : '✉️ Email'}
                </button>
              ))}
            </div>

            {tab === 'phone' ? (
              <div className="space-y-3">
                {/* Phone input */}
                <div>
                  <label className="text-xs font-semibold mb-1.5 block" style={{ color: '#607580' }}>
                    MOBILE NUMBER
                  </label>
                  <div className="flex gap-2">
                    {/* Country code picker */}
                    <button onClick={() => setShowPicker(!showPicker)}
                      className="flex items-center gap-1.5 px-3 rounded-2xl shrink-0 font-medium text-sm"
                      style={{
                        backgroundColor: '#F2F2F7',
                        border: `1.5px solid ${focused === 'phone' ? '#19B5A5' : '#D9E7EC'}`,
                        color: '#102A36',
                        minWidth: 80,
                      }}>
                      <span>{countryCode.flag}</span>
                      <span>{countryCode.code}</span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <path d="M6 9L12 15L18 9" stroke="#607580" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </button>
                    <input
                      type="tel"
                      inputMode="numeric"
                      placeholder="98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 12))}
                      onFocus={() => setFocused('phone')}
                      onBlur={() => setFocused(null)}
                      className="flex-1 px-4 py-3.5 rounded-2xl text-sm outline-none"
                      style={{
                        backgroundColor: '#F2F2F7',
                        border: `1.5px solid ${focused === 'phone' ? '#19B5A5' : '#D9E7EC'}`,
                        color: '#102A36',
                      }}
                    />
                  </div>
                  {/* Dropdown */}
                  {showPicker && (
                    <div className="mt-1 rounded-2xl overflow-hidden bg-white shadow-lg" style={{ border: '1px solid #D9E7EC', zIndex: 10 }}>
                      {countryCodes.map((c) => (
                        <button key={c.code}
                          onClick={() => { setCountryCode(c); setShowPicker(false); }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-appbg text-left"
                          style={{ borderBottom: '1px solid #F2F2F7' }}>
                          <span className="text-lg">{c.flag}</span>
                          <span className="flex-1 font-medium" style={{ color: '#102A36' }}>{c.country}</span>
                          <span style={{ color: '#607580' }}>{c.code}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-xs" style={{ color: '#607580' }}>
                  We'll send a 6-digit OTP to verify your number
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Email */}
                <div>
                  <label className="text-xs font-semibold mb-1.5 block" style={{ color: '#607580' }}>EMAIL</label>
                  <input
                    type="email"
                    placeholder="arjun@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocused('email')}
                    onBlur={() => setFocused(null)}
                    className="w-full px-4 py-3.5 rounded-2xl text-sm outline-none"
                    style={{
                      backgroundColor: '#F2F2F7',
                      border: `1.5px solid ${focused === 'email' ? '#19B5A5' : '#D9E7EC'}`,
                      color: '#102A36',
                    }}
                  />
                </div>
                {/* Password */}
                <div>
                  <label className="text-xs font-semibold mb-1.5 block" style={{ color: '#607580' }}>PASSWORD</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocused('password')}
                      onBlur={() => setFocused(null)}
                      className="w-full px-4 py-3.5 pr-12 rounded-2xl text-sm outline-none"
                      style={{
                        backgroundColor: '#F2F2F7',
                        border: `1.5px solid ${focused === 'password' ? '#19B5A5' : '#D9E7EC'}`,
                        color: '#102A36',
                      }}
                    />
                    <button onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2">
                      {showPassword ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20C7 20 2.73 16.5 1 12c.82-2.1 2.19-3.96 3.94-5.38M9.53 9.53A3 3 0 0 0 12 15a3 3 0 0 0 2.47-4.47M22.54 6.46l-16 16M1 1l16 16"
                            stroke="#607580" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                          <path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12Z" stroke="#607580" strokeWidth="2" />
                          <circle cx="12" cy="12" r="3" stroke="#607580" strokeWidth="2" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button onClick={() => navigate('forgot-password')} className="text-xs font-semibold" style={{ color: '#19B5A5' }}>
                    Forgot Password?
                  </button>
                </div>
              </div>
            )}

            {/* Continue button */}
            <button onClick={handleContinue}
              className="w-full mt-5 py-4 rounded-2xl font-semibold text-base transition-all"
              style={{
                backgroundColor: canContinue ? '#19B5A5' : '#D9E7EC',
                color: canContinue ? 'white' : '#AABCC3',
              }}>
              {tab === 'phone' ? 'Send OTP' : 'Sign In'}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px" style={{ backgroundColor: '#D9E7EC' }} />
              <span className="text-xs" style={{ color: '#AABCC3' }}>or continue with</span>
              <div className="flex-1 h-px" style={{ backgroundColor: '#D9E7EC' }} />
            </div>

            {/* Social buttons */}
            <div className="flex gap-3">
              {[
                {
                  label: 'Google',
                  icon: (
                    <svg width="18" height="18" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                  ),
                },
                {
                  label: 'Apple',
                  icon: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#102A36">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                    </svg>
                  ),
                },
              ].map(({ label, icon }) => (
                <button key={label}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-medium"
                  style={{ border: '1.5px solid #D9E7EC', color: '#102A36' }}>
                  {icon}
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sign up link */}
        <p className="text-center mt-5 mb-6 text-sm" style={{ color: '#607580' }}>
          New to GoSure?{' '}
          <button onClick={() => navigate('create-account')} className="font-semibold" style={{ color: '#19B5A5' }}>
            Create Account
          </button>
        </p>
      </div>
    </div>
  );
}
