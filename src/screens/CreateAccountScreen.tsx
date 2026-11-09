import { useState } from 'react';
import { useNav } from '../context/NavContext';
import Logo from '../components/Logo';

const steps = ['Personal Info', 'Contact', 'Security'];

export default function CreateAccountScreen() {
  const { navigate, goBack } = useNav();

  const [step, setStep] = useState(0);
  const [focused, setFocused] = useState<string | null>(null);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    gender: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }));

  const passwordsMatch = form.password === form.confirmPassword && form.confirmPassword.length > 0;
  const passwordStrength = (() => {
    const p = form.password;
    if (!p) return null;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();

  const strengthLabel = ['Weak', 'Fair', 'Good', 'Strong'][passwordStrength ? passwordStrength - 1 : 0];
  const strengthColor = ['#FF3B30', '#FF9F0A', '#3FC2E5', '#34C759'][passwordStrength ? passwordStrength - 1 : 0];

  const canNext = [
    form.firstName.length >= 2 && form.lastName.length >= 2,
    form.phone.length >= 8 || form.email.includes('@'),
    form.password.length >= 6 && passwordsMatch && agreed,
  ][step];

  const handleNext = () => {
    if (step < 2) setStep(step + 1);
    else navigate('otp', { phone: form.phone || form.email, isNewAccount: true });
  };

  const inputStyle = (key: string) => ({
    backgroundColor: '#F2F2F7',
    border: `1.5px solid ${focused === key ? '#19B5A5' : '#D9E7EC'}`,
    color: '#102A36' as const,
  });

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: '#F2F2F7' }}>
      {/* Header */}
      <div className="px-5 pt-5 pb-6 shrink-0" style={{ backgroundColor: '#073B4C' }}>
        <div className="flex items-center gap-3 mb-5">
          <button onClick={goBack}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          <Logo size={36} />
          <div>
            <h1 className="text-lg font-bold text-white">Create Account</h1>
            <p className="text-xs" style={{ color: '#87D8EA' }}>Join 50,000+ safe travelers</p>
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-0">
          {steps.map((label, i) => (
            <div key={i} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{
                    backgroundColor: i < step ? '#34C759' : i === step ? '#19B5A5' : 'rgba(255,255,255,0.15)',
                    color: i <= step ? 'white' : '#87D8EA',
                  }}>
                  {i < step ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <path d="M5 13L9 17L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                  ) : i + 1}
                </div>
                <span className="text-[9px] mt-1 font-medium whitespace-nowrap"
                  style={{ color: i === step ? '#19B5A5' : '#87D8EA' }}>
                  {label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className="flex-1 h-0.5 mx-1 mb-4 rounded-full"
                  style={{ backgroundColor: i < step ? '#34C759' : 'rgba(255,255,255,0.2)' }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form body */}
      <div className="flex-1 overflow-y-auto px-5 pt-5 pb-4">

        {/* ── Step 0: Personal Info ── */}
        {step === 0 && (
          <div className="space-y-4">
            <div className="flex flex-col items-center mb-6">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mb-2 relative"
                style={{ backgroundColor: '#E8F8FD', border: '2px dashed #87D8EA' }}>
                <span className="text-3xl">🧑</span>
                <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: '#19B5A5' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path d="M12 5V19M5 12H19" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
              <p className="text-xs" style={{ color: '#607580' }}>Add profile photo (optional)</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold mb-1.5 block" style={{ color: '#607580' }}>FIRST NAME</label>
                <input placeholder="Arjun" value={form.firstName} onChange={set('firstName')}
                  onFocus={() => setFocused('firstName')} onBlur={() => setFocused(null)}
                  className="w-full px-4 py-3.5 rounded-2xl text-sm outline-none"
                  style={inputStyle('firstName')} />
              </div>
              <div>
                <label className="text-xs font-semibold mb-1.5 block" style={{ color: '#607580' }}>LAST NAME</label>
                <input placeholder="Trivedi" value={form.lastName} onChange={set('lastName')}
                  onFocus={() => setFocused('lastName')} onBlur={() => setFocused(null)}
                  className="w-full px-4 py-3.5 rounded-2xl text-sm outline-none"
                  style={inputStyle('lastName')} />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: '#607580' }}>DATE OF BIRTH</label>
              <input type="date" value={form.dob} onChange={set('dob')}
                onFocus={() => setFocused('dob')} onBlur={() => setFocused(null)}
                className="w-full px-4 py-3.5 rounded-2xl text-sm outline-none"
                style={inputStyle('dob')} />
            </div>

            <div>
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: '#607580' }}>GENDER</label>
              <div className="flex gap-2">
                {['Male', 'Female', 'Other'].map(g => (
                  <button key={g} onClick={() => setForm(f => ({ ...f, gender: g }))}
                    className="flex-1 py-3 rounded-2xl text-sm font-medium transition-all"
                    style={{
                      backgroundColor: form.gender === g ? '#E6F9F7' : '#F2F2F7',
                      border: `1.5px solid ${form.gender === g ? '#19B5A5' : '#D9E7EC'}`,
                      color: form.gender === g ? '#19B5A5' : '#607580',
                    }}>
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Step 1: Contact ── */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="rounded-2xl p-3 flex gap-2 items-start" style={{ backgroundColor: '#E8F8FD', border: '1px solid #87D8EA' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" fill="#3FC2E5" />
                <path d="M12 8V12M12 16H12.01" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <p className="text-xs leading-relaxed" style={{ color: '#073B4C' }}>
                Your contact details are used for OTP verification and emergency alerts only.
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: '#607580' }}>MOBILE NUMBER</label>
              <div className="flex items-center rounded-2xl overflow-hidden" style={{ border: `1.5px solid ${focused === 'phone' ? '#19B5A5' : '#D9E7EC'}`, backgroundColor: '#F2F2F7' }}>
                <span className="pl-4 pr-2 text-sm" style={{ color: '#607580' }}>🇮🇳 +91</span>
                <input type="tel" inputMode="numeric" placeholder="98765 43210"
                  value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                  onFocus={() => setFocused('phone')} onBlur={() => setFocused(null)}
                  className="flex-1 px-3 py-3.5 text-sm bg-transparent outline-none"
                  style={{ color: '#102A36' }} />
                {form.phone.length === 10 && (
                  <span className="pr-4" style={{ color: '#34C759' }}>✓</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px" style={{ backgroundColor: '#D9E7EC' }} />
              <span className="text-xs" style={{ color: '#AABCC3' }}>and / or</span>
              <div className="flex-1 h-px" style={{ backgroundColor: '#D9E7EC' }} />
            </div>

            <div>
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: '#607580' }}>EMAIL ADDRESS</label>
              <input type="email" placeholder="arjun@example.com"
                value={form.email} onChange={set('email')}
                onFocus={() => setFocused('email')} onBlur={() => setFocused(null)}
                className="w-full px-4 py-3.5 rounded-2xl text-sm outline-none"
                style={inputStyle('email')} />
              {form.email.includes('@') && form.email.includes('.') && (
                <p className="text-xs mt-1 flex items-center gap-1" style={{ color: '#34C759' }}>
                  <span>✓</span> Valid email address
                </p>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: '#607580' }}>REFERRAL CODE (OPTIONAL)</label>
              <input placeholder="e.g. GOSURE50"
                onFocus={() => setFocused('ref')} onBlur={() => setFocused(null)}
                className="w-full px-4 py-3.5 rounded-2xl text-sm outline-none"
                style={inputStyle('ref')} />
            </div>
          </div>
        )}

        {/* ── Step 2: Security ── */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: '#607580' }}>CREATE PASSWORD</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} placeholder="Min. 6 characters"
                  value={form.password} onChange={set('password')}
                  onFocus={() => setFocused('password')} onBlur={() => setFocused(null)}
                  className="w-full px-4 py-3.5 pr-12 rounded-2xl text-sm outline-none"
                  style={inputStyle('password')} />
                <button onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    {showPass
                      ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20C7 20 2.73 16.5 1 12c.82-2.1 2.19-3.96 3.94-5.38M9.53 9.53A3 3 0 0 0 12 15a3 3 0 0 0 2.47-4.47M22.54 6.46l-16 16M1 1l16 16" stroke="#607580" strokeWidth="2" strokeLinecap="round" /></>
                      : <><path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12Z" stroke="#607580" strokeWidth="2" /><circle cx="12" cy="12" r="3" stroke="#607580" strokeWidth="2" /></>
                    }
                  </svg>
                </button>
              </div>

              {/* Strength meter */}
              {form.password.length > 0 && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map(n => (
                      <div key={n} className="flex-1 h-1.5 rounded-full transition-all"
                        style={{ backgroundColor: (passwordStrength ?? 0) >= n ? strengthColor : '#D9E7EC' }} />
                    ))}
                  </div>
                  <p className="text-xs font-medium" style={{ color: strengthColor }}>
                    Password strength: {strengthLabel}
                  </p>
                </div>
              )}

              {/* Requirements */}
              <div className="mt-2 space-y-1">
                {[
                  { label: 'At least 8 characters', ok: form.password.length >= 8 },
                  { label: 'One uppercase letter', ok: /[A-Z]/.test(form.password) },
                  { label: 'One number', ok: /[0-9]/.test(form.password) },
                ].map(r => (
                  <div key={r.label} className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                      style={{ backgroundColor: r.ok ? '#E6F4EE' : '#F2F2F7', border: `1px solid ${r.ok ? '#34C759' : '#D9E7EC'}` }}>
                      {r.ok && (
                        <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                          <path d="M2 5L4 7L8 3" stroke="#34C759" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      )}
                    </div>
                    <span className="text-xs" style={{ color: r.ok ? '#34C759' : '#607580' }}>{r.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: '#607580' }}>CONFIRM PASSWORD</label>
              <div className="relative">
                <input type={showConfirm ? 'text' : 'password'} placeholder="Re-enter password"
                  value={form.confirmPassword} onChange={set('confirmPassword')}
                  onFocus={() => setFocused('confirm')} onBlur={() => setFocused(null)}
                  className="w-full px-4 py-3.5 pr-12 rounded-2xl text-sm outline-none"
                  style={{
                    backgroundColor: '#F2F2F7',
                    border: `1.5px solid ${
                      form.confirmPassword.length > 0
                        ? passwordsMatch ? '#34C759' : '#FF3B30'
                        : focused === 'confirm' ? '#19B5A5' : '#D9E7EC'
                    }`,
                    color: '#102A36',
                  }} />
                <button onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    {showConfirm
                      ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20C7 20 2.73 16.5 1 12c.82-2.1 2.19-3.96 3.94-5.38M9.53 9.53A3 3 0 0 0 12 15a3 3 0 0 0 2.47-4.47M22.54 6.46l-16 16M1 1l16 16" stroke="#607580" strokeWidth="2" strokeLinecap="round" /></>
                      : <><path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12Z" stroke="#607580" strokeWidth="2" /><circle cx="12" cy="12" r="3" stroke="#607580" strokeWidth="2" /></>
                    }
                  </svg>
                </button>
              </div>
              {form.confirmPassword.length > 0 && (
                <p className="text-xs mt-1 flex items-center gap-1"
                  style={{ color: passwordsMatch ? '#34C759' : '#FF3B30' }}>
                  {passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
                </p>
              )}
            </div>

            {/* Agreement */}
            <button onClick={() => setAgreed(!agreed)}
              className="flex items-start gap-3 text-left w-full">
              <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-all"
                style={{ backgroundColor: agreed ? '#19B5A5' : 'white', border: `2px solid ${agreed ? '#19B5A5' : '#D9E7EC'}` }}>
                {agreed && (
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                    <path d="M2 5.5L4.5 8L9 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                )}
              </div>
              <p className="text-xs leading-relaxed" style={{ color: '#607580' }}>
                I agree to GoSure's{' '}
                <span style={{ color: '#19B5A5' }}>Terms of Service</span> and{' '}
                <span style={{ color: '#19B5A5' }}>Privacy Policy</span>. I consent to receive safety alerts.
              </p>
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 pb-6 pt-3 bg-white shrink-0" style={{ borderTop: '1px solid #D9E7EC' }}>
        <button onClick={handleNext} disabled={!canNext}
          className="w-full py-4 rounded-2xl font-semibold text-base transition-all"
          style={{
            backgroundColor: canNext ? '#19B5A5' : '#D9E7EC',
            color: canNext ? 'white' : '#AABCC3',
          }}>
          {step < 2 ? 'Continue' : 'Create Account'}
        </button>
        {step === 0 && (
          <p className="text-center mt-3 text-xs" style={{ color: '#607580' }}>
            Already have an account?{' '}
            <button onClick={() => navigate('login')} className="font-semibold" style={{ color: '#19B5A5' }}>
              Sign In
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
