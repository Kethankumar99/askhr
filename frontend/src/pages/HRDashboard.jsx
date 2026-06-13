import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, FileText, MessageCircle, Upload, Plus, Trash2, Copy, ExternalLink, Eye, LogOut, Loader2 } from 'lucide-react';
import api from '../api/axios';
import Modal from '../components/Modal';
import ResultModal from '../components/ResultModal';

const API_URL = 'https://askhr-1e3a.onrender.com';
const FRONTEND_URL = 'https://askhr-9fz0yxrk4-kethan-s-projects.vercel.app';

export default function HRDashboard() {
  const [data, setData] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [activeTab, setActiveTab] = useState('employees');
  const [loaded, setLoaded] = useState(false);
  const [modal, setModal] = useState({ open: false, title: '', message: '', onConfirm: null });
  const [resultModal, setResultModal] = useState({ open: false, title: '', data: {} });
  const [page, setPage] = useState(1);
  const [addMsg, setAddMsg] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ show: false, fileName: '', fileSize: '', status: '' });
  const [docUploading, setDocUploading] = useState(false);
  const [docProgress, setDocProgress] = useState({ show: false, fileName: '', fileSize: '', status: '' });
  const perPage = 5;
  const navigate = useNavigate();
  const companyName = localStorage.getItem('company') || 'Company';

  const fetchAll = async () => {
    try {
      const [dash, emp, docs] = await Promise.all([
        api.get('/api/dashboard/'),
        api.get('/api/employees/'),
        api.get('/api/documents/')
      ]);
      setData(dash.data);
      setEmployees(emp.data.employees || []);
      setDocuments(docs.data.documents || []);
      setLoaded(true);
    } catch { navigate('/hr/login'); }
  };

  if (!loaded) { fetchAll(); return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20"><p className="text-slate-400">Loading...</p></div>; }

  const handleLogout = () => { localStorage.clear(); navigate('/hr/login'); };

  const addEmployee = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    try {
      await api.post('/api/employees/add', { email, name: '', department: '' });
      setAddMsg({ type: 'success', text: `✅ ${email} added successfully!` });
      e.target.reset();
      setLoaded(false);
    } catch (err) {
      const detail = err.response?.data?.detail || 'Error adding employee';
      setAddMsg({ type: 'error', text: `❌ ${detail}` });
    }
    setTimeout(() => setAddMsg(null), 4000);
  };

  const bulkUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setUploadProgress({
        show: true, fileName: file.name,
        fileSize: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
        status: 'error',
        message: `❌ File too large! Max 10MB. Your file: ${(file.size / (1024 * 1024)).toFixed(1)} MB`
      });
      e.target.value = '';
      setTimeout(() => setUploadProgress({ show: false, fileName: '', fileSize: '', status: '' }), 5000);
      return;
    }

    setUploadProgress({ show: true, fileName: file.name, fileSize: (file.size / 1024).toFixed(1) + ' KB', status: 'uploading', message: '⏳ Extracting emails...' });
    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await fetch(`${API_URL}/api/employees/upload-file`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: formData
      });
      const result = await res.json();
      
      if (res.ok) {
        setUploadProgress({ show: true, fileName: file.name, fileSize: (file.size / 1024).toFixed(1) + ' KB', status: 'success', message: `✅ Done! ${result.emails_found?.length || 0} emails found` });
        setResultModal({ open: true, title: '📁 Bulk Upload Complete', data: { found: result.emails_found?.length || 0, added: result.added?.length || 0, skipped: result.skipped?.length || 0, addedList: result.added || [], skippedList: result.skipped || [] } });
        setLoaded(false);
      } else {
        setUploadProgress({ show: true, fileName: file.name, fileSize: (file.size / 1024).toFixed(1) + ' KB', status: 'error', message: `❌ ${result.detail || 'Upload failed'}` });
      }
    } catch {
      setUploadProgress({ show: true, fileName: file.name, fileSize: (file.size / 1024).toFixed(1) + ' KB', status: 'error', message: '❌ Connection error' });
    }
    setUploading(false);
    e.target.value = '';
    setTimeout(() => setUploadProgress({ show: false, fileName: '', fileSize: '', status: '' }), 5000);
  };

  const deleteEmployee = (email) => setModal({ open: true, title: 'Remove Employee', message: `Remove "${email}"?`, onConfirm: async () => { try { await api.delete('/api/employees/delete', { data: { email } }); setLoaded(false); } catch { /* empty */ } } });
  
  const uploadDoc = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const maxSize = 15 * 1024 * 1024;
    if (file.size > maxSize) {
      setDocProgress({ show: true, fileName: file.name, fileSize: (file.size / (1024 * 1024)).toFixed(1) + ' MB', status: 'error', message: `❌ File too large! Max 15MB` });
      e.target.value = '';
      setTimeout(() => setDocProgress({ show: false, fileName: '', fileSize: '', status: '' }), 5000);
      return;
    }
    setDocProgress({ show: true, fileName: file.name, fileSize: (file.size / 1024).toFixed(1) + ' KB', status: 'uploading', message: '⏳ Uploading...' });
    setDocUploading(true);
    const fd = new FormData(); fd.append('file', file);
    try {
      const res = await api.post('/api/documents/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (res.data.success) {
        setDocProgress({ show: true, fileName: file.name, fileSize: (file.size / 1024).toFixed(1) + ' KB', status: 'success', message: `✅ Uploaded! ${res.data.document?.chunk_count || 0} chunks` });
        setLoaded(false);
      } else {
        setDocProgress({ show: true, fileName: file.name, fileSize: (file.size / 1024).toFixed(1) + ' KB', status: 'error', message: `❌ ${res.data.message || 'Failed'}` });
      }
    } catch {
      setDocProgress({ show: true, fileName: file.name, fileSize: (file.size / 1024).toFixed(1) + ' KB', status: 'error', message: '❌ Upload error' });
    }
    setDocUploading(false);
    e.target.value = '';
    setTimeout(() => setDocProgress({ show: false, fileName: '', fileSize: '', status: '' }), 5000);
  };

  const deleteDoc = (id, name) => setModal({ open: true, title: 'Delete Document', message: `Delete "${name}"?`, onConfirm: async () => { try { await api.delete('/api/documents/delete', { data: { document_id: id } }); setLoaded(false); } catch { /* empty */ } } });
  const viewDoc = (doc) => alert(`📄 ${doc.filename}\n\n📊 Chunks: ${doc.chunk_count}\n📅 Added: ${new Date(doc.created_at).toLocaleDateString()}`);

  const totalPages = Math.ceil(employees.length / perPage);
  const paginatedEmployees = employees.slice((page - 1) * perPage, page * perPage);
  const chatSlug = companyName.toLowerCase().replace(/\s+/g, '-');
  const copyLink = () => { navigator.clipboard.writeText(`${FRONTEND_URL}/chat/${chatSlug}`); alert('✅ Link copied!'); };

  return (
    <div className="min-h-screen p-4 md:p-6 bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20">
      <div className="max-w-6xl mx-auto space-y-5 relative">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border border-white/50 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-lg font-bold text-white shadow-lg shadow-indigo-200">A</div>
            <div><h1 className="text-lg font-bold text-slate-800">{data?.company_name}</h1><p className="text-xs text-slate-500">🤖 {data?.bot_name} | Dashboard</p></div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => window.open(`${FRONTEND_URL}/chat/${chatSlug}`, '_blank')} className="px-4 py-2 bg-white border border-slate-200 text-indigo-600 rounded-xl text-sm font-semibold hover:bg-indigo-50 transition flex items-center gap-1.5"><ExternalLink size={14} /> Preview Chat</button>
            <button onClick={handleLogout} className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-100 transition flex items-center gap-1.5"><LogOut size={14} /> Logout</button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: Users, bg: 'from-indigo-50 to-indigo-100', color: 'text-indigo-600', val: data?.employees || 0, label: 'Employees' },
            { icon: FileText, bg: 'from-emerald-50 to-emerald-100', color: 'text-emerald-600', val: data?.documents || 0, label: 'Documents' },
            { icon: MessageCircle, bg: 'from-violet-50 to-violet-100', color: 'text-violet-600', val: data?.chats || 0, label: 'Chats' },
            { icon: null, bg: 'from-amber-50 to-amber-100', color: 'text-amber-600', val: 'Online', label: 'Status', isStatus: true },
          ].map((s, i) => (
            <div key={i} className="relative bg-white/80 backdrop-blur-xl rounded-xl p-4 border border-white/50 shadow-sm hover:-translate-y-0.5 transition-all">
              <div className={`w-10 h-10 bg-gradient-to-br ${s.bg} rounded-lg flex items-center justify-center mb-3`}>
                {s.isStatus ? <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" /> : <s.icon className={s.color} size={20} />}
              </div>
              <p className="text-2xl font-bold text-slate-800">{s.val}</p><p className="text-xs text-slate-500 font-medium">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl border border-white/50 shadow-sm overflow-hidden">
          <div className="flex border-b border-slate-100">
            <button onClick={() => { setActiveTab('employees'); setAddMsg(null); }} className={`flex-1 py-3.5 text-center font-semibold text-sm transition ${activeTab === 'employees' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/30' : 'text-slate-500'}`}>👥 Employees ({employees.length})</button>
            <button onClick={() => setActiveTab('documents')} className={`flex-1 py-3.5 text-center font-semibold text-sm transition ${activeTab === 'documents' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/30' : 'text-slate-500'}`}>📄 Documents ({documents.length})</button>
          </div>

          <div className="p-5">
            {activeTab === 'employees' && (
              <div>
                {addMsg && <div className={`px-4 py-3 rounded-xl text-sm font-medium mb-3 ${addMsg.type === 'success' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>{addMsg.text}</div>}
                {uploadProgress.show && (
                  <div className={`mb-3 px-4 py-3 rounded-xl border text-sm font-medium ${uploadProgress.status === 'uploading' ? 'bg-blue-50 border-blue-100 text-blue-700' : uploadProgress.status === 'success' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-600'}`}>
                    <div className="flex items-center justify-between flex-wrap gap-2"><div className="flex items-center gap-2">{uploadProgress.status === 'uploading' && <Loader2 size={16} className="animate-spin" />}<span>{uploadProgress.message}</span></div><span className="text-xs opacity-70">{uploadProgress.fileName} · {uploadProgress.fileSize}</span></div>
                  </div>
                )}
                <div className="flex flex-col sm:flex-row gap-2 mb-3">
                  <form onSubmit={addEmployee} className="flex flex-1 gap-2"><input type="email" name="email" placeholder="employee@company.com" className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 outline-none focus:border-indigo-400 text-sm" required /><button type="submit" className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold text-sm flex items-center gap-1.5"><Plus size={16} /> Add</button></form>
                  <label className="px-4 py-2.5 bg-white border border-slate-200 text-indigo-600 rounded-xl font-semibold text-sm cursor-pointer hover:bg-indigo-50 transition flex items-center gap-1.5"><Upload size={16} /> Bulk Upload<input type="file" onChange={bulkUpload} accept=".csv,.txt,.xlsx,.xls,.pdf,.docx" className="hidden" disabled={uploading} /></label>
                </div>
                <p className="text-xs text-slate-400 mb-4">CSV, Excel, PDF, TXT — emails auto-extracted · Max 10MB</p>
                {employees.length === 0 ? <div className="text-center py-12 text-slate-400"><div className="text-5xl mb-3">👥</div><p className="font-medium">No employees yet</p></div> : (
                  <>
                    <div className="space-y-1.5">{paginatedEmployees.map((emp, i) => (<div key={i} className="flex justify-between items-center p-3 rounded-xl hover:bg-slate-50/70 transition border border-transparent hover:border-slate-100"><div><p className="font-semibold text-slate-800 text-sm">{emp.email}</p><p className="text-xs text-slate-400">{new Date(emp.created_at).toLocaleDateString()}</p></div><button onClick={() => deleteEmployee(emp.email)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:bg-red-50 hover:text-red-500"><Trash2 size={15} /></button></div>))}</div>
                    {totalPages > 1 && <div className="flex justify-center gap-2 mt-5">{Array.from({ length: totalPages }, (_, i) => (<button key={i} onClick={() => setPage(i + 1)} className={`w-8 h-8 rounded-lg text-xs font-semibold transition ${page === i + 1 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>{i + 1}</button>))}</div>}
                    <p className="text-xs text-slate-400 text-center mt-3">Showing {paginatedEmployees.length} of {employees.length}</p>
                  </>
                )}
              </div>
            )}

            {activeTab === 'documents' && (
              <div>
                {docProgress.show && <div className={`mb-4 px-4 py-3 rounded-xl border text-sm font-medium ${docProgress.status === 'uploading' ? 'bg-blue-50 border-blue-100 text-blue-700' : docProgress.status === 'success' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-600'}`}><div className="flex items-center justify-between flex-wrap gap-2"><div className="flex items-center gap-2">{docProgress.status === 'uploading' && <Loader2 size={16} className="animate-spin" />}<span>{docProgress.message}</span></div><span className="text-xs opacity-70">{docProgress.fileName} · {docProgress.fileSize}</span></div></div>}
                <label className={`inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold text-sm cursor-pointer hover:shadow-lg transition mb-4 ${docUploading ? 'opacity-50 pointer-events-none' : ''}`}>{docUploading ? <><Loader2 size={16} className="animate-spin" /> Uploading...</> : <><Upload size={16} /> Upload Document</>}<input type="file" onChange={uploadDoc} accept=".pdf,.docx,.txt,.csv" className="hidden" disabled={docUploading} /></label>
                <p className="text-xs text-slate-400 mb-4">Upload HR policies · PDF, DOCX, TXT, CSV · Max 15MB</p>
                {documents.length === 0 ? <div className="text-center py-12 text-slate-400"><div className="text-5xl mb-3">📄</div><p className="font-medium">No documents</p></div> : (
                  <div className="space-y-1.5">{documents.map((doc, i) => (<div key={i} className="flex justify-between items-center p-3 rounded-xl hover:bg-slate-50/70 transition border border-transparent hover:border-slate-100"><div className="flex items-center gap-3"><span className="text-xl">📄</span><div><p className="font-semibold text-slate-800 text-sm">{doc.filename}</p><p className="text-xs text-slate-400">{doc.chunk_count} chunks · {new Date(doc.created_at).toLocaleDateString()}</p></div></div><div className="flex gap-1"><button onClick={() => viewDoc(doc)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:bg-indigo-50 hover:text-indigo-500"><Eye size={15} /></button><button onClick={() => deleteDoc(doc.id, doc.filename)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:bg-red-50 hover:text-red-500"><Trash2 size={15} /></button></div></div>))}</div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl p-5 border border-white/50 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">🔗 Share with Employees</p>
          <div className="flex flex-col sm:flex-row gap-2">
            <input type="text" value={`${FRONTEND_URL}/chat/${chatSlug}`} readOnly className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 text-sm text-slate-600 outline-none" />
            <button onClick={copyLink} className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold text-sm flex items-center gap-1.5"><Copy size={16} /> Copy</button>
          </div>
        </div>
      </div>
      <Modal isOpen={modal.open} onClose={() => setModal({ ...modal, open: false })} title={modal.title} message={modal.message} onConfirm={modal.onConfirm} />
      <ResultModal isOpen={resultModal.open} onClose={() => setResultModal({ ...resultModal, open: false })} title={resultModal.title} data={resultModal.data} />
    </div>
  );
}