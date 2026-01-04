
import React, { useState, useEffect, useRef } from 'react';
import { Device, UserStats, DeviceCategory, Badge } from '../types';

const ALL_BADGES: Badge[] = [
  { id: 'pioneer', name: 'Grid Pioneer', icon: '🛰️', description: 'Initiated the first device lifecycle entry.', category: 'MILESTONE' },
  { id: 'savior', name: 'Circuit Savior', icon: '⚡', description: 'Successfully repaired a legacy computing unit.', category: 'REPAIR' },
  { id: 'guardian', name: 'Material Guardian', icon: '🛡️', description: 'Diverted 10kg of toxins from regional landfills.', category: 'RECYCLE' },
  { id: 'recruiter', name: 'Grid Advocate', icon: '📣', description: 'Successfully referred 3 new guardians.', category: 'COMMUNITY' },
  { id: 'steady', name: 'Steady Hand', icon: '⚖️', description: 'Maintained active status for over 3 months.', category: 'MILESTONE' },
  { id: 'master', name: 'Circular Master', icon: '👑', description: 'Reached Level 10 in the National Registry.', category: 'MILESTONE' },
];

const ConsumerDashboard: React.FC = () => {
  const [view, setView] = useState<'OVERVIEW' | 'FIND_RECYCLERS' | 'REWARDS'>('OVERVIEW');
  const [showForm, setShowForm] = useState(false);
  const [deviceDetails, setDeviceDetails] = useState({ category: '' as DeviceCategory | '', type: '', age: '', condition: '', image: '' });
  const [activeTracking, setActiveTracking] = useState<Device | null>(null);
  const [activeCertificate, setActiveCertificate] = useState<Device | null>(null);
  const [showReferralToast, setShowReferralToast] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showBadgeUnlock, setShowBadgeUnlock] = useState<Badge | null>(null);
  const [showSuccess, setShowSuccess] = useState<{title: string, msg: string} | null>(null);
  const [showEOLConfirmation, setShowEOLConfirmation] = useState(false);
  const [redeemingReward, setRedeemingReward] = useState<any | null>(null);
  
  // Geolocation & Nearby Recyclers State
  const [isLocating, setIsLocating] = useState(false);
  const [nearbyRecyclers, setNearbyRecyclers] = useState<any[]>([]);
  const [locationError, setLocationError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Gamification State
  const [stats, setStats] = useState<UserStats>({
    points: 1850, 
    level: 4,
    rank: 'Eco-Protector',
    nextLevelAt: 2000,
    badges: [
      { ...ALL_BADGES[0], unlockedAt: 'Jan 12, 2024' },
      { ...ALL_BADGES[4], unlockedAt: 'Feb 05, 2024' }
    ]
  });

  const [devices, setDevices] = useState<Device[]>([
    { id: '991', type: 'MacBook Pro', category: 'Computing', age: '5', condition: 'Display Flicker', status: 'In-Repair', owner: 'Self' },
    { id: '992', type: 'iPhone 12', category: 'Mobile', age: '3', condition: 'Software Errors', status: 'Repaired', owner: 'Self' },
    { id: '993', type: 'Old Monitor', category: 'Entertainment', age: '8', condition: 'Damaged Panel', status: 'Recycled', owner: 'Self' },
  ]);

  useEffect(() => {
    const pendingDevice = devices.find(d => d.status === 'Pickup-Requested');
    if (pendingDevice) {
      const timer = setTimeout(() => {
        setDevices(prev => prev.map(d => 
          d.id === pendingDevice.id ? { ...d, status: 'In-Repair' } : d
        ));
      }, 5000); 
      return () => clearTimeout(timer);
    }
  }, [devices]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDeviceDetails(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const unlockBadge = (badgeId: string) => {
    if (stats.badges.some(b => b.id === badgeId)) return;
    const badge = ALL_BADGES.find(b => b.id === badgeId);
    if (!badge) return;

    const newBadge = { ...badge, unlockedAt: new Date().toLocaleDateString('en-IN', { month: 'short', day: '2-digit', year: 'numeric' }) };
    setStats(prev => ({
      ...prev,
      badges: [...prev.badges, newBadge]
    }));
    setShowBadgeUnlock(newBadge);
    setTimeout(() => setShowBadgeUnlock(null), 6000);
  };

  const awardPoints = (amount: number) => {
    setStats(prev => {
      const newPoints = prev.points + amount;
      let newLevel = prev.level;
      let newRank = prev.rank;
      let newNextAt = prev.nextLevelAt;

      if (newPoints >= prev.nextLevelAt && amount > 0) {
        newLevel += 1;
        newNextAt += 1000;
        setShowLevelUp(true);
        
        if (newLevel >= 10) {
          newRank = 'Eco-Master';
          setTimeout(() => unlockBadge('master'), 3000);
        } else if (newLevel >= 5) {
          newRank = 'Earth Guardian';
        }
      }

      return {
        ...prev,
        points: Math.max(0, newPoints),
        level: newLevel,
        rank: newRank,
        nextLevelAt: newNextAt
      };
    });
  };

  const handleFinalAction = (action: 'REPAIR' | 'RECYCLE' | 'EOL') => {
    let status: Device['status'];
    let pointsAwarded = 150;

    if (action === 'REPAIR') {
      status = 'Pickup-Requested';
      setTimeout(() => unlockBadge('savior'), 1000);
    } else if (action === 'RECYCLE') {
      status = 'Awaiting-Logistics';
      setTimeout(() => unlockBadge('guardian'), 1000);
    } else {
      status = 'Awaiting-Logistics';
      pointsAwarded = 200;
      setShowSuccess({
        title: "EOL Recovery Initiated",
        msg: "Your asset has been routed for high-impact material extraction. +200 XP Added."
      });
      setTimeout(() => setShowSuccess(null), 5000);
    }
    
    const newDevice: Device = {
      id: Math.floor(Math.random() * 1000 + 1000).toString(),
      category: deviceDetails.category as DeviceCategory,
      type: deviceDetails.type,
      age: deviceDetails.age,
      condition: action === 'EOL' ? 'Total Hardware Failure (EOL)' : deviceDetails.condition.replace(/_/g, ' '),
      status: status,
      owner: 'Self',
      image: deviceDetails.image
    };
    
    awardPoints(pointsAwarded);
    setDevices([newDevice, ...devices]);
    setShowForm(false);
    setView('OVERVIEW');
    setDeviceDetails({ category: '', type: '', age: '', condition: '', image: '' });
  };

  const handleReferral = () => {
    awardPoints(50);
    setShowReferralToast(true);
    setTimeout(() => {
      setShowReferralToast(false);
    }, 3000);
    if (stats.points > 3000) unlockBadge('recruiter');
  };

  const handleConfirmRedemption = () => {
    if (!redeemingReward) return;
    
    const cost = redeemingReward.cost;
    if (stats.points >= cost) {
      awardPoints(-cost);
      const rewardName = redeemingReward.title;
      setRedeemingReward(null);
      
      setShowSuccess({
        title: "Voucher Issued",
        msg: `Successfully redeemed ${rewardName}. Code sent to registered email.`
      });
      setTimeout(() => setShowSuccess(null), 5000);
    }
  };

  const handleUseMyLocation = () => {
    setIsLocating(true);
    setLocationError(null);
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      setIsLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      () => {
        setTimeout(() => {
          const mockNearby = [
            { id: 'rec-1', name: 'GreenLoop Cyberabad', distance: '1.2 km', type: 'Industrial Recycler', rating: 4.9, address: 'HITEC City Node 4' },
            { id: 'rec-2', name: 'EcoMend Repairs', distance: '2.4 km', type: 'Premium Service Hub', rating: 4.8, address: 'Madhapur Main Rd' },
            { id: 'rec-3', name: 'ZeroWaste Gachibowli', distance: '3.1 km', type: 'E-Waste Drop-off', rating: 4.7, address: 'DLF Cyber City' },
          ];
          setNearbyRecyclers(mockNearby);
          setIsLocating(false);
        }, 2000);
      },
      () => {
        setLocationError("Unable to retrieve location.");
        setIsLocating(false);
      }
    );
  };

  const getFeasibility = () => {
    const { type, age, condition } = deviceDetails;
    const ageNum = parseInt(age) || 0;
    if (!type || !age || !condition) return null;
    
    let score = ageNum <= 2 ? 3 : ageNum <= 4 ? 2 : 1;
    const issue = condition.toLowerCase();
    
    const highRepair = ['software', 'battery_drain', 'port', 'speaker', 'os_lag', 'mic', 'camera', 'button', 'firmware', 'keyboard'];
    const mediumRepair = ['screen_crack', 'backlight', 'pixels', 'hinge', 'touch_unresponsive', 'overheating', 'audio_jack'];
    const lowRepair = ['liquid', 'motherboard', 'boot_loop', 'eol', 'no_power', 'swollen', 'logic_board', 'internal_short'];
    
    if (highRepair.some(k => issue.includes(k))) score += 3;
    else if (mediumRepair.some(k => issue.includes(k))) score += 2;
    else if (lowRepair.some(k => issue.includes(k))) score += 1;

    if (score >= 5) return { label: 'High', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', rec: 'Highly repairable. Parts are readily available in our regional distribution centers.', icon: '✅' };
    if (score >= 4) return { label: 'Medium', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', rec: 'Likely repairable. Requires professional hardware diagnostic at an L3 Node.', icon: '⚖️' };
    return { label: 'Critical', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', rec: 'Complex damage detected. Repair may not be cost-effective. We recommend formal EOL material recovery.', icon: '⚠️' };
  };

  const feasibility = getFeasibility();

  const getCategoryIcon = (category: DeviceCategory) => {
    switch(category) {
      case 'Mobile': return '📱';
      case 'Computing': return '💻';
      case 'Home Appliances': return '🏠';
      case 'Entertainment': return '🎮';
      default: return '📦';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-24">
      
      {/* SUCCESS TOAST */}
      {showSuccess && (
        <div className="fixed bottom-10 right-10 z-[20000] animate-in slide-in-from-right-10">
           <div className="bg-emerald-600 text-white px-8 py-5 rounded-3xl shadow-2xl flex items-center gap-5 border-2 border-emerald-500">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl shadow-lg">✨</div>
              <div>
                 <p className="font-black text-sm uppercase tracking-tight">{showSuccess.title}</p>
                 <p className="text-[10px] font-bold opacity-80">{showSuccess.msg}</p>
              </div>
           </div>
        </div>
      )}

      {/* REWARD REDEMPTION CONFIRMATION */}
      {redeemingReward && (
        <div className="fixed inset-0 z-[15000] flex items-center justify-center p-6 bg-slate-900/90 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 border border-white/20">
              <div className="bg-slate-900 p-10 text-white relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                    <span className="text-9xl">{redeemingReward.icon}</span>
                 </div>
                 <h2 className="text-3xl font-black tracking-tight leading-none uppercase italic">Confirm Redemption</h2>
                 <p className="text-emerald-400 font-black text-[10px] uppercase tracking-[0.3em] mt-2">Deducting from Green Credits Balance</p>
              </div>
              <div className="p-10 space-y-8">
                 <div className="space-y-4">
                    <div className="flex justify-between items-center bg-slate-50 p-6 rounded-2xl border border-slate-100">
                       <div className="flex items-center gap-4">
                          <div className="text-4xl">{redeemingReward.icon}</div>
                          <div>
                             <h4 className="font-black text-slate-900 uppercase tracking-tight leading-none">{redeemingReward.title}</h4>
                             <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">{redeemingReward.cost} Green Credits</p>
                          </div>
                       </div>
                    </div>
                    <p className="text-sm font-medium text-slate-500 leading-relaxed italic px-2">
                       "You are about to exchange your hard-earned credits for a verified sustainability benefit. This action is recorded on the National Grid and cannot be reversed."
                    </p>
                 </div>

                 <div className="grid grid-cols-2 gap-4 pt-4">
                    <button 
                       onClick={() => setRedeemingReward(null)}
                       className="py-5 border-2 border-slate-100 text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all"
                    >
                       Go Back
                    </button>
                    <button 
                       onClick={handleConfirmRedemption}
                       className="py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 shadow-xl active:scale-95 transition-all"
                    >
                       Redeem Now
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* BADGE UNLOCK TOAST */}
      {showBadgeUnlock && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[15000] animate-in slide-in-from-bottom-20 duration-700">
          <div className="bg-slate-900 border-2 border-emerald-500/50 text-white px-8 py-5 rounded-[2.5rem] shadow-2xl flex items-center gap-6 group overflow-hidden">
             <div className="absolute inset-0 bg-emerald-500/10 scale-x-0 group-hover:scale-x-100 transition-transform duration-1000 origin-left"></div>
             <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-2xl flex items-center justify-center text-3xl shadow-xl animate-bounce relative z-10">
               {showBadgeUnlock.icon}
             </div>
             <div className="relative z-10">
               <p className="text-[10px] font-black uppercase text-emerald-400 tracking-[0.3em] mb-1">New Badge Earned!</p>
               <h3 className="text-xl font-black tracking-tight leading-none mb-1">{showBadgeUnlock.name}</h3>
               <p className="text-xs font-medium text-slate-400 max-w-[200px] leading-tight">{showBadgeUnlock.description}</p>
             </div>
             <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
               <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L1 21h22L12 2zm0 3.99L19.53 19H4.47L12 5.99zM11 16h2v2h-2zm0-6h2v4h-2z"/></svg>
             </div>
          </div>
        </div>
      )}

      {/* EOL CONFIRMATION MODAL */}
      {showEOLConfirmation && (
        <div className="fixed inset-0 z-[11000] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 border border-white/20">
              <div className="bg-red-600 p-10 text-white relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
                    <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L1 21h22L12 2zm0 3.99L19.53 19H4.47L12 5.99zM11 16h2v2h-2zm0-6h2v4h-2z"/></svg>
                 </div>
                 <h2 className="text-3xl font-black tracking-tight leading-none uppercase italic">End-of-Life Declaration</h2>
                 <p className="text-red-100 font-black text-[10px] uppercase tracking-[0.3em] mt-2">Hazardous Material Protocol</p>
              </div>
              <div className="p-10 space-y-8">
                 <div className="space-y-4">
                    <div className="bg-red-50 border border-red-100 rounded-2xl p-6 flex items-start gap-4">
                       <span className="text-2xl mt-1">⚠️</span>
                       <div className="space-y-2">
                          <p className="text-red-900 font-black text-sm uppercase tracking-tight">Destructive Recovery Authorized</p>
                          <p className="text-red-700 text-xs font-medium leading-relaxed">
                            Declaring this asset as End-of-Life (EOL) bypasses the repair grid. It will be routed to a <strong>Specialized Recovery Partner</strong> for material extraction and toxin neutralization.
                          </p>
                       </div>
                    </div>
                    <ul className="space-y-3 px-2">
                       <li className="flex items-center gap-3 text-xs font-bold text-slate-600">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                          Permanent data destruction via industrial shredding.
                       </li>
                       <li className="flex items-center gap-3 text-xs font-bold text-slate-600">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                          Formal hazardous waste tracking initiated.
                       </li>
                       <li className="flex items-center gap-3 text-xs font-bold text-slate-600">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                          Earn maximum Green Credits for toxin prevention (+200 XP).
                       </li>
                    </ul>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <button 
                       onClick={() => setShowEOLConfirmation(false)}
                       className="py-5 border-2 border-slate-100 text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all"
                    >
                       Abandon Action
                    </button>
                    <button 
                       onClick={() => { setShowEOLConfirmation(false); handleFinalAction('EOL'); }}
                       className="py-5 bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-700 shadow-xl shadow-red-500/20 active:scale-95 transition-all"
                    >
                       Confirm EOL Routing
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* CELEBRATORY LEVEL UP MODAL */}
      {showLevelUp && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6 bg-slate-900/90 backdrop-blur-xl animate-in fade-in duration-500 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
             {[...Array(24)].map((_, i) => (
               <div 
                 key={i} 
                 className={`absolute w-2 h-2 rounded-sm animate-bounce`}
                 style={{ 
                   left: `${Math.random() * 100}%`, 
                   top: `${Math.random() * 100}%`,
                   backgroundColor: i % 3 === 0 ? '#10b981' : i % 3 === 1 ? '#3b82f6' : '#f59e0b',
                   animationDelay: `${Math.random() * 2}s`,
                   opacity: 0.5
                 }}
               />
             ))}
          </div>

          <div className="bg-white rounded-[2.5rem] sm:rounded-[3.5rem] shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-500 border border-emerald-500/20 relative">
            <div className="bg-gradient-to-br from-emerald-600 via-blue-600 to-indigo-700 py-10 px-6 text-center text-white shrink-0 relative">
               <button 
                onClick={() => setShowLevelUp(false)}
                className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-all"
               >
                 <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M6 18L18 6M6 6l12 12" /></svg>
               </button>
               <div className="w-20 h-20 bg-white/20 rounded-2xl mx-auto flex items-center justify-center text-4xl shadow-xl border-2 border-white/30 animate-bounce mb-4">🏆</div>
               <h2 className="text-3xl font-black tracking-tight uppercase italic">Rank Promoted!</h2>
               <p className="text-blue-100/70 font-black uppercase tracking-[0.3em] text-[10px]">National Registry Achievement</p>
            </div>

            <div className="flex-grow overflow-y-auto p-8 sm:p-12 text-center space-y-8 custom-scrollbar">
               <div className="flex justify-center items-center gap-6 sm:gap-10">
                  <div className="text-center">
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Old</p>
                     <p className="text-3xl font-black text-slate-300 italic">{stats.level - 1}</p>
                  </div>
                  <div className="w-px h-10 bg-slate-100"></div>
                  <div className="text-center relative px-2">
                     <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[7px] font-black px-1.5 py-0.5 rounded animate-pulse whitespace-nowrap">NEW TIER</div>
                     <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">Active</p>
                     <p className="text-6xl font-black text-slate-900 tracking-tighter italic leading-none">{stats.level}</p>
                  </div>
                  <div className="w-px h-10 bg-slate-100"></div>
                  <div className="text-center">
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Rank</p>
                     <p className="text-base font-black text-blue-600 uppercase italic tracking-tight whitespace-nowrap">{stats.rank}</p>
                  </div>
               </div>

               <div className="bg-emerald-50 p-6 rounded-[1.5rem] border border-emerald-100 space-y-2">
                  <h4 className="text-xs font-black text-emerald-800 uppercase tracking-widest">Progress Validated</h4>
                  <p className="text-xs text-emerald-700/80 font-medium leading-relaxed italic">
                    "Your effort in diverting toxic waste has elevated your status. New regional rewards are now unlocked."
                  </p>
               </div>

               <button 
                onClick={() => setShowLevelUp(false)}
                className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-emerald-600 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3"
               >
                 Close & Continue
                 <span className="text-base">→</span>
               </button>
            </div>
          </div>
        </div>
      )}

      {/* IMPACT HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-emerald-900 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl border border-white/10 group">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px] pointer-events-none group-hover:bg-emerald-500/30 transition-all duration-1000"></div>
        
        <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center text-3xl font-black shadow-xl border-4 border-white/10">
                {stats.level}
              </div>
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 text-emerald-400 font-bold text-[10px] uppercase tracking-[0.2em]">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  {stats.rank}
                </div>
                <h2 className="text-xl font-black tracking-tight">Citizen Tier Rank</h2>
              </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
              You've prevented <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">12.4kg</span> of toxic waste.
            </h1>
            
            <div className="space-y-3 pt-4">
              <div className="flex justify-between items-end text-sm font-bold uppercase tracking-widest">
                <span className="text-white/60">Next: {stats.level >= 5 ? 'Eco-Master' : 'Earth Guardian'}</span>
                <span className="text-emerald-400">{stats.points} / {stats.nextLevelAt} Green Credits</span>
              </div>
              <div className="w-full h-4 bg-white/10 rounded-full overflow-hidden border border-white/10">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-all duration-1000"
                  style={{ width: `${(stats.points / stats.nextLevelAt) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <ImpactScoreCard label="Green Credits" value={stats.points.toString()} sub="Redeem for services" icon="💎" color="border-emerald-500/30 bg-emerald-500/10" />
             <ImpactScoreCard label="CO₂ Saved" value="48kg" sub="≈ 2 Tree lifetimes" icon="🌱" color="border-blue-500/30 bg-blue-500/10" />
             <ImpactScoreCard label="Toxins Blocked" value="0.8kg" sub="Lead & Mercury" icon="🛡️" color="border-cyan-500/30 bg-cyan-500/10" />
             <ImpactScoreCard label="Life Extenders" value="12" sub="Repair completions" icon="⚡" color="border-amber-500/30 bg-amber-500/10" />
          </div>
        </div>
      </section>

      {/* VIEW SWITCHER / QUICK ACTIONS */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between border-b border-slate-200 pb-6">
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 w-full sm:w-auto overflow-x-auto">
          <button 
            onClick={() => setView('OVERVIEW')}
            className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${view === 'OVERVIEW' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}
          >
            My Device Grid
          </button>
          <button 
            onClick={() => setView('FIND_RECYCLERS')}
            className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${view === 'FIND_RECYCLERS' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Find Nodes
          </button>
          <button 
            onClick={() => setView('REWARDS')}
            className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${view === 'REWARDS' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Rewards Hub
          </button>
        </div>
        
        <div className="flex gap-3 w-full sm:w-auto">
          {view === 'OVERVIEW' && (
            <button 
              onClick={() => setShowForm(!showForm)}
              className="flex-grow sm:flex-grow-0 px-8 py-3 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-emerald-600 transition-all active:scale-95 shadow-xl shadow-slate-900/10 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
              New Entry (+150 XP)
            </button>
          )}
        </div>
      </div>

      {/* DYNAMIC VIEW RENDERING */}
      {view === 'OVERVIEW' && (
        <div className="space-y-8 animate-in slide-in-from-bottom-6">
          {showForm && (
            <section id="device-upload-form" className="bg-white border border-slate-200 rounded-[2rem] p-6 sm:p-10 shadow-2xl max-w-2xl mx-auto animate-in zoom-in-95 duration-300">
               <div className="flex justify-between items-center mb-8">
                 <h2 className="text-2xl font-black text-slate-900 leading-tight uppercase italic">New Lifecycle Entry</h2>
                 <button 
                   onClick={() => { setShowForm(false); setDeviceDetails({ category: '', type: '', age: '', condition: '', image: '' }); }} 
                   className="text-slate-400 hover:text-slate-600"
                 >
                   <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                 </button>
               </div>
               
               <div className="space-y-6">
                 {/* IMAGE UPLOAD ZONE */}
                 <div className="space-y-3">
                    <label className="text-xs font-black uppercase text-slate-400 tracking-widest">Device Verification Photo</label>
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="relative w-full h-48 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl overflow-hidden group cursor-pointer hover:border-emerald-500 transition-all flex flex-col items-center justify-center text-center shadow-inner"
                    >
                       {deviceDetails.image ? (
                         <>
                           <img src={deviceDetails.image} className="w-full h-full object-cover" alt="Preview" />
                           <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <span className="text-white text-xs font-black uppercase tracking-widest">Change Photo</span>
                           </div>
                         </>
                       ) : (
                         <div className="space-y-2">
                            <div className="text-3xl grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all">📸</div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-emerald-600">Click to upload device image</p>
                         </div>
                       )}
                       <input 
                         type="file" 
                         ref={fileInputRef} 
                         onChange={handleImageUpload} 
                         accept="image/*" 
                         className="hidden" 
                       />
                    </div>
                 </div>

                 <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase text-slate-400 tracking-widest">Device Category</label>
                      <select 
                        value={deviceDetails.category}
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none appearance-none shadow-inner"
                        onChange={(e) => setDeviceDetails({...deviceDetails, category: e.target.value as DeviceCategory})}
                      >
                        <option value="">Select category...</option>
                        <option value="Mobile">Mobile / Smartphones</option>
                        <option value="Computing">Computing / Laptops</option>
                        <option value="Home Appliances">Home Appliances</option>
                        <option value="Entertainment">Entertainment / Gaming</option>
                        <option value="Other">Other Electronics</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase text-slate-400 tracking-widest">Model / Type</label>
                      <input 
                        type="text" 
                        value={deviceDetails.type}
                        placeholder="e.g. MacBook Pro, Dyson Vacuum" 
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none shadow-inner"
                        onChange={(e) => setDeviceDetails({...deviceDetails, type: e.target.value})}
                      />
                    </div>
                 </div>

                 <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase text-slate-400 tracking-widest">Age (Years)</label>
                      <input 
                        type="number" 
                        value={deviceDetails.age}
                        placeholder="e.g. 3" 
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none shadow-inner"
                        onChange={(e) => setDeviceDetails({...deviceDetails, age: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase text-slate-400 tracking-widest">Identify Primary Issue</label>
                      <select 
                        value={deviceDetails.condition}
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none appearance-none shadow-inner"
                        onChange={(e) => setDeviceDetails({...deviceDetails, condition: e.target.value})}
                      >
                        <option value="">Identify problem...</option>
                        <optgroup label="Display & Touch Issues">
                          <option value="screen_crack">Cracked / Shattered Screen</option>
                          <option value="dead_pixels">Vertical Lines / Dead Pixels</option>
                          <option value="touch_unresponsive">Touch Unresponsive</option>
                          <option value="backlight_failure">Backlight / Dim Display</option>
                          <option value="ghost_touch">Ghost Touching / Glitching</option>
                        </optgroup>
                        <optgroup label="Power & Battery">
                          <option value="battery_drain">Rapid Battery Drain</option>
                          <option value="swollen_battery">Swollen / Bulging Battery (Hazard)</option>
                          <option value="charging_port">Charging Port Loose / Failed</option>
                          <option value="random_shutdowns">Random Power-Offs</option>
                          <option value="overheating">Device Runs Excessively Hot</option>
                        </optgroup>
                        <optgroup label="Total Asset Failure">
                          <option value="no_power">No Power (Completely Dead)</option>
                          <option value="eol">Obsolete / No Security Updates</option>
                          <option value="beyond_repair">Known Beyond Economical Repair</option>
                        </optgroup>
                      </select>
                    </div>
                 </div>

                 {feasibility && (
                   <div className={`p-6 rounded-3xl border-2 animate-in slide-in-from-bottom-2 ${feasibility.bg} ${feasibility.border}`}>
                     <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                           <span className="text-xl">{feasibility.icon}</span>
                           <h4 className="text-sm font-black uppercase tracking-widest text-slate-700">Feasibility Scan</h4>
                        </div>
                        <span className={`text-sm font-black uppercase tracking-[0.2em] ${feasibility.color}`}>{feasibility.label} Potential</span>
                     </div>
                     <p className="text-sm text-slate-600 font-medium leading-relaxed">{feasibility.rec}</p>
                   </div>
                 )}
                 
                 <div className="space-y-4 pt-2">
                    <div className="flex flex-col sm:flex-row gap-4">
                       <button 
                         onClick={() => handleFinalAction('REPAIR')}
                         disabled={!deviceDetails.category || !deviceDetails.type || !deviceDetails.age || !deviceDetails.condition}
                         className="flex-grow py-5 bg-blue-600 text-white rounded-2xl font-black text-lg hover:bg-blue-700 disabled:opacity-50 shadow-xl shadow-blue-500/10 transition-all active:scale-95"
                       >
                         Request Repair
                       </button>
                       <button 
                         onClick={() => handleFinalAction('RECYCLE')}
                         disabled={!deviceDetails.category || !deviceDetails.type || !deviceDetails.age || !deviceDetails.condition}
                         className="flex-grow py-5 bg-emerald-600 text-white rounded-2xl font-black text-lg hover:bg-emerald-700 disabled:opacity-50 shadow-xl shadow-emerald-500/10 transition-all active:scale-95"
                       >
                         Schedule Recycling
                       </button>
                    </div>
                    
                    <button 
                      onClick={() => setShowEOLConfirmation(true)}
                      disabled={!deviceDetails.category || !deviceDetails.type || !deviceDetails.age || !deviceDetails.condition}
                      className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-lg hover:bg-red-600 disabled:opacity-50 shadow-xl shadow-slate-900/10 transition-all active:scale-95 flex items-center justify-center gap-3 group"
                    >
                      <span className="group-hover:rotate-12 transition-transform">🛡️</span>
                      Declare End-of-Life (EOL)
                    </button>
                 </div>
               </div>
            </section>
          )}

          <div className="grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-8">
              <section className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
                <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <h3 className="text-xl font-black text-slate-800 italic uppercase tracking-tight">Your Impact Timeline</h3>
                  <div className="flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                     <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Registry Synced</span>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left min-w-[600px]">
                    <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] border-b border-slate-100">
                      <tr>
                        <th className="px-8 py-5">Asset Entry</th>
                        <th className="px-8 py-5">Grid Status</th>
                        <th className="px-8 py-5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {devices.map((d) => (
                        <tr key={d.id} className="group hover:bg-blue-50/30 transition-all">
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-xl group-hover:bg-white shadow-sm overflow-hidden" title={d.category}>
                                {d.image ? (
                                  <img src={d.image} className="w-full h-full object-cover" alt={d.type} />
                                ) : (
                                  getCategoryIcon(d.category)
                                )}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900">{d.type}</p>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{d.category}</span>
                                  <span className="text-[10px] text-slate-400">•</span>
                                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate max-w-[150px]">{d.condition}</p>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              d.status === 'Repaired' || d.status === 'Recycled' || d.status.startsWith('Verified') ? 'bg-emerald-100 text-emerald-700' :
                              d.condition.includes('EOL') ? 'bg-red-50 text-red-700 border border-red-100' :
                              'bg-blue-50 text-blue-700 border border-blue-200'
                            }`}>
                              {d.condition.includes('EOL') ? 'EOL Extraction' : d.status.replace('-', ' ')}
                            </span>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <button 
                              onClick={() => d.status === 'Repaired' || d.status === 'Recycled' || d.status.startsWith('Verified') ? setActiveCertificate(d) : setActiveTracking(d)}
                              className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all active:scale-95"
                            >
                              {d.status === 'Repaired' || d.status === 'Recycled' || d.status.startsWith('Verified') ? 'View Proof' : 'Track Node'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>

            <div className="lg:col-span-4 space-y-6">
               {/* BADGE GALLERY SECTION */}
               <section className="bg-white border border-slate-200 rounded-[2.5rem] p-8 space-y-6 shadow-sm overflow-hidden relative">
                  <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                     <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Service Badges</h3>
                     <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                        {stats.badges.length} / {ALL_BADGES.length}
                     </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                     {ALL_BADGES.map((badge) => {
                        const isUnlocked = stats.badges.some(b => b.id === badge.id);
                        return (
                           <div key={badge.id} className="relative group flex flex-col items-center">
                              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl transition-all duration-500 border-2 ${
                                 isUnlocked ? 'bg-emerald-50 border-emerald-200 shadow-lg shadow-emerald-500/10' : 'bg-slate-50 border-slate-100 grayscale opacity-40'
                              }`}>
                                 {badge.icon}
                              </div>
                              
                              <div className="absolute -top-16 opacity-0 group-hover:opacity-100 transition-all bg-slate-900 text-white p-3 rounded-xl w-40 z-50 pointer-events-none text-center shadow-2xl scale-90 group-hover:scale-100">
                                 <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-1">{badge.name}</p>
                                 <p className="text-[9px] font-medium leading-tight opacity-70">{badge.description}</p>
                                 {isUnlocked && <p className="text-[8px] font-black text-emerald-500 mt-1 uppercase">Unlocked</p>}
                              </div>
                           </div>
                        );
                     })}
                  </div>
                  
                  <div className="pt-2">
                     <button className="w-full py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-t border-slate-50 hover:text-slate-900 transition-colors">
                        View Digital Trophy Room
                     </button>
                  </div>
               </section>

               <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white space-y-8 shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:rotate-12 transition-transform">
                    <svg className="w-48 h-48" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L1 21h22L12 2zm0 3.99L19.53 19H4.47L12 5.99zM11 16h2v2h-2zm0-6h2v4h-2z"/></svg>
                  </div>
                  <div className="space-y-2 relative z-10">
                    <h3 className="text-xl font-black uppercase italic tracking-tight">Guardian Referral</h3>
                    <p className="text-sm text-white/50 font-medium leading-relaxed">Recruit friends to the GreenLink grid and earn <span className="text-emerald-400 font-black">+50 XP</span> per joining.</p>
                  </div>
                  <button 
                    onClick={handleReferral}
                    className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-xl active:scale-95 relative z-10"
                  >
                    Copy Referral Link
                  </button>
                  {showReferralToast && (
                    <div className="absolute inset-0 bg-emerald-600 flex items-center justify-center p-8 animate-in fade-in zoom-in">
                       <div className="text-center space-y-2">
                          <p className="text-4xl">🚀</p>
                          <p className="text-[10px] font-black uppercase tracking-widest">Link Copied & Reward Added!</p>
                       </div>
                    </div>
                  )}
               </div>

               <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 space-y-6 shadow-sm">
                  <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-4">Registry Milestones</h3>
                  <div className="space-y-4">
                     <AchievementItem icon="🚲" title="Early Adopter" date="Joined Grid 2024" complete />
                     <AchievementItem icon="🔋" title="Power Saver" date="3 Batteries Salvaged" complete />
                     <AchievementItem icon="🌟" title="Community Guide" date="5 Referrals" />
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}

      {view === 'FIND_RECYCLERS' && (
        <div className="space-y-8 animate-in slide-in-from-right-10 duration-500">
          <section className="bg-slate-900 rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl group border border-white/10">
            <div className="absolute inset-0 opacity-10">
              <div className="w-full h-full" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
            </div>
            
            <div className="relative z-10 max-w-2xl mx-auto text-center space-y-8">
               <div className="w-20 h-20 bg-emerald-500/20 rounded-3xl mx-auto flex items-center justify-center text-4xl shadow-2xl shadow-emerald-500/10 border border-white/10 group-hover:scale-110 transition-transform">
                 {isLocating ? '🛰️' : '📡'}
               </div>
               <div className="space-y-4">
                 <h2 className="text-4xl font-black tracking-tight uppercase italic leading-none">Find Nearby Grid Nodes</h2>
                 <p className="text-blue-100/60 font-medium text-lg leading-relaxed">
                   Authorized disposal centers and certified repair hubs are mapped within the National Grid for immediate citizen access.
                 </p>
               </div>

               {locationError && (
                 <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-2xl text-red-200 text-xs font-black uppercase tracking-widest">
                   {locationError}
                 </div>
               )}

               <button 
                 onClick={handleUseMyLocation}
                 disabled={isLocating}
                 className={`w-full py-6 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-4 ${isLocating ? 'bg-slate-800 text-slate-500' : 'bg-white text-slate-900 hover:bg-emerald-400 active:scale-95 shadow-2xl'}`}
               >
                 {isLocating ? 'Syncing Satellite...' : 'Use My Location'}
               </button>
            </div>
          </section>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {nearbyRecyclers.length === 0 && !isLocating ? (
              <div className="col-span-full py-32 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem] space-y-4">
                 <div className="text-4xl opacity-50">🛰️</div>
                 <p className="text-slate-400 font-black uppercase tracking-[0.2em]">Node Directory is Empty. Initialize Scan.</p>
              </div>
            ) : nearbyRecyclers.map(rec => (
              <div key={rec.id} className="bg-white border-2 border-slate-100 p-8 rounded-[2.5rem] hover:shadow-2xl transition-all group animate-in slide-in-from-bottom-6 duration-500 flex flex-col shadow-sm">
                <div className="flex justify-between items-start mb-6">
                  <div className="bg-emerald-600 text-white w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-lg shadow-emerald-500/20 group-hover:rotate-6 transition-transform">
                    {rec.type.includes('Recycler') ? '♻️' : '⚡'}
                  </div>
                  <div className="text-right">
                    <p className="text-emerald-600 font-black text-lg tracking-tighter">{rec.distance}</p>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">PROXIMITY</p>
                  </div>
                </div>
                <div className="flex-grow space-y-4">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">{rec.name}</h3>
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">{rec.type} • AUTHENTICATED</p>
                  </div>
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Grid Address</p>
                     <p className="text-xs font-bold text-slate-700">{rec.address}</p>
                  </div>
                </div>
                <button className="w-full mt-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 active:scale-95 transition-all shadow-xl">
                  Schedule Handover (+50 XP)
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {view === 'REWARDS' && (
        <div className="space-y-8 animate-in slide-in-from-right-10 duration-500">
           <section className="bg-white border border-slate-200 rounded-[3rem] p-12 shadow-sm space-y-12">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-slate-100 pb-10 gap-6">
                 <div className="space-y-2">
                    <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">Rewards Hub</h2>
                    <p className="text-sm font-medium text-slate-400">Exchange your verified Green Credits for premium grid benefits and services.</p>
                 </div>
                 <div className="bg-slate-900 text-white px-8 py-6 rounded-[2rem] flex items-center gap-6 shadow-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-emerald-500/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                    <span className="text-4xl group-hover:scale-110 transition-transform">💎</span>
                    <div className="text-right relative z-10">
                       <p className="text-4xl font-black tracking-tighter leading-none">{stats.points}</p>
                       <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 mt-1">Available Credits</p>
                    </div>
                 </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                 <RewardCard 
                    title="Carbon-Neutral Delivery" 
                    cost={500} 
                    icon="🚚" 
                    desc="One-time professional logistics pickup from your doorstep to the nearest certified recycling hub." 
                    onRedeem={() => setRedeemingReward({ title: 'Carbon-Neutral Delivery', cost: 500, icon: '🚚' })}
                    disabled={stats.points < 500}
                 />
                 <RewardCard 
                    title="L3 Hub Diagnostic" 
                    cost={800} 
                    icon="🔬" 
                    desc="A deep-level technical audit and diagnostic session for any logic-board based asset at a Tier-3 node." 
                    onRedeem={() => setRedeemingReward({ title: 'L3 Hub Diagnostic', cost: 800, icon: '🔬' })}
                    disabled={stats.points < 800}
                 />
                 <RewardCard 
                    title="Eco-Guardian Transit Kit" 
                    cost={1500} 
                    icon="📦" 
                    desc="A set of 5 professional-grade, anti-static, and biodegradable transit boxes for secure e-waste movement." 
                    onRedeem={() => setRedeemingReward({ title: 'Transit Kit', cost: 1500, icon: '📦' })}
                    disabled={stats.points < 1500}
                 />
              </div>

              <div className="bg-slate-50 border border-slate-200 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-8 group">
                 <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-3xl shadow-lg group-hover:rotate-6 transition-transform">🎟️</div>
                 <div className="flex-grow text-center md:text-left">
                    <h4 className="font-black text-slate-900 uppercase tracking-tight italic">Partner Redemption Network</h4>
                    <p className="text-xs font-medium text-slate-500 leading-relaxed mt-1">
                       Our rewards are officially recognized by municipal bodies and authorized recycling partners across the district. Each redemption generates a unique verification code tied to your National ID.
                    </p>
                 </div>
                 <button className="px-8 py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-900 hover:text-white transition-all">Redemption History</button>
              </div>
           </section>
        </div>
      )}

      {/* TRACKING MODAL */}
      {activeTracking && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-md animate-in fade-in" role="dialog">
           <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl p-8 space-y-8 animate-in zoom-in-95 border border-white/20">
              <div className="flex justify-between items-start">
                 <div>
                    <h3 className="text-2xl font-black text-slate-900">Lifecycle Tracking</h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 mt-1">Asset ID: {activeTracking.id.toUpperCase()}</p>
                 </div>
                 <button onClick={() => setActiveTracking(null)} className="p-2 text-slate-400 hover:text-slate-900">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                 </button>
              </div>
              <div className="space-y-6 relative border-l-2 border-slate-100 ml-4 pl-8">
                 <TrackingStep title="Asset Logged" time="Success" complete />
                 <TrackingStep title={activeTracking.condition.includes('EOL') ? "EOL Triage" : "Hub Allocation"} time="Pending" active />
                 <TrackingStep title={activeTracking.condition.includes('EOL') ? "Material Extraction" : "Final Verification"} time="Locked" />
              </div>
              <button onClick={() => setActiveTracking(null)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest">Close Record</button>
           </div>
        </div>
      )}

      {/* CERTIFICATE MODAL */}
      {activeCertificate && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/90 backdrop-blur-xl animate-in fade-in">
           <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in slide-in-from-bottom-8 border border-white/20">
              <div className="bg-gradient-to-r from-emerald-600 to-blue-700 h-32 flex items-center justify-between px-10">
                 <h2 className="text-2xl font-black text-white uppercase italic tracking-tight leading-none">Impact Certificate</h2>
                 <button onClick={() => setActiveCertificate(null)} className="p-3 bg-white/20 rounded-2xl text-white hover:bg-white/30 transition-all">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12" strokeWidth={3}/></svg>
                 </button>
              </div>
              <div className="p-12 text-center space-y-8">
                 <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-500 italic">"Verified for formal extraction and circular re-entry."</p>
                    <div className="w-20 h-1 bg-emerald-500 mx-auto rounded-full"></div>
                 </div>
                 <div className="grid grid-cols-2 gap-8 border-y border-slate-50 py-8">
                    <div><p className="text-3xl font-black text-emerald-600">4.2kg</p><p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Weight Diverted</p></div>
                    <div><p className="text-3xl font-black text-blue-600">8.1kg</p><p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">CO2 Offset</p></div>
                 </div>
                 <button className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl">Download Official PDF</button>
              </div>
           </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}} />
    </div>
  );
};

const AchievementItem: React.FC<{ icon: string, title: string, date: string, complete?: boolean }> = ({ icon, title, date, complete }) => (
  <div className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${complete ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100 opacity-40 grayscale'}`}>
     <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-xl shadow-sm">{icon}</div>
     <div>
        <p className="text-[10px] font-black uppercase text-slate-900 tracking-tight leading-none">{title}</p>
        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">{date}</p>
     </div>
  </div>
);

const RewardCard: React.FC<{ title: string, cost: number, icon: string, desc: string, onRedeem: () => void, disabled: boolean }> = ({ title, cost, icon, desc, onRedeem, disabled }) => (
  <div className={`bg-slate-50 border border-slate-100 p-8 rounded-[2.5rem] space-y-6 hover:shadow-2xl hover:bg-white transition-all flex flex-col group ${disabled ? 'opacity-80' : 'hover:border-emerald-400'}`}>
     <div className="flex justify-between items-start">
        <div className={`w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-3xl shadow-lg border border-slate-100 group-hover:rotate-12 transition-transform ${disabled ? 'grayscale' : ''}`}>{icon}</div>
        <div className="text-right">
           <p className={`text-3xl font-black tracking-tighter leading-none ${disabled ? 'text-slate-400' : 'text-slate-900'}`}>{cost}</p>
           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Green Credits</p>
        </div>
     </div>
     <div className="flex-grow space-y-3">
        <h4 className={`text-xl font-black uppercase italic tracking-tight leading-tight ${disabled ? 'text-slate-400' : 'text-slate-900'}`}>{title}</h4>
        <p className="text-xs font-medium text-slate-500 leading-relaxed">{desc}</p>
     </div>
     <button 
        onClick={onRedeem}
        disabled={disabled}
        className={`w-full py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2 ${disabled ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-emerald-600'}`}
     >
        {disabled ? (
           <>
             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8-8v4" /></svg>
             Not Enough Credits
           </>
        ) : 'Redeem Benefit'}
     </button>
  </div>
);

const TrackingStep: React.FC<{ title: string, time: string, active?: boolean, complete?: boolean }> = ({ title, time, active, complete }) => (
  <div className="relative mb-6">
    <div className={`absolute -left-10 w-4 h-4 rounded-full border-2 transition-all ${complete ? 'bg-emerald-500 border-white shadow-lg' : active ? 'bg-blue-500 border-white animate-pulse' : 'bg-white border-slate-200'}`}></div>
    <div className={`flex justify-between items-center ${!complete && !active ? 'opacity-40' : 'opacity-100'}`}>
       <h4 className="font-black text-slate-900 uppercase text-xs tracking-widest">{title}</h4>
       <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{time}</span>
    </div>
  </div>
);

const ImpactScoreCard: React.FC<{ label: string, value: string, sub: string, icon: string, color: string }> = ({ label, value, sub, icon, color }) => (
  <div className={`p-6 rounded-[1.5rem] border backdrop-blur-sm group hover:scale-105 transition-all ${color}`}>
    <div className="flex justify-between items-start mb-4">
      <span className="text-2xl">{icon}</span>
      <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{label}</span>
    </div>
    <p className="text-3xl font-black mb-1 tracking-tighter leading-none">{value}</p>
    <p className="text-[10px] text-white/50 font-bold">{sub}</p>
  </div>
);

export default ConsumerDashboard;
