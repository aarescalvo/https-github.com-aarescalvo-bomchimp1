import React, { useState, useEffect } from 'react';
import { Flame, Plus, Search, MapPin, Clock, Filter, AlertCircle, CheckCircle2, MessageSquare, Share2 } from 'lucide-react';
import { toast } from 'sonner';

interface Incident {
  id: number;
  type: string;
  description: string;
  location: string;
  timestamp: string;
  status: string;
}

export default function Incidencias({ settings }: { settings: any }) {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newIncident, setNewIncident] = useState({
    type: 'INCENDIO ESTRUCTURAL',
    description: '',
    location: '',
    status: 'ACTIVO'
  });

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

  const handleWhatsAppDispatch = (inc: Partial<Incident>) => {
    const prefix = settings?.whatsapp_alert_message_prefix || '🚨 *DESPACHO DE EMERGENCIA BVC* 🚨';
    const message = `${prefix}\n\n` + 
                    `📍 *UBICACIÓN:* ${inc.location}\n` +
                    `🔥 *TIPO:* ${inc.type}\n` +
                    `📝 *INFO:* ${inc.description}\n` +
                    `⏰ *SALIDA:* ${new Date().toLocaleTimeString()}\n\n` +
                    `*POR FAVOR REPORTARSE AL CUARTEL INMEDIATAMENTE*`;
    
    const target = settings?.whatsapp_alert_target || '';
    const url = target 
      ? `https://wa.me/${target.includes('@') ? '' : target}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;
    
    window.open(url, '_blank');
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newIncident)
      });
      if (res.ok) {
        toast.success('Incidencia registrada');
        handleWhatsAppDispatch(newIncident);
        setShowModal(false);
        setNewIncident({ type: 'INCENDIO ESTRUCTURAL', description: '', location: '', status: 'ACTIVO' });
        fetchIncidents();
      }
    } catch (err) {
      toast.error('Error al registrar incidencia');
    }
  };

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
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Centro de despacho y notificaciones</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="px-6 py-3 bg-[#FA5252] text-white font-black rounded-xl shadow-[0_4px_0_0_#C92A2A] hover:translate-y-[2px] transition-all flex items-center gap-2 uppercase text-xs"
        >
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
                <div key={inc.id} className="p-6 hover:bg-gray-50/50 transition-colors group cursor-pointer relative">
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
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleWhatsAppDispatch(inc);
                        }}
                        className="flex items-center gap-2 p-2 px-4 bg-[#25D366] text-white rounded-xl text-[10px] font-black uppercase hover:scale-105 transition-all shadow-md"
                      >
                        <MessageSquare size={14} /> Despachar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {incidents.length === 0 && !loading && (
                <div className="py-20 text-center text-gray-300 font-black uppercase tracking-widest text-xs">Sin registros activos</div>
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
                  <p className="text-[10px] font-black text-gray-400 uppercase">Promedio Salida</p>
                  <p className="text-sm font-black italic">Minutos</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 italic">Protocolo Emergencia</h5>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded bg-gray-100 flex items-center justify-center text-[10px] font-black flex-shrink-0">1</div>
                <p className="text-[10px] font-bold text-gray-600 uppercase">Activar alarma general en cuartel</p>
              </li>
               <li className="flex items-start gap-3">
                <div className="w-20 bg-[#25D366] text-white rounded flex items-center justify-center text-[8px] font-black flex-shrink-0 p-1">WHATSAPP</div>
                <p className="text-[10px] font-bold text-gray-600 uppercase italic">Notificar al grupo de Primera Respuesta</p>
              </li>
               <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded bg-gray-100 flex items-center justify-center text-[10px] font-black flex-shrink-0">3</div>
                <p className="text-[10px] font-bold text-gray-600 uppercase">Asignar dotación a unidades</p>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1D2124]/80 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <form onSubmit={handleCreate} className="p-8 space-y-6">
              <div>
                <h3 className="text-2xl font-black text-[#1D2124] uppercase mb-1">Nueva Salida de Emergencia</h3>
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Registra el despacho inmediato</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tipo de Incidente</label>
                  <select 
                    className="w-full h-12 bg-gray-50 border-2 border-gray-100 rounded-xl px-4 text-sm font-black focus:border-[#FA5252] focus:outline-none transition-all uppercase"
                    value={newIncident.type}
                    onChange={(e) => setNewIncident({...newIncident, type: e.target.value})}
                  >
                    <option value="INCENDIO ESTRUCTURAL">INCENDIO ESTRUCTURAL</option>
                    <option value="ACCIDENTE VEHICULAR">ACCIDENTE VEHICULAR</option>
                    <option value="RESCATE DE PERSONAS">RESCATE DE PERSONAS</option>
                    <option value="INCENDIO FORESTAL">INCENDIO FORESTAL</option>
                    <option value="MATERIALES PELIGROSOS">MATERIALES PELIGROSOS</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ubicación / Dirección</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-3.5 text-gray-300" size={18} />
                    <input 
                      required
                      type="text"
                      className="w-full h-12 bg-gray-50 border-2 border-gray-100 rounded-xl pl-12 pr-4 text-sm font-bold focus:border-[#FA5252] focus:outline-none transition-all uppercase"
                      value={newIncident.location}
                      onChange={(e) => setNewIncident({...newIncident, location: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Descripción / Novedades</label>
                  <textarea 
                    required
                    rows={4}
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl p-4 text-sm font-bold focus:border-[#FA5252] focus:outline-none transition-all uppercase"
                    value={newIncident.description}
                    onChange={(e) => setNewIncident({...newIncident, description: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 h-12 text-[#1D2124] font-black rounded-xl border-2 border-gray-100 hover:bg-gray-50 transition-all uppercase text-xs"
                >
                  Cerrar
                </button>
                <button 
                  type="submit"
                  className="flex-1 h-12 bg-[#FA5252] text-white font-black rounded-xl shadow-[0_4px_0_0_#C92A2A] hover:translate-y-[2px] transition-all uppercase text-xs flex items-center justify-center gap-2"
                >
                  <Flame size={18} />
                  Despachar y Notificar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
