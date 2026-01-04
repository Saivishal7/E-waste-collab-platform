
import React, { useState } from 'react';
import { UserRole, User } from '../types';

interface AuthPageProps {
  onClose: () => void;
  onLogin: (user: User) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onClose, onLogin }) => {
  const [method, setMethod] = useState<'INITIAL' | 'OTP' | 'GOOGLE' | 'ROLE_SELECT'>('INITIAL');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  const handleGoogleLogin = () => {
    setName('Guest User'); // Default for demo if not entered
    setMethod('ROLE_SELECT');
  };

  const handlePhoneSubmit = () => {
    if (phone.length === 10) setMethod('OTP');
  };

  const finalizeLogin = (role: UserRole) => {
    // Determine verification status: Consumers are auto-verified
    const isVerified = role === UserRole.CONSUMER;
    
    onLogin({
      id: Math.random().toString(36).substr(2, 9),
      name: name || (method === 'OTP' ? 'User ' + phone.slice(-4) : 'Citizen Agent'),
      email: name ? `${name.toLowerCase().replace(/\s+/g, '.')}@example.com` : 'user@example.com',
      role: role,
      isVerified: isVerified,
      phone: phone
    });
  };

  return (
    <div className="fixed inset-0 z-[2000] flex justify-center items-start overflow-y-auto p-4 sm:p-8 bg-slate-900/95 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] sm:rounded-[3.5rem] shadow-2xl w-full max-w-xl my-auto overflow-hidden animate-in zoom-in-95 relative border border-white/20">
        
        <button onClick={onClose} className="absolute top-6 right-6 sm:top-8 sm:right-8 p-3 sm:p-4 bg-slate-100 rounded-2xl text-slate-400 hover:text-slate-900 transition-all z-20">
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <div className="bg-slate-900 p-8 sm:p-12 text-white relative">
           <div className="absolute top-0 right-0 p-8 sm:p-12 opacity-5 pointer-events-none">
             <svg className="w-32 h-32 sm:w-48 sm:h-48" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L1 21h22L12 2zm0 3.99L19.53 19H4.47L12 5.99zM11 16h2v2h-2zm0-6h2v4h-2z"/></svg>
           </div>
           <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-none uppercase italic">Access Gateway</h2>
           <p className="text-emerald-400 font-black text-[9px] sm:text-[10px] uppercase tracking-[0.3em] mt-2">National Grid Secure Authentication</p>
        </div>

        <div className="p-8 sm:p-12 space-y-6 sm:space-y-8 min-h-[300px] flex flex-col justify-center">
          
          {method === 'INITIAL' && (
            <div className="space-y-4 sm:space-y-6 animate-in slide-in-from-bottom-4">
              <div className="space-y-3">
                 <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] px-2">Identification</label>
                 <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-6 py-4 sm:py-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] sm:rounded-3xl font-black text-base sm:text-lg focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all shadow-inner"
                 />
              </div>

              <button 
                onClick={() => setMethod('ROLE_SELECT')}
                disabled={!name.trim()}
                className="w-full p-5 sm:p-6 border-2 border-slate-100 rounded-[1.5rem] sm:rounded-[2rem] flex items-center justify-center gap-4 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all group active:scale-95 disabled:opacity-30"
              >
                <img src="https://www.svgrepo.com/show/355037/google.svg" className="w-5 h-5 sm:w-6 sm:h-6" alt="Google" />
                <span className="font-black text-slate-900 uppercase tracking-widest text-[10px] sm:text-xs">Continue with Google</span>
              </button>
              
              <div className="relative py-2 sm:py-4">
                 <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                 <div className="relative flex justify-center"><span className="bg-white px-4 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">Or use phone</span></div>
              </div>

              <div className="space-y-3 sm:space-y-4">
                 <div className="relative group">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-black text-sm">+91</span>
                    <input 
                      type="tel" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="Mobile Number"
                      className="w-full pl-16 pr-8 py-4 sm:py-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] sm:rounded-3xl font-black text-base sm:text-lg focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all shadow-inner"
                    />
                 </div>
                 <button 
                   onClick={handlePhoneSubmit}
                   disabled={phone.length < 10 || !name.trim()}
                   className="w-full py-4 sm:py-5 bg-slate-900 text-white rounded-[1.5rem] sm:rounded-3xl font-black uppercase text-[10px] sm:text-xs tracking-[0.3em] hover:bg-emerald-600 disabled:opacity-30 transition-all shadow-2xl active:scale-95"
                 >
                   Request One-Time Pin
                 </button>
              </div>
            </div>
          )}

          {method === 'GOOGLE' && (
            <div className="space-y-6 sm:space-y-8 animate-in zoom-in-95">
               <div className="text-center space-y-2">
                 <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-500 rounded-full mx-auto flex items-center justify-center text-2xl sm:text-3xl shadow-xl shadow-emerald-500/20">✨</div>
                 <h3 className="text-lg sm:text-xl font-black text-slate-900">Success {name.split(' ')[0]}!</h3>
                 <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest leading-relaxed">Your account identity has been validated. <br/>Now choose your grid role to continue.</p>
               </div>
               <button onClick={() => setMethod('ROLE_SELECT')} className="w-full py-4 sm:py-5 bg-slate-900 text-white rounded-[1.5rem] sm:rounded-3xl font-black uppercase text-[10px] sm:text-xs tracking-[0.3em] hover:bg-emerald-600 transition-all shadow-2xl active:scale-95">Select My Role</button>
            </div>
          )}

          {method === 'OTP' && (
            <div className="space-y-6 sm:space-y-8 animate-in slide-in-from-right-4">
               <div className="text-center space-y-2">
                 <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Verify Identity</h3>
                 <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">A 6-digit code was sent to +91 {phone}</p>
               </div>
               
               <div className="flex gap-2 sm:gap-3 justify-center">
                 {otp.map((digit, i) => (
                   <input 
                    key={i}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => {
                      const newOtp = [...otp];
                      newOtp[i] = e.target.value.slice(-1);
                      setOtp(newOtp);
                      if (e.target.value && i < 5) {
                        const next = e.target.nextSibling as HTMLInputElement;
                        if (next) next.focus();
                      }
                      if (newOtp.join('').length === 6) setMethod('ROLE_SELECT');
                    }}
                    className="w-10 h-14 sm:w-12 sm:h-16 bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl text-center text-xl sm:text-2xl font-black focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all shadow-inner"
                   />
                 ))}
               </div>

               <div className="text-center">
                 <button className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 hover:underline">Resend code in 0:24</button>
               </div>
            </div>
          )}

          {method === 'ROLE_SELECT' && (
            <div className="space-y-4 sm:space-y-6 animate-in zoom-in-95">
               <div className="text-center pb-2">
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">System Role Profile</h3>
                  <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Select your primary activity on the grid, {name.split(' ')[0]}</p>
               </div>
               
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-h-[40vh] overflow-y-auto px-1 custom-scrollbar">
                  <RoleBtn 
                    label="Citizen / Consumer" 
                    icon="🌱" 
                    desc="Recycle and repair your devices"
                    selected={selectedRole === UserRole.CONSUMER}
                    onClick={() => setSelectedRole(UserRole.CONSUMER)}
                  />
                  <RoleBtn 
                    label="Certified Technician" 
                    icon="⚡" 
                    desc="Accept repairs and earn credits"
                    selected={selectedRole === UserRole.TECHNICIAN}
                    onClick={() => setSelectedRole(UserRole.TECHNICIAN)}
                  />
                  <RoleBtn 
                    label="Asset Recycler" 
                    icon="🛡️" 
                    desc="Process e-waste industrial loads"
                    selected={selectedRole === UserRole.RECYCLER}
                    onClick={() => setSelectedRole(UserRole.RECYCLER)}
                  />
                  <RoleBtn 
                    label="NGO / Municipality" 
                    icon="🏛️" 
                    desc="Monitor regional grid impact"
                    selected={selectedRole === UserRole.NGO_GOV}
                    onClick={() => setSelectedRole(UserRole.NGO_GOV)}
                  />
               </div>

               <button 
                 onClick={() => selectedRole && finalizeLogin(selectedRole)}
                 disabled={!selectedRole}
                 className="w-full py-4 sm:py-5 bg-emerald-600 text-white rounded-[1.5rem] sm:rounded-3xl font-black uppercase text-[10px] sm:text-xs tracking-[0.3em] hover:bg-emerald-700 disabled:opacity-20 transition-all shadow-2xl active:scale-95 mt-2 sm:mt-4"
               >
                 Confirm Selection
               </button>
            </div>
          )}
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}} />
    </div>
  );
};

const RoleBtn: React.FC<{ label: string, icon: string, desc: string, selected: boolean, onClick: () => void }> = ({ label, icon, desc, selected, onClick }) => (
  <button 
    onClick={onClick}
    className={`p-5 sm:p-6 border-2 rounded-[1.5rem] sm:rounded-[2rem] text-left transition-all h-full flex flex-col items-start ${selected ? 'bg-slate-900 border-slate-900 text-white shadow-2xl scale-[1.02]' : 'bg-white border-slate-100 text-slate-900 hover:border-emerald-300'}`}
  >
     <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-lg sm:text-xl mb-3 sm:mb-4 shrink-0 ${selected ? 'bg-white/20' : 'bg-slate-50'}`}>{icon}</div>
     <h4 className="font-black text-[9px] sm:text-xs uppercase tracking-widest mb-1">{label}</h4>
     <p className={`text-[8px] sm:text-[10px] leading-relaxed opacity-60 font-medium ${selected ? 'text-white/60' : 'text-slate-400'}`}>{desc}</p>
  </button>
);

export default AuthPage;
