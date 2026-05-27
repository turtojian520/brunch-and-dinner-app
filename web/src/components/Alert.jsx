import React, { useEffect, useState } from 'react';
import { Info, AlertCircle, CheckCircle, X } from 'lucide-react';

export default function Alert() {
  const [alertState, setAlertState] = useState(null);

  useEffect(() => {
    const handleAlert = (event) => {
      const { title, message } = event.detail;
      setAlertState({ title, message });
    };

    window.addEventListener('custom-alert', handleAlert);
    window.__hasAlertHandler = true;

    return () => {
      window.removeEventListener('custom-alert', handleAlert);
      window.__hasAlertHandler = false;
    };
  }, []);

  if (!alertState) return null;

  const isError = alertState.title.toLowerCase().includes('error') || alertState.title.toLowerCase().includes('fail') || alertState.title.toLowerCase().includes('cannot');
  const isSuccess = alertState.title.toLowerCase().includes('success') || alertState.title.toLowerCase().includes('added');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-charcoal/40 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-sm bg-[#FAF9F5] border border-[#EBEBE2] rounded-brand shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden paper-texture">
        {/* Color bar */}
        <div className={`h-1.5 w-full ${isError ? 'bg-red-500' : isSuccess ? 'bg-[#38B000]' : 'bg-brand-primary'}`} />
        
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`p-2 rounded-xl shrink-0 ${
              isError ? 'bg-red-500/10 text-red-500' : isSuccess ? 'bg-[#38B000]/10 text-[#38B000]' : 'bg-brand-primary/10 text-brand-primary'
            }`}>
              {isError ? <AlertCircle size={22} /> : isSuccess ? <CheckCircle size={22} /> : <Info size={22} />}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-headline font-bold text-lg text-brand-charcoal leading-snug">
                {alertState.title}
              </h3>
              <p className="font-body text-sm font-medium text-[#5E5E54] mt-2 leading-relaxed">
                {alertState.message}
              </p>
            </div>
            
            <button 
              onClick={() => setAlertState(null)}
              className="text-[#A2A292] hover:text-brand-charcoal transition-colors p-1 rounded-full hover:bg-[#F2EFE6]"
            >
              <X size={16} />
            </button>
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => setAlertState(null)}
              className="px-6 py-2.5 rounded-brand bg-brand-primary hover:bg-brand-primary/90 text-white font-body font-bold text-sm shadow-md shadow-brand-primary/10 transition-colors"
            >
              Okay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
