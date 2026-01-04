
import React, { useState, useMemo, useEffect } from 'react';

interface MaterialStock {
  id: string;
  name: string;
  weight: number;
  unit: 'g' | 'kg';
  marketValue: string;
  trend: 'up' | 'down';
  capacity: number; // Max storage capacity for percentage calculations
}

interface ProcessingBatch {
  id: string;
  origin: string;
  type: string;
  weight: string;
  weightNum: number; // For calculations
  progress: number;
  status: 'Inbound' | 'Disassembly' | 'Material-Recovery' | 'Final-Audit';
  toxins: string[];
  isProcessing?: boolean;
  logs: string[];
}

interface InboundShipment {
  id: string;
  node: string;
  cat: string;
  weight: string;
  weightNum: number;
}

interface Telemetry {
  temp: number;
  pressure: number;
  o2: number;
  purity: number;
}

const RecyclerDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Processing' | 'Warehouse' | 'Logistics' | 'Compliance'>('Processing');
  const [isExporting, setIsExporting] = useState(false);
  const [showSuccess, setShowSuccess] = useState<{title: string, msg: string} | null>(null);
  const [auditTarget, setAuditTarget] = useState<ProcessingBatch | null>(null);

  // 1. LIVE TELEMETRY STATE
  const [telemetry, setTelemetry] = useState<Telemetry>({ temp: 42, pressure: 1.2, o2: 21.4, purity: 98.2 });

  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry(prev => ({
        temp: +(prev.temp + (Math.random() * 2 - 1)).toFixed(1),
        pressure: +(prev.pressure + (Math.random() * 0.1 - 0.05)).toFixed(2),
        o2: +(prev.o2 + (Math.random() * 0.4 - 0.2)).toFixed(1),
        purity: +(98.2 + (Math.random() * 0.5 - 0.25)).toFixed(1)
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // 2. DATA STATE
  const [batches, setBatches] = useState<ProcessingBatch[]>([
    { id: 'BATCH-HYD-102', origin: 'Miyapur Node', type: 'Lithium-Ion Mix', weight: '420kg', weightNum: 420, progress: 65, status: 'Disassembly', toxins: ['Cobalt', 'Lithium'], logs: ['Batch arrived', 'Initial weighing complete', 'Sorting initialized'] },
    { id: 'BATCH-BNG-404', origin: 'Gachibowli Node', type: 'Mixed Logic Boards', weight: '85kg', weightNum: 85, progress: 90, status: 'Material-Recovery', toxins: ['Lead', 'Mercury'], logs: ['Batch arrived', 'Shredding complete', 'Chemical leaching active'] },
  ]);

  const [materials, setMaterials] = useState<MaterialStock[]>([
    { id: 'mat-1', name: 'Rare Earth Elements', weight: 4.2, unit: 'g', marketValue: '₹14,200', trend: 'up', capacity: 10 },
    { id: 'mat-2', name: 'Gold (99%)', weight: 128.5, unit: 'g', marketValue: '₹842,000', trend: 'up', capacity: 500 },
    { id: 'mat-3', name: 'Copper', weight: 42.1, unit: 'kg', marketValue: '₹35,800', trend: 'down', capacity: 200 },
    { id: 'mat-4', name: 'Aluminium', weight: 890, unit: 'kg', marketValue: '₹182,500', trend: 'up', capacity: 2000 },
  ]);

  const [inbound, setInbound] = useState<InboundShipment[]>([
    { id: 'SHIP-9912', node: 'NODE-HYD-042', cat: 'EOL Consumer Mix', weight: '182kg', weightNum: 182 },
    { id: 'SHIP-8821', node: 'NODE-BNG-012', cat: 'Industrial PCBs', weight: '42kg', weightNum: 42 },
    { id: 'SHIP-7710', node: 'NODE-CHE-005', cat: 'Server Components', weight: '1.2 Tons', weightNum: 1200 },
  ]);

  // 3. ACTIONS
  const handleAcceptLoad = (shipmentId: string) => {
    const shipment = inbound.find(s => s.id === shipmentId);
    if (!shipment) return;

    const newBatch: ProcessingBatch = {
      id: shipment.id.replace('SHIP', 'BATCH'),
      origin: shipment.node,
      type: shipment.cat,
      weight: shipment.weight,
      weightNum: shipment.weightNum,
      progress: 0,
      status: 'Inbound',
      toxins: shipment.cat.includes('Consumer') ? ['Lead', 'Cadmium'] : ['Solder Flux', 'Barium'],
      logs: [`Shipment accepted: ${new Date().toLocaleTimeString()}`]
    };

    setBatches([newBatch, ...batches]);
    setInbound(inbound.filter(s => s.id !== shipmentId));
    setActiveTab('Processing');
  };

  const advanceProgress = (batchId: string) => {
    setBatches(prev => prev.map(b => b.id === batchId ? { ...b, isProcessing: true } : b));

    setTimeout(() => {
      setBatches(prev => prev.map(b => {
        if (b.id !== batchId) return b;
        const newProgress = Math.min(b.progress + 20, 100);
        let newStatus = b.status;
        const newLogs = [...b.logs];
        
        if (newProgress > 0 && newProgress < 50) {
          newStatus = 'Disassembly';
          newLogs.push('Physical disassembly node active');
        } else if (newProgress >= 50 && newProgress < 100) {
          newStatus = 'Material-Recovery';
          newLogs.push('Chemical leaching sequence initialized');
        } else if (newProgress === 100) {
          newStatus = 'Final-Audit';
          newLogs.push('Recovery sequence finalized. Ready for audit.');
        }

        return { ...b, progress: newProgress, status: newStatus, isProcessing: false, logs: newLogs };
      }));
    }, 1200);
  };

  const handleAuditMaterials = (batch: ProcessingBatch) => {
    setAuditTarget(batch);
  };

  const finalizeAudit = () => {
    if (!auditTarget) return;

    const isTech = auditTarget.type.toLowerCase().includes('pcb') || auditTarget.type.toLowerCase().includes('board');
    
    setMaterials(prev => prev.map(m => {
      if (m.name.includes('Rare Earth') && isTech) return { ...m, weight: m.weight + (auditTarget.weightNum * 0.01) };
      if (m.name.includes('Gold') && isTech) return { ...m, weight: m.weight + (auditTarget.weightNum * 0.05) };
      if (m.name.includes('Copper')) return { ...m, weight: m.weight + (auditTarget.weightNum * 0.15) };
      if (m.name.includes('Aluminium')) return { ...m, weight: m.weight + (auditTarget.weightNum * 0.4) };
      return m;
    }));

    setBatches(batches.filter(b => b.id !== auditTarget.id));
    setAuditTarget(null);
    setShowSuccess({
      title: "Audit Finalized",
      msg: `All secondary raw materials from ${auditTarget.id} have been stocked.`
    });
    setTimeout(() => setShowSuccess(null), 3000);
  };

  const handleCommoditySale = () => {
    setIsExporting(true);
    setTimeout(() => {
      setMaterials(prev => prev.map(m => ({
        ...m,
        weight: m.weight * 0.5 
      })));
      setIsExporting(false);
      setShowSuccess({
        title: "Market Export Complete",
        msg: "Commodity load successfully transferred to authorized foundry."
      });
      setTimeout(() => setShowSuccess(null), 4000);
    }, 2500);
  };

  const handleExportCert = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      setShowSuccess({
        title: "Policy Audit Submitted",
        msg: "Digital compliance certificate generated and synced with ministry."
      });
      setTimeout(() => setShowSuccess(null), 3000);
    }, 2000);
  };

  const utilizationPercent = useMemo(() => {
    const totalWeight = materials.reduce((acc, m) => acc + (m.unit === 'kg' ? m.weight : m.weight / 1000), 0);
    const totalCapacity = materials.reduce((acc, m) => acc + (m.unit === 'kg' ? m.capacity : m.capacity / 1000), 0);
    return Math.round((totalWeight / totalCapacity) * 100);
  }, [materials]);

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-700">
      
      {/* INDUSTRIAL HEADER */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 border-b border-slate-200 pb-10">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
             <div className="w-16 h-16 bg-slate-900 rounded-[1.5rem] flex items-center justify-center text-emerald-400 shadow-2xl">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
             </div>
             <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">Material Recovery Unit</h1>
                <div className="flex items-center gap-3 mt-1">
                   <span className="bg-emerald-100 text-emerald-700 text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest border border-emerald-200">Certified Hazardous Waste Handler</span>
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Facility ID: RECY-TS-HYD-012</span>
                </div>
             </div>
          </div>
        </div>

        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 w-full lg:w-auto">
          <button onClick={() => setActiveTab('Processing')} className={`flex-grow lg:flex-none px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'Processing' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}>Current Batches</button>
          <button onClick={() => setActiveTab('Warehouse')} className={`flex-grow lg:flex-none px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'Warehouse' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}>Commodity Stock</button>
          <button onClick={() => setActiveTab('Logistics')} className={`flex-grow lg:flex-none px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'Logistics' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}>Inbound Chain</button>
          <button onClick={() => setActiveTab('Compliance')} className={`flex-grow lg:flex-none px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'Compliance' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}>Compliance</button>
        </div>
      </header>

      {/* TOP METRICS GRID */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <MetricCard label="Toxins Neutralized" value="1.8 Tons" sub="Lead, Mercury, Cadmium" icon="🛡️" color="bg-slate-900" />
         <MetricCard label="Extraction Efficiency" value="94.2%" sub="+2.1% from last month" icon="⚙️" color="bg-emerald-600" />
         <MetricCard label="Secondary Raw Value" value="₹2.4M" sub="Recovered Market Value" icon="💎" color="bg-blue-600" />
         <MetricCard label="Safety Score" value="A+" sub="Zero Incidents in 180 Days" icon="✨" color="bg-amber-600" />
      </section>

      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* MAIN WORK AREA */}
        <div className="lg:col-span-8 space-y-6">
           {activeTab === 'Processing' && (
             <div className="space-y-6 animate-in slide-in-from-bottom-4">
                <div className="flex justify-between items-center px-4">
                   <h2 className="text-2xl font-black text-slate-900 tracking-tight">Active Disassembly Pipeline</h2>
                </div>
                
                <div className="grid gap-6">
                   {batches.length === 0 ? (
                     <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem] p-20 text-center">
                       <p className="text-slate-400 font-black uppercase tracking-widest">Pipeline Idle. Requesting inbound logs...</p>
                     </div>
                   ) : batches.map(batch => (
                     <div key={batch.id} className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-8 space-y-6 hover:border-emerald-500 transition-all group shadow-sm overflow-hidden relative">
                        {batch.isProcessing && (
                          <div className="absolute inset-x-0 top-0 h-1 bg-emerald-500 animate-progress"></div>
                        )}
                        <div className="flex justify-between items-start">
                           <div className="space-y-1">
                              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Process Tracking ID</p>
                              <h3 className="text-2xl font-black text-slate-900">{batch.id}</h3>
                              <p className="text-xs font-bold text-slate-500">{batch.origin} • {batch.type}</p>
                           </div>
                           <div className="text-right">
                              <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm ${batch.status === 'Final-Audit' ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-emerald-400'}`}>
                                 {batch.status.replace('-', ' ')}
                              </div>
                           </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6">
                           <div className="md:col-span-2 space-y-6">
                              <div className="space-y-3">
                                 <div className="flex justify-between items-end">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Machine Cycle Progress ({batch.progress}%)</span>
                                    <span className="text-xs font-black text-slate-900">{batch.weight} Load</span>
                                 </div>
                                 <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200 p-0.5">
                                    <div 
                                       className={`h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-1000 ${batch.isProcessing ? 'animate-pulse' : ''}`}
                                       style={{ width: `${batch.progress}%` }}
                                    ></div>
                                 </div>
                              </div>

                              <div className="flex flex-wrap gap-2 items-center">
                                 {batch.toxins.map((t, i) => (
                                   <span key={i} className="px-3 py-1 bg-red-50 text-red-700 rounded-lg text-[9px] font-black uppercase tracking-widest border border-red-100">
                                     ⚠ Toxic Extraction: {t}
                                   </span>
                                 ))}
                              </div>
                           </div>

                           <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 h-[120px] overflow-y-auto custom-scrollbar">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-100 pb-1">Activity Log</p>
                              {batch.logs.slice().reverse().map((log, i) => (
                                <p key={i} className="text-[10px] font-bold text-slate-600 mb-1 leading-tight border-l-2 border-emerald-500 pl-2">{log}</p>
                              ))}
                           </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-50">
                            {batch.progress < 100 ? (
                              <button 
                                onClick={() => advanceProgress(batch.id)}
                                disabled={batch.isProcessing}
                                className={`px-8 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center gap-2 shadow-xl ${batch.isProcessing ? 'opacity-50' : ''}`}
                              >
                                 {batch.isProcessing && <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                                 {batch.isProcessing ? 'Running Machine Cycle...' : 'Execute Recovery Step'}
                              </button>
                            ) : (
                              <button 
                                onClick={() => handleAuditMaterials(batch)}
                                className="px-8 py-3 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl animate-pulse"
                              >
                                 Final Audit & Stock-In
                              </button>
                            )}
                        </div>
                     </div>
                   ))}
                </div>
             </div>
           )}

           {activeTab === 'Warehouse' && (
             <div className="bg-white border-2 border-slate-100 rounded-[3rem] p-10 space-y-10 animate-in slide-in-from-bottom-4 shadow-sm">
                <div className="flex justify-between items-center">
                   <h2 className="text-2xl font-black text-slate-900 tracking-tight">Recovered Commodity Stock</h2>
                   <button 
                     onClick={handleCommoditySale}
                     disabled={isExporting}
                     className="px-6 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg"
                   >
                     {isExporting ? 'Initiating Market Sale...' : 'Bulk Foundry Export'}
                   </button>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                   {materials.map((mat, i) => (
                     <div key={i} className="bg-slate-50 border border-slate-100 p-8 rounded-[2.5rem] flex justify-between items-center group hover:bg-white hover:border-blue-500 transition-all">
                        <div className="space-y-1">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{mat.name}</p>
                           <h4 className="text-3xl font-black text-slate-900 tracking-tighter">{mat.weight.toFixed(2)}{mat.unit}</h4>
                           <div className="flex items-center gap-1">
                              <span className={`text-[10px] font-black uppercase ${mat.trend === 'up' ? 'text-emerald-600' : 'text-red-500'}`}>
                                 {mat.trend === 'up' ? '▲' : '▼'} {mat.marketValue}
                              </span>
                              <span className="text-[9px] text-slate-400 font-bold">Valuation</span>
                           </div>
                        </div>
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-xl shadow-lg group-hover:rotate-12 transition-transform">
                           {mat.name.includes('Gold') ? '🏆' : mat.name.includes('Earth') ? '🔬' : '🏭'}
                        </div>
                     </div>
                   ))}
                </div>

                <div className="bg-blue-600 p-10 rounded-[3rem] text-white flex items-center gap-8 relative overflow-hidden group shadow-2xl shadow-blue-600/20">
                   <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:rotate-12 transition-transform">
                      <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L1 21h22L12 2zm0 3.99L19.53 19H4.47L12 5.99zM11 16h2v2h-2zm0-6h2v4h-2z"/></svg>
                   </div>
                   <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center text-4xl shrink-0">📊</div>
                   <div>
                      <h4 className="font-black uppercase text-xs tracking-[0.2em] mb-2">Secondary Raw Materials Act</h4>
                      <p className="text-sm font-medium opacity-80 leading-relaxed max-w-xl">These materials are certified for direct re-entry into the manufacturing supply chain. Each gram is blockchain-traced from citizen handover to foundry delivery.</p>
                   </div>
                </div>
             </div>
           )}

           {activeTab === 'Compliance' && (
             <div className="space-y-6 animate-in slide-in-from-bottom-4">
                <div className="bg-white border-2 border-slate-100 rounded-[3rem] p-10 space-y-8 shadow-sm">
                   <div className="flex justify-between items-center border-b border-slate-50 pb-6">
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight">Facility Compliance Protocol</h2>
                      <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl uppercase tracking-widest border border-emerald-100">Live Environmental Monitoring</span>
                   </div>

                   <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                         <ComplianceToggle label="Air Quality: Particulate Filtration Active" active={true} />
                         <ComplianceToggle label="Hazardous Waste Containment Check" active={true} />
                         <ComplianceToggle label="Operator PPE Verification" active={true} />
                         <ComplianceToggle label="Mercury Vapor Scrubbing Sync" active={false} warning />
                      </div>
                      <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
                         <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl"></div>
                         <h4 className="text-[10px] font-black uppercase text-emerald-400 tracking-widest mb-6">Current Emission Delta</h4>
                         <div className="flex items-center justify-center h-24">
                            <span className="text-6xl font-black tracking-tighter">0.02</span>
                            <span className="text-xs font-bold text-emerald-400 ml-2 uppercase">mg/m³</span>
                         </div>
                         <p className="text-center text-[10px] font-bold opacity-40 uppercase tracking-widest mt-4">Safe Limit: 0.10 mg/m³</p>
                      </div>
                   </div>

                   <div className="pt-6 border-t border-slate-50 flex justify-end">
                      <button 
                         onClick={handleExportCert}
                         disabled={isExporting}
                         className={`px-10 py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-2xl active:scale-95 flex items-center gap-3 ${isExporting ? 'opacity-50' : ''}`}
                      >
                         {isExporting ? (
                           <svg className="animate-spin h-4 w-4 text-emerald-400" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                         ) : <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
                         {isExporting ? 'Bundling Compliance Data...' : 'Submit Certified Audit Report'}
                      </button>
                   </div>
                </div>
             </div>
           )}

           {activeTab === 'Logistics' && (
             <div className="space-y-6 animate-in slide-in-from-bottom-4">
                <div className="px-4 flex justify-between items-center">
                   <h2 className="text-2xl font-black text-slate-900 tracking-tight">Inbound Logistics Chain</h2>
                   <div className="flex gap-2">
                      <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-xl">
                         <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                         <span className="text-[10px] font-black text-blue-700 uppercase tracking-widest">{inbound.length} Node Shipments Pending</span>
                      </div>
                   </div>
                </div>

                <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm">
                   <table className="w-full text-left">
                      <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] border-b border-slate-100">
                         <tr>
                            <th className="px-8 py-6">Shipment ID</th>
                            <th className="px-8 py-6">Origin Node</th>
                            <th className="px-8 py-6">Load Category</th>
                            <th className="px-8 py-6">Est. Weight</th>
                            <th className="px-8 py-6 text-right">Action</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                         {inbound.length === 0 ? (
                           <tr>
                             <td colSpan={5} className="px-8 py-12 text-center text-slate-400 font-bold uppercase tracking-widest italic">
                               Logistics chain clear. No pending regional hub transfers.
                             </td>
                           </tr>
                         ) : inbound.map(shipment => (
                            <LogisticsRow 
                               key={shipment.id} 
                               id={shipment.id} 
                               node={shipment.node} 
                               cat={shipment.cat} 
                               weight={shipment.weight} 
                               onAccept={() => handleAcceptLoad(shipment.id)}
                            />
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>
           )}
        </div>

        {/* SIDEBAR - INDUSTRIAL TELEMETRY */}
        <aside className="lg:col-span-4 space-y-6">
           <div className="bg-slate-900 border-2 border-slate-800 rounded-[2.5rem] p-8 space-y-8 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform">
                 <svg className="w-32 h-32 text-emerald-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L1 21h22L12 2zm0 3.99L19.53 19H4.47L12 5.99zM11 16h2v2h-2zm0-6h2v4h-2z"/></svg>
              </div>

              <div className="flex justify-between items-center">
                 <h3 className="text-xl font-black text-white tracking-tight">Live Telemetry</h3>
                 <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div> Sensor Feed
                 </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                 <TelemetryItem label="Temp" value={telemetry.temp} unit="°C" active={telemetry.temp < 50} />
                 <TelemetryItem label="Pressure" value={telemetry.pressure} unit="atm" active={true} />
                 <TelemetryItem label="Purity" value={telemetry.purity} unit="%" active={true} />
                 <TelemetryItem label="O2 Level" value={telemetry.o2} unit="%" active={true} />
              </div>

              <div className="pt-6 border-t border-white/10 space-y-6">
                 <div className="flex justify-between items-center">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Material Balances</h4>
                 </div>
                 <div className="space-y-4">
                    {materials.map(m => (
                      <BalanceProgress 
                        key={m.id} 
                        label={m.name} 
                        percent={Math.min(Math.round((m.weight / m.capacity) * 100), 100)} 
                        color={m.name.includes('Gold') ? 'bg-amber-400' : m.name.includes('Copper') ? 'bg-orange-500' : 'bg-blue-600'} 
                        amount={`${m.weight.toFixed(1)}${m.unit}`} 
                      />
                    ))}
                 </div>
              </div>

              <div className="pt-4 space-y-4">
                 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
                   Current facility capacity utilization is at <span className="text-white font-black">{utilizationPercent}%</span>. Outbound logs suggest market transfer.
                 </p>
                 <button 
                  onClick={handleCommoditySale}
                  className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl font-black text-[10px] uppercase tracking-widest text-white hover:bg-white hover:text-slate-900 transition-all shadow-sm">
                    Initiate Commodity Sale
                 </button>
              </div>
           </div>

           <div className="bg-emerald-600 p-8 rounded-[2.5rem] text-white space-y-4 shadow-2xl shadow-emerald-600/20 group">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl group-hover:rotate-12 transition-transform">🌍</div>
                 <div>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Climate Contribution</p>
                    <p className="text-xl font-black">4.8T CO₂ Prevented</p>
                 </div>
              </div>
              <p className="text-xs font-medium opacity-80 leading-relaxed">Your recycling efforts this month are equivalent to planting <span className="text-white font-black underline underline-offset-4">124 mature trees</span> in the regional urban belt.</p>
           </div>
        </aside>
      </div>

      {/* AUDIT MODAL */}
      {auditTarget && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-slate-900/90 backdrop-blur-md animate-in fade-in">
           <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-xl p-0 overflow-hidden relative border border-white/20 animate-in zoom-in-95">
              <div className="bg-slate-900 p-10 space-y-4">
                 <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-black text-white tracking-tight">Material Yield Audit</h3>
                    <button onClick={() => setAuditTarget(null)} className="text-white/40 hover:text-white transition-colors">
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                 </div>
                 <p className="text-xs text-white/50 font-medium uppercase tracking-widest text-center">Final recovery verification for {auditTarget.id}</p>
              </div>
              <div className="p-10 space-y-8">
                 <div className="grid grid-cols-2 gap-6">
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Input Weight</p>
                       <p className="text-2xl font-black text-slate-900">{auditTarget.weight}</p>
                    </div>
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-right">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Complexity Grade</p>
                       <p className="text-2xl font-black text-emerald-600">A+</p>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Yield Estimates (Formalized Extraction)</p>
                    <div className="space-y-3">
                       {auditTarget.type.toLowerCase().includes('pcb') || auditTarget.type.toLowerCase().includes('board') ? (
                          <>
                            <AuditEstimator label="Gold (99.9% Purity)" amount={`~${(auditTarget.weightNum * 0.05).toFixed(1)}g`} color="bg-amber-400" />
                            <AuditEstimator label="Rare Earth Elements" amount={`~${(auditTarget.weightNum * 0.01).toFixed(1)}g`} color="bg-blue-400" />
                          </>
                       ) : (
                          <AuditEstimator label="Refined Plastics" amount={`~${(auditTarget.weightNum * 0.6).toFixed(1)}kg`} color="bg-cyan-400" />
                       )}
                       <AuditEstimator label="Copper Module" amount={`~${(auditTarget.weightNum * 0.15).toFixed(1)}kg`} color="bg-orange-500" />
                       <AuditEstimator label="Aluminium Extrusions" amount={`~${(auditTarget.weightNum * 0.4).toFixed(1)}kg`} color="bg-slate-400" />
                    </div>
                 </div>

                 <button 
                   onClick={finalizeAudit}
                   className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl active:scale-95"
                 >
                    Confirm Yield & Stock In
                 </button>
              </div>
           </div>
        </div>
      )}

      {showSuccess && (
        <div className="fixed bottom-10 right-10 z-[3000] animate-in slide-in-from-right-10">
           <div className="bg-emerald-600 text-white px-8 py-5 rounded-3xl shadow-2xl shadow-emerald-600/40 flex items-center gap-4 border-2 border-emerald-500">
              <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center text-xl shadow-lg">✅</div>
              <div>
                 <p className="font-black text-sm uppercase tracking-tight">{showSuccess.title}</p>
                 <p className="text-[10px] font-bold opacity-80">{showSuccess.msg}</p>
              </div>
           </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
        
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

const TelemetryItem: React.FC<{ label: string, value: number, unit: string, active: boolean }> = ({ label, value, unit, active }) => (
  <div className={`p-4 rounded-xl border transition-all ${active ? 'bg-white/5 border-white/10' : 'bg-red-500/10 border-red-500/20'}`}>
     <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest mb-1">{label}</p>
     <div className="flex items-baseline gap-1">
        <span className={`text-lg font-black tracking-tight ${active ? 'text-white' : 'text-red-400'}`}>{value}</span>
        <span className="text-[8px] font-bold text-slate-500 uppercase">{unit}</span>
     </div>
  </div>
);

const AuditEstimator: React.FC<{ label: string, amount: string, color: string }> = ({ label, amount, color }) => (
  <div className="flex justify-between items-center p-4 bg-slate-50 border border-slate-100 rounded-xl">
     <div className="flex items-center gap-3">
        <div className={`w-3 h-3 rounded-full ${color}`}></div>
        <span className="text-xs font-bold text-slate-700">{label}</span>
     </div>
     <span className="text-xs font-black text-slate-900">{amount}</span>
  </div>
);

const MetricCard: React.FC<{ label: string, value: string, sub: string, icon: string, color: string }> = ({ label, value, sub, icon, color }) => (
  <div className={`${color} p-8 rounded-[2.5rem] text-white space-y-4 shadow-xl hover:-translate-y-2 transition-transform cursor-default group`}>
    <div className="flex justify-between items-start">
       <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-2xl group-hover:rotate-12 transition-transform">{icon}</div>
       <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40">{label}</p>
    </div>
    <div>
       <h4 className="text-4xl font-black tracking-tighter">{value}</h4>
       <p className="text-[10px] font-black uppercase tracking-widest opacity-50 mt-1">{sub}</p>
    </div>
  </div>
);

const ComplianceToggle: React.FC<{ label: string, active: boolean, warning?: boolean }> = ({ label, active, warning }) => (
  <div className="flex items-center justify-between p-5 bg-slate-50 border border-slate-100 rounded-2xl group hover:bg-white hover:border-slate-200 transition-all cursor-default">
     <div className="flex items-center gap-4">
        <div className={`w-3 h-3 rounded-full ${active ? 'bg-emerald-500' : warning ? 'bg-red-500 animate-pulse' : 'bg-slate-300'}`}></div>
        <span className="text-xs font-black text-slate-700 tracking-tight">{label}</span>
     </div>
     <div className={`w-10 h-6 rounded-full p-1 transition-all ${active ? 'bg-emerald-600' : 'bg-slate-300'}`}>
        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${active ? 'translate-x-4' : 'translate-x-0'}`}></div>
     </div>
  </div>
);

const LogisticsRow: React.FC<{ id: string, node: string, cat: string, weight: string, onAccept: () => void }> = ({ id, node, cat, weight, onAccept }) => (
  <tr className="group hover:bg-slate-50/50 transition-colors">
     <td className="px-8 py-6 font-mono font-bold text-slate-900 text-sm">{id}</td>
     <td className="px-8 py-6">
        <div className="flex flex-col">
           <span className="font-bold text-slate-800">{node}</span>
           <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Verified Dispatch</span>
        </div>
     </td>
     <td className="px-8 py-6 text-xs font-black text-slate-600 uppercase tracking-widest">{cat}</td>
     <td className="px-8 py-6 font-black text-slate-900">{weight}</td>
     <td className="px-8 py-6 text-right">
        <button 
           onClick={onAccept}
           className="px-6 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg active:scale-95"
        >
           Accept Load
        </button>
     </td>
  </tr>
);

const BalanceProgress: React.FC<{ label: string, percent: number, color: string, amount: string }> = ({ label, percent, color, amount }) => (
  <div className="space-y-2">
     <div className="flex justify-between items-end">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
        <span className="text-[10px] font-black text-slate-100">{amount}</span>
     </div>
     <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/10">
        <div className={`h-full ${color} transition-all duration-1000`} style={{ width: `${percent}%` }}></div>
     </div>
  </div>
);

export default RecyclerDashboard;
