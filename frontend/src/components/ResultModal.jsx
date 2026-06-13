export default function ResultModal({ isOpen, onClose, title, data }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md border border-slate-100 animate-in max-h-[80vh] overflow-y-auto">
        
        {!data.success ? (
          /* Error */
          <div className="text-center">
            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-3xl">❌</span>
            </div>
            <h3 className="text-lg font-bold text-slate-800">{title}</h3>
            <p className="text-sm text-red-500 mt-2">{data.error}</p>
            <button onClick={onClose} className="mt-5 w-full py-2.5 bg-slate-100 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-200 transition">
              Close
            </button>
          </div>
        ) : (
          /* Success */
          <>
            <div className="text-center mb-5">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 ${data.added > 0 ? 'bg-green-50' : 'bg-amber-50'}`}>
                <span className="text-3xl">{data.added > 0 ? '✅' : '⚠️'}</span>
              </div>
              <h3 className="text-lg font-bold text-slate-800">{title}</h3>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-5">
              <div className="bg-blue-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-blue-600">{data.found || 0}</p>
                <p className="text-xs text-blue-500 font-medium">Found</p>
              </div>
              <div className="bg-green-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-green-600">{data.added || 0}</p>
                <p className="text-xs text-green-500 font-medium">Added</p>
              </div>
              <div className="bg-orange-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-orange-600">{data.skipped || 0}</p>
                <p className="text-xs text-orange-500 font-medium">Skipped</p>
              </div>
            </div>

            {data.addedList?.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-bold text-green-600 uppercase tracking-wider mb-2">✅ Added ({data.addedList.length})</p>
                <div className="bg-green-50/50 rounded-xl p-3 max-h-32 overflow-y-auto space-y-1">
                  {data.addedList.map((email, i) => <p key={i} className="text-xs text-green-700">{email}</p>)}
                </div>
              </div>
            )}

            {data.skippedList?.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-2">⚠️ Skipped ({data.skippedList.length})</p>
                <div className="bg-orange-50/50 rounded-xl p-3 max-h-32 overflow-y-auto space-y-1">
                  {data.skippedList.map((email, i) => <p key={i} className="text-xs text-orange-700">{email}</p>)}
                </div>
              </div>
            )}

            {data.added === 0 && data.skipped > 0 && (
              <p className="text-center text-sm text-slate-500 mb-3">All emails already exist in your company!</p>
            )}

            <button onClick={onClose} className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg transition">
              Done
            </button>
          </>
        )}
      </div>
    </div>
  );
}