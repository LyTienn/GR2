import React, { useEffect } from 'react';
import { AlertCircle, X, Check } from 'lucide-react';

export default function ConfirmModal({ 
  isOpen, 
  title, 
  message, 
  confirmText = 'Xác nhận', 
  cancelText = 'Hủy',
  isLoading = false,
  onConfirm, 
  onCancel,
  isDangerous = false 
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <>
      {/* Overlay backdrop - optional, you can remove if you don't want it */}
      {/* {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 transition-opacity"
          onClick={onCancel}
        />
      )} */}
      
      {/* Notification slide down */}
      <div 
        className={`fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 transition-all duration-300 ease-out ${
          isOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        <div className="bg-white dark:bg-slate-900 shadow-lg m-4 rounded-lg overflow-hidden">
          <div className="p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <div className={`shrink-0 p-2 rounded-full ${isDangerous ? 'bg-red-100 dark:bg-red-900/30' : 'bg-blue-100 dark:bg-blue-900/30'}`}>
                <AlertCircle 
                  size={20} 
                  className={isDangerous ? 'text-red-600' : 'text-blue-600'} 
                />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-base dark:text-white">{title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{message}</p>
              </div>
              <button 
                onClick={onCancel}
                className="shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex gap-2 justify-end mt-4 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={onCancel}
                disabled={isLoading}
                className="px-3 py-1.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors font-medium disabled:opacity-50"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className={`px-3 py-1.5 text-sm rounded transition-colors font-medium flex items-center gap-1.5 disabled:opacity-50 ${
                  isDangerous 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {isLoading ? (
                  <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <Check size={16} />
                )}
                {confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}