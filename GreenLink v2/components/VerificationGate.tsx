
import React, { useState } from 'react';
import { User, UserRole } from '../types';

interface VerificationGateProps {
  user: User;
  onVerify: () => void;
}

const VerificationGate: React.FC<VerificationGateProps> = ({ user, onVerify }) => {
  const [step, setStep] = useState<'ID' | 'DOCS' | 'REVIEW'>('ID');
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      setStep(step === 'ID' ? 'DOCS' : 'REVIEW');
    }, 2000);
  };

  return (
    <div className="max-w-3xl mx-auto py-20 px-6">
      <div className="bg-white border border-slate-200 rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in-95">
        <div className="bg-slate-900 p-12 text-white">
           <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-emerald-500 rounded-3xl flex items-center justify-center text-4xl shadow-2xl">
                {user.role === UserRole.TECHNICIAN ? '⚡' : user.role === UserRole.RECYCLER ? '🛡️' : '🏛️'}
              </div>
              <div>
                 <h2 className="text-3xl font-black tracking-tight leading-none uppercase italic">Partner Verification</h2>
                 <p className="text-emerald-400 font-black text-[10px] uppercase tracking-[0.3em] mt-2">Security Level: Professional Registry Access</p>
              </div>
           </div>
        </div>

        <div className="p-12 space-y-10">
           {step !== 'REVIEW' ? (
             <div className="space-y-8">
               <div className="flex justify-between items-center">
                  <h3 className="text-xl font-black text-slate-900">{step === 'ID' ? 'Upload Government ID' : 'Business / Certification Documents'}</h3>
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{step === 'ID' ? 'Step 1 of 2' : 'Step 2 of 2'}</span>
               </div>
               
               <div className="border-4 border-dashed border-slate-100 rounded-[2.5rem] p-16 text-center group hover:border-emerald-300 transition-all cursor-pointer relative overflow-hidden bg-slate-50/50">
                  {isUploading ? (
                    <div className="space-y-4">
                       <svg className="animate-spin h-10 w-10 text-emerald-600 mx-auto" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                       <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] animate-pulse">Scanning Document Integrity...</p>
                    </div>
                  ) : (
                    <div className="space-y-4" onClick={handleUpload}>
                       <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-500">📄</div>
                       <p className="text-slate-900 font-black uppercase tracking-widest text-xs">Tap to choose or drag files</p>
                       <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Supported formats: PDF, PNG, JPG (Max 5MB)</p>
                    </div>
                  )}
               </div>

               <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex items-start gap-4">
                  <div className="text-xl">⚖️</div>
                  <p className="text-xs font-bold text-blue-800 leading-relaxed italic uppercase">"As a certified technician or recruiter, your credentials are cross-referenced with the National Registry for public trust."</p>
               </div>
             </div>
           ) : (
             <div className="text-center space-y-8 py-10 animate-in zoom-in-95">
                <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full mx-auto flex items-center justify-center text-4xl shadow-xl shadow-emerald-500/10">⌛</div>
                <div className="space-y-3">
                   <h3 className="text-3xl font-black text-slate-900 tracking-tight">Audit Underway</h3>
                   <p className="text-slate-500 font-medium max-w-md mx-auto leading-relaxed">Our compliance team is reviewing your documents. This typically takes 15 minutes during business hours.</p>
                </div>
                <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-center">
                   <button 
                    onClick={onVerify}
                    className="px-12 py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-emerald-600 transition-all shadow-2xl"
                   >
                     Bypass for Demo
                   </button>
                   <button className="px-12 py-5 border-2 border-slate-100 text-slate-400 rounded-2xl font-black uppercase text-xs tracking-[0.2em] cursor-not-allowed">Wait for Review</button>
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default VerificationGate;
