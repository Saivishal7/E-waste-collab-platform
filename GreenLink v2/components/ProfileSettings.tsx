
import React, { useState } from 'react';
import { User, UserRole } from '../types';

interface ProfileSettingsProps {
  user: User;
  onUpdate: (user: User) => void;
  onBack: () => void;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ user, onUpdate, onBack }) => {
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone || '',
    licenseId: user.profileData?.licenseId || '',
    organization: user.profileData?.organization || '',
    address: user.profileData?.address || ''
  });

  const handleSave = () => {
    onUpdate({
      ...user,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      profileData: {
        ...user.profileData,
        licenseId: formData.licenseId,
        organization: formData.organization,
        address: formData.address
      }
    });
    onBack();
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-6 animate-in slide-in-from-bottom-6 duration-500">
      <div className="flex justify-between items-center mb-12">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase italic">Profile Settings</h1>
          <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Configure your grid identity</p>
        </div>
        <button 
          onClick={onBack}
          className="px-8 py-3 bg-slate-100 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-600 hover:bg-slate-200 transition-all"
        >
          Return to Dashboard
        </button>
      </div>

      <div className="grid lg:grid-cols-12 gap-12">
        {/* AVATAR COLUMN */}
        <aside className="lg:col-span-4 space-y-8">
           <div className="bg-white border border-slate-200 rounded-[3rem] p-10 text-center space-y-6 shadow-sm">
              <div className="relative inline-block mx-auto group">
                 <div className="w-32 h-32 bg-emerald-500 rounded-[2.5rem] flex items-center justify-center text-5xl font-black text-white shadow-2xl group-hover:rotate-6 transition-transform">
                   {formData.name[0]}
                 </div>
                 <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-slate-900 text-white rounded-2xl flex items-center justify-center border-4 border-white shadow-xl hover:bg-emerald-600 transition-all">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                 </button>
              </div>
              <div className="space-y-1">
                 <h2 className="text-2xl font-black text-slate-900">{formData.name}</h2>
                 <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{user.role}</p>
              </div>
              <div className="pt-6 border-t border-slate-50 flex items-center justify-center gap-2">
                 <span className={`w-2 h-2 rounded-full ${user.isVerified ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{user.isVerified ? 'Identity Verified' : 'Verification Pending'}</span>
              </div>
           </div>

           <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white space-y-4 shadow-2xl">
              <p className="text-[10px] font-black uppercase text-emerald-400 tracking-[0.3em]">Privacy Lock</p>
              <p className="text-xs font-medium opacity-60 leading-relaxed">Your professional credentials like bank accounts and licenses are only visible to authorized municipal auditors.</p>
           </div>
        </aside>

        {/* FORM COLUMN */}
        <div className="lg:col-span-8 space-y-8">
           <section className="bg-white border border-slate-200 rounded-[3rem] p-12 space-y-10 shadow-sm">
              <div className="grid md:grid-cols-2 gap-8">
                 <Input label="Full Name" value={formData.name} onChange={(v) => setFormData({...formData, name: v})} />
                 <Input label="Email Address" value={formData.email} onChange={(v) => setFormData({...formData, email: v})} />
                 <Input label="Mobile Contact" value={formData.phone} onChange={(v) => setFormData({...formData, phone: v})} />
                 <Input label="Base Location" value={formData.address} onChange={(v) => setFormData({...formData, address: v})} placeholder="e.g. Hyderabad, TS" />
              </div>

              {/* ROLE SPECIFIC FIELDS */}
              {(user.role === UserRole.TECHNICIAN || user.role === UserRole.RECYCLER) && (
                <div className="pt-10 border-t border-slate-100 space-y-8">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-lg">📄</div>
                      <h3 className="text-xl font-black text-slate-900 tracking-tight">Professional Credentials</h3>
                   </div>
                   <div className="grid md:grid-cols-2 gap-8">
                      <Input label="Certification License ID" value={formData.licenseId} onChange={(v) => setFormData({...formData, licenseId: v})} placeholder="e.g. TS-EW-2026-X" />
                      <Input label="Primary Work Node / Hub" value={formData.organization} onChange={(v) => setFormData({...formData, organization: v})} placeholder="e.g. EcoFix Hyderabad" />
                   </div>
                   <div className="p-6 bg-blue-50 border border-blue-100 rounded-3xl space-y-2">
                      <p className="text-[10px] font-black text-blue-800 uppercase tracking-widest">Technician Service Radius</p>
                      <div className="flex items-center gap-4">
                         <input type="range" className="flex-grow accent-blue-600" min="5" max="50" />
                         <span className="text-sm font-black text-blue-900">25 KM</span>
                      </div>
                   </div>
                </div>
              )}

              {user.role === UserRole.NGO_GOV && (
                <div className="pt-10 border-t border-slate-100 space-y-8">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-lg">🏛️</div>
                      <h3 className="text-xl font-black text-slate-900 tracking-tight">Administrative Scope</h3>
                   </div>
                   <div className="grid md:grid-cols-2 gap-8">
                      <Input label="Authority Department" value={formData.organization} onChange={(v) => setFormData({...formData, organization: v})} placeholder="e.g. Ministry of Electronics" />
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Operational Jurisdiction</label>
                         <select className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-black outline-none appearance-none">
                            <option>National (Global Access)</option>
                            <option>Regional (State Level)</option>
                            <option>Municipal (Local Hubs)</option>
                         </select>
                      </div>
                   </div>
                </div>
              )}

              <div className="pt-10 border-t border-slate-100 flex justify-end gap-4">
                 <button 
                  onClick={onBack}
                  className="px-10 py-4 border-2 border-slate-100 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all"
                 >
                   Discard Changes
                 </button>
                 <button 
                  onClick={handleSave}
                  className="px-12 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl active:scale-95"
                 >
                   Update Records
                 </button>
              </div>
           </section>
        </div>
      </div>
    </div>
  );
};

const Input: React.FC<{ label: string, value: string, onChange: (v: string) => void, placeholder?: string }> = ({ label, value, onChange, placeholder }) => (
  <div className="space-y-2">
     <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</label>
     <input 
      type="text" 
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-black text-slate-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all shadow-inner"
     />
  </div>
);

export default ProfileSettings;
