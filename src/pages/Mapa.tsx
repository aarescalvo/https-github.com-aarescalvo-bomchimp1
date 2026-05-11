import React, { useState, useEffect } from 'react';
import { Map as MapIcon, Navigation, Info, Shield, Radio, Activity } from 'lucide-react';

export default function Mapa() {
  const [incidents, setIncidents] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/incidents')
      .then(res => res.json())
      .then(data => setIncidents(data.filter((i: any) => i.status === 'ACTIVO' || i.status === 'EN PROCESO')));
  }, []);

  return (
    <div className="h-[calc(100vh-160px)] space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-[#1D2124] uppercase tracking-tight">Mapa Operativo</h2>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Despacho y geolocalización en tiempo real</p>
        </div>
        <div className="flex bg-white p-1 rounded-xl border border-gray-100 shadow-sm">
          <button className="px-4 py-2 bg-[#1D2124] text-white text-[10px] font-black rounded-lg uppercase">Global</button>
          <button className="px-4 py-2 text-gray-400 text-[10px] font-black rounded-lg uppercase">Unidades</button>
        </div>
      </div>

      <div className="flex-1 bg-[#F8F9FA] rounded-[3rem] border border-gray-100 relative overflow-hidden shadow-inner flex">
        {/* Mock Map Background with CSS Grids */}
        <div className="absolute inset-0 opacity-20 pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(#1D2124 1px, transparent 1px)', size: '40px 40px' }} />
        
        {/* Active Incidents on "Map" */}
        <div className="relative flex-1 p-10">
           {incidents.map((inc, i) => (
             <div 
              key={inc.id}
              className="absolute animate-bounce"
              style={{ top: `${20 + (i * 15)}%`, left: `${30 + (i * 20)}%` }}
             >
                <div className="relative group">
                  <div className="w-10 h-10 bg-[#FA5252] rounded-full flex items-center justify-center text-white shadow-xl cursor-help">
                    <Navigation size={20} className="rotate-45" />
                  </div>
                  <div className="absolute top-12 left-0 bg-white p-4 rounded-2xl shadow-2xl border border-gray-100 w-48 opacity-0 group-hover:opacity-100 transition-all z-10">
                    <p className="text-[10px] font-black text-red-500 uppercase mb-1">{inc.type}</p>
                    <p className="text-xs font-black text-[#1D2124] uppercase">{inc.location}</p>
                    <div className="mt-2 pt-2 border-t border-gray-50 flex items-center justify-between">
                       <span className="text-[8px] font-bold text-gray-400">RADIO: 300m</span>
                       <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    </div>
                  </div>
                </div>
             </div>
           ))}

           {/* Mobile Units (Mock) */}
           <div className="absolute bottom-[20%] right-[30%]">
             <div className="w-8 h-8 bg-[#20C997] rounded-xl flex items-center justify-center text-white shadow-lg rotate-12">
                <Shield size={16} />
             </div>
             <p className="mt-2 text-[8px] font-black text-[#1D2124] bg-white px-2 py-0.5 rounded shadow-sm">MOVIL 15</p>
           </div>
        </div>

        {/* Sidebar Info */}
        <div className="w-80 bg-white/80 backdrop-blur-md border-l border-gray-100 p-8 space-y-8 overflow-y-auto">
          <div>
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 italic">Unidades en Servicio</h4>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-xs font-black text-[#1D2124]">M-10 (PESADO) - CUARTEL</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-red-500 rounded-full" />
                <span className="text-xs font-black text-[#1D2124]">M-02 (RESCATE) - OPERATIVO</span>
              </div>
            </div>
          </div>

          <div className="p-6 bg-[#1D2124] rounded-3xl text-white">
            <Radio className="text-[#FFD43B] mb-2" size={20} />
            <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Frecuencia Activa</p>
            <p className="text-lg font-black italic tracking-tighter">142.350 MHz</p>
          </div>

          <div className="space-y-4 pt-4">
             <div className="flex items-center justify-between text-[10px] font-black uppercase text-gray-400">
               <span>Población en riesgo</span>
               <span className="text-[#FA5252]">Media</span>
             </div>
             <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
               <div className="w-[45%] h-full bg-[#FA5252]" />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
