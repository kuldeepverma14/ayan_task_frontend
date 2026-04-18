import React from 'react';
import { AlertCircle } from 'lucide-react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, variant = 'danger' }) => {
  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger': return 'bg-rose-600 hover:bg-rose-700 shadow-rose-200';
      case 'warning': return 'bg-amber-500 hover:bg-amber-600 shadow-amber-200';
      default: return 'bg-primary-600 hover:bg-primary-700 shadow-primary-200';
    }
  };

  const getIconStyles = () => {
    switch (variant) {
      case 'danger': return 'bg-rose-50 text-rose-600';
      case 'warning': return 'bg-amber-50 text-amber-600';
      default: return 'bg-primary-50 text-primary-600';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${getIconStyles()}`}>
          <AlertCircle size={24} />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
        <p className="text-slate-500 text-sm mb-6">{message}</p>
        <div className="flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50 transition-all font-sans"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            className={`flex-1 py-2.5 rounded-xl text-white font-semibold shadow-lg transition-all font-sans ${getVariantStyles()}`}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
