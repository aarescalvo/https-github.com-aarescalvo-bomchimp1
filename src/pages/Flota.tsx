import React, { useState, useEffect } from 'react';
import { Truck, Plus, Settings, AlertTriangle, CheckCircle2, MapPin, Gauge, Save, History, Wrench } from 'lucide-react';
import { toast } from 'sonner';

interface Vehicle {
  id: number;
  unit_id: string;
  type: string;
  model: string;
  status: string;
  last_maintenance: string;
  patent?: string;
  year?: number;
}

interface MaintenanceRecord {
  id: number;
  unit_id: string;
  type: string;
  description: string;
  date: string;
  mileage: number;
  cost: number;
}

export default function Flota() {
  const [fleet, setFleet] = useState<Vehicle[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'UNIDADES' | 'MANTENIMIENTO'>('UNIDADES');
  
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [newUnit, setNewUnit] = useState({ unit_id: '', type: 'AUTOBOMBA', model: '', patent: '', year: new Date().getFullYear() });

  const [showMaintModal, setShowMaintModal] = useState(false);
  const [newMaint, setNewMaint] = useState({ unit_id: '', type: 'PREVENTIVO', description: '', mileage: 0, cost: 0 });

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

  const fetchMaintenance = async () => {
    const res = await fetch('/api/fleet/maintenance');
    const data = await res.json();
    setMaintenance(data);
  };

  useEffect(() => {
    fetchFleet();
    fetchMaintenance();
  }, []);

  const handleCreateUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/fleet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUnit)
      });
      if (res.ok) {
        toast.success('Unidad registrada');
        setShowUnitModal(false);
        setNewUnit({ unit_id: '', type: 'AUTOBOMBA', model: '', patent: '', year: new Date().getFullYear() });
        fetchFleet();
      }
    } catch (err) {
      toast.error('Error al registrar unidad');
    }
  };

  const handleCreateMaint = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/fleet/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMaint)
      });
      if (res.ok) {
        toast.success('Mantenimiento registrado');
        setShowMaintModal(false);
        setNewMaint({ unit_id: '', type: 'PREVENTIVO', description: '', mileage: 0, cost: 0 });
        fetchMaintenance();
        fetchFleet();
      }
    } catch (err) {
      toast.error('Error al registrar mantenimiento');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-[#1D2124] uppercase">Flota y Activos</h2>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Control de unidades y mantenimiento preventivo</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setShowUnitModal(true)}
            className="px-6 py-3 bg-[#FFD43B] text-[#1D2124] font-black rounded-xl shadow-[0_4px_0_0_#FAB005] hover:translate-y-[2px] transition-all flex items-center gap-2 uppercase text-xs"
          >
            <Plus size={18} /> Nueva Unidad
          </button>
          <button 
            onClick={() => setShowMaintModal(true)}
            className="px-6 py-3 bg-[#1D2124] text-white font-black rounded-xl hover:bg-black transition-all flex items-center gap-2 uppercase text-xs"
          >
            <Wrench size={18} /> Registrar Service
          </button>
        </div>
      </div>

      <div className="flex gap-2 p-1 bg-white border border-gray-100 rounded-2xl w-fit shadow-sm">
        <button 
          onClick={() => setActiveTab('UNIDADES')}
          className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'UNIDADES' ? 'bg-[#FFD43B] text-[#1D2124]' : 'text-gray-400 hover:text-[#1D2124]'}`}
        >
          Unidades Activas
        </button>
        <button 
          onClick={() => setActiveTab('MANTENIMIENTO')}
          className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'MANTENIMIENTO' ? 'bg-[#FFD43B] text-[#1D2124]' : 'text-gray-400 hover:text-[#1D2124]'}`}
        >
          Historial Mantenimiento
        </button>
      </div>

      {activeTab === 'UNIDADES' ? (
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
                      <p className="text-[8px] font-black text-gray-400 uppercase mb-1">Patente / Año</p>
                      <p className="text-[10px] font-black text-[#1D2124] uppercase truncate">{v.patent || 'S/D'} • {v.year || 'S/D'}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-2xl">
                      <p className="text-[8px] font-black text-gray-400 uppercase mb-1">Último Service</p>
                      <p className="text-[10px] font-black text-[#1D2124] uppercase truncate">
                        {v.last_maintenance ? new Date(v.last_maintenance).toLocaleDateString() : 'SIN DATOS'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[10px] font-black text-gray-400 uppercase">
                      <div className="flex items-center gap-2"><Gauge size={14} /> Estado de Neumáticos</div>
                      <span className="text-[#1D2124]">85%</span>
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
                  <button className="py-3 bg-[#1D2124] text-white text-[10px] font-black rounded-xl hover:bg-black transition-all uppercase tracking-widest">Inspección</button>
                  <button className="py-3 bg-gray-50 text-[#1D2124] text-[10px] font-black rounded-xl hover:bg-gray-100 transition-all uppercase tracking-widest flex items-center justify-center gap-2">
                    <Settings size={14} />
                    Manual
                  </button>
                </div>
              </div>
            </div>
          ))}
          {fleet.length === 0 && !loading && (
            <div className="col-span-full py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100 text-center">
              <Truck size={64} className="mx-auto mb-4 text-gray-100" />
              <p className="font-black text-gray-300 uppercase tracking-widest text-xs">Sin flota registrada</p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Unidad</th>
                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tipo</th>
                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Kilometraje</th>
                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Fecha</th>
                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Costo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-[10px] font-bold">
              {maintenance.map(m => (
                <tr key={m.id} className="hover:bg-gray-50/30">
                  <td className="p-6 font-black text-[#1D2124]">UNIDAD {m.unit_id}</td>
                  <td className="p-6">
                    <span className={`px-2 py-1 rounded inline-block ${m.type === 'PREVENTIVO' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                      {m.type}
                    </span>
                  </td>
                  <td className="p-6">{m.mileage.toLocaleString()} KM</td>
                  <td className="p-6 text-gray-400">{new Date(m.date).toLocaleDateString()}</td>
                  <td className="p-6 text-[#20C997]">${m.cost}</td>
                </tr>
              ))}
              {maintenance.length === 0 && (
                <tr>
                   <td colSpan={5} className="p-20 text-center text-gray-300 font-black uppercase">No hay registros de servicio</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* MODALS */}
      {showUnitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1D2124]/80 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95">
            <form onSubmit={handleCreateUnit} className="p-8 space-y-6">
              <h3 className="text-2xl font-black text-[#1D2124] uppercase italic">Nueva Unidad</h3>
              <div className="space-y-4">
                <input required placeholder="ID UNIDAD (E.G. M-10)" className="w-full h-12 bg-gray-50 border-2 border-gray-100 rounded-xl px-4 text-sm font-black uppercase" value={newUnit.unit_id} onChange={e => setNewUnit({...newUnit, unit_id: e.target.value})} />
                <select className="w-full h-12 bg-gray-50 border-2 border-gray-100 rounded-xl px-4 text-sm font-black uppercase" value={newUnit.type} onChange={e => setNewUnit({...newUnit, type: e.target.value})}>
                  <option value="AUTOBOMBA">AUTOBOMBA</option>
                  <option value="RESCATE">RESCATE</option>
                  <option value="LOGISTICA">LOGISTICA</option>
                  <option value="CISTERNA">CISTERNA</option>
                </select>
                <input required placeholder="MARCA/MODELO" className="w-full h-12 bg-gray-50 border-2 border-gray-100 rounded-xl px-4 text-sm font-black uppercase" value={newUnit.model} onChange={e => setNewUnit({...newUnit, model: e.target.value})} />
                <div className="grid grid-cols-2 gap-4">
                  <input placeholder="PATENTE" className="w-full h-12 bg-gray-50 border-2 border-gray-100 rounded-xl px-4 text-sm font-black uppercase" value={newUnit.patent} onChange={e => setNewUnit({...newUnit, patent: e.target.value})} />
                  <input type="number" placeholder="AÑO" className="w-full h-12 bg-gray-50 border-2 border-gray-100 rounded-xl px-4 text-sm font-black uppercase" value={newUnit.year} onChange={e => setNewUnit({...newUnit, year: parseInt(e.target.value)})} />
                </div>
              </div>
              <div className="flex gap-4">
                <button type="button" onClick={() => setShowUnitModal(false)} className="flex-1 h-12 border-2 border-gray-100 rounded-xl font-black uppercase text-xs">Cerrar</button>
                <button type="submit" className="flex-1 h-12 bg-[#FFD43B] text-[#1D2124] font-black rounded-xl shadow-[0_4px_0_0_#FAB005] uppercase text-xs italic">Dar de Alta</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showMaintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1D2124]/80 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95">
            <form onSubmit={handleCreateMaint} className="p-8 space-y-6">
              <h3 className="text-2xl font-black text-[#1D2124] uppercase italic underline decoration-[#FFD43B]">Registrar Service</h3>
              <div className="space-y-4">
                <select required className="w-full h-12 bg-gray-50 border-2 border-gray-100 rounded-xl px-4 text-sm font-black uppercase" value={newMaint.unit_id} onChange={e => setNewMaint({...newMaint, unit_id: e.target.value})}>
                  <option value="">SELECCIONE UNIDAD</option>
                  {fleet.map(v => <option key={v.id} value={v.unit_id}>{v.unit_id} - {v.type}</option>)}
                </select>
                <select className="w-full h-12 bg-gray-50 border-2 border-gray-100 rounded-xl px-4 text-sm font-black uppercase" value={newMaint.type} onChange={e => setNewMaint({...newMaint, type: e.target.value})}>
                  <option value="PREVENTIVO">PREVENTIVO</option>
                  <option value="CORRECTIVO">CORRECTIVO</option>
                </select>
                <input type="number" placeholder="KILOMETRAJE ACTUAL" className="w-full h-12 bg-gray-50 border-2 border-gray-100 rounded-xl px-4 text-sm font-black uppercase" value={newMaint.mileage || ''} onChange={e => setNewMaint({...newMaint, mileage: parseInt(e.target.value)})} />
                <input required placeholder="DETALLE DEL TRABAJO" className="w-full h-12 bg-gray-50 border-2 border-gray-100 rounded-xl px-4 text-sm font-black uppercase" value={newMaint.description} onChange={e => setNewMaint({...newMaint, description: e.target.value})} />
                <input type="number" placeholder="COSTO $" className="w-full h-12 bg-gray-50 border-2 border-gray-100 rounded-xl px-4 text-sm font-black uppercase" value={newMaint.cost || ''} onChange={e => setNewMaint({...newMaint, cost: parseFloat(e.target.value)})} />
              </div>
              <div className="flex gap-4">
                <button type="button" onClick={() => setShowMaintModal(false)} className="flex-1 h-12 border-2 border-gray-100 rounded-xl font-black uppercase text-xs">Cerrar</button>
                <button type="submit" className="flex-1 h-12 bg-[#1D2124] text-white font-black rounded-xl uppercase text-xs italic">Guardar Registro</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
