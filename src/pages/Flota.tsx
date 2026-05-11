import React, { useState, useEffect } from 'react';
import { Truck, Plus, Settings, AlertTriangle, CheckCircle2, MapPin, Gauge } from 'lucide-react';
import { toast } from 'sonner';

interface Vehicle {
  id: number;
  unit_id: string;
  type: string;
  model: string;
  status: string;
  last_maintenance: string;
}

export default function Flota() {
  const [fleet, setFleet] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFleet = async () => {
    try {
      const res = await fetch('/api/fleet');
      const data = await res.json();
      setFleet(data);
    } catch (err) {
      toast.error('Error al cargar flota');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFleet();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-[#1D2124] uppercase">Flota y Activos</h2>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Control de unidades y equipamiento</p>
        </div>
        <button className="px-6 py-3 bg-[#FFD43B] text-[#1D2124] font-black rounded-xl shadow-[0_4px_0_0_#FAB005] hover:translate-y-[2px] transition-all flex items-center gap-2 uppercase text-xs">
          <Plus size={18} />
          Nueva Unidad
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {fleet.map((v) => (
          <div key={v.id} className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
            <div className={`h-2 ${v.status === 'OPERATIVO' ? 'bg-[#20C997]' : 'bg-[#FA5252]'}`} />
            <div className="p-8 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-4xl font-black text-[#1D2124] italic tracking-tighter mb-1 uppercase">{v.unit_id}</h3>
                  <p className="text-[#FFD43B] text-[10px] font-black uppercase tracking-[0.2em]">{v.type}</p>
                </div>
                <div className={`p-3 rounded-2xl ${v.status === 'OPERATIVO' ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'}`}>
                  {v.status === 'OPERATIVO' ? <CheckCircle2 size={24} /> : <AlertTriangle size={24} />}
                </div>
              </div>

              <div className="space-y-6 flex-1">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-2xl">
                    <p className="text-[8px] font-black text-gray-400 uppercase mb-1">Modelo</p>
                    <p className="text-[10px] font-black text-[#1D2124] uppercase truncate">{v.model}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-2xl">
                    <p className="text-[8px] font-black text-gray-400 uppercase mb-1">Service</p>
                    <p className="text-[10px] font-black text-[#1D2124] uppercase">20/05/2026</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[10px] font-black text-gray-400 uppercase">
                    <div className="flex items-center gap-2"><Gauge size={14} /> KM ACTUAL</div>
                    <span className="text-[#1D2124]">45.200 KM</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="w-[85%] h-full bg-[#FFD43B]" />
                  </div>
                </div>

                <div className="flex items-center gap-3 text-[10px] font-black text-gray-400 uppercase">
                  <MapPin size={14} />
                  <span>UBICACIÓN: <span className="text-[#1D2124]">CUARTEL CENTRAL</span></span>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-50 grid grid-cols-2 gap-3">
                <button className="py-3 bg-[#1D2124] text-white text-[10px] font-black rounded-xl hover:bg-black transition-all uppercase tracking-widest">Control</button>
                <button className="py-3 bg-gray-50 text-[#1D2124] text-[10px] font-black rounded-xl hover:bg-gray-100 transition-all uppercase tracking-widest flex items-center justify-center gap-2">
                  <Settings size={14} />
                  Manual
                </button>
              </div>
            </div>
          </div>
        ))}
        {fleet.length === 0 && !loading && (
          <div className="col-span-full py-20 bg-white rounded-3xl border border-gray-100 text-center">
            <Truck size={64} className="mx-auto mb-4 text-gray-100" />
            <p className="font-black text-gray-300 uppercase tracking-widest text-xs">Sin flota registrada</p>
          </div>
        )}
      </div>
    </div>
  );
}
