
import React, { useState, useEffect, useMemo } from 'react';

interface LeaderboardUser {
  id: string;
  name: string;
  points: number;
  impact: string;
  category: string;
  badges: string[];
  contributions: {
    laptops: number;
    phones: number;
    misc: number;
  };
  joinDate: string;
  lastAction: string;
  toxinsDiverted: string;
  regionalRank: number;
}

interface RestockRequest {
  id: string;
  node: string;
  item: string;
  currentStock: number;
  requestedQty: number;
  urgency: 'High' | 'Standard';
  status: 'Pending' | 'Verifying' | 'Approved' | 'Dispatched';
  requestDate: string;
  auditLog: string[];
}

interface NodeStatus {
  id: string;
  name: string;
  status: 'Online' | 'Offline' | 'Warning';
  utilization: number;
  lastSync: string;
}

type MetricType = 'IMPACT' | 'NODES' | 'REWARDS' | 'CARBON';
type SortKey = 'points' | 'impact' | 'regionalRank';

const NGODashboard: React.FC = () => {
  const [activeView, setActiveView] = useState<'ANALYTICS' | 'LOGISTICS' | 'HEROES' | 'REGISTRY'>('ANALYTICS');
  const [showExportModal, setShowExportModal] = useState(false);
  const [activeMetricDetail, setActiveMetricDetail] = useState<MetricType | null>(null);
  const [selectedHero, setSelectedHero] = useState<LeaderboardUser | null>(null);
  const [isRefreshingIndex, setIsRefreshingIndex] = useState(false);
  const [verifyingRequestId, setVerifyingRequestId] = useState<string | null>(null);
  const [isGeneratingFile, setIsGeneratingFile] = useState(false);

  // Sorting State
  const [sortKey, setSortKey] = useState<SortKey>('points');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // DATA STATE
  const [chartData, setChartData] = useState([45, 62, 58, 88, 72, 95, 82, 64, 89, 75, 68, 92]);
  
  const [nodes] = useState<NodeStatus[]>([
    { id: 'NODE-HYD-042', name: 'Hyderabad Central', status: 'Online', utilization: 84, lastSync: '2m ago' },
    { id: 'NODE-BNG-012', name: 'Bangalore East', status: 'Online', utilization: 76, lastSync: '5m ago' },
    { id: 'NODE-CHE-005', name: 'Chennai Hub', status: 'Warning', utilization: 92, lastSync: '1m ago' },
    { id: 'NODE-DEL-099', name: 'Delhi North', status: 'Online', utilization: 64, lastSync: '12m ago' },
  ]);

  const [restockRequests, setRestockRequests] = useState<RestockRequest[]>([
    { id: 'REQ-401', node: 'NODE-HYD-042', item: 'OLED Controller IC', currentStock: 2, requestedQty: 50, urgency: 'High', status: 'Pending', requestDate: '2h ago', auditLog: ['Request Logged by Tech A. Varma'] },
    { id: 'REQ-402', node: 'NODE-BNG-012', item: 'M.2 NVMe SSD 512GB', currentStock: 1, requestedQty: 25, urgency: 'High', status: 'Pending', requestDate: '3h ago', auditLog: ['Request Logged by Auto-Replenish System'] },
    { id: 'REQ-403', node: 'NODE-CHE-005', item: 'ThinkPad Battery 57Wh', currentStock: 4, requestedQty: 100, urgency: 'Standard', status: 'Pending', requestDate: '5h ago', auditLog: ['Request Logged by Site Manager'] },
  ]);

  const leaderboardRaw: LeaderboardUser[] = [
    { id: '1', name: 'Arjun Mehta', points: 14200, impact: '142.5kg', category: 'Platinum Hero', badges: ['Trailblazer', 'Recycling Pro'], contributions: { laptops: 12, phones: 45, misc: 8 }, joinDate: 'Jan 2024', lastAction: '2h ago', toxinsDiverted: '0.82kg', regionalRank: 1 },
    { id: '2', name: 'Priya Sharma', points: 12800, impact: '118.2kg', category: 'Platinum Hero', badges: ['Eco-Warrior'], contributions: { laptops: 9, phones: 38, misc: 4 }, joinDate: 'Mar 2024', lastAction: '4h ago', toxinsDiverted: '0.64kg', regionalRank: 2 },
    { id: '3', name: 'Kiran Deep', points: 9500, impact: '92.4kg', category: 'Gold Guardian', badges: ['Quick Responder'], contributions: { laptops: 5, phones: 22, misc: 12 }, joinDate: 'Feb 2024', lastAction: '1w ago', toxinsDiverted: '0.45kg', regionalRank: 3 },
  ];

  const sortedLeaderboard = useMemo(() => {
    const data = [...leaderboardRaw];
    data.sort((a, b) => {
      let valA: number, valB: number;

      if (sortKey === 'points') {
        valA = a.points;
        valB = b.points;
      } else if (sortKey === 'regionalRank') {
        valA = a.regionalRank;
        valB = b.regionalRank;
      } else {
        valA = parseFloat(a.impact.replace(/[^0-9.]/g, ''));
        valB = parseFloat(b.impact.replace(/[^0-9.]/g, ''));
      }

      return sortDirection === 'asc' ? valA - valB : valB - valA;
    });
    return data;
  }, [sortKey, sortDirection]);

  const handleRefreshIndex = () => {
    setIsRefreshingIndex(true);
    setTimeout(() => {
      setChartData(chartData.map(() => Math.floor(Math.random() * 50) + 45));
      setIsRefreshingIndex(false);
    }, 1500);
  };

  const handleVerifyRequest = (id: string) => {
    setVerifyingRequestId(id);
    setRestockRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'Verifying', auditLog: [...r.auditLog, 'Commencing Regional Audit...'] } : r));
    
    setTimeout(() => {
      setRestockRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'Approved', auditLog: [...r.auditLog, 'Registry Match Confirmed', 'Authorized by NGO Central Command'] } : r));
      setVerifyingRequestId(null);
      
      setTimeout(() => {
        setRestockRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'Dispatched', auditLog: [...r.auditLog, 'Fleet GL-102 Dispatched', 'ETD: 45mins'] } : r));
      }, 3000);
    }, 2500);
  };

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('desc');
    }
  };

  const downloadAuditReport = () => {
    setIsGeneratingFile(true);
    
    setTimeout(() => {
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
      const timeStr = now.toLocaleTimeString('en-IN');
      
      let content = `==================================================\n`;
      content += `GREENLINK NATIONAL CIRCULAR ECONOMY AUDIT REPORT\n`;
      content += `==================================================\n`;
      content += `Generation Date: ${dateStr}\n`;
      content += `Generation Time: ${timeStr}\n`;
      content += `Authority: NGO Central Command Node\n`;
      content += `Security Level: CLASS-A AUDIT\n\n`;

      content += `1. NATIONAL IMPACT SUMMARY\n`;
      content += `--------------------------\n`;
      content += `Total Traceable Recovery: 142.5 Tons\n`;
      content += `Carbon Offset Generated: 68.2 Tons CO2e\n`;
      content += `Active Grid Nodes: ${nodes.length}\n`;
      content += `Reward Tokens Minted: 4.8 Million Credits\n\n`;

      content += `2. TOP PERFORMING CITIZEN HEROES\n`;
      content += `--------------------------------\n`;
      sortedLeaderboard.forEach((hero, i) => {
        content += `${i + 1}. ${hero.name.toUpperCase()}\n`;
        content += `   XP Points: ${hero.points}\n`;
        content += `   Material Impact: ${hero.impact}\n`;
        content += `   Toxins Diverted: ${hero.toxinsDiverted}\n`;
        content += `   Category: ${hero.category}\n\n`;
      });

      content += `3. LOGISTICS & SUPPLY CHAIN LOGS\n`;
      content += `--------------------------------\n`;
      restockRequests.forEach((req) => {
        content += `ID: ${req.id} | Node: ${req.node}\n`;
        content += `Item: ${req.item} | Status: ${req.status}\n`;
        content += `Qty Requested: ${req.requestedQty} | Urgency: ${req.urgency}\n`;
        content += `Audit Log: ${req.auditLog.join(' -> ')}\n\n`;
      });

      content += `\n*** End of Authorized Record ***\n`;

      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `GreenLink_Audit_${now.toISOString().split('T')[0]}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setIsGeneratingFile(false);
      setShowExportModal(false);
    }, 2000);
  };

  const getMetricData = (type: MetricType) => {
    switch (type) {
      case 'IMPACT': return { title: 'Impact Calculation', calc: 'Σ (Recycled_Mass + Refurbished_Mass)', source: 'National Circular Ledger', formula: 'Impact = M_r + M_f', details: 'Diverted from 18.4k citizen handovers.' };
      case 'NODES': return { title: 'Node Analytics', calc: 'Active L3 Hubs + Certified Recyclers', source: 'Registry v4.2', formula: 'Nodes = count(Active_Licenses)', details: 'Spanning 42 regional administrative sectors.' };
      case 'REWARDS': return { title: 'Rewards Registry', calc: 'Minted Credits - Redeemed Credits', source: 'GreenBond Treasury', formula: 'Pool = Treasury_Balance', details: 'Backed by sustainability assets.' };
      case 'CARBON': return { title: 'CO2e Methodology', calc: 'Avoided virgin mining footprint (LCA)', source: 'EPA Emission Factors v4.2', formula: 'CO2e = Σ (Mass_i * Factor_i)', details: 'Conservative estimates based on IRP standards.' };
    }
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col xl:flex-row xl:items-end justify-between border-b border-slate-200 pb-10 gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-slate-900 rounded-[1.5rem] flex items-center justify-center text-emerald-400 shadow-2xl group cursor-pointer overflow-hidden relative">
               <div className="absolute inset-0 bg-emerald-500/10 scale-0 group-hover:scale-100 transition-transform duration-500 rounded-full"></div>
               <svg className="w-8 h-8 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2-2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            </div>
            <div>
              <div className="flex items-center gap-3">
                 <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none uppercase italic">NGO Governance Terminal</h1>
                 <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-200">Admin-Master</span>
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                 Ecosystem Integrity: 99.8% • Regional Feed Live
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            <TabBtn active={activeView === 'ANALYTICS'} onClick={() => setActiveView('ANALYTICS')}>Global Analytics</TabBtn>
            <TabBtn active={activeView === 'LOGISTICS'} onClick={() => setActiveView('LOGISTICS')}>
              Logistics
              {restockRequests.length > 0 && <span className="ml-2 bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-black animate-pulse">{restockRequests.length}</span>}
            </TabBtn>
            <TabBtn active={activeView === 'HEROES'} onClick={() => setActiveView('HEROES')}>Heroes</TabBtn>
            <TabBtn active={activeView === 'REGISTRY'} onClick={() => setActiveView('REGISTRY')}>Node Registry</TabBtn>
          </div>
          <button onClick={() => setShowExportModal(true)} className="bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-2xl active:scale-95 flex items-center gap-3">
             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
             Generate Audit
          </button>
        </div>
      </header>

      {/* EXPORT MODAL */}
      {showExportModal && (
        <div className="fixed inset-0 z-[2500] flex items-center justify-center p-6 bg-slate-900/90 backdrop-blur-xl animate-in fade-in">
           <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 border border-white/20">
              <div className="bg-slate-900 p-10 text-white relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                    <svg className="w-40 h-40" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L1 21h22L12 2zm0 3.99L19.53 19H4.47L12 5.99zM11 16h2v2h-2zm0-6h2v4h-2z"/></svg>
                 </div>
                 <h2 className="text-3xl font-black tracking-tight leading-none uppercase italic">Audit Compilation</h2>
                 <p className="text-emerald-400 font-black text-[10px] uppercase tracking-[0.3em] mt-2">Requesting Data Bundle: {new Date().toISOString().split('T')[0]}</p>
                 <button 
                  onClick={() => setShowExportModal(false)} 
                  className="absolute top-10 right-10 p-2 hover:bg-white/10 rounded-xl transition-all"
                 >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                 </button>
              </div>
              <div className="p-10 space-y-8 text-center">
                 <div className="space-y-4">
                    <p className="text-sm font-medium text-slate-500 leading-relaxed max-w-sm mx-auto">
                       The system is ready to compile the <strong>National Circular Economy</strong> report including citizen impact and logistic logs.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Records Found</p>
                          <p className="text-xl font-black text-slate-900">{sortedLeaderboard.length + restockRequests.length}</p>
                       </div>
                       <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Audit Format</p>
                          <p className="text-xl font-black text-blue-600">TEXT/LOG</p>
                       </div>
                    </div>
                 </div>

                 <button 
                    disabled={isGeneratingFile}
                    onClick={downloadAuditReport}
                    className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-emerald-600 transition-all shadow-2xl active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                 >
                    {isGeneratingFile ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-emerald-400" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        Compiling Log...
                      </>
                    ) : 'Initialize Export'}
                 </button>
              </div>
           </div>
        </div>
      )}

      {activeView === 'ANALYTICS' && (
        <div className="space-y-8 animate-in slide-in-from-bottom-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard onClick={() => setActiveMetricDetail('IMPACT')} label="National Impact" value="142.5T" sub="Traceable Recovery" color="bg-emerald-600" icon="🌍" />
            <StatCard onClick={() => setActiveMetricDetail('NODES')} label="Network Nodes" value="1,786" sub="Active Facilities" color="bg-blue-600" icon="🛰️" />
            <StatCard onClick={() => setActiveMetricDetail('REWARDS')} label="Reward Pool" value="4.8M" sub="Eco-Credits Circulating" color="bg-cyan-600" icon="💎" />
            <StatCard onClick={() => setActiveMetricDetail('CARBON')} label="Carbon Offset" value="68.2T" sub="CO₂ Equivalent" color="bg-slate-900" icon="☁️" />
          </div>

          <div className="grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 bg-white border border-slate-200 rounded-[3rem] p-10 shadow-sm space-y-10 relative overflow-hidden flex flex-col">
               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-50 pb-8 gap-4">
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none uppercase italic">Regional Performance Flux</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Recovery rate trends across all certified hubs</p>
                  </div>
                  <button onClick={handleRefreshIndex} disabled={isRefreshingIndex} className="flex items-center gap-3 px-5 py-2.5 bg-slate-50 rounded-2xl border border-slate-200 hover:bg-white transition-all group">
                    <span className={`w-2 h-2 rounded-full bg-emerald-500 ${isRefreshingIndex ? 'animate-ping' : ''}`}></span>
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{isRefreshingIndex ? 'Syncing...' : 'Live Sync Index'}</span>
                    <svg className={`w-4 h-4 text-slate-400 group-hover:rotate-180 transition-transform duration-500 ${isRefreshingIndex ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                  </button>
               </div>

               <div className="flex-grow h-72 flex items-end justify-between gap-4 px-4 pb-2">
                 {chartData.map((h, i) => (
                   <div key={i} className="flex-grow group relative flex flex-col items-center h-full justify-end">
                     <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-all bg-slate-900 text-white text-[9px] font-black px-3 py-2 rounded-xl whitespace-nowrap z-50 shadow-2xl scale-90 group-hover:scale-100 origin-bottom">
                       {h}% Capacity Efficiency
                     </div>
                     <div className="bg-slate-50 w-full min-w-[14px] h-full rounded-2xl overflow-hidden flex flex-col justify-end border border-slate-100 group-hover:border-emerald-300 transition-all shadow-inner">
                        <div 
                          className="bg-gradient-to-t from-emerald-600 via-emerald-500 to-emerald-400 transition-all duration-[1500ms] ease-out group-hover:brightness-110 shadow-[0_-4px_15px_rgba(16,185,129,0.3)]" 
                          style={{ height: `${h}%` }}
                        ></div>
                     </div>
                     <p className="mt-5 text-[10px] font-black text-slate-300 uppercase tracking-widest">W-{i+1}</p>
                   </div>
                 ))}
               </div>
               
               <div className="grid grid-cols-3 gap-6 pt-8 border-t border-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <div className="flex items-center gap-3"><div className="w-3 h-3 bg-emerald-500 rounded-sm"></div><span>Formal Extraction</span></div>
                  <div className="flex items-center gap-3"><div className="w-3 h-3 bg-blue-500 rounded-sm"></div><span>Circular Re-entry</span></div>
                  <div className="flex items-center gap-3"><div className="w-3 h-3 bg-slate-200 rounded-sm"></div><span>Idle Buffer</span></div>
               </div>
            </div>

            <div className="lg:col-span-4 space-y-6">
               <div className="bg-slate-900 rounded-[3rem] p-10 text-white space-y-8 shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:rotate-12 transition-transform">
                     <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L1 21h22L12 2zm0 3.99L19.53 19H4.47L12 5.99zM11 16h2v2h-2zm0-6h2v4h-2z"/></svg>
                  </div>
                  <div className="space-y-1 relative z-10">
                     <p className="text-[10px] font-black uppercase text-emerald-400 tracking-[0.3em]">Resource Efficiency</p>
                     <h4 className="text-3xl font-black tracking-tighter">Circular Index: 0.94</h4>
                  </div>
                  <div className="space-y-6 relative z-10">
                     <MiniMetric label="Rare Earth Elements" value="1.2T" percent={12} color="bg-blue-400" />
                     <MiniMetric label="Refined Plastics" value="84.2T" percent={65} color="bg-emerald-400" />
                     <MiniMetric label="Precious Metals" value="0.8T" percent={8} color="bg-amber-400" />
                  </div>
                  <div className="pt-6 border-t border-white/10">
                     <p className="text-[10px] font-bold text-white/40 leading-relaxed italic">
                        "Ecosystem extraction rates are currently exceeding Q1 targets by 4.2% based on verified recycler telemetry."
                     </p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}

      {activeView === 'LOGISTICS' && (
        <section className="bg-white border border-slate-200 rounded-[3rem] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4">
           <div className="p-12 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
             <div className="space-y-2">
                <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-none italic uppercase">Dispatch Control Console</h3>
                <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">Multi-Step Verification Protocol for Site Replenishment</p>
             </div>
             <div className="flex gap-4 items-center">
                <div className="px-5 py-2.5 bg-slate-900 rounded-2xl text-emerald-400 font-mono text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                   Central Ledger Connection: Stable
                </div>
             </div>
           </div>
           
           <div className="p-10 space-y-6">
              {restockRequests.map((req) => (
                <div key={req.id} className="flex flex-col lg:flex-row lg:items-center gap-8 p-10 bg-slate-50 border border-slate-200 rounded-[2.5rem] hover:bg-white hover:border-emerald-500 transition-all group relative overflow-hidden">
                   {req.status === 'Verifying' && <div className="absolute inset-x-0 bottom-0 h-1.5 bg-blue-500 animate-progress"></div>}
                   
                   <div className="lg:w-1/4 space-y-2">
                      <div className="flex items-center gap-3">
                         <span className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-lg border-2 border-white ${req.status === 'Dispatched' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-900'}`}>
                            {req.status === 'Dispatched' ? '🚛' : '📦'}
                         </span>
                         <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Node</p>
                            <p className="font-black text-slate-900 uppercase tracking-tight font-mono">{req.node}</p>
                         </div>
                      </div>
                   </div>

                   <div className="lg:w-1/3 space-y-1">
                      <h4 className="text-xl font-black text-slate-900 tracking-tight">{req.item}</h4>
                      <div className="flex flex-wrap gap-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                         <span className="text-slate-900">Qty: {req.requestedQty}</span>
                         <span>•</span>
                         <span className={req.urgency === 'High' ? 'text-red-500' : 'text-blue-500'}>{req.urgency} Priority</span>
                         <span>•</span>
                         <span>{req.requestDate}</span>
                      </div>
                   </div>

                   <div className="lg:w-1/4 p-4 bg-white/50 rounded-2xl border border-slate-200/50 space-y-1.5">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Verification Audit Trail</p>
                      <div className="space-y-1 max-h-12 overflow-y-auto custom-scrollbar">
                         {req.auditLog.map((log, i) => (
                           <p key={i} className="text-[9px] font-bold text-slate-600 flex items-center gap-2">
                             <span className="w-1 h-1 rounded-full bg-emerald-500 shrink-0"></span>
                             {log}
                           </p>
                         ))}
                      </div>
                   </div>

                   <div className="lg:w-1/6 flex justify-end">
                      {req.status === 'Pending' && (
                        <button onClick={() => handleVerifyRequest(req.id)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 shadow-xl transition-all">Verify & Approve</button>
                      )}
                      {req.status === 'Verifying' && (
                        <div className="w-full py-4 bg-blue-50 text-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 border border-blue-200">
                           <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                           Auditing Hub
                        </div>
                      )}
                      {req.status === 'Approved' && (
                        <div className="w-full py-4 bg-emerald-50 text-emerald-600 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 border border-emerald-200 shadow-lg shadow-emerald-500/10">
                           <svg className="w-4 h-4 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                           Approved
                        </div>
                      )}
                      {req.status === 'Dispatched' && (
                        <div className="w-full py-4 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl">
                           <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>
                           Dispatched
                        </div>
                      )}
                   </div>
                </div>
              ))}
           </div>
        </section>
      )}

      {activeView === 'HEROES' && (
        <section className="bg-white border border-slate-200 rounded-[3rem] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4">
           <div className="p-12 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
             <div className="space-y-2">
                <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-none italic uppercase">Community Impact Heroes</h3>
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Traceable citizen rankings based on material diversion weight</p>
             </div>
             <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
               <SortBtn active={sortKey === 'points'} onClick={() => toggleSort('points')}>Points {sortKey === 'points' && (sortDirection === 'asc' ? '▲' : '▼')}</SortBtn>
               <SortBtn active={sortKey === 'impact'} onClick={() => toggleSort('impact')}>Impact {sortKey === 'impact' && (sortDirection === 'asc' ? '▲' : '▼')}</SortBtn>
               <SortBtn active={sortKey === 'regionalRank'} onClick={() => toggleSort('regionalRank')}>Rank {sortKey === 'regionalRank' && (sortDirection === 'asc' ? '▲' : '▼')}</SortBtn>
             </div>
           </div>
           
           <div className="p-10 grid gap-6">
              {sortedLeaderboard.map((user, idx) => (
                <div key={user.id} onClick={() => setSelectedHero(user)} className="flex items-center gap-8 p-8 bg-slate-50 border border-slate-100 rounded-[2.5rem] hover:bg-white hover:border-emerald-400 transition-all group cursor-pointer relative overflow-hidden">
                   <div className={`w-16 h-16 flex items-center justify-center font-black rounded-2xl text-2xl shadow-xl border-4 border-white transition-transform group-hover:rotate-6 ${user.regionalRank === 1 ? 'bg-amber-400 text-white shadow-amber-500/20' : user.regionalRank === 2 ? 'bg-slate-300 text-white' : 'bg-orange-400 text-white'}`}>{user.regionalRank}</div>
                   <div className="flex-grow">
                      <div className="flex items-center gap-3">
                         <h4 className="font-black text-slate-900 text-2xl tracking-tight group-hover:text-emerald-600 transition-colors">{user.name}</h4>
                         <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[8px] font-black uppercase tracking-widest">Verified</span>
                      </div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">{user.category}</p>
                   </div>
                   <div className="text-right space-y-1">
                      <p className="text-3xl font-black text-emerald-600 tracking-tighter leading-none">{user.impact}</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{user.points.toLocaleString()} XP Points</p>
                   </div>
                   <div className="pl-6 opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg className="w-8 h-8 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                   </div>
                </div>
              ))}
           </div>
        </section>
      )}

      {activeView === 'REGISTRY' && (
        <section className="bg-white border border-slate-200 rounded-[3rem] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4">
           <div className="p-12 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
             <div className="space-y-2">
                <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-none italic uppercase">Active Node Monitoring</h3>
                <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">Real-time status of regional technician hubs and recycling units</p>
             </div>
             <button className="px-10 py-4 border-2 border-slate-200 rounded-2xl font-black text-[11px] uppercase tracking-widest text-slate-900 hover:bg-slate-50 transition-all shadow-sm active:scale-95">Audit All Nodes</button>
           </div>
           
           <div className="p-10 grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {nodes.map(node => (
                <div key={node.id} className="p-8 bg-slate-50 border border-slate-200 rounded-[2.5rem] space-y-6 hover:shadow-2xl hover:bg-white transition-all group">
                   <div className="flex justify-between items-start">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-xl shadow-md border border-slate-100 group-hover:rotate-12 transition-transform">🛰️</div>
                      <span className={`px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-widest ${node.status === 'Online' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{node.status}</span>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">{node.id}</p>
                      <h4 className="font-black text-slate-900 text-lg leading-tight">{node.name}</h4>
                   </div>
                   <div className="space-y-2 pt-4 border-t border-slate-200">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                         <span className="text-slate-400">Load Factor</span>
                         <span className="text-slate-900">{node.utilization}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                         <div className={`h-full ${node.utilization > 85 ? 'bg-amber-500' : 'bg-blue-600'}`} style={{ width: `${node.utilization}%` }}></div>
                      </div>
                      <p className="text-[9px] font-bold text-slate-400 text-right italic uppercase tracking-widest mt-1">Last Sync: {node.lastSync}</p>
                   </div>
                </div>
              ))}
           </div>
        </section>
      )}

      {selectedHero && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6 bg-slate-900/80 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="absolute inset-0 cursor-pointer" onClick={() => setSelectedHero(null)}></div>
           <div className="bg-white rounded-[2.5rem] sm:rounded-[3rem] shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden animate-in zoom-in-95 border border-white/20 relative flex flex-col">
              
              <div className="bg-slate-900 p-8 sm:p-10 text-white relative shrink-0">
                 <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                   <svg className="w-32 h-32 sm:w-40 sm:h-40" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L1 21h22L12 2zm0 3.99L19.53 19H4.47L12 5.99zM11 16h2v2h-2zm0-6h2v4h-2z"/></svg>
                 </div>
                 <div className="flex justify-between items-center relative z-10">
                   <div className="flex items-center gap-6">
                     <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-500 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl font-black shadow-xl border-2 border-white/20 uppercase shrink-0">
                       {selectedHero.name[0]}
                     </div>
                     <div className="space-y-1">
                        <div className="flex items-center gap-3">
                           <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-none italic uppercase">{selectedHero.name}</h2>
                           <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={5} d="M5 13l4 4L19 7" /></svg>
                           </div>
                        </div>
                        <p className="text-[10px] font-black uppercase text-emerald-400 tracking-[0.3em]">{selectedHero.category}</p>
                     </div>
                   </div>
                   <button 
                    onClick={() => setSelectedHero(null)} 
                    className="p-3 bg-white/10 rounded-xl text-white hover:bg-white/20 transition-all border border-white/10 flex items-center justify-center"
                   >
                     <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                   </button>
                 </div>
              </div>

              <div className="p-8 sm:p-10 space-y-8 overflow-y-auto custom-scrollbar flex-grow">
                 <div className="grid grid-cols-3 gap-3 sm:gap-6 text-center bg-slate-50 p-6 rounded-3xl border border-slate-100 shadow-inner">
                    <HeroImpact label="CO2 Prevented" value={`${(parseInt(selectedHero.impact) * 0.8).toFixed(1)}kg`} color="text-blue-600" />
                    <HeroImpact label="Toxins Blocked" value={selectedHero.toxinsDiverted} color="text-emerald-600" />
                    <HeroImpact label="Regional Rank" value={`#${selectedHero.regionalRank}`} color="text-slate-900" />
                 </div>

                 <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] border-b border-slate-100 pb-3 flex items-center gap-2">
                       <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                       Asset Contribution Summary
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       <HeroStatRow label="Computing Units" value={selectedHero.contributions.laptops} icon="💻" />
                       <HeroStatRow label="Mobile Devices" value={selectedHero.contributions.phones} icon="📱" />
                       <HeroStatRow label="Total Net Mass" value={selectedHero.impact} icon="⚖️" />
                       <HeroStatRow label="Member Since" value={selectedHero.joinDate} icon="🗓️" />
                    </div>
                 </div>

                 <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] border-b border-slate-100 pb-3 flex items-center gap-2">
                       <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                       Verified Credentials
                    </h4>
                    <div className="flex flex-wrap gap-2">
                       {selectedHero.badges.map((badge, i) => (
                         <span key={i} className="px-4 py-2 bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-widest rounded-xl border border-blue-100">
                           {badge}
                         </span>
                       ))}
                       <span className="px-4 py-2 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-xl border border-blue-100">
                         Identity Verified
                       </span>
                    </div>
                 </div>

                 <div className="h-4"></div>
              </div>

              <div className="p-8 sm:p-10 bg-white border-t border-slate-100 shrink-0">
                 <div className="flex flex-col sm:flex-row gap-4">
                    <button className="flex-grow py-4 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-emerald-600 transition-all shadow-xl active:scale-95">Endorse Impact Certificate</button>
                    <button className="sm:w-1/3 py-4 border-2 border-slate-100 text-slate-900 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-slate-50 transition-all">Full Audit Trace</button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {activeMetricDetail && (() => {
        const data = getMetricData(activeMetricDetail);
        return (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-xl animate-in fade-in">
             <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-xl p-0 overflow-hidden animate-in zoom-in-95 border border-white/20">
                <div className="bg-slate-900 p-10 flex justify-between items-center text-white">
                   <div className="space-y-1">
                      <h3 className="text-2xl font-black tracking-tight leading-none uppercase italic">{data.title}</h3>
                      <p className="text-[10px] font-black uppercase text-emerald-400 tracking-[0.3em]">Policy Verification Protocol</p>
                   </div>
                   <button onClick={() => setActiveMetricDetail(null)} className="p-2 bg-white/10 rounded-xl text-white/60 hover:text-white transition-colors">
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                   </button>
                </div>
                <div className="p-10 space-y-8">
                   <div className="space-y-2">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Calculation Methodology</p>
                      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 font-mono text-xs font-black text-blue-700 leading-relaxed">
                        {data.calc}
                      </div>
                   </div>
                   <div className="grid grid-cols-2 gap-8 border-y border-slate-50 py-8">
                      <div className="space-y-1.5">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Formal Logic</p>
                         <p className="text-sm font-black text-slate-900 italic font-mono">{data.formula}</p>
                      </div>
                      <div className="space-y-1.5 text-right">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Authority</p>
                         <p className="text-sm font-black text-slate-900">National Registry v4.2</p>
                      </div>
                   </div>
                   <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-2xl space-y-3">
                      <div className="flex items-center gap-3">
                         <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                         <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">Data Source Primary</p>
                      </div>
                      <p className="text-xs font-medium text-slate-700 leading-relaxed italic">"{data.details}"</p>
                      <p className="text-[9px] font-black text-emerald-600/60 uppercase tracking-widest">Verified via Blockchain Handshake • Live</p>
                   </div>
                   <button onClick={() => setActiveMetricDetail(null)} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-emerald-600 transition-all shadow-xl">Acknowledge Audit</button>
                </div>
             </div>
          </div>
        );
      })()}

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-progress {
          animation: progress 2s linear infinite;
        }
      `}} />
    </div>
  );
};

const TabBtn: React.FC<{ active: boolean, onClick: () => void, children: React.ReactNode }> = ({ active, onClick, children }) => (
  <button onClick={onClick} className={`px-8 py-3.5 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all flex items-center ${active ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}>
    {children}
  </button>
);

const SortBtn: React.FC<{ active: boolean, onClick: () => void, children: React.ReactNode }> = ({ active, onClick, children }) => (
  <button onClick={onClick} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${active ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
    {children}
  </button>
);

const StatCard: React.FC<{ label: string, value: string, sub: string, color: string, icon: string, onClick: () => void }> = ({ label, value, sub, color, icon, onClick }) => (
  <button onClick={onClick} className={`${color} p-8 rounded-[2.5rem] text-white text-left space-y-6 shadow-2xl hover:-translate-y-2 hover:brightness-110 active:scale-95 transition-all cursor-pointer overflow-hidden relative group w-full`}>
    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform text-4xl">{icon}</div>
    <div className="flex items-center gap-2">
      <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">{label}</p>
      <div className="w-1.5 h-1.5 rounded-full bg-white opacity-0 group-hover:opacity-100 animate-pulse"></div>
    </div>
    <div>
      <h4 className="text-5xl font-black tracking-tighter leading-none italic">{value}</h4>
      <p className="text-[11px] font-bold opacity-70 mt-3 uppercase tracking-widest">{sub}</p>
    </div>
  </button>
);

const MiniMetric: React.FC<{ label: string, value: string, percent: number, color: string }> = ({ label, value, percent, color }) => (
  <div className="space-y-2.5">
     <div className="flex justify-between items-end">
        <span className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">{label}</span>
        <span className="text-[11px] font-black text-white tracking-tighter">{value}</span>
     </div>
     <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div className={`h-full ${color} transition-all duration-[1.5s] ease-out shadow-[0_0_10px_rgba(255,255,255,0.2)]`} style={{ width: `${percent}%` }}></div>
     </div>
  </div>
);

const HeroImpact: React.FC<{ label: string, value: string, color: string }> = ({ label, value, color }) => (
  <div className="space-y-1">
     <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</p>
     <p className={`text-xl sm:text-2xl font-black tracking-tighter leading-none ${color}`}>{value}</p>
  </div>
);

const HeroStatRow: React.FC<{ label: string, value: number | string, icon: string }> = ({ label, value, icon }) => (
  <div className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-slate-100 hover:border-emerald-200 transition-colors shadow-sm">
     <div className="text-xl sm:text-2xl" aria-hidden="true">{icon}</div>
     <div className="flex-grow min-w-0">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">{label}</p>
        <p className="text-sm font-black text-slate-800 leading-tight truncate">{value}</p>
     </div>
  </div>
);

export default NGODashboard;
