import React, { useState, useEffect } from 'react';
import { Flame, Plus, Search, MapPin, Clock, Filter, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface Incident {
  id: number;
  type: string;
  description: string;
  location: string;
  timestamp: string;
  status: string;
}

export default function Incidencias() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchIncidents = async () => {
    try {
      const res = await fetch('/api/incidents');
      const data = await res.json();
      setIncidents(data);
    } catch (err) {
      toast.error('Error al cargar incidencias');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVO': return 'text-[#FA5252] bg-red-50';
      case 'EN PROCESO': return 'text-[#FFD43B] bg-yellow-50';
      case 'CONTROLADO': return 'text-[#228BE6] bg-blue-50';
      case 'FINALIZADO': return 'text-[#20C997] bg-green-50';
      default: return 'text-gray-400 bg-gray-50';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-[#1D2124] uppercase">Incidencias</h2>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Centro de despacho y despacho</p>
        </div>
        <button className="px-6 py-3 bg-[#FA5252] text-white font-black rounded-xl shadow-[0_4px_0_0_#C92A2A] hover:translate-y-[2px] transition-all flex items-center gap-2 uppercase text-xs">
          <Plus size={18} />
          Nueva Salida
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-3">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h4 className="font-black text-[#1D2124] uppercase">Incidentes Recientes</h4>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-[8px] font-black text-red-500 uppercase tracking-widest">En Vivo</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 bg-gray-50 text-gray-400 rounded-lg hover:text-[#1D2124] transition-colors"><Search size={18} /></button>
                <button className="p-2 bg-gray-50 text-gray-400 rounded-lg hover:text-[#1D2124] transition-colors"><Filter size={18} /></button>
              </div>
            </div>
            
            <div className="divide-y divide-gray-50">
              {incidents.map((inc) => (
                <div key={inc.id} className="p-6 hover:bg-gray-50/50 transition-colors group cursor-pointer">
                  <div className="flex gap-6 items-start">
                    <div className={`p-4 rounded-2xl ${getStatusColor(inc.status)} flex-shrink-0`}>
                      <Flame size={24} />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <h5 className="text-lg font-black text-[#1D2124] uppercase tracking-tight">{inc.type}</h5>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 size={14} className="text-gray-200 group-hover:text-[#20C997] transition-colors" />
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">
                            {new Date(inc.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-500 text-xs font-bold leading-relaxed">{inc.description}</p>
                      <div className="flex items-center gap-6 pt-2">
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase">
                          <MapPin size={12} />
                          {inc.location}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase">
                          <AlertCircle size={12} />
                          Prioridad: <span className="text-red-500">Alta</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                       <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm ${getStatusColor(inc.status)}`}>
                        {inc.status}
                      </span>
                      <button className="text-[10px] font-black text-[#228BE6] uppercase hover:underline">Ver Mapa</button>
                    </div>
                  </div>
                </div>
              ))}
              {incidents.length === 0 && !loading && (
                <div className="p-20 text-center text-gray-300">
                  <Flame size={48} className="mx-auto mb-4 opacity-10" />
                  <p className="font-black uppercase tracking-widest text-xs">Sin incidencias activas en el sistema</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-[#1D2124] p-6 rounded-3xl text-white shadow-xl">
            <h5 className="text-[#FFD43B] text-[10px] font-black uppercase tracking-[0.2em] mb-4">Información Clave</h5>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-white/40 font-black">74</div>
                <div>
                  <p className="text-[10px] font-black text-gray-500 uppercase">Salidas 2026</p>
                  <p className="text-sm font-black">+12 vs 2025</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-white/40 font-black">03:4</div>
                <div>
                  <p className="text-[10px] font-black text-gray-500 uppercase">Promedio Salida</p>
                  <p className="text-sm font-black italic">Minutos</p>
                </div>
              </div>
            </div>
            <button className="w-full mt-8 py-3 bg-white/10 hover:bg-white/20 text-white text-[10px] font-black rounded-xl border border-white/10 transition-all uppercase tracking-widest">Generar Reporte Mensual</button>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 italic">Protocolo Emergencia</h5>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded bg-gray-100 flex items-center justify-center text-[10px] font-black flex-shrink-0">1</div>
                <p className="text-[10px] font-bold text-gray-600 uppercase">Activar alarma general en cuartel</p>
              </li>
               <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded bg-gray-100 flex items-center justify-center text-[10px] font-black flex-shrink-0">2</div>
                <p className="text-[10px] font-bold text-gray-600 uppercase">Notificar por grupo de Whatsapp</p>
              </li>
               <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded bg-gray-100 flex items-center justify-center text-[10px] font-black flex-shrink-0">3</div>
                <p className="text-[10px] font-bold text-gray-600 uppercase">Asignar dotación a unidades</p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
