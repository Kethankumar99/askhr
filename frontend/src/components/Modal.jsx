export default function Modal({ isOpen, onClose, title, message, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm border border-[#e0d5c0] animate-in">
        <div className="text-center mb-5">
          <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-3xl">🗑️</span>
          </div>
          <h3 className="text-lg font-bold text-[#4a3f30]">{title}</h3>
          <p className="text-sm text-[#9b8b70] mt-1">{message}</p>
        </div>
        
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 bg-white border border-[#d4c5a9] text-[#6b5a42] rounded-xl font-semibold text-sm hover:bg-[#faf7f0] transition-all">
            Cancel
          </button>
          <button onClick={() => { onConfirm(); onClose(); }} className="flex-1 py-3 bg-red-500 text-white rounded-xl font-semibold text-sm hover:bg-red-600 transition-all shadow-lg shadow-red-200">
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
}