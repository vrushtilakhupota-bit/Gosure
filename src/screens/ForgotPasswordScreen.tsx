import { useState } from 'react';
import { useNav } from '../context/NavContext';
import Logo from '../components/Logo';

type Step = 'method' | 'otp' | 'reset' | 'done';

const digits6 = Array.from({ length: 6 }, (_, i) => i);

export default function ForgotPasswordScreen() {
  const { navigate, goBack } = useNav();

  const [step, setStep] = useState<Step>('method');
  const [method, setMethod] = useState<'phone' | 'email'>('phone');
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState<string | null>(null);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resend, setResend] = useState(30);
  const [otpRefs] = useState(() => digits6.map(() => ({ current: null as HTMLInputElement | null })));
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [otpError, setOtpError] = useState(false);
  const [verifying, setVerifying] = useState(false);

  // Countdown for OTP step
  const startCountdown = () => {
    setResend(30);
    const tick = setInterval(() => {
      setResend(r => {
        if (r <= 1) { clearInterval(tick); return 0; }
        return r - 1;
      });
    }, 1000);
  };

  const handleSend = () => {
    if (!value) return;
    setStep('otp');
    startCountdown();
    setTimeout(() => otpRefs[0].current?.focus(), 50);
  };

  const handleOtpInput = (i: number, val: string) => {
    const char = val.replace(/\D/g, '').slice(-1);
    if (!char) return;
    setOtpError(false);
    const next = [...otp];
    next[i] = char;
    setOtp(next);
    if (i < 5) otpRefs[i + 1].current?.focus();
    if (i === 5 && next.every(d => d)) verifyOtp(next.join(''));
  };

  const handleOtpKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace') {
      const next = [...otp];
      if (next[i]) { next[i] = ''; setOtp(next); }
      else if (i > 0) { next[i - 1] = ''; setOtp(next); otpRefs[i - 1].current?.focus(); }
    }
  };

  const verifyOtp = (code: string) => {
    setVerifying(true);
    setTimeout(() => {
      if (code === '000000') {
        setOtpError(true);
        setOtp(['', '', '', '', '', '']);
        setVerifying(false);
        otpRefs[0].current?.focus();
      } else {
        setVerifying(false);
        setStep('reset');
      }
    }, 1000);
  };

  const passwordsMatch = newPass === confirmPass && confirmPass.length > 0;
  const canReset = newPass.length >= 6 && passwordsMatch;

  const handleReset = () => {
    if (!canReset) return;
    setStep('done');
  };

  const strengthScore = (() => {
    let s = 0;
    if (newPass.length >= 8) s++;
    if (/[A-Z]/.test(newPass)) s++;
    if (/[0-9]/.test(newPass)) s++;
    if (/[^A-Za-z0-9]/.test(newPass)) s++;
    return s;
  })();
  const strengthColor = ['#FF3B30', '#FF9F0A', '#3FC2E5', '#34C759'][Math.max(strengthScore - 1, 0)];
  const strengthLabel = ['Weak', 'Fair', 'Good', 'Strong'][Math.max(strengthScore - 1, 0)];

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: '#F2F2F7' }}>
      {/* Header */}
      <div className="px-5 pt-5 pb-6 shrink-0" style={{ backgroundColor: '#073B4C' }}>
        <button onClick={step === 'method' ? goBack : () => setStep(step === 'otp' ? 'method' : step === 'reset' ? 'otp' : 'done')}
          className="w-9 h-9 rounded-full flex items-center justify-center mb-5"
          style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
        <div className="flex items-center gap-3">
          <Logo size={40} />
          <div>
            <h1 className="text-xl font-bold text-white">
              {step === 'method' && 'Forgot Password'}
              {step === 'otp' && 'Verify Identity'}
              {step === 'reset' && 'New Password'}
              {step === 'done' && 'Password Reset!'}
            </h1>
            <p className="text-xs mt-0.5" style={{ color: '#87D8EA' }}>
              {step === 'method' && "We'll send a reset code to you"}
              {step === 'otp' && `Code sent to ${value}`}
              {step === 'reset' && 'Set your new password'}
              {step === 'done' && 'All done — sign in again'}
            </p>
          </div>
        </div>

        {/* Progress line */}
        {step !== 'done' && (
          <div className="flex gap-1 mt-5">
            {(['method', 'otp', 'reset'] as const).map((s, i) => (
              <div key={s} className="flex-1 h-1 rounded-full transition-all"
                style={{
                  backgroundColor: ['method', 'otp', 'reset', 'done'].indexOf(step) >= i
                    ? '#19B5A5' : 'rgba(255,255,255,0.2)',
                }} />
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-5 pt-6 pb-4">

        {/* ── Step: method ── */}
        {step === 'method' && (
          <div className="space-y-5">
            <p className="text-sm" style={{ color: '#607580' }}>
              Choose how you'd like to receive your reset code.
            </p>

            {/* Method toggle */}
            <div className="flex rounded-2xl p-1" style={{ backgroundColor: '#F2F2F7', border: '1px solid #D9E7EC' }}>
              {(['phone', 'email'] as const).map(m => (
                <button key={m} onClick={() => { setMethod(m); setValue(''); }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    backgroundColor: method === m ? 'white' : 'transparent',
                    color: method === m ? '#102A36' : '#607580',
                    boxShadow: method === m ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                  }}>
                  {m === 'phone' ? '📱 Phone' : '✉️ Email'}
                </button>
              ))}
            </div>

            {method === 'phone' ? (
              <div>
                <label className="text-xs font-semibold mb-1.5 block" style={{ color: '#607580' }}>
                  REGISTERED MOBILE NUMBER
                </label>
                <div className="flex items-center rounded-2xl overflow-hidden"
                  style={{ border: `1.5px solid ${focused === 'val' ? '#19B5A5' : '#D9E7EC'}`, backgroundColor: '#F2F2F7' }}>
                  <span className="pl-4 pr-2 text-sm" style={{ color: '#607580' }}>🇮🇳 +91</span>
                  <input type="tel" inputMode="numeric" placeholder="98765 43210"
                    value={value}
                    onChange={e => setValue(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    onFocus={() => setFocused('val')} onBlur={() => setFocused(null)}
                    className="flex-1 px-3 py-3.5 text-sm bg-transparent outline-none"
                    style={{ color: '#102A36' }} />
                </div>
              </div>
            ) : (
              <div>
                <label className="text-xs font-semibold mb-1.5 block" style={{ color: '#607580' }}>
                  REGISTERED EMAIL ADDRESS
                </label>
                <input type="email" placeholder="arjun@example.com" value={value}
                  onChange={e => setValue(e.target.value)}
                  onFocus={() => setFocused('val')} onBlur={() => setFocused(null)}
                  className="w-full px-4 py-3.5 rounded-2xl text-sm outline-none"
                  style={{ backgroundColor: '#F2F2F7', border: `1.5px solid ${focused === 'val' ? '#19B5A5' : '#D9E7EC'}`, color: '#102A36' }} />
              </div>
            )}

            {/* Info card */}
            <div className="rounded-2xl p-3 flex gap-3" style={{ backgroundColor: '#E8F8FD', border: '1px solid #87D8EA' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0 mt-0.5">
                <circle cx="12" cy="12" r="10" fill="#3FC2E5" />
                <path d="M12 8V12M12 16H12.01" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <p className="text-xs leading-relaxed" style={{ color: '#073B4C' }}>
                Make sure to enter the {method === 'phone' ? 'phone number' : 'email address'} linked to your GoSure account.
              </p>
            </div>
          </div>
        )}

        {/* ── Step: OTP ── */}
        {step === 'otp' && (
          <div className="flex flex-col items-center">
            <p className="text-sm text-center mb-1" style={{ color: '#607580' }}>Enter the 6-digit code sent to</p>
            <p className="text-sm font-semibold text-center mb-7" style={{ color: '#102A36' }}>{value}</p>

            <div className="flex gap-2.5">
              {otp.map((d, i) => (
                <input key={i}
                  ref={(el) => { otpRefs[i].current = el; }}
                  type="text" inputMode="numeric" maxLength={1} value={d}
                  onChange={e => handleOtpInput(i, e.target.value)}
                  onKeyDown={e => handleOtpKey(i, e)}
                  className="text-center text-xl font-bold rounded-2xl outline-none transition-all"
                  style={{
                    width: 46, height: 56,
                    backgroundColor: d ? '#E6F9F7' : '#F2F2F7',
                    border: `2px solid ${otpError ? '#FF3B30' : d ? '#19B5A5' : '#D9E7EC'}`,
                    color: '#102A36',
                  }} />
              ))}
            </div>

            {otpError && (
              <p className="text-xs mt-3 flex items-center gap-1.5" style={{ color: '#FF3B30' }}>
                <span>✗</span> Incorrect code. Please try again.
              </p>
            )}

            {verifying && (
              <div className="flex items-center gap-2 mt-3">
                <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="#19B5A5" strokeWidth="2" strokeDasharray="28 56" />
                </svg>
                <p className="text-xs" style={{ color: '#19B5A5' }}>Verifying…</p>
              </div>
            )}

            <div className="mt-6 text-center">
              {resend > 0 ? (
                <p className="text-sm" style={{ color: '#607580' }}>
                  Resend in <span className="font-semibold" style={{ color: '#102A36' }}>0:{String(resend).padStart(2, '0')}</span>
                </p>
              ) : (
                <button onClick={() => { setOtp(['', '', '', '', '', '']); setOtpError(false); startCountdown(); otpRefs[0].current?.focus(); }}
                  className="text-sm font-semibold" style={{ color: '#19B5A5' }}>
                  Resend Code
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── Step: reset ── */}
        {step === 'reset' && (
          <div className="space-y-4">
            <div className="rounded-2xl p-3 flex gap-2" style={{ backgroundColor: '#E6F4EE', border: '1px solid #34C759' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0 mt-0.5">
                <path d="M5 13L9 17L19 7" stroke="#34C759" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <p className="text-xs" style={{ color: '#34C759' }}>Identity verified. Set your new password.</p>
            </div>

            <div>
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: '#607580' }}>NEW PASSWORD</label>
              <div className="relative">
                <input type={showNew ? 'text' : 'password'} placeholder="Min. 6 characters"
                  value={newPass} onChange={e => setNewPass(e.target.value)}
                  onFocus={() => setFocused('new')} onBlur={() => setFocused(null)}
                  className="w-full px-4 py-3.5 pr-12 rounded-2xl text-sm outline-none"
                  style={{ backgroundColor: '#F2F2F7', border: `1.5px solid ${focused === 'new' ? '#19B5A5' : '#D9E7EC'}`, color: '#102A36' }} />
                <button onClick={() => setShowNew(!showNew)} className="absolute right-4 top-1/2 -translate-y-1/2">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    {showNew
                      ? <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20C7 20 2.73 16.5 1 12c.82-2.1 2.19-3.96 3.94-5.38M9.53 9.53A3 3 0 0 0 12 15a3 3 0 0 0 2.47-4.47M22.54 6.46l-16 16M1 1l16 16" stroke="#607580" strokeWidth="2" strokeLinecap="round" />
                      : <><path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12Z" stroke="#607580" strokeWidth="2" /><circle cx="12" cy="12" r="3" stroke="#607580" strokeWidth="2" /></>
                    }
                  </svg>
                </button>
              </div>

              {newPass.length > 0 && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map(n => (
                      <div key={n} className="flex-1 h-1.5 rounded-full"
                        style={{ backgroundColor: strengthScore >= n ? strengthColor : '#D9E7EC' }} />
                    ))}
                  </div>
                  <p className="text-xs font-medium" style={{ color: strengthColor }}>
                    {strengthLabel}
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: '#607580' }}>CONFIRM NEW PASSWORD</label>
              <div className="relative">
                <input type={showConfirm ? 'text' : 'password'} placeholder="Re-enter password"
                  value={confirmPass} onChange={e => setConfirmPass(e.target.value)}
                  onFocus={() => setFocused('confirm')} onBlur={() => setFocused(null)}
                  className="w-full px-4 py-3.5 pr-12 rounded-2xl text-sm outline-none"
                  style={{
                    backgroundColor: '#F2F2F7',
                    border: `1.5px solid ${
                      confirmPass.length > 0 ? (passwordsMatch ? '#34C759' : '#FF3B30') : focused === 'confirm' ? '#19B5A5' : '#D9E7EC'
                    }`,
                    color: '#102A36',
                  }} />
                <button onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    {showConfirm
                      ? <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20C7 20 2.73 16.5 1 12c.82-2.1 2.19-3.96 3.94-5.38M9.53 9.53A3 3 0 0 0 12 15a3 3 0 0 0 2.47-4.47M22.54 6.46l-16 16M1 1l16 16" stroke="#607580" strokeWidth="2" strokeLinecap="round" />
                      : <><path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12Z" stroke="#607580" strokeWidth="2" /><circle cx="12" cy="12" r="3" stroke="#607580" strokeWidth="2" /></>
                    }
                  </svg>
                </button>
              </div>
              {confirmPass.length > 0 && (
                <p className="text-xs mt-1" style={{ color: passwordsMatch ? '#34C759' : '#FF3B30' }}>
                  {passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
                </p>
              )}
            </div>
          </div>
        )}

        {/* ── Step: done ── */}
        {step === 'done' && (
          <div className="flex flex-col items-center pt-8 gap-5">
            <div className="w-24 h-24 rounded-full flex items-center justify-center"
              style={{ backgroundColor: '#E6F4EE' }}>
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
                <path d="M5 13L9 17L19 7" stroke="#34C759" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-xl font-bold" style={{ color: '#102A36' }}>Password Updated!</h2>
              <p className="text-sm leading-relaxed" style={{ color: '#607580' }}>
                Your password has been reset successfully. Sign in with your new password.
              </p>
            </div>

            <div className="w-full mt-4 rounded-2xl p-4 space-y-3" style={{ backgroundColor: '#E6F9F7', border: '1px solid #19B5A5' }}>
              {[
                'Password changed on 20 Sept 2026, 14:32',
                'All active sessions signed out',
                'Emergency contacts notified',
              ].map((msg, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: '#19B5A5' }}>
                    <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </div>
                  <p className="text-xs" style={{ color: '#073B4C' }}>{msg}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer CTA */}
      {step !== 'otp' && (
        <div className="px-5 pb-6 pt-3 bg-white shrink-0" style={{ borderTop: '1px solid #D9E7EC' }}>
          {step === 'method' && (
            <button onClick={handleSend} disabled={!value}
              className="w-full py-4 rounded-2xl font-semibold text-base transition-all"
              style={{ backgroundColor: value ? '#19B5A5' : '#D9E7EC', color: value ? 'white' : '#AABCC3' }}>
              Send Reset Code
            </button>
          )}
          {step === 'reset' && (
            <button onClick={handleReset} disabled={!canReset}
              className="w-full py-4 rounded-2xl font-semibold text-base transition-all"
              style={{ backgroundColor: canReset ? '#19B5A5' : '#D9E7EC', color: canReset ? 'white' : '#AABCC3' }}>
              Reset Password
            </button>
          )}
          {step === 'done' && (
            <button onClick={() => navigate('login')}
              className="w-full py-4 rounded-2xl font-semibold text-base text-white"
              style={{ backgroundColor: '#19B5A5' }}>
              Back to Sign In
            </button>
          )}
        </div>
      )}
    </div>
  );
}
