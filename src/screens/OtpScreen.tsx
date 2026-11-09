import { useState, useRef, useEffect, useCallback } from 'react';
import { useNav } from '../context/NavContext';

const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;

// Circumference for the circular countdown ring (r=22)
const CIRC = 2 * Math.PI * 22;

export default function OtpScreen() {
  const { navigate, params, goBack } = useNav();
  const phone: string = params.phone || '+91 98765 43210';
  const isNew: boolean = !!params.isNewAccount;

  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [status, setStatus] = useState<'idle' | 'verifying' | 'error' | 'success'>('idle');
  const [shake, setShake] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_SECONDS);
  const [resendFlash, setResendFlash] = useState(false);

  // Safe array ref — no hooks-in-loop
  const inputRefs = useRef<(HTMLInputElement | null)[]>(Array(OTP_LENGTH).fill(null));

  // Focus first box on mount
  useEffect(() => { inputRefs.current[0]?.focus(); }, []);

  // Countdown tick
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setInterval(() => setCountdown(c => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [countdown]);

  const verify = useCallback((code: string) => {
    setStatus('verifying');
    setTimeout(() => {
      if (code === '000000') {
        setStatus('error');
        setShake(true);
        setDigits(Array(OTP_LENGTH).fill(''));
        setTimeout(() => { setShake(false); setStatus('idle'); inputRefs.current[0]?.focus(); }, 700);
      } else {
        setStatus('success');
        setTimeout(() => navigate(isNew ? 'home' : 'home'), 1400);
      }
    }, 1300);
  }, [navigate, isNew]);

  const handleChange = (i: number, val: string) => {
    const char = val.replace(/\D/g, '').slice(-1);
    if (!char) return;
    if (status === 'error' || status === 'verifying') return;
    const next = [...digits];
    next[i] = char;
    setDigits(next);
    if (i < OTP_LENGTH - 1) {
      inputRefs.current[i + 1]?.focus();
    } else if (next.every(Boolean)) {
      verify(next.join(''));
    }
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const next = [...digits];
      if (next[i]) {
        next[i] = '';
        setDigits(next);
      } else if (i > 0) {
        next[i - 1] = '';
        setDigits(next);
        inputRefs.current[i - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && i > 0) {
      inputRefs.current[i - 1]?.focus();
    } else if (e.key === 'ArrowRight' && i < OTP_LENGTH - 1) {
      inputRefs.current[i + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = Array(OTP_LENGTH).fill('');
    for (let j = 0; j < pasted.length; j++) next[j] = pasted[j];
    setDigits(next);
    const focusIdx = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[focusIdx]?.focus();
    if (pasted.length === OTP_LENGTH) verify(pasted);
  };

  const handleResend = () => {
    if (countdown > 0) return;
    setDigits(Array(OTP_LENGTH).fill(''));
    setStatus('idle');
    setCountdown(RESEND_SECONDS);
    setResendFlash(true);
    setTimeout(() => setResendFlash(false), 1500);
    inputRefs.current[0]?.focus();
  };

  const filled = digits.filter(Boolean).length;
  const canVerify = filled === OTP_LENGTH && status === 'idle';
  const progress = countdown / RESEND_SECONDS;

  // Derive box state
  const boxState = (i: number) => {
    if (status === 'success') return 'success';
    if (status === 'error') return 'error';
    if (digits[i]) return 'filled';
    return 'empty';
  };

  const boxStyle = (state: string): React.CSSProperties => {
    const base: React.CSSProperties = {
      width: 48,
      height: 60,
      borderRadius: 16,
      textAlign: 'center' as const,
      fontSize: 22,
      fontWeight: 700,
      outline: 'none',
      transition: 'all 0.15s ease',
      caretColor: 'transparent',
      fontFamily: 'Inter, sans-serif',
    };
    if (state === 'success') return { ...base, backgroundColor: '#E6F4EE', border: '2px solid #34C759', color: '#34C759' };
    if (state === 'error') return { ...base, backgroundColor: '#FFF0F0', border: '2px solid #FF3B30', color: '#FF3B30' };
    if (state === 'filled') return { ...base, backgroundColor: '#E6F9F7', border: '2px solid #19B5A5', color: '#102A36' };
    return { ...base, backgroundColor: '#F2F2F7', border: '2px solid #D9E7EC', color: '#102A36' };
  };

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: '#F2F2F7' }}>

      {/* ── Header ── */}
      <div className="shrink-0 px-5 pt-5 pb-7" style={{ backgroundColor: '#073B4C' }}>
        <button onClick={goBack}
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        <div className="mt-4 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-white leading-tight">
              {status === 'success' ? 'Verified!' : 'Enter OTP'}
            </h1>
            <p className="text-sm mt-1" style={{ color: '#87D8EA' }}>
              {status === 'success'
                ? isNew ? 'Account created successfully' : 'Welcome back to GoSure'
                : `6-digit code sent to`}
            </p>
            {status !== 'success' && (
              <div className="flex items-center gap-2 mt-1">
                <p className="text-sm font-semibold text-white">{phone}</p>
                <button onClick={goBack} className="text-xs px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#87D8EA' }}>
                  Change
                </button>
              </div>
            )}
          </div>

          {/* Circular countdown — hidden on success */}
          {status !== 'success' && (
            <div className="relative w-14 h-14 shrink-0">
              <svg width="56" height="56" viewBox="0 0 56 56" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="28" cy="28" r="22" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="4" />
                <circle cx="28" cy="28" r="22" fill="none"
                  stroke={countdown > 0 ? '#19B5A5' : '#FF3B30'}
                  strokeWidth="4"
                  strokeDasharray={CIRC}
                  strokeDashoffset={CIRC * (1 - progress)}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold" style={{ color: countdown > 0 ? 'white' : '#FF3B30' }}>
                  {String(countdown).padStart(2, '0')}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex-1 flex flex-col px-6">

        {/* Success state */}
        {status === 'success' ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-6">
            {/* Animated checkmark */}
            <div className="relative">
              <div className="w-28 h-28 rounded-full flex items-center justify-center"
                style={{ backgroundColor: '#E6F4EE' }}>
                <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
                  <circle cx="28" cy="28" r="26" stroke="#34C759" strokeWidth="2" fill="none" opacity="0.3" />
                  <path d="M16 28L24 36L40 20" stroke="#34C759" strokeWidth="3"
                    strokeLinecap="round" strokeLinejoin="round"
                    style={{
                      strokeDasharray: 40,
                      strokeDashoffset: 0,
                      animation: 'draw-check 0.5s ease forwards',
                    }} />
                </svg>
              </div>
              <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: '#34C759' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M5 13L9 17L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
            </div>
            <div className="text-center space-y-1">
              <p className="text-xl font-bold" style={{ color: '#102A36' }}>
                {isNew ? 'Account Created!' : 'Identity Verified!'}
              </p>
              <p className="text-sm" style={{ color: '#607580' }}>
                {isNew ? 'Welcome to GoSure 🎉' : 'Welcome back 👋'}
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-full"
              style={{ backgroundColor: '#E6F9F7' }}>
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#34C759' }} />
              <p className="text-xs font-medium" style={{ color: '#19B5A5' }}>Taking you to GoSure…</p>
            </div>
          </div>
        ) : (
          <>
            {/* Illustration */}
            <div className="flex justify-center mt-7 mb-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-3xl flex items-center justify-center"
                  style={{ backgroundColor: '#E8F8FD' }}>
                  <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
                    <rect x="10" y="4" width="32" height="44" rx="6" fill="#073B4C" />
                    <rect x="13" y="8" width="26" height="36" rx="4" fill="#E8F8FD" />
                    <rect x="20" y="4" width="12" height="4" rx="2" fill="#19B5A5" />
                    <rect x="16" y="22" width="20" height="2.5" rx="1.25" fill="#D9E7EC" />
                    <rect x="16" y="27" width="14" height="2.5" rx="1.25" fill="#D9E7EC" />
                    <circle cx="39" cy="39" r="11" fill="#19B5A5" />
                    <path d="M34 39L37.5 42.5L44 36" stroke="white" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
                {/* Pulse ring */}
                {status === 'verifying' && (
                  <div className="absolute inset-0 rounded-3xl animate-ping opacity-20"
                    style={{ backgroundColor: '#19B5A5' }} />
                )}
              </div>
            </div>

            {/* OTP boxes */}
            <div
              className="flex gap-2 justify-center mb-3"
              onPaste={handlePaste}
              style={{
                animation: shake ? 'shake 0.5s ease' : 'none',
              }}>
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  autoComplete={i === 0 ? 'one-time-code' : 'off'}
                  maxLength={1}
                  value={d}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  disabled={status === 'verifying'}
                  style={boxStyle(boxState(i))}
                />
              ))}
            </div>

            {/* Fill-progress dots */}
            <div className="flex gap-1.5 justify-center mb-5">
              {digits.map((d, i) => (
                <div key={i} className="rounded-full transition-all duration-200"
                  style={{
                    width: d ? 20 : 8,
                    height: 6,
                    backgroundColor: status === 'error' ? '#FF3B30' : d ? '#19B5A5' : '#D9E7EC',
                  }} />
              ))}
            </div>

            {/* Status message */}
            <div className="min-h-[28px] flex items-center justify-center mb-5">
              {status === 'error' && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-full"
                  style={{ backgroundColor: '#FFF0F0' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" fill="#FF3B30" />
                    <path d="M12 8V12M12 16H12.01" stroke="white" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <p className="text-xs font-medium" style={{ color: '#FF3B30' }}>
                    Incorrect OTP — please try again
                  </p>
                </div>
              )}
              {status === 'verifying' && (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="9" stroke="#19B5A5" strokeWidth="2.5"
                      strokeDasharray="20 40" />
                  </svg>
                  <p className="text-sm font-medium" style={{ color: '#19B5A5' }}>Verifying…</p>
                </div>
              )}
              {resendFlash && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-full"
                  style={{ backgroundColor: '#E6F9F7' }}>
                  <p className="text-xs font-medium" style={{ color: '#19B5A5' }}>
                    New OTP sent!
                  </p>
                </div>
              )}
            </div>

            {/* Verify button */}
            <button
              onClick={() => canVerify && verify(digits.join(''))}
              disabled={!canVerify}
              className="w-full py-4 rounded-2xl font-semibold text-base transition-all"
              style={{
                backgroundColor: canVerify ? '#19B5A5' : '#D9E7EC',
                color: canVerify ? 'white' : '#AABCC3',
              }}>
              Verify OTP
            </button>

            {/* Resend row */}
            <div className="mt-5 flex items-center justify-center gap-1.5">
              <p className="text-sm" style={{ color: '#607580' }}>
                Didn't receive it?
              </p>
              {countdown > 0 ? (
                <p className="text-sm" style={{ color: '#607580' }}>
                  Resend in <span className="font-semibold" style={{ color: '#102A36' }}>
                    0:{String(countdown).padStart(2, '0')}
                  </span>
                </p>
              ) : (
                <button onClick={handleResend}
                  className="text-sm font-semibold"
                  style={{ color: '#19B5A5' }}>
                  Resend OTP
                </button>
              )}
            </div>

            <p className="text-xs text-center mt-3" style={{ color: '#AABCC3' }}>
              For testing, enter anything except 000000 to verify
            </p>
          </>
        )}
      </div>

      {/* Keyframe styles */}
      <style>{`
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          15% { transform: translateX(-8px); }
          30% { transform: translateX(8px); }
          45% { transform: translateX(-6px); }
          60% { transform: translateX(6px); }
          75% { transform: translateX(-3px); }
          90% { transform: translateX(3px); }
        }
        @keyframes draw-check {
          from { stroke-dashoffset: 40; }
          to   { stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  );
}
