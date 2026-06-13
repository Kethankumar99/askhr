import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import api from '../api/axios';

export default function HRRegister() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ email: '', password: '', company: '', botName: '' });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/api/auth/register', {
        email: form.email,
        password: form.password,
        company_name: form.company,
        bot_name: form.botName
      });
      setSuccess('Verification code sent!');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await api.post('/api/auth/register', {
        email: form.email,
        password: form.password,
        company_name: form.company,
        bot_name: form.botName
      });
      setSuccess('Code resent!');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to resend');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) document.getElementById(`otp-${index + 1}`)?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length !== 6) { setError('Enter complete code'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/api/auth/verify-otp', { email: form.email, otp: otpCode });
      localStorage.setItem('token', res.data.access_token);
      localStorage.setItem('company', res.data.company_name);
      setSuccess('Account created! Redirecting...');
      setTimeout(() => navigate('/hr/dashboard'), 1000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20">
      <div className="absolute top-20 right-20 w-72 h-72 bg-purple-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-20 w-72 h-72 bg-indigo-200/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative">
        <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-white/50">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl inline-flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-indigo-200 mb-4">
              A
            </div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Create Account</h1>
            <p className="text-sm text-slate-500 mt-1">Set up your AI HR Assistant</p>
          </div>

          {/* Steps */}
          <div className="flex justify-center items-center gap-3 mb-6">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step === 1 ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-slate-100 text-slate-400'}`}>1</div>
            <div className={`w-8 h-0.5 rounded transition-all ${step === 2 ? 'bg-indigo-600' : 'bg-slate-200'}`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step === 2 ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-slate-100 text-slate-400'}`}>2</div>
          </div>

          {error && <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm mb-4 text-center font-medium">{error}</div>}
          {success && <div className="bg-green-50 border border-green-100 text-green-600 px-4 py-3 rounded-xl text-sm mb-4 text-center font-medium">{success}</div>}

          {step === 1 ? (
            <form onSubmit={handleRegister} className="space-y-3">
              {[
                { label: 'Company Email', icon: '✉️', type: 'email', key: 'email', placeholder: 'hr@company.com' },
                { label: 'Password', icon: '🔒', type: 'password', key: 'password', placeholder: 'Create password' },
                { label: 'Company Name', icon: '🏢', type: 'text', key: 'company', placeholder: 'Company name' },
                { label: 'Bot Name', icon: '🤖', type: 'text', key: 'botName', placeholder: 'HR Assistant' },
              ].map((f) => (
                <div key={f.key}>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">{f.label}</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm opacity-70">{f.icon}</span>
                    <input
                      type={f.type}
                      value={form[f.key]}
                      onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                      placeholder={f.placeholder}
                      className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-2xl bg-slate-50/50 text-slate-800 outline-none focus:border-indigo-400 transition-all text-sm"
                      required
                    />
                  </div>
                </div>
              ))}
              <button type="submit" disabled={loading} className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-semibold text-sm hover:shadow-lg transition-all disabled:opacity-60 flex items-center justify-center gap-2 mt-2">
                {loading ? <><Loader2 size={16} className="animate-spin" /> Sending...</> : 'Send Verification Code'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-slate-500">Code sent to</p>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <strong className="text-indigo-600">{form.email}</strong>
                  <button type="button" onClick={() => { setStep(1); setError(''); setSuccess(''); }} className="text-xs text-slate-400 hover:text-indigo-600 underline">Change</button>
                </div>
              </div>

              <div className="flex gap-2.5 justify-center">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className="w-12 h-14 text-center text-xl font-bold border border-slate-200 rounded-xl bg-slate-50/50 outline-none focus:border-indigo-400 transition-all text-slate-800"
                  />
                ))}
              </div>

              <p className="text-center text-xs text-slate-400">
                Didn't receive code?{' '}
                <button type="button" onClick={handleResend} disabled={loading} className="text-indigo-600 font-semibold hover:underline disabled:opacity-50">
                  Resend
                </button>
              </p>

              <button type="submit" disabled={loading} className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-semibold text-sm hover:shadow-lg transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                {loading ? <><Loader2 size={16} className="animate-spin" /> Creating...</> : 'Verify & Create Account'}
              </button>
            </form>
          )}

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400 font-semibold uppercase">or</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          <p className="text-center text-sm text-slate-500">
            Already registered?{' '}
            <Link to="/hr/login" className="text-indigo-600 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}