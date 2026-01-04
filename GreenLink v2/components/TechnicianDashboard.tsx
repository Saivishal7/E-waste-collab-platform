
import React, { useState, useMemo } from 'react';

type JobStatus = 'Pending' | 'Ongoing' | 'Verified-Repair' | 'Verified-EOL';

interface RepairJob {
  id: string;
  device: string;
  issue: string;
  dist: string;
  date: string;
  status: JobStatus;
  assetClass: 'Government' | 'Enterprise' | 'Consumer';
  priority: 'High' | 'Standard';
  currentStep: number;
  notes: string[];
  partsToReplace: string[];
  txHash?: string;
  completedAt?: string;
  signerId?: string;
}

interface InventoryItem {
  part: string;
  count: number;
  grade: 'A+' | 'Refurbished';
  minThreshold: number;
  requestPending?: boolean;
}

const TechnicianDashboard: React.FC = () => {
  // 1. AUTHENTICATION STATE
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isAuthorizing, setIsAuthorizing] = useState(false);

  // 2. DATA STATE
  const [activeTab, setActiveTab] = useState<'Requests' | 'Workbench' | 'History' | 'Inventory'>('Requests');
  const [selectedWorkbenchJobId, setSelectedWorkbenchJobId] = useState<string | null>(null);
  const [isFinalizing, setIsFinalizing] = useState<string | null>(null); // Job ID currently being signed
  const [pendingConfirmation, setPendingConfirmation] = useState<{ job: RepairJob, result: 'Repair' | 'EOL' } | null>(null);
  const [restockConfirm, setRestockConfirm] = useState<InventoryItem | null>(null);
  const [showRestockSuccess, setShowRestockSuccess] = useState(false);
  
  const [allJobs, setAllJobs] = useState<RepairJob[]>([
    { 
      id: 'ASSET-2026-001', 
      device: 'ThinkPad X1 Carbon Gen 9', 
      issue: 'Intermittent Power Failure / Logic Board Shorts', 
      dist: '0.4 km', 
      date: '12m ago', 
      status: 'Pending', 
      assetClass: 'Government', 
      priority: 'High',
      currentStep: 0,
      notes: ['Initial inspection: Exterior chassis shows slight oxidation.', 'Battery terminals test positive for voltage but fail load test.'],
      partsToReplace: ['ThinkPad Battery 57Wh']
    },
    { 
      id: 'ASSET-2026-002', 
      device: 'Pixel 7 Pro', 
      issue: 'Broken Digitizer & Rapid Battery Drain', 
      dist: '2.1 km', 
      date: '1h ago', 
      status: 'Pending', 
      assetClass: 'Consumer', 
      priority: 'Standard',
      currentStep: 0,
      notes: [],
      partsToReplace: []
    },
    { 
      id: 'ASSET-2026-003', 
      device: 'Cisco Catalyst Switch', 
      issue: 'Firmware Corruption & Fan Failure', 
      dist: '1.2 km', 
      date: '2h ago', 
      status: 'Pending', 
      assetClass: 'Enterprise', 
      priority: 'High',
      currentStep: 0,
      notes: [],
      partsToReplace: []
    },
  ]);

  const [inventory, setInventory] = useState<InventoryItem[]>([
    { part: 'LPDDR5 RAM 16GB', count: 14, grade: 'A+', minThreshold: 5 },
    { part: 'OLED Controller IC', count: 2, grade: 'Refurbished', minThreshold: 4 },
    { part: 'ThinkPad Battery 57Wh', count: 3, grade: 'A+', minThreshold: 5 },
    { part: 'USB-C Charging Port', count: 22, grade: 'A+', minThreshold: 10 },
    { part: 'M.2 NVMe SSD 512GB', count: 1, grade: 'Refurbished', minThreshold: 3 },
  ]);

  const [isSyncing, setIsSyncing] = useState(false);
  const [showSchematics, setShowSchematics] = useState(false);
  const [newNote, setNewNote] = useState('');

  // 3. DERIVED DATA
  const requests = useMemo(() => allJobs.filter(j => j.status === 'Pending'), [allJobs]);
  const workbench = useMemo(() => allJobs.filter(j => j.status === 'Ongoing'), [allJobs]);
  const history = useMemo(() => allJobs.filter(j => j.status.startsWith('Verified')), [allJobs]);
  const activeJob = useMemo(() => workbench.find(j => j.id === selectedWorkbenchJobId), [workbench, selectedWorkbenchJobId]);

  // 4. ACTION HANDLERS
  const handleAuth = () => {
    setIsAuthorizing(true);
    setTimeout(() => {
      setIsAuthorized(true);
      setIsAuthorizing(false);
    }, 1800);
  };

  const handleAcceptJob = (jobId: string) => {
    setAllJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: 'Ongoing' } : j));
    setSelectedWorkbenchJobId(jobId);
    setActiveTab('Workbench');
  };

  const handleNextStep = (jobId: string) => {
    setAllJobs(prev => prev.map(j => j.id === jobId ? { ...j, currentStep: j.currentStep + 1 } : j));
  };

  const addNoteToJob = (jobId: string) => {
    if (!newNote.trim()) return;
    setAllJobs(prev => prev.map(j => 
      j.id === jobId ? { ...j, notes: [...j.notes, newNote.trim()] } : j
    ));
    setNewNote('');
  };

  const togglePartForJob = (jobId: string, part: string) => {
    setAllJobs(prev => prev.map(j => {
      if (j.id === jobId) {
        const parts = j.partsToReplace.includes(part)
          ? j.partsToReplace.filter(p => p !== part)
          : [...j.partsToReplace, part];
        return { ...j, partsToReplace: parts };
      }
      return j;
    }));
  };

  const finalizeJob = (jobId: string, result: 'Repair' | 'EOL') => {
    setPendingConfirmation(null);
    setIsFinalizing(jobId);
    
    // Simulate "Signing Lifecycle Record"
    setTimeout(() => {
      const timestamp = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
      const hash = `0x${Math.random().toString(16).slice(2, 16)}${Math.random().toString(16).slice(2, 16)}`.toUpperCase();
      
      setAllJobs(prev => prev.map(j => 
        j.id === jobId ? { 
          ...j, 
          status: result === 'Repair' ? 'Verified-Repair' : 'Verified-EOL',
          completedAt: timestamp,
          txHash: hash,
          signerId: 'TECH-NODE-HYD-042'
        } : j
      ));
      setIsFinalizing(null);
      setSelectedWorkbenchJobId(null);
      setActiveTab('History');
    }, 2500);
  };

  const confirmRestock = () => {
    if (!restockConfirm) return;
    const partName = restockConfirm.part;
    setInventory(prev => prev.map(item => 
      item.part === partName ? { ...item, requestPending: true } : item
    ));
    setRestockConfirm(null);
    setShowRestockSuccess(true);
    setTimeout(() => setShowRestockSuccess(false), 3000);
  };

  const syncChain = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 2000);
  };

  // 5. AUTHENTICATION GATE
  if (!isAuthorized) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6 bg-slate-50">
        <div className="max-w-md w-full bg-white rounded-[3rem] p-12 shadow-2xl border border-slate-200 space-y-8 animate-in zoom-in-95 duration-500 text-center">
           <div className="relative inline-block mx-auto">
              <div className="w-24 h-24 bg-slate-900 rounded-[2rem] flex items-center justify-center shadow-2xl">
                 <svg className={`w-12 h-12 text-emerald-400 ${isAuthorizing ? 'animate-pulse' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8-8v4" />
                 </svg>
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 rounded-full border-4 border-white flex items-center justify-center text-white text-xs">
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
              </div>
           </div>
           
           <div className="space-y-2">
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Secure Login</h2>
              <p className="text-sm text-slate-500 font-medium">Verified Technician Biometric Authorization Required for Node Access.</p>
           </div>

           <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 font-mono text-[10px] text-slate-400 space-y-1 text-left">
              <p className="animate-pulse"> HANDSHAKE: REGIONAL_VAULT_TS09</p>
              <p className=""> IDENTITY: LEVEL_3_CERTIFIED</p>
              <p className=""> ENCRYPTION: SHA-256 ENABLED</p>
           </div>

           <button 
             onClick={handleAuth}
             disabled={isAuthorizing}
             className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-emerald-600 transition-all shadow-xl active:scale-95 disabled:opacity-50"
           >
             {isAuthorizing ? 'Processing Biometrics...' : 'Verify Technician'}
           </button>
        </div>
      </div>
    );
  }

  // 6. MAIN DASHBOARD
  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-700">
      
      {/* FINALIZATION OVERLAY */}
      {isFinalizing && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-900/90 backdrop-blur-xl animate-in fade-in">
           <div className="text-center space-y-6">
              <div className="w-24 h-24 bg-emerald-500 rounded-[2rem] mx-auto flex items-center justify-center shadow-2xl shadow-emerald-500/50">
                 <svg className="w-12 h-12 text-slate-900 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                 </svg>
              </div>
              <div className="space-y-2">
                 <h2 className="text-white text-3xl font-black tracking-tight">Signing Lifecycle Record</h2>
                 <p className="text-emerald-400 font-mono text-[10px] font-black uppercase tracking-[0.3em]">Generating Cryptographic Hash...</p>
              </div>
           </div>
        </div>
      )}

      {/* FINAL STATUS CONFIRMATION DIALOG */}
      {pendingConfirmation && (
        <div className="fixed inset-0 z-[1500] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
           <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 border border-slate-200">
              <div className={`p-8 pb-6 flex justify-between items-center ${pendingConfirmation.result === 'Repair' ? 'bg-emerald-50' : 'bg-amber-50'}`}>
                 <div className="space-y-1">
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Review Final Status</h3>
                    <p className={`text-[10px] font-black uppercase tracking-widest ${pendingConfirmation.result === 'Repair' ? 'text-emerald-600' : 'text-amber-600'}`}>
                       Target: {pendingConfirmation.result === 'Repair' ? 'VERIFIED-REPAIR' : 'VERIFIED-EOL'}
                    </p>
                 </div>
                 <button onClick={() => setPendingConfirmation(null)} className="p-2 bg-white/50 rounded-xl hover:bg-white text-slate-400 transition-colors">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                 </button>
              </div>

              <div className="p-8 space-y-6">
                 <div className="space-y-4">
                    <div className="flex justify-between items-start border-b border-slate-50 pb-4">
                       <div>
                          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Device Identity</p>
                          <p className="font-bold text-slate-900">{pendingConfirmation.job.device}</p>
                       </div>
                       <div className="text-right">
                          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Asset ID</p>
                          <p className="font-mono text-xs font-bold text-slate-500">{pendingConfirmation.job.id}</p>
                       </div>
                    </div>

                    <div className="space-y-2">
                       <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Reported Issue</p>
                       <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium text-slate-600 italic">
                          "{pendingConfirmation.job.issue}"
                       </div>
                    </div>

                    <div className="space-y-2">
                       <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Parts Consumed</p>
                       <div className="flex flex-wrap gap-2">
                          {pendingConfirmation.job.partsToReplace.length > 0 ? (
                             pendingConfirmation.job.partsToReplace.map((p, i) => (
                                <span key={i} className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-[9px] font-black uppercase text-slate-600">{p}</span>
                             ))
                          ) : (
                             <span className="text-xs text-slate-400 italic">No inventory modules used.</span>
                          )}
                       </div>
                    </div>
                 </div>

                 <div className="pt-4 grid grid-cols-2 gap-4">
                    <button 
                       onClick={() => setPendingConfirmation(null)}
                       className="py-4 border-2 border-slate-100 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all"
                    >
                       Back to Bench
                    </button>
                    <button 
                       onClick={() => finalizeJob(pendingConfirmation.job.id, pendingConfirmation.result)}
                       className={`py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-white shadow-xl transition-all active:scale-95 ${pendingConfirmation.result === 'Repair' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20' : 'bg-slate-900 hover:bg-slate-800 shadow-slate-900/20'}`}
                    >
                       Confirm & Sign
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* RESTOCK CONFIRMATION DIALOG */}
      {restockConfirm && (
        <div className="fixed inset-0 z-[1600] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in">
           <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-md p-10 space-y-8 animate-in zoom-in-95 border border-slate-200">
              <div className="text-center space-y-4">
                 <div className="w-16 h-16 bg-blue-100 rounded-2xl mx-auto flex items-center justify-center text-3xl">📦</div>
                 <h3 className="text-2xl font-black text-slate-900">Request Restock?</h3>
                 <p className="text-sm text-slate-500 font-medium">Are you sure you want to request a restock for <span className="text-slate-900 font-bold">{restockConfirm.part}</span> (Grade {restockConfirm.grade}) from the regional supply node?</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <button 
                   onClick={() => setRestockConfirm(null)}
                   className="py-4 border-2 border-slate-100 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all"
                 >
                   Cancel
                 </button>
                 <button 
                   onClick={confirmRestock}
                   className="py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl active:scale-95"
                 >
                   Confirm Request
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* PROFESSIONAL TECH HEADER */}
      <header className="grid lg:grid-cols-4 gap-6 items-end">
        <div className="lg:col-span-3">
          <div className="flex items-center gap-4 mb-3">
             <div className="bg-slate-900 text-emerald-400 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg">L3 Senior Tech</div>
             <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Technician Command Terminal</h1>
          </div>
          <div className="flex items-center gap-6 text-slate-500 font-bold text-sm">
            <p>ID: <span className="text-slate-900 font-mono">NODE-HYD-042</span></p>
            <p>Operator: <span className="text-slate-900 uppercase">A. Varma</span></p>
            <p className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Session: 03h 12m Active
            </p>
          </div>
        </div>
        <div className="flex gap-4">
           <button 
             onClick={() => setShowSchematics(true)}
             className="flex-grow py-4 bg-white border-2 border-slate-100 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
           >
             Schematic Library
           </button>
           <button 
             onClick={syncChain}
             disabled={isSyncing}
             className={`px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl ${isSyncing ? 'bg-emerald-600 text-white animate-pulse' : 'bg-slate-900 text-white hover:bg-emerald-600'}`}
           >
             {isSyncing ? 'Syncing...' : 'Verify Chain'}
           </button>
        </div>
      </header>

      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* SIDEBAR NAV */}
        <aside className="lg:col-span-3 space-y-6">
           <nav className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-4 space-y-2 shadow-sm">
              <SidebarButton active={activeTab === 'Requests'} label="Incoming Grid" icon="📥" count={requests.length} onClick={() => { setActiveTab('Requests'); setSelectedWorkbenchJobId(null); }} />
              <SidebarButton active={activeTab === 'Workbench'} label="Active Workbench" icon="🛠️" count={workbench.length} onClick={() => setActiveTab('Workbench')} />
              <SidebarButton active={activeTab === 'History'} label="Verified Tab" icon="✅" count={history.length} onClick={() => { setActiveTab('History'); setSelectedWorkbenchJobId(null); }} />
              <SidebarButton active={activeTab === 'Inventory'} label="Spare Inventory" icon="📦" onClick={() => { setActiveTab('Inventory'); setSelectedWorkbenchJobId(null); }} />
           </nav>

           <div className="bg-emerald-600 rounded-[2.5rem] p-8 text-white space-y-4 shadow-2xl shadow-emerald-600/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:rotate-12 transition-transform">
                <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L1 21h22L12 2zm0 3.99L19.53 19H4.47L12 5.99zM11 16h2v2h-2zm0-6h2v4h-2z"/></svg>
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">Weekly Quota</p>
              <p className="text-3xl font-black tracking-tighter">84% Efficiency</p>
              <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                 <div className="h-full bg-white w-[84%]"></div>
              </div>
              <p className="text-[10px] font-bold opacity-80 leading-relaxed">Target: Divert 150kg of toxic materials this week. You are at 126kg.</p>
           </div>
        </aside>

        {/* MAIN DISPLAY */}
        <main className="lg:col-span-9">
           
           {/* 1. INCOMING REQUESTS */}
           {activeTab === 'Requests' && (
             <div className="space-y-6 animate-in slide-in-from-right-4">
                <h2 className="text-2xl font-black text-slate-900 px-4">Regional Priority Allocation</h2>
                <div className="grid gap-4">
                   {requests.length === 0 ? (
                     <EmptyState message="No unallocated hardware detected in regional grid." />
                   ) : requests.map(req => (
                     <div key={req.id} className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-8 flex justify-between items-center group hover:border-emerald-500 transition-all shadow-sm">
                        <div className="space-y-4">
                           <div className="flex gap-2">
                             <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${req.assetClass === 'Government' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>{req.assetClass}</span>
                             {req.priority === 'High' && <span className="bg-red-50 text-red-600 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-red-100">Urgent</span>}
                           </div>
                           <div>
                              <h3 className="text-2xl font-black text-slate-900 tracking-tight">{req.device}</h3>
                              <div className="mt-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 max-w-xl">
                                 <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Citizen Reported Problem</p>
                                 <p className="text-sm font-bold text-slate-700 leading-relaxed italic">"{req.issue}"</p>
                              </div>
                           </div>
                        </div>
                        <div className="text-right space-y-4">
                           <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{req.dist} • {req.date}</p>
                           <button 
                             onClick={() => handleAcceptJob(req.id)}
                             className="px-10 py-5 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-emerald-600 active:scale-95 transition-all shadow-xl shadow-slate-900/10"
                           >
                              Initialize Workbench
                           </button>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
           )}

           {/* 2. ACTIVE WORKBENCH */}
           {activeTab === 'Workbench' && (
             <div className="space-y-6 animate-in slide-in-from-right-4">
                <div className="flex justify-between items-center px-4">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Active Hardware Bench</h2>
                  {selectedWorkbenchJobId && (
                    <button 
                      onClick={() => setSelectedWorkbenchJobId(null)}
                      className="text-xs font-black text-blue-600 uppercase tracking-widest hover:underline flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M15 19l-7-7 7-7" /></svg>
                      Back to Queue
                    </button>
                  )}
                </div>

                {!selectedWorkbenchJobId ? (
                  <div className="grid gap-4">
                    {workbench.length === 0 ? (
                      <EmptyState message="Bench clear. Ready for incoming allocation." />
                    ) : workbench.map(job => (
                      <div 
                        key={job.id} 
                        onClick={() => setSelectedWorkbenchJobId(job.id)}
                        className="bg-white border-2 border-slate-100 rounded-[2rem] p-8 flex justify-between items-center group hover:border-blue-500 hover:shadow-xl transition-all cursor-pointer"
                      >
                         <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-3xl group-hover:rotate-6 transition-transform">🛠️</div>
                            <div>
                               <p className="text-[10px] font-black uppercase text-blue-600 tracking-widest mb-1">In-Process Asset</p>
                               <h3 className="text-xl font-black text-slate-900">{job.device}</h3>
                               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono mt-1">{job.id} • Step {job.currentStep}/4</p>
                            </div>
                         </div>
                         <div className="flex items-center gap-4">
                            <div className="text-right">
                               <p className="text-xs font-black text-slate-900 uppercase">Priority: {job.priority}</p>
                               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active: {job.date}</p>
                            </div>
                            <svg className="w-6 h-6 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M9 5l7 7-7 7" /></svg>
                         </div>
                      </div>
                    ))}
                  </div>
                ) : activeJob && (
                  <div className="bg-slate-900 rounded-[3rem] p-10 text-white grid lg:grid-cols-2 gap-12 relative shadow-2xl overflow-hidden animate-in zoom-in-95">
                     <div className="space-y-8">
                        <div className="space-y-2">
                           <p className="text-[10px] font-black uppercase text-emerald-400 tracking-[0.3em]">Lifecycle Extraction Workbench</p>
                           <h3 className="text-4xl font-black tracking-tighter leading-tight">{activeJob.device}</h3>
                           <p className="text-xs font-bold opacity-40 font-mono tracking-widest">{activeJob.id}</p>
                        </div>

                        {/* REPAIR LOGIC GUIDE */}
                        <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem] space-y-6">
                           <div className="flex justify-between items-center">
                              <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-400">Stepwise Protocol</h4>
                              <span className="text-[9px] font-mono text-white/30">MODULE_V2.1</span>
                           </div>
                           
                           <div className="space-y-4">
                              <RepairStep active={activeJob.currentStep === 0} done={activeJob.currentStep > 0} text="Physical Inspection: Check for internal corrosion/swelling" />
                              <RepairStep active={activeJob.currentStep === 1} done={activeJob.currentStep > 1} text="V-Rail Continuity: Test 3.3V / 5.0V power gates" />
                              <RepairStep active={activeJob.currentStep === 2} done={activeJob.currentStep > 2} text="Component Replacement: Swap faulty modules from inventory" />
                              <RepairStep active={activeJob.currentStep === 3} done={activeJob.currentStep > 3} text="OS Re-flash: Secure boot and data wiping verification" />
                           </div>

                           <button 
                             onClick={() => handleNextStep(activeJob.id)}
                             disabled={activeJob.currentStep >= 4}
                             className={`w-full py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeJob.currentStep >= 4 ? 'bg-emerald-500 text-slate-900 shadow-xl' : 'bg-white/10 hover:bg-white/20 border border-white/10'}`}
                           >
                              {activeJob.currentStep >= 4 ? 'Verification Requirements Met' : 'Log Step Completion'}
                           </button>
                        </div>
                     </div>

                     <div className="space-y-6">
                        {/* PARTS & NOTES SECTION */}
                        <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem] space-y-8">
                           <div className="space-y-6">
                              <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                Log of Tech Observations
                              </h4>
                              
                              <div className="max-h-[160px] overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                                 {activeJob.notes.length === 0 ? (
                                   <p className="text-xs text-white/30 italic text-center py-4">Zero logs detected. Please initialize observation entry.</p>
                                 ) : activeJob.notes.map((n, i) => (
                                   <div key={i} className="text-[11px] p-4 bg-white/5 rounded-2xl border border-white/10 font-medium leading-relaxed group hover:bg-white/10 transition-all">
                                      <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest block mb-1">Tech Entry #{i+1}</span>
                                      {n}
                                   </div>
                                 ))}
                              </div>
                              <div className="flex gap-2">
                                 <input 
                                   type="text" 
                                   value={newNote}
                                   onChange={(e) => setNewNote(e.target.value)}
                                   placeholder="Transmit tech observation to registry..." 
                                   className="flex-grow bg-white/10 border border-white/10 rounded-xl p-4 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500 transition-all shadow-inner"
                                 />
                                 <button onClick={() => addNoteToJob(activeJob.id)} className="p-4 bg-emerald-500 text-slate-900 rounded-xl hover:bg-emerald-400 shadow-lg active:scale-95"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg></button>
                              </div>
                           </div>

                           {/* Parts Detailed Breakdown */}
                           <div className="space-y-4 pt-6 border-t border-white/10">
                              <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                Breakdown of Parts Used
                              </h4>
                              <div className="grid grid-cols-2 gap-2">
                                 {inventory.map((item, i) => (
                                   <button 
                                     key={i}
                                     onClick={() => togglePartForJob(activeJob.id, item.part)}
                                     className={`px-4 py-3 rounded-xl text-[9px] font-black transition-all border flex items-center justify-between group ${activeJob.partsToReplace.includes(item.part) ? 'bg-emerald-500 border-emerald-500 text-slate-900 shadow-lg' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'}`}
                                   >
                                      <span className="truncate pr-2">{item.part}</span>
                                      {activeJob.partsToReplace.includes(item.part) && <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                                   </button>
                                 ))}
                              </div>
                           </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                           <button 
                              onClick={() => setPendingConfirmation({ job: activeJob, result: 'Repair' })}
                              className="py-6 bg-emerald-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-emerald-500 shadow-xl shadow-emerald-600/20 active:scale-95 transition-all"
                           >
                              Confirm Repaired Status
                           </button>
                           <button 
                              onClick={() => setPendingConfirmation({ job: activeJob, result: 'EOL' })}
                              className="py-6 border-2 border-white/20 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-white/10 active:scale-95 transition-all"
                           >
                              Declare Unrepairable EOL
                           </button>
                        </div>
                     </div>
                  </div>
                )}
             </div>
           )}

           {/* 3. VERIFIED TAB (History) */}
           {activeTab === 'History' && (
             <div className="space-y-6 animate-in slide-in-from-right-4 pb-12">
                <div className="px-4 flex justify-between items-center">
                   <h2 className="text-2xl font-black text-slate-900 tracking-tight">Verified Lifecycle History</h2>
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Central Registry Synced</span>
                   </div>
                </div>
                
                <div className="grid gap-6">
                   {history.length === 0 ? (
                     <EmptyState message="No verified actions this shift." />
                   ) : history.map(job => (
                     <div key={job.id} className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-0 overflow-hidden hover:shadow-2xl transition-all border-l-[10px] border-l-emerald-500 group">
                        {/* Header Area */}
                        <div className="p-8 pb-4 flex justify-between items-start">
                           <div className="flex items-center gap-6">
                              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-xl border border-white/50 ${job.status === 'Verified-Repair' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                 {job.status === 'Verified-Repair' ? '✅' : '♻️'}
                              </div>
                              <div>
                                 <h4 className="text-2xl font-black text-slate-900 leading-tight">{job.device}</h4>
                                 <div className="flex items-center gap-3 mt-1">
                                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${job.status === 'Verified-Repair' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>
                                       {job.status.replace('Verified-', '')}
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Completed: {job.completedAt}</span>
                                 </div>
                              </div>
                           </div>
                           <div className="text-right">
                              <div className="inline-block px-4 py-1.5 bg-slate-900 text-emerald-400 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg">
                                 Official Record
                              </div>
                           </div>
                        </div>

                        {/* Transaction Block */}
                        <div className="mx-8 mb-8 p-6 bg-slate-50 border border-slate-200 rounded-[1.5rem] space-y-4">
                           <div className="flex justify-between items-end border-b border-slate-200 pb-3">
                              <div className="space-y-1">
                                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Regional Signing Node</p>
                                 <p className="text-xs font-black text-slate-800 uppercase tracking-widest">{job.signerId}</p>
                              </div>
                              <div className="text-right">
                                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Network</p>
                                 <p className="text-xs font-black text-emerald-600 uppercase tracking-widest">GL-MAINNET-2026</p>
                              </div>
                           </div>

                           <div className="space-y-2">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Cryptographic Transaction Hash</p>
                              <div className="flex items-center gap-3">
                                 <div className="flex-grow font-mono text-[10px] text-slate-500 bg-white p-3 rounded-xl border border-slate-100 break-all select-all shadow-inner">
                                    {job.txHash}
                                 </div>
                                 <button className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-emerald-500 transition-colors shadow-sm">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>
                                 </button>
                              </div>
                           </div>
                        </div>

                        {/* Actions Summary */}
                        <div className="px-8 pb-8 flex flex-wrap gap-2">
                           {job.partsToReplace.length > 0 ? job.partsToReplace.map((p, i) => (
                             <span key={i} className="px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-lg text-[9px] font-black uppercase text-blue-700">Replaced: {p}</span>
                           )) : (
                             <span className="px-3 py-1.5 bg-slate-100 rounded-lg text-[9px] font-black uppercase text-slate-400 italic">No Parts Required</span>
                           )}
                           <span className="px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-lg text-[9px] font-black uppercase text-emerald-700">Logic Diagnostic Pass</span>
                           <span className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[9px] font-black uppercase tracking-widest ml-auto cursor-pointer hover:bg-emerald-600 transition-colors">View PDF Certificate</span>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
           )}

           {/* 4. INVENTORY */}
           {activeTab === 'Inventory' && (
             <div className="space-y-6 animate-in slide-in-from-right-4">
               <div className="px-4 flex justify-between items-center">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Spare Component Ledger</h2>
                  <div className="flex items-center gap-3">
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Synced: 4m ago</span>
                  </div>
               </div>

               <div className="bg-white border border-slate-200 rounded-[3rem] overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                     <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
                           <tr>
                              <th className="px-8 py-6">Component Module</th>
                              <th className="px-8 py-6">Certified Grade</th>
                              <th className="px-8 py-6">Available Stock</th>
                              <th className="px-8 py-6">Status</th>
                              <th className="px-8 py-6 text-right">Action</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                           {inventory.map((item, idx) => {
                              const isLow = item.count <= item.minThreshold;
                              return (
                                 <tr key={idx} className="group hover:bg-slate-50/50 transition-colors">
                                    <td className="px-8 py-6">
                                       <div className="flex items-center gap-4">
                                          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-xl" aria-hidden="true">⚙️</div>
                                          <span className="font-bold text-slate-900">{item.part}</span>
                                       </div>
                                    </td>
                                    <td className="px-8 py-6">
                                       <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${item.grade === 'A+' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                                          Grade {item.grade}
                                       </span>
                                    </td>
                                    <td className="px-8 py-6">
                                       <span className={`text-lg font-black tracking-tighter ${isLow ? 'text-amber-600' : 'text-slate-900'}`}>{item.count} Units</span>
                                    </td>
                                    <td className="px-8 py-6">
                                       {isLow ? (
                                          <div className="flex items-center gap-2">
                                             <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                                             <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Low Stock Alert</span>
                                          </div>
                                       ) : (
                                          <div className="flex items-center gap-2">
                                             <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                             <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Optimal Supply</span>
                                          </div>
                                       )}
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                       {item.requestPending ? (
                                          <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-[9px] font-black uppercase tracking-widest border border-blue-100">
                                             <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                             Restock Pending
                                          </span>
                                       ) : isLow ? (
                                          <button 
                                             onClick={() => setRestockConfirm(item)}
                                             className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all bg-slate-900 text-white hover:bg-emerald-600 shadow-lg active:scale-95`}
                                          >
                                             Request Restock
                                          </button>
                                       ) : (
                                          <span className="text-[9px] font-black text-slate-300 uppercase italic">Stock Optimal</span>
                                       )}
                                    </td>
                                 </tr>
                              );
                           })}
                        </tbody>
                     </table>
                  </div>
               </div>

                <div className="bg-blue-600 p-8 rounded-[3rem] text-white flex items-center gap-8 relative overflow-hidden group shadow-2xl shadow-blue-600/20">
                   <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform">
                      <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L1 21h22L12 2zm0 3.99L19.53 19H4.47L12 5.99zM11 16h2v2h-2zm0-6h2v4h-2z"/></svg>
                   </div>
                   <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center text-3xl shrink-0" aria-hidden="true">♻️</div>
                   <div>
                      <h4 className="font-black uppercase text-[11px] tracking-widest mb-1">Circular Metric Dashboard</h4>
                      <p className="text-sm font-medium opacity-80 leading-relaxed">Your station has successfully salvaged <span className="text-emerald-300 font-black">42.1kg</span> of raw materials this month. Keep hardware alive to maintain high node rating and supply priority.</p>
                   </div>
                </div>
             </div>
           )}

        </main>
      </div>

      {/* SCHEMATICS MODAL */}
      {showSchematics && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-slate-900/90 backdrop-blur-md animate-in fade-in">
           <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl p-0 overflow-hidden relative border border-white/20">
              <div className="bg-slate-900 p-10 space-y-4">
                 <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-black text-white tracking-tight">Secure Blueprint Library</h3>
                    <button onClick={() => setShowSchematics(false)} className="text-white/40 hover:text-white transition-colors">
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                 </div>
                 <p className="text-xs text-white/50 font-medium">Accessing official device schematics for Level-3 Technicians.</p>
              </div>
              <div className="p-10 max-h-[400px] overflow-y-auto space-y-4 custom-scrollbar">
                 <SchematicItem name="ThinkPad X1 Gen 9 Mainboard" code="TP-X1-S9" />
                 <SchematicItem name="iPhone 13 Pro Logic Board" code="AP-13P-L" />
                 <SchematicItem name="Dell XPS 15 Battery Circuit" code="DL-XPS-B" />
                 <SchematicItem name="Cisco 2900 Series PSU" code="CS-PSU-2" />
              </div>
           </div>
        </div>
      )}

      {showRestockSuccess && (
        <div className="fixed bottom-10 right-10 z-[3000] animate-in slide-in-from-bottom-10">
           <div className="bg-emerald-600 text-white px-8 py-5 rounded-3xl shadow-2xl shadow-emerald-600/40 flex items-center gap-4 border-2 border-emerald-500">
              <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center text-xl">✅</div>
              <div>
                 <p className="font-black text-sm uppercase tracking-tight">Restock Dispatched</p>
                 <p className="text-[10px] font-bold opacity-80">Supply request transmitted to Regional Governance Dashboard.</p>
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

const SidebarButton: React.FC<{ active: boolean, label: string, icon: string, count?: number, onClick: () => void }> = ({ active, label, icon, count, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center justify-between p-5 rounded-2xl transition-all duration-300 ${active ? 'bg-slate-900 text-white shadow-2xl translate-x-2' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600 group'}`}
  >
    <div className="flex items-center gap-4">
       <span className={`text-xl transition-transform ${active ? 'scale-125' : 'group-hover:scale-110'}`}>{icon}</span>
       <span className="text-[11px] font-black uppercase tracking-[0.2em]">{label}</span>
    </div>
    {count !== undefined && count > 0 && (
      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black ${active ? 'bg-emerald-500 text-slate-900 shadow-lg' : 'bg-slate-100 text-slate-400'}`}>
        {count}
      </span>
    )}
  </button>
);

const RepairStep: React.FC<{ active: boolean, done: boolean, text: string }> = ({ active, done, text }) => (
  <div className={`flex items-center gap-4 transition-all duration-500 ${done ? 'opacity-40' : active ? 'opacity-100' : 'opacity-20'}`}>
     <div className={`w-6 h-6 rounded-full border-4 flex items-center justify-center z-10 shrink-0 transition-all duration-500 ${done ? 'bg-emerald-500 border-white shadow-lg shadow-emerald-500/20' : active ? 'bg-blue-500 border-white shadow-lg shadow-blue-500/20' : 'bg-white border-slate-100'}`}>
        {done && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
     </div>
     <span className={`text-xs font-bold leading-tight ${active ? 'text-white' : 'text-white/60'}`}>{text}</span>
  </div>
);

const SchematicItem: React.FC<{ name: string, code: string }> = ({ name, code }) => (
  <div className="flex items-center justify-between p-6 bg-slate-50 border border-slate-100 rounded-[2rem] hover:bg-white hover:shadow-xl transition-all cursor-pointer group">
    <div className="flex items-center gap-4">
      <span className="text-2xl group-hover:rotate-12 transition-transform">📄</span>
      <div>
        <h4 className="font-black text-slate-900">{name}</h4>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{code} • CAD.DOCK.ZIP</p>
      </div>
    </div>
    <button className="px-6 py-2 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-600 transition-colors">Open</button>
  </div>
);

const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem] p-20 text-center space-y-4">
     <div className="text-4xl">🛰️</div>
     <p className="text-slate-400 font-black uppercase tracking-[0.2em]">{message}</p>
  </div>
);

export default TechnicianDashboard;
