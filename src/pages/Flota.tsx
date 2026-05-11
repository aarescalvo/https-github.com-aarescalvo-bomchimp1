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
  engine_number?: string;
  kilometers: number;
  fuel_type?: string;
  last_service_mileage: number;
  notes?: string;
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

interface FuelRecord {
  id: number;
  unit_id: string;
  date: string;
  kilometers: number;
  amount_liters: number;
  cost: number;
  recorded_by: string;
}

export default function Flota() {
  const [fleet, setFleet] = useState<Vehicle[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>([]);
  const [fuelLogs, setFuelLogs] = useState<FuelRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'UNIDADES' | 'MANTENIMIENTO' | 'COMBUSTIBLE' | 'ROTURAS'>('UNIDADES');
  const [damages, setDamages] = useState<any[]>([]);
  
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [newUnit, setNewUnit] = useState({ 
    unit_id: '', 
    type: 'AUTOBOMBA', 
    model: '', 
    patent: '', 
    year: new Date().getFullYear(),
    engine_number: '',
    kilometers: 0,
    fuel_type: 'DIESEL',
    last_service_mileage: 0,
    last_service_date: '',
    notes: '' 
  });

  const [showMaintModal, setShowMaintModal] = useState(false);
  const [newMaint, setNewMaint] = useState({ unit_id: '', type: 'PREVENTIVO', description: '', mileage: 0, cost: 0 });

  const [showFuelModal, setShowFuelModal] = useState(false);
  const [newFuel, setNewFuel] = useState({ unit_id: '', kilometers: 0, amount_liters: 0, cost: 0, recorded_by: '' });

  const [showDamageModal, setShowDamageModal] = useState(false);
  const [newDamage, setNewDamage] = useState({ unit_id: '', description: '', severity: 'MEDIA' });

  const fetchData = async () => {
    try {
      const [resFleet, resMaint, resFuel, resDamages] = await Promise.all([
        fetch('/api/fleet'),
        fetch('/api/fleet/maintenance'),
        fetch('/api/fleet/fuel'),
        fetch('/api/fleet/damages')
      ]);
      setFleet(await resFleet.json());
      setMaintenance(await resMaint.json());
      setFuelLogs(await resFuel.json());
      setDamages(await resDamages.json());
    } catch (err) {
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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
        setNewUnit({ 
          unit_id: '', 
          type: 'AUTOBOMBA', 
          model: '', 
          patent: '', 
          year: new Date().getFullYear(),
          engine_number: '',
          kilometers: 0,
          fuel_type: 'DIESEL',
          notes: '' 
        });
        fetchData();
      }
    } catch (err) {
      toast.error('Error al registrar unidad');
    }
  };

  const handleCreateFuel = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/fleet/fuel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFuel)
      });
      if (res.ok) {
        toast.success('Carga registrada');
        setShowFuelModal(false);
        setNewFuel({ unit_id: '', kilometers: 0, amount_liters: 0, cost: 0, recorded_by: '' });
        fetchData();
      }
    } catch (err) {
      toast.error('Error al registrar carga');
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
        fetchData();
      }
    } catch (err) {
      toast.error('Error al registrar mantenimiento');
    }
  };

  const handleCreateDamage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/fleet/damages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDamage)
      });
      if (res.ok) {
        toast.success('Reporte de rotura guardado');
        setShowDamageModal(false);
        setNewDamage({ unit_id: '', description: '', severity: 'MEDIA' });
        fetchData();
      }
    } catch (err) {
      toast.error('Error al registrar rotura');
    }
  };

  const exportFleetReport = () => {
    const headers = ['Unidad', 'Tipo', 'Modelo', 'Patente', 'KM Actual', 'Proximo Service', 'Status'];
    const rows = fleet.map(v => [
      v.unit_id,
      v.type,
      v.model,
      v.patent || 'S/D',
      v.kilometers,
      v.last_service_mileage + 10000,
      v.status
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `reporte_flota.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportVehicleReport = (vehicle: Vehicle) => {
    const vMaint = maintenance.filter(m => m.unit_id === vehicle.unit_id);
    const vFuel = fuelLogs.filter(f => f.unit_id === vehicle.unit_id);
    const vDamages = damages.filter(d => d.unit_id === vehicle.unit_id);

    let csv = `Reporte Individual: ${vehicle.unit_id}\n`;
    csv += `Modelo: ${vehicle.model}, Patent: ${vehicle.patent}, KM: ${vehicle.kilometers}\n\n`;
    
    csv += "MANTENIMIENTO\n";
    csv += "Fecha,Tipo,KM,Costo,Desc\n";
    vMaint.forEach(m => {
      csv += `${new Date(m.date).toLocaleDateString()},${m.type},${m.mileage},${m.cost},${m.description}\n`;
    });

    csv += "\nCOMBUSTIBLE\n";
    csv += "Fecha,Litros,Costo,KM,Operador\n";
    vFuel.forEach(f => {
      csv += `${new Date(f.date).toLocaleDateString()},${f.amount_liters},${f.cost},${f.kilometers},${f.recorded_by}\n`;
    });

    csv += "\nROTURAS/FALLAS\n";
    csv += "Fecha,Severidad,Estado,Desc\n";
    vDamages.forEach(d => {
      csv += `${new Date(d.recorded_at).toLocaleDateString()},${d.severity},${d.status},${d.description}\n`;
    });

    const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csv);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `reporte_${vehicle.unit_id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
             onClick={exportFleetReport}
             className="px-6 py-3 bg-blue-50 text-blue-600 font-black rounded-xl hover:bg-blue-100 transition-all flex items-center gap-2 uppercase text-xs"
          >
             Exportar Flota
          </button>
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
        <button 
          onClick={() => setActiveTab('COMBUSTIBLE')}
          className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'COMBUSTIBLE' ? 'bg-[#FFD43B] text-[#1D2124]' : 'text-gray-400 hover:text-[#1D2124]'}`}
        >
          Control Combustible
        </button>
        <button 
          onClick={() => setActiveTab('ROTURAS')}
          className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'ROTURAS' ? 'bg-[#FFD43B] text-[#1D2124]' : 'text-gray-400 hover:text-[#1D2124]'}`}
        >
          Reporte de Roturas
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
                      <p className="text-[8px] font-black text-gray-400 uppercase mb-1">Patente</p>
                      <p className="text-[10px] font-black text-[#1D2124] uppercase truncate">{v.patent || 'S/D'}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-2xl">
                      <p className="text-[8px] font-black text-gray-400 uppercase mb-1">Kilometraje</p>
                      <p className="text-[10px] font-black text-[#1D2124] uppercase truncate">{v.kilometers.toLocaleString()} KM</p>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-2xl">
                      <p className="text-[8px] font-black text-gray-400 uppercase mb-1">Motor / Modelo</p>
                      <p className="text-[10px] font-black text-[#1D2124] uppercase truncate">{v.engine_number || 'S/D'} • {v.model}</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[10px] font-black text-gray-400 uppercase">
                      <div className="flex items-center gap-2"><Gauge size={14} /> Próximo Service</div>
                      <span className="text-[#1D2124]">{v.kilometers} / {v.last_service_mileage + 10000} KM</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full bg-[#FFD43B]`} style={{ width: `${Math.min(100, (v.kilometers / (v.last_service_mileage + 10000)) * 100)}%` }} />
                    </div>
                  </div>

                  {v.notes && (
                      <div className="p-3 bg-yellow-50/50 rounded-xl border border-yellow-100">
                          <p className="text-[8px] font-black text-yellow-600 uppercase mb-1">Notas de la Unidad</p>
                          <p className="text-[9px] font-medium text-gray-600 line-clamp-2">{v.notes}</p>
                      </div>
                  )}
                </div>

                <div className="mt-8 pt-6 border-t border-gray-50 grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => exportVehicleReport(v)}
                    className="py-3 bg-[#1D2124] text-white text-[10px] font-black rounded-xl hover:bg-black transition-all uppercase tracking-widest"
                  >
                    Exportar
                  </button>
                  <button 
                    onClick={() => {
                        setNewDamage({...newDamage, unit_id: v.unit_id});
                        setShowDamageModal(true);
                    }}
                    className="py-3 bg-red-50 text-red-500 text-[10px] font-black rounded-xl hover:bg-red-100 transition-all uppercase tracking-widest flex items-center justify-center gap-2"
                  >
                    <AlertTriangle size={14} />
                    Falla
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
      ) : activeTab === 'MANTENIMIENTO' ? (
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase">
                <th className="p-6">Unidad</th>
                <th className="p-6">Tipo</th>
                <th className="p-6">KM</th>
                <th className="p-6">Descripción</th>
                <th className="p-6 text-right">Costo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-[10px] font-bold">
              {maintenance.map(m => (
                <tr key={m.id} className="hover:bg-gray-50/30">
                  <td className="p-6 font-black text-[#1D2124]">{m.unit_id}</td>
                  <td className="p-6">
                    <span className={`px-2 py-1 rounded ${m.type === 'PREVENTIVO' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                      {m.type}
                    </span>
                  </td>
                  <td className="p-6">{m.mileage.toLocaleString()} KM</td>
                  <td className="p-6 text-gray-400 italic truncate max-w-xs">{m.description}</td>
                  <td className="p-6 text-[#20C997] text-right font-black">${m.cost.toLocaleString()}</td>
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
      ) : activeTab === 'ROTURAS' ? (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button 
              onClick={() => setShowDamageModal(true)}
              className="px-6 py-3 bg-[#FA5252] text-white font-black rounded-xl shadow-[0_4px_0_0_#C92A2A] hover:translate-y-[2px] transition-all flex items-center gap-2 uppercase text-xs"
            >
              Reportar Nueva Rotura / Falla
            </button>
          </div>
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
             <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase">
                    <th className="p-6">Unidad</th>
                    <th className="p-6">Prioridad</th>
                    <th className="p-6">Descripción</th>
                    <th className="p-6">Fecha Reporte</th>
                    <th className="p-6">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-[10px] font-bold">
                   {damages.map(d => (
                      <tr key={d.id} className="hover:bg-gray-50/30">
                         <td className="p-6 font-black text-[#1D2124]">{d.unit_id}</td>
                         <td className="p-6">
                            <span className={`px-2 py-1 rounded ${
                               d.severity === 'ALTA' ? 'bg-red-50 text-red-500' : 
                               d.severity === 'MEDIA' ? 'bg-orange-50 text-orange-500' : 'bg-blue-50 text-blue-500'
                            }`}>
                               {d.severity}
                            </span>
                         </td>
                         <td className="p-6 text-gray-500 uppercase">{d.description}</td>
                         <td className="p-6 text-gray-400">{new Date(d.recorded_at).toLocaleDateString()}</td>
                         <td className="p-6">
                            <span className="bg-gray-100 px-2 py-1 rounded text-gray-400 uppercase">{d.status}</span>
                         </td>
                      </tr>
                   ))}
                   {damages.length === 0 && (
                      <tr>
                         <td colSpan={5} className="p-20 text-center text-gray-300 font-black uppercase">Sin roturas pendientes de reparación</td>
                      </tr>
                   )}
                </tbody>
             </table>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-end">
             <button 
               onClick={() => setShowFuelModal(true)}
               className="px-6 py-3 bg-[#20C997] text-white font-black rounded-xl shadow-[0_4px_0_0_#0CA678] hover:translate-y-[2px] transition-all flex items-center gap-2 uppercase text-xs"
             >
               Registrar Carga de Combustible
             </button>
          </div>
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase">
                  <th className="p-6">Unidad</th>
                  <th className="p-6">Fecha</th>
                  <th className="p-6">KM</th>
                  <th className="p-6">Litros</th>
                  <th className="p-6">Operador</th>
                  <th className="p-6 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-[10px] font-bold">
                {fuelLogs.map(f => (
                  <tr key={f.id} className="hover:bg-gray-50/30">
                    <td className="p-6 font-black text-[#1D2124]">{f.unit_id}</td>
                    <td className="p-6 text-gray-400">{new Date(f.date).toLocaleString()}</td>
                    <td className="p-6">{f.kilometers.toLocaleString()} KM</td>
                    <td className="p-6">{f.amount_liters} L</td>
                    <td className="p-6 uppercase">{f.recorded_by}</td>
                    <td className="p-6 text-[#20C997] text-right font-black">${f.cost.toLocaleString()}</td>
                  </tr>
                ))}
                {fuelLogs.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-20 text-center text-gray-300 font-black uppercase">Sin cargas registradas</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
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
                <div className="grid grid-cols-2 gap-4">
                  <select className="w-full h-12 bg-gray-50 border-2 border-gray-100 rounded-xl px-4 text-sm font-black uppercase" value={newUnit.type} onChange={e => setNewUnit({...newUnit, type: e.target.value})}>
                    <option value="AUTOBOMBA">AUTOBOMBA</option>
                    <option value="RESCATE">RESCATE</option>
                    <option value="LOGISTICA">LOGISTICA</option>
                    <option value="CISTERNA">CISTERNA</option>
                  </select>
                  <select className="w-full h-12 bg-gray-50 border-2 border-gray-100 rounded-xl px-4 text-sm font-black uppercase" value={newUnit.fuel_type} onChange={e => setNewUnit({...newUnit, fuel_type: e.target.value})}>
                    <option value="DIESEL">DIESEL</option>
                    <option value="DIESEL PREMIUM">DIESEL PREMIUM</option>
                    <option value="NAFTA">NAFTA</option>
                  </select>
                </div>
                <input required placeholder="MARCA/MODELO" className="w-full h-12 bg-gray-50 border-2 border-gray-100 rounded-xl px-4 text-sm font-black uppercase" value={newUnit.model} onChange={e => setNewUnit({...newUnit, model: e.target.value})} />
                <div className="grid grid-cols-2 gap-4">
                  <input placeholder="PATENTE" className="w-full h-12 bg-gray-50 border-2 border-gray-100 rounded-xl px-4 text-sm font-black uppercase" value={newUnit.patent} onChange={e => setNewUnit({...newUnit, patent: e.target.value})} />
                  <input placeholder="MOTOR N°" className="w-full h-12 bg-gray-50 border-2 border-gray-100 rounded-xl px-4 text-sm font-black uppercase" value={newUnit.engine_number} onChange={e => setNewUnit({...newUnit, engine_number: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <input type="number" placeholder="KM INICIAL" className="w-full h-12 bg-gray-50 border-2 border-gray-100 rounded-xl px-4 text-sm font-black uppercase" value={newUnit.kilometers || ''} onChange={e => setNewUnit({...newUnit, kilometers: parseInt(e.target.value)})} />
                   <input type="number" placeholder="AÑO" className="w-full h-12 bg-gray-50 border-2 border-gray-100 rounded-xl px-4 text-sm font-black uppercase" value={newUnit.year} onChange={e => setNewUnit({...newUnit, year: parseInt(e.target.value)})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase">Último Service (KM)</label>
                    <input type="number" placeholder="KM" className="w-full h-12 bg-gray-50 border-2 border-gray-100 rounded-xl px-4 text-sm font-black uppercase" value={newUnit.last_service_mileage || ''} onChange={e => setNewUnit({...newUnit, last_service_mileage: parseInt(e.target.value)})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase">Fecha Último Service</label>
                    <input type="date" className="w-full h-12 bg-gray-50 border-2 border-gray-100 rounded-xl px-4 text-sm font-black uppercase" value={newUnit.last_service_date} onChange={e => setNewUnit({...newUnit, last_service_date: e.target.value})} />
                  </div>
                </div>
                <textarea placeholder="NOTAS ADICIONALES" className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl p-4 text-sm font-bold uppercase" value={newUnit.notes} onChange={e => setNewUnit({...newUnit, notes: e.target.value})} />
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
      {showFuelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1D2124]/80 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95">
            <form onSubmit={handleCreateFuel} className="p-8 space-y-6">
              <h3 className="text-2xl font-black text-[#1D2124] uppercase italic underline decoration-green-400">Carga Combustible</h3>
              <div className="space-y-4">
                <select required className="w-full h-12 bg-gray-50 border-2 border-gray-100 rounded-xl px-4 text-sm font-black uppercase" value={newFuel.unit_id} onChange={e => setNewFuel({...newFuel, unit_id: e.target.value})}>
                  <option value="">SELECCIONE UNIDAD</option>
                  {fleet.map(v => <option key={v.id} value={v.unit_id}>{v.unit_id}</option>)}
                </select>
                <input type="number" placeholder="KILOMETRAJE ACTUAL" className="w-full h-12 bg-gray-50 border-2 border-gray-100 rounded-xl px-4 text-sm font-black uppercase" value={newFuel.kilometers || ''} onChange={e => setNewFuel({...newFuel, kilometers: parseInt(e.target.value)})} />
                <div className="grid grid-cols-2 gap-4">
                  <input type="number" step="0.01" placeholder="LITROS" className="w-full h-12 bg-gray-50 border-2 border-gray-100 rounded-xl px-4 text-sm font-black uppercase" value={newFuel.amount_liters || ''} onChange={e => setNewFuel({...newFuel, amount_liters: parseFloat(e.target.value)})} />
                  <input type="number" placeholder="COSTO TOTAL $" className="w-full h-12 bg-gray-50 border-2 border-gray-100 rounded-xl px-4 text-sm font-black uppercase" value={newFuel.cost || ''} onChange={e => setNewFuel({...newFuel, cost: parseFloat(e.target.value)})} />
                </div>
                <input required placeholder="OPERADOR" className="w-full h-12 bg-gray-50 border-2 border-gray-100 rounded-xl px-4 text-sm font-black uppercase" value={newFuel.recorded_by} onChange={e => setNewFuel({...newFuel, recorded_by: e.target.value})} />
              </div>
              <div className="flex gap-4">
                <button type="button" onClick={() => setShowFuelModal(false)} className="flex-1 h-12 border-2 border-gray-100 rounded-xl font-black uppercase text-xs">Cerrar</button>
                <button type="submit" className="flex-1 h-12 bg-[#20C997] text-white font-black rounded-xl uppercase text-xs italic">Guardar Carga</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showDamageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1D2124]/80 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95">
            <form onSubmit={handleCreateDamage} className="p-8 space-y-6">
              <div className="flex items-center gap-4 mb-4">
                 <div className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center italic font-black">!</div>
                 <div>
                    <h3 className="text-2xl font-black text-[#1D2124] uppercase italic">Reportar Rotura</h3>
                    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Informa fallas o daños en la unidad</p>
                 </div>
              </div>
              <div className="space-y-4">
                <select required className="w-full h-12 bg-gray-50 border-2 border-gray-100 rounded-xl px-4 text-sm font-black uppercase" value={newDamage.unit_id} onChange={e => setNewDamage({...newDamage, unit_id: e.target.value})}>
                  <option value="">SELECCIONE UNIDAD</option>
                  {fleet.map(v => <option key={v.id} value={v.unit_id}>{v.unit_id}</option>)}
                </select>
                <select className="w-full h-12 bg-gray-50 border-2 border-gray-100 rounded-xl px-4 text-sm font-black uppercase" value={newDamage.severity} onChange={e => setNewDamage({...newDamage, severity: e.target.value})}>
                  <option value="BAJA">PRIORIDAD BAJA (ESTETICO)</option>
                  <option value="MEDIA">PRIORIDAD MEDIA (FUNCIONAL)</option>
                  <option value="ALTA">PRIORIDAD ALTA (FUERA DE SERVICIO)</option>
                </select>
                <textarea required placeholder="DESCRIPCIÓN DE LA FALLA O ROTURA" className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl p-4 text-sm font-bold uppercase" value={newDamage.description} onChange={e => setNewDamage({...newDamage, description: e.target.value})} />
              </div>
              <div className="flex gap-4">
                <button type="button" onClick={() => setShowDamageModal(false)} className="flex-1 h-12 border-2 border-gray-100 rounded-xl font-black uppercase text-xs">Cerrar</button>
                <button type="submit" className="flex-1 h-12 bg-[#FA5252] text-white font-black rounded-xl uppercase text-xs italic">Enviar Reporte</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
