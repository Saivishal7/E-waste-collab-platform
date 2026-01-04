
import React from 'react';
import { UserRole, User } from '../types';

interface LandingPageProps {
  user: User | null;
  onRoleSelect: (role: UserRole) => void;
  onNavigate: (role: UserRole) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ user, onRoleSelect, onNavigate }) => {
  if (user) {
    return <AuthenticatedHome user={user} onNavigate={onNavigate} />;
  }

  return (
    <div className="flex flex-col">
      {/* GLOBAL MOVEMENT TICKER */}
      <div className="bg-slate-900 py-4 overflow-hidden whitespace-nowrap border-b border-white/5 relative z-[60]">
        <div className="inline-block animate-marquee uppercase text-[10px] font-black tracking-[0.3em] text-emerald-400/80">
          <span className="mx-8">Global Impact Update: 142,500kg E-Waste Diverted</span>
          <span className="mx-8">Active Technicians: 1,204</span>
          <span className="mx-8">Certified Recyclers: 582</span>
          <span className="mx-8">Citizens Contributing: 18,492</span>
          <span className="mx-8">Current Savings: $4.2M in Reclaimed Materials</span>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-white px-6 pt-12 pb-20 md:pt-24 md:pb-24 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none opacity-[0.03]">
           <svg className="w-full h-full" viewBox="0 0 100 100" fill="none" stroke="currentColor"><path d="M0,50 Q25,0 50,50 T100,50" strokeWidth="0.1"/></svg>
        </div>

        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-10 relative z-10">
            <div className="inline-flex items-center gap-3 bg-emerald-50 px-5 py-2 rounded-full border border-emerald-100 text-emerald-700 font-black text-xs uppercase tracking-widest shadow-sm">
               <span className="flex h-2 w-2 rounded-full bg-emerald-600 animate-pulse"></span>
               Active: 2026 National Circular Standard
            </div>
            <h1 className="text-5xl md:text-7xl font-black leading-[1.05] text-slate-900 tracking-tighter">
              Don't Just Waste. <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-blue-600">Lead the Progress.</span>
            </h1>
            <p className="text-xl text-slate-500 leading-relaxed font-medium max-w-xl">
              Every device you save contributes to a global movement. Track your impact, earn credits, and watch as your community transforms through traceable eco-tech.
            </p>
            <div className="flex items-center gap-6 pt-4">
               <div className="flex flex-col">
                  <span className="text-3xl font-black text-slate-900">98%</span>
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Traceability Rate</span>
               </div>
               <div className="w-px h-12 bg-slate-200"></div>
               <div className="flex flex-col">
                  <span className="text-3xl font-black text-emerald-600">12.4k</span>
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Active Guardians</span>
               </div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-[3rem] blur-2xl opacity-10 group-hover:opacity-20 transition-opacity"></div>
            <div className="relative p-10 bg-white rounded-[3rem] border border-slate-100 shadow-2xl flex flex-col items-center">
              <div className="space-y-8 w-full">
                <ProcessStep num="01" label="Upload Your Device" desc="Instant Progress Reward" color="emerald" />
                <ProcessStep num="02" label="Lifecycle Action" desc="Repair or Secure Disposal" color="blue" />
                <ProcessStep num="03" label="Collect Your Impact" desc="Earn Ranks & Green Credits" color="cyan" />
                
                <div className="pt-6 border-t border-slate-100 mt-4 flex justify-between items-center">
                  <div className="flex -space-x-3">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden shadow-md">
                        <img src={`https://i.pravatar.cc/100?u=${i + 10}`} alt="user" />
                      </div>
                    ))}
                    <div className="w-10 h-10 rounded-full border-2 border-white bg-blue-600 flex items-center justify-center text-[10px] font-black text-white shadow-md">
                      +2.1k
                    </div>
                  </div>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Making a difference today</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NEW GAMIFICATION & WHY SECTION */}
      <section className="bg-slate-900 py-24 px-6 relative overflow-hidden">
        {/* Abstract Background Grid */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none">
          <div className="w-full h-full" style={{ backgroundImage: 'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)', backgroundSize: '80px 80px' }}></div>
        </div>

        <div className="max-w-7xl mx-auto space-y-24 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
             <div className="space-y-8">
                <div className="inline-block px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-[10px] font-black uppercase tracking-[0.3em]">
                  The National Incentive Program
                </div>
                <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-[1.1] italic uppercase">
                  Waste is <span className="text-emerald-500">Toxic.</span> <br/>
                  GreenLink is <span className="text-blue-500">Wealth.</span>
                </h2>
                <p className="text-slate-400 text-lg leading-relaxed font-medium">
                  Traditional e-waste disposal is broken. When you throw electronics in public bins, heavy metals leak into our soil and water. GreenLink digitizes the lifecycle of every component, rewarding your responsibility with verified national credits.
                </p>
                
                <div className="grid grid-cols-2 gap-6 pt-4">
                   <div className="p-6 bg-white/5 rounded-3xl border border-white/10 space-y-3">
                      <div className="text-3xl">🗑️</div>
                      <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">The Old Way</p>
                      <p className="text-sm font-bold text-slate-300">Public Dumping = Soil Poisoning & Waste.</p>
                   </div>
                   <div className="p-6 bg-emerald-500/5 rounded-3xl border border-emerald-500/20 space-y-3 shadow-inner">
                      <div className="text-3xl">⚡</div>
                      <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">The GreenLink Way</p>
                      <p className="text-sm font-bold text-slate-300">Repair & Recycle = XP & Rewards.</p>
                   </div>
                </div>
             </div>

             <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[4rem] p-10 space-y-10 shadow-2xl relative">
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-emerald-500 rounded-3xl flex items-center justify-center text-4xl shadow-2xl border-4 border-slate-900 animate-bounce">💎</div>
                
                <h3 className="text-2xl font-black text-white uppercase italic tracking-tight">Gamified Loop</h3>
                
                <div className="space-y-6">
                   <GameStep 
                    icon="🛠️" 
                    title="Repair & Save" 
                    desc="Extend device life at certified hubs." 
                    xp="+150 XP" 
                    color="blue"
                   />
                   <GameStep 
                    icon="🛡️" 
                    title="Formal Recycle" 
                    desc="Verified material extraction." 
                    xp="+200 XP" 
                    color="emerald"
                   />
                   <GameStep 
                    icon="🏆" 
                    title="Rank Up" 
                    desc="Reach Level 10 for Elite Status." 
                    xp="Badge Unlock" 
                    color="amber"
                   />
                   <GameStep 
                    icon="🎁" 
                    title="Redeem Perks" 
                    desc="Exchange for service vouchers." 
                    xp="Real Rewards" 
                    color="cyan"
                   />
                </div>

                <div className="pt-6 border-t border-white/10 flex justify-between items-center">
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">National Registry v4.2</p>
                   <button 
                    onClick={() => onRoleSelect(UserRole.CONSUMER)}
                    className="px-6 py-2.5 bg-emerald-500 text-slate-900 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-lg"
                   >
                    Start Earning
                   </button>
                </div>
             </div>
          </div>

          {/* REWARDS PREVIEW GRID */}
          <div className="space-y-12">
             <div className="text-center space-y-4">
                <h3 className="text-white text-3xl font-black uppercase tracking-tight italic">Exclusive Grid Benefits</h3>
                <p className="text-slate-500 font-medium">Your Green Credits unlock specialized services and community honors.</p>
             </div>

             <div className="grid md:grid-cols-3 gap-8">
                <RewardPreview 
                  icon="🔬" 
                  title="Logic Board Diagnostic" 
                  cost="800 Credits" 
                  desc="Deep technical audit at L3 Node." 
                />
                <RewardPreview 
                  icon="🚚" 
                  title="Carbon-Neutral Logistics" 
                  cost="500 Credits" 
                  desc="Free professional home pickup." 
                />
                <RewardPreview 
                  icon="📜" 
                  title="National Impact Certificate" 
                  cost="Level 5+" 
                  desc="Official sustainability endorsement." 
                />
             </div>
          </div>
        </div>
      </section>

      {/* CHOOSE YOUR PATH */}
      <section className="bg-slate-50 px-6 py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto space-y-16 relative z-10">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Choose how you want to participate</h2>
            <p className="text-slate-500 font-medium text-lg">Select your profile to access specialized tools and workflows.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <RoleCard title="Consumer" desc="Dispose or repair your old electronics with verified local experts." icon="🌱" color="emerald" onClick={() => onRoleSelect(UserRole.CONSUMER)} />
            <RoleCard title="Repair Technician" desc="Accept repair requests and extend device life for your community." icon="⚡" color="blue" onClick={() => onRoleSelect(UserRole.TECHNICIAN)} />
            <RoleCard title="Recycler" desc="Become a verified partner for secure and responsible disposal." icon="🛡️" color="cyan" onClick={() => onRoleSelect(UserRole.RECYCLER)} />
            <RoleCard title="NGO / Municipality" desc="Monitor, manage, and reduce regional e-waste impact." icon="🏛️" color="slate" onClick={() => onRoleSelect(UserRole.NGO_GOV)} />
          </div>
        </div>
      </section>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-marquee { display: inline-block; animation: marquee 40s linear infinite; }
      `}} />
    </div>
  );
};

const GameStep: React.FC<{ icon: string, title: string, desc: string, xp: string, color: string }> = ({ icon, title, desc, xp, color }) => (
  <div className="flex items-center gap-6 p-5 bg-white/5 border border-white/5 rounded-3xl hover:bg-white/10 transition-all group">
     <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-xl transition-transform group-hover:scale-110
        ${color === 'emerald' ? 'bg-emerald-500/20 text-emerald-400' : 
          color === 'blue' ? 'bg-blue-500/20 text-blue-400' : 
          color === 'amber' ? 'bg-amber-500/20 text-amber-400' : 'bg-cyan-500/20 text-cyan-400'}`}>
        {icon}
     </div>
     <div className="flex-grow">
        <h4 className="font-black text-white text-lg tracking-tight leading-none">{title}</h4>
        <p className="text-slate-500 text-xs font-medium mt-1 uppercase tracking-widest">{desc}</p>
     </div>
     <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-white/10 ${color === 'emerald' ? 'text-emerald-400' : 'text-blue-400'}`}>
        {xp}
     </div>
  </div>
);

const RewardPreview: React.FC<{ icon: string, title: string, cost: string, desc: string }> = ({ icon, title, cost, desc }) => (
  <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] hover:bg-white/10 transition-all group text-center space-y-4">
     <div className="w-16 h-16 bg-slate-800 rounded-2xl mx-auto flex items-center justify-center text-3xl group-hover:rotate-12 transition-transform shadow-xl">{icon}</div>
     <div className="space-y-1">
        <p className="text-emerald-400 font-black text-[9px] uppercase tracking-[0.2em]">{cost}</p>
        <h4 className="text-white font-black text-lg uppercase tracking-tight">{title}</h4>
        <p className="text-slate-500 text-xs font-medium leading-relaxed">{desc}</p>
     </div>
  </div>
);

const AuthenticatedHome: React.FC<{ user: User, onNavigate: (role: UserRole) => void }> = ({ user, onNavigate }) => {
  const getRoleGreeting = () => {
    switch(user.role) {
      case UserRole.CONSUMER: return { title: "Hero Hub", sub: "Your personal impact dashboard", icon: "🌱" };
      case UserRole.TECHNICIAN: return { title: "Tech Terminal", sub: "Grid maintenance & workbench", icon: "⚡" };
      case UserRole.RECYCLER: return { title: "Recovery Ops", sub: "Material extraction center", icon: "🛡️" };
      case UserRole.NGO_GOV: return { title: "Gov Command", sub: "Policy & network monitoring", icon: "🏛️" };
      default: return { title: "Command Center", sub: "Manage your activities", icon: "💎" };
    }
  };

  const greeting = getRoleGreeting();

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500">
      {/* PERSONALIZED HERO */}
      <section className="bg-slate-900 rounded-[3rem] p-10 md:p-14 text-white relative overflow-hidden shadow-2xl group">
         <div className="absolute top-0 right-0 p-14 opacity-10 pointer-events-none group-hover:rotate-12 transition-transform duration-1000">
            <span className="text-9xl">{greeting.icon}</span>
         </div>
         <div className="relative z-10 space-y-6 max-w-3xl">
            <div className="flex items-center gap-4">
              <div className="px-4 py-1.5 bg-emerald-500 rounded-xl text-slate-900 text-[10px] font-black uppercase tracking-widest">
                {user.role.replace('_', ' ')}
              </div>
              {user.isVerified && (
                <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                  <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                  Verified Identity
                </div>
              )}
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-none italic uppercase">
              Welcome back, <br/>
              <span className="text-emerald-400">{user.name.split(' ')[0]}</span>.
            </h1>
            <p className="text-xl text-blue-100/60 font-medium">{greeting.sub}</p>
            <div className="pt-4 flex flex-wrap gap-4">
               <button 
                 onClick={() => onNavigate(user.role)}
                 className="px-10 py-4 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-xl active:scale-95"
               >
                 Launch Dashboard
               </button>
               <button 
                onClick={() => onNavigate(UserRole.NETWORK)}
                className="px-8 py-4 bg-white/10 border border-white/10 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all"
               >
                 Explore Grid Map
               </button>
            </div>
         </div>
      </section>

      {/* QUICK ACTIONS GRID */}
      <div className="grid md:grid-cols-3 gap-6">
         <QuickAction 
            title="Start Disposal" 
            desc="Register a new end-of-life device." 
            icon="🛡️" 
            onClick={() => onNavigate(user.role)} 
         />
         <QuickAction 
            title="Locate Hub" 
            desc="Find certified nodes in your area." 
            icon="🛰️" 
            onClick={() => onNavigate(UserRole.NETWORK)} 
         />
         <QuickAction 
            title="Impact History" 
            desc="View your verified CO2e savings." 
            icon="⚖️" 
            onClick={() => onNavigate(user.role)} 
         />
      </div>

      {/* ALERTS & CRITICAL TASKS */}
      <div className="grid md:grid-cols-12 gap-8">
        
        {/* INBOX & NOTIFICATIONS */}
        <div className="md:col-span-4 space-y-6">
           <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm space-y-6">
              <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                 <h3 className="text-lg font-black text-slate-900 uppercase italic">Grid Intel</h3>
                 <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">3 Priority</span>
              </div>
              <div className="space-y-4">
                 <NotificationItem 
                    title="Handover Complete" 
                    time="2h ago" 
                    msg="Logistics handshake for Asset-42 successfully signed by Node-HYD." 
                    type="SUCCESS"
                 />
                 <NotificationItem 
                    title="Reward Credited" 
                    time="1d ago" 
                    msg="50 XP has been added to your profile for sustainable disposal." 
                    type="INFO"
                 />
                 <NotificationItem 
                    title="Policy Update" 
                    time="2d ago" 
                    msg="New rules for Li-ion battery transit have been published by Ministry." 
                    type="WARNING"
                 />
              </div>
              <button 
                onClick={() => onNavigate(user.role)}
                className="w-full py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-t border-slate-50 hover:text-slate-900 transition-colors"
              >
                 Open Full Archive
              </button>
           </div>

           {/* ADVERTISEMENT / ARTICLE */}
           <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-8 text-white space-y-6 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:rotate-12 transition-transform duration-700">
                 <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L1 21h22L12 2zm0 3.99L19.53 19H4.47L12 5.99zM11 16h2v2h-2zm0-6h2v4h-2z"/></svg>
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-200">Regional Bulletin</p>
              <h4 className="text-2xl font-black tracking-tight leading-tight">National Circular Economy Framework 2026</h4>
              <p className="text-sm font-medium opacity-70 leading-relaxed">mandatory reporting for all industrial and corporate e-waste flows starting Q3.</p>
              <button className="w-full py-3.5 bg-white text-blue-700 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-emerald-400 hover:text-white transition-all">Read Whitepaper</button>
           </div>
        </div>

        {/* MAIN TASKS & SUGGESTIONS */}
        <div className="md:col-span-8 space-y-8">
           <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm space-y-10">
              <div className="space-y-1">
                 <h3 className="text-2xl font-black text-slate-900 uppercase italic">Priority Recommendations</h3>
                 <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Optimized for {user.role.toLocaleLowerCase()} workflow</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                 <SuggestionCard 
                    icon="🎯" 
                    title="Validate Active Impact" 
                    desc="Update your device inventory to sync current CO2e prevention stats with the registry."
                    action="Update Inventory"
                    color="emerald"
                    onClick={() => onNavigate(user.role)}
                 />
                 <SuggestionCard 
                    icon="🛰️" 
                    title="Find Active Clusters" 
                    desc="Discover 3 new certified technician hubs active in your sector this week."
                    action="Map Network"
                    color="blue"
                    onClick={() => onNavigate(UserRole.NETWORK)}
                 />
                 <SuggestionCard 
                    icon="🏆" 
                    title="Tier-2 Eco Guardian" 
                    desc="You are only 150 Credits away from the next tier of regional benefits."
                    action="Track Progress"
                    color="cyan"
                    onClick={() => onNavigate(user.role)}
                 />
                 <SuggestionCard 
                    icon="🏛️" 
                    title="Verified Grants" 
                    desc="Check eligibility for the 2026 Small Hub sustainability grants program."
                    action="Verify Status"
                    color="slate"
                    onClick={() => {}} 
                 />
              </div>
           </div>

           {/* HELP & SUPPORT SECTION */}
           <div className="bg-slate-50 border border-slate-200 rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center gap-10">
              <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-4xl shadow-xl border border-slate-100 shrink-0">🏛️</div>
              <div className="space-y-3 flex-grow text-center md:text-left">
                 <h4 className="text-xl font-black text-slate-900 tracking-tight leading-none uppercase">Government Assistance Node</h4>
                 <p className="text-sm font-medium text-slate-500 leading-relaxed italic">"Our digital concierge is available 24/7 for verification help, logistics tracking, or material disposal policy inquiries."</p>
                 <div className="pt-2 flex flex-wrap justify-center md:justify-start gap-4">
                    <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">Knowledge Hub</button>
                    <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">Live Support Link</button>
                    <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">Policy Video Docs</button>
                 </div>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};

const QuickAction: React.FC<{ title: string, desc: string, icon: string, onClick: () => void }> = ({ title, desc, icon, onClick }) => (
  <button 
    onClick={onClick}
    className="bg-white border border-slate-200 p-8 rounded-[2rem] text-left hover:shadow-2xl hover:border-emerald-400 transition-all group flex items-start gap-6"
  >
    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">{icon}</div>
    <div>
      <h4 className="font-black text-slate-900 uppercase text-xs tracking-widest mb-1 group-hover:text-emerald-600">{title}</h4>
      <p className="text-[11px] font-medium text-slate-400 leading-relaxed">{desc}</p>
    </div>
  </button>
);

const NotificationItem: React.FC<{ title: string, time: string, msg: string, type: 'SUCCESS' | 'INFO' | 'WARNING' }> = ({ title, time, msg, type }) => (
  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-start gap-4 group hover:bg-white hover:border-blue-200 transition-all cursor-default">
     <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${type === 'SUCCESS' ? 'bg-emerald-500' : type === 'INFO' ? 'bg-blue-500' : 'bg-amber-500'}`}></div>
     <div className="space-y-1">
        <div className="flex justify-between items-center">
           <h5 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{title}</h5>
           <span className="text-[8px] font-bold text-slate-400 uppercase">{time}</span>
        </div>
        <p className="text-[11px] font-medium text-slate-500 leading-relaxed">{msg}</p>
     </div>
  </div>
);

const SuggestionCard: React.FC<{ icon: string, title: string, desc: string, action: string, color: string, onClick: () => void }> = ({ icon, title, desc, action, color, onClick }) => (
  <div className="p-8 bg-slate-50 border border-slate-100 rounded-[2rem] space-y-6 hover:bg-white hover:border-emerald-500 hover:shadow-2xl hover:-translate-y-1 transition-all group h-full flex flex-col">
     <div className="text-3xl group-hover:scale-110 transition-transform">{icon}</div>
     <div className="space-y-2 flex-grow">
        <h4 className="font-black text-slate-900 uppercase text-xs tracking-widest">{title}</h4>
        <p className="text-[11px] font-medium text-slate-500 leading-relaxed">{desc}</p>
     </div>
     <button 
      onClick={onClick}
      className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] group-hover:gap-4 transition-all pt-4"
     >
        {action}
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
     </button>
  </div>
);

const RoleCard: React.FC<{ title: string, desc: string, icon: string, color: 'emerald' | 'blue' | 'cyan' | 'slate', onClick: () => void }> = ({ title, desc, icon, color, onClick }) => (
  <div 
    onClick={onClick}
    className="group bg-white p-8 rounded-[2rem] border border-slate-200 hover:border-emerald-400 transition-all cursor-pointer shadow-sm hover:shadow-2xl hover:-translate-y-2 flex flex-col h-full"
  >
    <div className={`w-14 h-14 rounded-2xl mb-6 flex items-center justify-center text-2xl shadow-lg border border-white/20 transition-transform group-hover:rotate-6
      ${color === 'emerald' ? 'bg-emerald-600 shadow-emerald-500/20' : 
        color === 'blue' ? 'bg-blue-600 shadow-blue-500/20' : 
        color === 'cyan' ? 'bg-cyan-500 shadow-cyan-500/20' : 
        'bg-slate-900 shadow-slate-900/20'}`}>
      {icon}
    </div>
    <h3 className="text-xl font-black text-slate-900 mb-3 group-hover:text-emerald-600 transition-colors">{title}</h3>
    <p className="text-sm text-slate-500 font-medium leading-relaxed mb-8 flex-grow">
      {desc}
    </p>
    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-blue-600 group-hover:gap-4 transition-all">
      Continue
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
    </div>
  </div>
);

const ProcessStep: React.FC<{ num: string, label: string, desc: string, color: 'emerald' | 'blue' | 'cyan' }> = ({ num, label, desc, color }) => (
  <div className="flex items-center gap-6">
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg border border-white/20 
      ${color === 'emerald' ? 'bg-emerald-600 text-white shadow-emerald-500/20' : 
        color === 'blue' ? 'bg-blue-600 text-white shadow-blue-500/20' : 
        'bg-cyan-500 text-white shadow-cyan-500/20'}`}>
      {num}
    </div>
    <div className="flex-grow">
      <h4 className="font-black text-slate-900 leading-tight">{label}</h4>
      <p className={`text-xs font-bold uppercase tracking-widest mt-1 ${color === 'emerald' ? 'text-emerald-500' : color === 'blue' ? 'text-blue-500' : 'text-cyan-500'}`}>{desc}</p>
    </div>
    <div className="hidden sm:block">
      <svg className="w-5 h-5 text-slate-200" fill="currentColor" viewBox="0 0 20 20"><path d="M7.293 14.707a1 1 0 010-1.414L10.586 11H3a1 1 0 110-2h7.586l-3.293-3.293a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z"/></svg>
    </div>
  </div>
);

export default LandingPage;
