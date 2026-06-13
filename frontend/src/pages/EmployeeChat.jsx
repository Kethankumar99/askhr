import { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import api from '../api/axios';

export default function EmployeeChat() {
  const { company } = useParams();
  const [email, setEmail] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => { scrollToBottom(); }, [messages]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email) return;
    
    setError('');
    setChecking(true);

    try {
      // Check if employee exists
      const checkRes = await api.get(`/api/chatbot/test?employee_email=${encodeURIComponent(email)}`);
      
      if (checkRes.data.exists) {
        setLoggedIn(true);
        setMessages([{ 
          type: 'bot', 
          text: `👋 Hello! I'm your HR Assistant. Ask me anything about company policies, leaves, WFH, salary structure, etc.` 
        }]);
      } else {
        setError(`❌ This email is not registered with ${company?.replace(/-/g, ' ').toUpperCase()}. Please contact HR to add you.`);
      }
    } catch {
      setError('❌ Unable to verify email. Please try again.');
    } finally {
      setChecking(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const userMessage = { type: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/api/chatbot/ask', { 
        employee_email: email, 
        question: input 
      });
      setMessages((prev) => [...prev, { type: 'bot', text: res.data.answer }]);
    } catch {
      setMessages((prev) => [...prev, { 
        type: 'bot', 
        text: '❌ Sorry, something went wrong. Please try again.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  // LOGIN SCREEN
  if (!loggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20 flex items-center justify-center p-4">
        <div className="absolute top-20 left-20 w-72 h-72 bg-indigo-200/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-purple-200/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-8 w-full max-w-md shadow-xl shadow-slate-200/50 border border-white/50">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl inline-flex items-center justify-center text-3xl text-white shadow-lg shadow-indigo-200 mb-4">
              🤖
            </div>
            <h1 className="text-2xl font-bold text-slate-800">HR Assistant</h1>
            <p className="text-sm text-slate-500 mt-1">{company?.replace(/-/g, ' ').toUpperCase()}</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm mb-4 text-center font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
              Company Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              placeholder="ramesh@company.com"
              className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-slate-50/50 text-sm outline-none focus:border-indigo-400 transition-all"
              required
            />
            <button 
              type="submit" 
              disabled={checking}
              className="w-full mt-4 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-semibold text-sm hover:shadow-lg hover:shadow-indigo-200 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {checking ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Verifying...
                </>
              ) : (
                '🚀 Start Chat'
              )}
            </button>
          </form>
          <p className="text-center text-slate-400 text-xs mt-6">Powered by AskHR</p>
        </div>
      </div>
    );
  }

  // CHAT SCREEN
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20 flex flex-col">
      <div className="bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-lg text-white shadow">🤖</div>
        <div>
          <h2 className="font-semibold text-slate-800 text-sm">HR Assistant</h2>
          <p className="text-xs text-slate-500">{email}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-2.5 ${msg.type === 'user' ? 'justify-end' : ''}`}>
              {msg.type === 'bot' && (
                <div className="w-8 h-8 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Bot size={16} className="text-indigo-600" />
                </div>
              )}
              <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                msg.type === 'user'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-md'
                  : 'bg-white border border-slate-100 text-slate-700 rounded-bl-md shadow-sm'
              }`}>
                {msg.text}
              </div>
              {msg.type === 'user' && (
                <div className="w-8 h-8 bg-slate-200 rounded-xl flex items-center justify-center flex-shrink-0">
                  <User size={16} className="text-slate-500" />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex gap-2.5">
              <div className="w-8 h-8 bg-indigo-100 rounded-xl flex items-center justify-center">
                <Bot size={16} className="text-indigo-600" />
              </div>
              <div className="bg-white border px-4 py-2.5 rounded-2xl shadow-sm">
                <Loader2 size={18} className="animate-spin text-indigo-500" />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-xl border-t border-slate-100 px-4 md:px-8 py-4">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSend} className="flex gap-2.5">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about policies..."
              className="flex-1 px-4 py-3 border border-slate-200 rounded-2xl bg-slate-50/50 text-sm outline-none focus:border-indigo-400"
              disabled={loading}
            />
            <button type="submit" disabled={loading} className="px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl hover:shadow-lg disabled:opacity-50">
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}