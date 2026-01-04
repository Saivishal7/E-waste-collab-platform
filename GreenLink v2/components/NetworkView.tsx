
import React, { useState, useEffect, useMemo, useRef } from 'react';

// Extend Window interface for Leaflet global
declare const L: any;

interface Partner {
  id: string;
  name: string;
  type: 'TECHNICIAN' | 'RECYCLER';
  location: string;
  rating: number;
  activeJobs: number;
  status: string;
  license: string;
  specialties: string[];
  impact: string;
  distance?: number; 
  estArrival?: string;
  lat: number;
  lng: number;
}

interface NetworkViewProps {
  searchQuery?: string;
}

const NetworkView: React.FC<NetworkViewProps> = ({ searchQuery = '' }) => {
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'TECHNICIAN' | 'RECYCLER' | 'NEARBY'>('ALL');
  const [isScanning, setIsScanning] = useState(false);
  const [scanSector, setScanSector] = useState<string | null>(null);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [contactingPartner, setContactingPartner] = useState<Partner | null>(null);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [connectionSuccess, setConnectionSuccess] = useState<string | null>(null);
  const [userPos, setUserPos] = useState<[number, number] | null>(null);

  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<any[]>([]);

  // Realistic Hyderabad Coordinates including Moinabad area
  const [partners, setPartners] = useState<Partner[]>([
    { 
      id: '1', name: 'EcoFix Hub HITEC', type: 'TECHNICIAN', location: 'Madhapur, HYD', rating: 4.9, activeJobs: 124, status: 'Active',
      license: 'TS-EW-TECH-882', specialties: ['Laptop Logic Boards', 'Smartphone Recovery'], impact: '1.2 Tons',
      lat: 17.4483, lng: 78.3915
    },
    { 
      id: '2', name: 'Zenith Recycling Gachibowli', type: 'RECYCLER', location: 'Financial District, HYD', rating: 4.7, activeJobs: 842, status: 'Active',
      license: 'TS-EW-RECY-441', specialties: ['Lithium-Ion Neutralization', 'Gold Reclamation'], impact: '8.4 Tons',
      lat: 17.4170, lng: 78.3440
    },
    { 
      id: '3', name: 'SmartCare Labs Banjara', type: 'TECHNICIAN', location: 'Banjara Hills, HYD', rating: 4.8, activeJobs: 315, status: 'High Demand',
      license: 'TS-EW-TECH-109', specialties: ['Data Sanitization', 'Tablet Micro-soldering'], impact: '0.9 Tons',
      lat: 17.4123, lng: 78.4435
    },
    { 
      id: '4', name: 'GreenCycle Secunderabad', type: 'RECYCLER', location: 'Sikh Village, HYD', rating: 5.0, activeJobs: 1204, status: 'Active',
      license: 'TS-EW-RECY-001', specialties: ['Industrial E-Waste', 'Corporate Decommissioning'], impact: '42.5 Tons',
      lat: 17.4720, lng: 78.4850
    },
    { 
      id: '5', name: 'Precision Tech Jubilee', type: 'TECHNICIAN', location: 'Jubilee Hills, HYD', rating: 4.6, activeJobs: 95, status: 'Active',
      license: 'TS-EW-TECH-652', specialties: ['Audio Equipment', 'Home Appliances'], impact: '0.4 Tons',
      lat: 17.4300, lng: 78.4100
    },
    { 
      id: '6', name: 'Moinabad Precision Systems', type: 'TECHNICIAN', location: 'Near KG Reddy College, Moinabad', rating: 4.9, activeJobs: 42, status: 'Active',
      license: 'TS-EW-TECH-901', specialties: ['Industrial Controls', 'Agri-Tech Board Repair'], impact: '2.1 Tons',
      lat: 17.3414, lng: 78.2384
    },
    { 
      id: '7', name: 'Western Gateway Recovery', type: 'RECYCLER', location: 'Moinabad Sector, HYD', rating: 4.8, activeJobs: 156, status: 'Active',
      license: 'TS-EW-RECY-772', specialties: ['Battery Packs', 'Solar Inverter Recovery'], impact: '11.2 Tons',
      lat: 17.3450, lng: 78.2450
    },
  ]);

  // INITIALIZE MAP
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Leaflet map
    mapRef.current = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false
    }).setView([17.3850, 78.3867], 11); 

    // Add CartoDB Positron Tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19
    }).addTo(mapRef.current);

    L.control.zoom({ position: 'bottomright' }).addTo(mapRef.current);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // SYNC MARKERS
  useEffect(() => {
    if (!mapRef.current) return;

    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    const filtered = partners.filter(p => {
      if (activeFilter === 'ALL') return true;
      if (activeFilter === 'NEARBY') return p.distance !== undefined;
      return p.type === activeFilter;
    });

    filtered.forEach(p => {
      const icon = L.divIcon({
        className: 'custom-div-icon',
        html: `
          <div class="flex items-center justify-center w-10 h-10 rounded-2xl shadow-xl border-4 border-white transition-all hover:scale-125 ${p.type === 'TECHNICIAN' ? 'bg-emerald-600' : 'bg-blue-600'}" style="color: white; font-size: 18px;">
            ${p.type === 'TECHNICIAN' ? '⚡' : '🛡️'}
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      const marker = L.marker([p.lat, p.lng], { icon }).addTo(mapRef.current);
      marker.on('click', () => setSelectedPartner(p));
      markersRef.current.push(marker);
    });

    if (markersRef.current.length > 1) {
      const group = new L.featureGroup(markersRef.current);
      mapRef.current.fitBounds(group.getBounds().pad(0.2));
    }
  }, [partners, activeFilter]);

  const handleExploreNearby = () => {
    setIsScanning(true);
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      setIsScanning(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserPos([latitude, longitude]);
        const userIcon = L.divIcon({
          className: 'user-icon',
          html: `<div class="relative w-8 h-8 flex items-center justify-center"><div class="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-40"></div><div class="w-4 h-4 bg-white rounded-full border-4 border-blue-600 shadow-lg relative z-10"></div></div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });
        L.marker([latitude, longitude], { icon: userIcon }).addTo(mapRef.current);
        mapRef.current.flyTo([latitude, longitude], 14, { duration: 2 });
        setTimeout(() => {
          setIsScanning(false);
          setScanSector('TELANGANA-SOUTH-SECTOR');
          const updated = partners.map(p => {
            const d = Math.sqrt(Math.pow(p.lat - latitude, 2) + Math.pow(p.lng - longitude, 2)) * 111;
            return { ...p, distance: parseFloat(d.toFixed(1)), estArrival: `${Math.floor(d * 5 + 10)} mins` };
          });
          setPartners(updated);
          setActiveFilter('NEARBY');
        }, 2000);
      },
      () => {
        setIsScanning(false);
        mapRef.current.flyTo([17.3850, 78.4867], 13);
      }
    );
  };

  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    setIsSendingMessage(true);
    setTimeout(() => {
      setIsSendingMessage(false);
      setConnectionSuccess(`Transmission Successful: Your secure inquiry has been delivered to ${contactingPartner?.name}.`);
      setContactingPartner(null);
      setMessageText('');
      setTimeout(() => setConnectionSuccess(null), 5000);
    }, 2200);
  };

  const filteredList = partners.filter(p => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = !query || 
      p.name.toLowerCase().includes(query) || 
      p.type.toLowerCase().includes(query) ||
      p.location.toLowerCase().includes(query) ||
      p.specialties.some(s => s.toLowerCase().includes(query));

    if (!matchesSearch) return false;
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'NEARBY') return p.distance !== undefined;
    return p.type === activeFilter;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700 pb-24">
      <header className="text-center space-y-4 max-w-3xl mx-auto pt-8">
        <div className="inline-flex items-center gap-3 bg-emerald-50 text-emerald-700 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-emerald-100 mb-2 shadow-sm">
          <span className="flex h-2 w-2 rounded-full bg-emerald-600 animate-pulse"></span>
          National Resource Registry Map
        </div>
        <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-none uppercase italic">Circular Economy Network</h1>
        <p className="text-slate-500 font-medium text-lg leading-relaxed">Authorized technical nodes and recycling facilities mapped across the Hyderabad Circular Grid.</p>
      </header>

      {/* MAP INTERFACE */}
      <section className="relative h-[650px] bg-slate-900 rounded-[3.5rem] overflow-hidden shadow-2xl border-4 border-white flex flex-col md:flex-row group">
        <div className="w-full md:w-80 h-auto md:h-full bg-slate-900/90 backdrop-blur-xl border-b md:border-b-0 md:border-r border-white/10 z-20 flex flex-col p-8 pointer-events-auto">
           <div className="space-y-8">
              <div className="space-y-4">
                 <h3 className="text-white text-[10px] font-black uppercase tracking-[0.3em] opacity-40">System Metadata</h3>
                 <div className="space-y-5">
                    <MapStat label="Nodes Online" value={partners.length.toString()} color="text-emerald-400" />
                    <MapStat label="Sector Capacity" value="94%" color="text-blue-400" />
                    <MapStat label="District Load" value="Optimal" color="text-amber-400" />
                 </div>
              </div>
              <div className="pt-8 border-t border-white/10 space-y-6">
                 <h3 className="text-white text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Grid Calibration</h3>
                 <button onClick={handleExploreNearby} disabled={isScanning} className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-400 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 shadow-2xl">
                   {isScanning ? <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : '🛰️ Sync My Location'}
                 </button>
                 <div className="bg-white/5 p-5 rounded-2xl border border-white/5 space-y-3">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Identified Sector</p>
                    {scanSector ? <div className="space-y-2 animate-in fade-in"><p className="text-sm font-black text-emerald-400 font-mono tracking-tighter">{scanSector}</p></div> : <p className="text-[10px] font-bold text-slate-600 italic">No active scan sequence initiated.</p>}
                 </div>
              </div>
           </div>
        </div>
        <div ref={mapContainerRef} className="flex-grow h-full z-10 outline-none" style={{ minHeight: '400px' }}></div>
      </section>

      {/* FILTER BAR */}
      <section className="flex flex-col lg:flex-row items-center justify-between gap-6 bg-white border border-slate-200 p-6 rounded-[2.5rem] shadow-sm">
         <div className="flex bg-slate-100 p-1.5 rounded-[1.5rem] border border-slate-200 overflow-x-auto w-full md:w-auto">
            {['ALL', 'NEARBY', 'TECHNICIAN', 'RECYCLER'].map(f => (
              <button key={f} onClick={() => setActiveFilter(f as any)} className={`px-8 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${activeFilter === f ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}>
                {f === 'ALL' ? 'Entire District' : f === 'NEARBY' ? 'Closest To Me' : f === 'TECHNICIAN' ? 'Repair Hubs' : 'Recovery Units'}
              </button>
            ))}
          </div>
          <div className="text-right hidden md:block">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Data Feed</p>
            <p className="text-xs font-bold text-slate-900">Hyderabad Metropolitan Region</p>
          </div>
      </section>

      {/* DIRECTORY LISTING */}
      <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredList.map(partner => (
          <div key={partner.id} className={`bg-white border-2 p-10 rounded-[3rem] hover:shadow-2xl transition-all group flex flex-col h-full animate-in slide-in-from-bottom-6 duration-500 ${partner.distance ? 'border-emerald-500/30 shadow-2xl shadow-emerald-500/5' : 'border-slate-100'}`}>
            <div className="flex justify-between items-start mb-8">
              <div className="flex flex-col gap-3">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-xl border-4 border-white transition-transform group-hover:rotate-6 ${partner.type === 'TECHNICIAN' ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white'}`}>
                  {partner.type === 'TECHNICIAN' ? '⚡' : '🛡️'}
                </div>
                {partner.distance && <span className="bg-emerald-50 text-emerald-700 text-[9px] px-3 py-1.5 rounded-lg font-black uppercase tracking-[0.15em] border border-emerald-100 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>{partner.distance} KM AWAY</span>}
              </div>
              <div className="text-right space-y-1">
                <div className="text-amber-500 text-sm font-black tracking-widest flex items-center justify-end gap-1.5">★ {partner.rating}</div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">{partner.location}</p>
              </div>
            </div>
            <div className="flex-grow space-y-4 mb-10">
              <div className="space-y-1">
                <h3 className="text-2xl font-black text-slate-900 tracking-tighter group-hover:text-emerald-600 transition-colors">{partner.name}</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{partner.type} • VERIFIED</p>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                 {partner.specialties.map((spec, i) => (
                   <span key={i} className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider border ${partner.type === 'TECHNICIAN' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>{spec}</span>
                 ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setSelectedPartner(partner)} className="py-4 border-2 border-slate-100 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all active:scale-95 shadow-sm">Inspect</button>
              <button onClick={() => setContactingPartner(partner)} className={`py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl active:scale-95 ${partner.distance ? 'bg-gradient-to-r from-emerald-600 to-blue-600 text-white shadow-emerald-500/20 hover:scale-105' : 'bg-slate-900 text-white shadow-slate-900/10 hover:bg-slate-800'}`}>Secure Message</button>
            </div>
          </div>
        ))}
      </section>

      {/* CONTACT MODAL */}
      {contactingPartner && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-slate-900/90 backdrop-blur-xl animate-in fade-in">
           <div className="bg-white rounded-[3.5rem] shadow-2xl w-full max-w-xl p-0 overflow-hidden animate-in zoom-in-95 border border-white/20">
              <div className="bg-slate-900 p-12 space-y-2 text-white relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none text-9xl">✉️</div>
                 <h2 className="text-3xl font-black tracking-tight leading-none uppercase italic">Secure Transmit</h2>
                 <p className="text-emerald-400 font-black text-[10px] uppercase tracking-[0.3em]">Direct Channel to {contactingPartner.name}</p>
                 <button onClick={() => setContactingPartner(null)} className="absolute top-12 right-12 p-3 bg-white/10 rounded-2xl text-white hover:bg-white/20 transition-all z-20"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M6 18L18 6M6 6l12 12" /></svg></button>
              </div>
              <div className="p-12 space-y-8">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">Message Payload</label>
                    <textarea value={messageText} onChange={(e) => setMessageText(e.target.value)} placeholder="Describe your asset category and primary defect for triage..." className="w-full h-40 bg-slate-50 border border-slate-200 rounded-[2rem] p-8 text-base font-medium outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all resize-none shadow-inner"></textarea>
                    <div className="flex justify-between px-2">
                       <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">End-to-End Encrypted Handshake</p>
                       <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{messageText.length} Characters</p>
                    </div>
                 </div>
                 <button disabled={isSendingMessage || !messageText.trim()} onClick={handleSendMessage} className="w-full py-6 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-emerald-600 transition-all shadow-2xl active:scale-95 disabled:opacity-50 flex items-center justify-center gap-4">
                    {isSendingMessage ? (
                       <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        Transmitting...
                       </>
                    ) : (
                       <>Broadcast to Node</>
                    )}
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* PARTNER DOSSIER MODAL */}
      {selectedPartner && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6 bg-slate-900/95 backdrop-blur-2xl animate-in fade-in overflow-hidden">
          <div className="bg-white rounded-[3rem] sm:rounded-[4rem] shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 relative border border-white/20">
            <div className="bg-slate-900 p-8 sm:p-14 text-white shrink-0">
               <div className="flex justify-between items-start">
                 <div className="flex items-center gap-6 sm:gap-10">
                   <div className={`w-16 h-16 sm:w-28 sm:h-28 rounded-2xl sm:rounded-[2.5rem] flex items-center justify-center text-3xl sm:text-5xl shadow-2xl border-4 border-white/20 ${selectedPartner.type === 'TECHNICIAN' ? 'bg-emerald-500' : 'bg-blue-500'}`}>{selectedPartner.type === 'TECHNICIAN' ? '⚡' : '🛡️'}</div>
                   <div className="space-y-1 sm:space-y-3">
                      <h2 className="text-2xl sm:text-4xl font-black tracking-tighter leading-none italic uppercase">{selectedPartner.name}</h2>
                      <p className="text-[9px] sm:text-[11px] font-black uppercase text-emerald-400 tracking-[0.4em]">Government Registered Hub • {selectedPartner.type}</p>
                   </div>
                 </div>
                 <button onClick={() => setSelectedPartner(null)} className="p-3 sm:p-4 bg-white/10 rounded-xl sm:rounded-2xl text-white hover:bg-white/20 transition-all"><svg className="w-5 h-5 sm:w-8 sm:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M6 18L18 6M6 6l12 12" /></svg></button>
               </div>
            </div>
            <div className="p-8 sm:p-16 space-y-10 sm:space-y-12 overflow-y-auto custom-scrollbar flex-grow">
               <div className="grid md:grid-cols-2 gap-8 sm:gap-12">
                  <div className="space-y-8">
                     <div className="space-y-3">
                       <label className="text-[10px] sm:text-[11px] font-black uppercase text-slate-400 tracking-[0.3em]">Operational License</label>
                       <p className="font-mono text-lg sm:text-xl font-black text-slate-900 bg-slate-50 px-4 py-3 rounded-xl border border-slate-100">{selectedPartner.license}</p>
                     </div>
                     <div className="space-y-3">
                       <label className="text-[10px] sm:text-[11px] font-black uppercase text-slate-400 tracking-[0.3em]">Specialized Capabilities</label>
                       <div className="flex flex-wrap gap-2">
                          {selectedPartner.specialties.map((s, i) => (<span key={i} className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-50 text-blue-700 text-[9px] sm:text-[10px] font-black uppercase tracking-widest rounded-xl border border-blue-100">{s}</span>))}
                       </div>
                     </div>
                  </div>
                  <div className="bg-slate-900 p-8 sm:p-10 rounded-[2.5rem] sm:rounded-[3rem] text-white shadow-2xl relative flex flex-col justify-center">
                     <div className="absolute top-0 right-0 p-8 opacity-5 text-8xl">📊</div>
                     <p className="text-[10px] font-black uppercase text-emerald-400 tracking-[0.3em] mb-4">Circular Metric Hub</p>
                     <div className="space-y-2 relative z-10">
                        <p className="text-3xl sm:text-4xl font-black text-white tracking-tighter">{selectedPartner.impact}</p>
                        <p className="text-[9px] sm:text-[10px] font-black text-emerald-400/80 uppercase">Materials Formally Extracted</p>
                        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mt-4"><div className="h-full bg-emerald-500 w-[92%]"></div></div>
                     </div>
                  </div>
               </div>
            </div>
            <div className="p-8 sm:p-14 bg-white border-t border-slate-100 shrink-0">
               <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                  <button onClick={() => { setContactingPartner(selectedPartner); setSelectedPartner(null); }} className="flex-grow py-5 sm:py-6 bg-slate-900 text-white rounded-2xl sm:rounded-3xl font-black text-xs uppercase tracking-[0.3em] hover:bg-emerald-600 transition-all shadow-xl active:scale-95">Secure Message</button>
                  <button onClick={() => setSelectedPartner(null)} className="sm:w-1/3 py-5 sm:py-6 border-2 border-slate-100 text-slate-900 rounded-2xl sm:rounded-3xl font-black text-xs uppercase tracking-[0.3em] hover:bg-slate-50 transition-all">Dismiss Dossier</button>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* CONNECTION SUCCESS TOAST */}
      {connectionSuccess && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[3000] animate-in slide-in-from-bottom-10">
           <div className="bg-emerald-600 border-2 border-white/20 text-white px-10 py-6 rounded-[2.5rem] shadow-2xl flex items-center gap-6 group">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">✨</div>
              <div className="max-w-md">
                 <p className="font-black text-base uppercase tracking-tight">Handshake Verified</p>
                 <p className="text-[11px] font-bold text-emerald-100 uppercase tracking-widest mt-1">{connectionSuccess}</p>
              </div>
           </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `.custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }`}} />
    </div>
  );
};

const MapStat: React.FC<{ label: string, value: string, color: string }> = ({ label, value, color }) => (
  <div className="flex justify-between items-end">
    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{label}</span>
    <span className={`text-xl font-black tracking-tighter leading-none ${color}`}>{value}</span>
  </div>
);

export default NetworkView;
