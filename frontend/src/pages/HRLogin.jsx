import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import api from '../api/axios';

export default function HRLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [resetStep, setResetStep] = useState(1);
  const [forgotMsg, setForgotMsg] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.access_token);
      localStorage.setItem('company', res.data.company_name);
      navigate('/hr/dashboard');
    } catch {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSend = async (e) => {
    e.preventDefault();
    if (!email) { setForgotMsg('Enter your email'); return; }
    setLoading(true);
    try {
      await api.post('/api/auth/forgot-password', { email });
      setForgotMsg('✅ OTP sent to your email!');
      setResetStep(2);
    } catch {
      setForgotMsg('❌ Email not found');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    const otp = e.target.otp.value;
    const newPass = e.target.password.value;
    if (!otp || !newPass) { setForgotMsg('Fill all fields'); return; }
    setLoading(true);
    try {
      await api.post('/api/auth/reset-password', { email, otp, new_password: newPass });
      setForgotMsg('✅ Password reset! Login now.');
      setTimeout(() => { setForgotMode(false); setResetStep(1); setForgotMsg(''); }, 2000);
    } catch {
      setForgotMsg('❌ Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20">
      <div className="absolute top-20 left-20 w-72 h-72 bg-indigo-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-20 w-72 h-72 bg-purple-200/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative">
        <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-white/50">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl inline-flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-indigo-200 mb-4">
              A
            </div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
              {forgotMode ? 'Reset Password' : 'Welcome back'}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {forgotMode ? 'We\'ll send you a verification code' : 'Sign in to your HR dashboard'}
            </p>
          </div>

          {error && !forgotMode && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm mb-4 text-center font-medium border border-red-100">{error}</div>
          )}
          {forgotMsg && (
            <div className={`px-4 py-3 rounded-xl text-sm mb-4 text-center font-medium ${forgotMsg.includes('✅') ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'} border`}>
              {forgotMsg}
            </div>
          )}

          {forgotMode ? (
            <div className="space-y-3">
              {resetStep === 1 ? (
                <form onSubmit={handleForgotSend}>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Your Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="hr@company.com"
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-slate-50/50 text-sm outline-none focus:border-indigo-400 transition-all"
                    required
                  />
                  <button type="submit" disabled={loading} className="w-full mt-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-semibold text-sm flex items-center justify-center gap-2">
                    {loading ? <><Loader2 size={16} className="animate-spin" /> Sending...</> : 'Send OTP'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleReset}>
                  <p className="text-center text-sm text-slate-600 mb-3">Code sent to <strong className="text-indigo-600">{email}</strong></p>
                  <input name="otp" placeholder="Enter OTP" className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-slate-50/50 text-sm outline-none focus:border-indigo-400 mb-2" required />
                  <input name="password" type="password" placeholder="New password" className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-slate-50/50 text-sm outline-none focus:border-indigo-400 mb-2" required />
                  <button type="submit" disabled={loading} className="w-full py-3 bg-green-600 text-white rounded-2xl font-semibold text-sm flex items-center justify-center gap-2">
                    {loading ? <><Loader2 size={16} className="animate-spin" /> Resetting...</> : 'Reset Password'}
                  </button>
                </form>
              )}
              <button onClick={() => { setForgotMode(false); setResetStep(1); setForgotMsg(''); }} className="w-full text-sm text-slate-500 hover:text-slate-700 py-2">
                ← Back to Login
              </button>
            </div>
          ) : (
            <>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="hr@company.com"
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-slate-50/50 text-sm outline-none focus:border-indigo-400 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-slate-50/50 text-sm outline-none focus:border-indigo-400 transition-all"
                    required
                  />
                </div>
                <button type="submit" disabled={loading} className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-semibold text-sm hover:shadow-lg hover:shadow-indigo-200 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                  {loading ? <><Loader2 size={16} className="animate-spin" /> Signing in...</> : 'Sign In'}
                </button>
              </form>

              <div className="flex items-center justify-between mt-3">
                <button onClick={() => setForgotMode(true)} className="text-xs text-indigo-600 font-medium hover:underline">
                  Forgot Password?
                </button>
              </div>

              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-xs text-slate-400 font-semibold uppercase">or</span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              <p className="text-center text-sm text-slate-500">
                New to AskHR?{' '}
                <Link to="/hr/register" className="text-indigo-600 font-semibold hover:underline">Create account</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}