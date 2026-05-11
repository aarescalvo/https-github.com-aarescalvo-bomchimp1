import React, { useState, useEffect } from 'react';
import { ClipboardList, Plus, Search, User, Clock, MessageSquare, Save, LogIn, LogOut, History, Users } from 'lucide-react';
import { toast } from 'sonner';

interface GuardEntry {
  id: number;
  officer_in_charge: string;
  observations: string;
  entry_time: string;
  exit_time: string | null;
  shift: string;
}

interface Attendance {
  id: number;
  personnel_id: number;
  personnel_name: string;
  personnel_rank: string;
  check_in: string;
  check_out: string | null;
  type: string;
  observations: string;
}

interface Person {
  id: number;
  name: string;
  rank: string;
}

export default function Guardia() {
  const [activeTab, setActiveTab] = useState<'LIBRETA' | 'ASISTENCIA' | 'PROGRAMACION'>('ASISTENCIA');
  const [entries, setEntries] = useState<GuardEntry[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [personnel, setPersonnel] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [guardShifts, setGuardShifts] = useState<any[]>([]);
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [newShift, setNewShift] = useState({ personnel_id: 0, date: new Date().toISOString().split('T')[0], shift_type: 'MAÑANA' });
  
  const [showLibretaModal, setShowLibretaModal] = useState(false);
  const [newEntry, setNewEntry] = useState({ officer_in_charge: '', observations: '', shift: 'DIURNA', guard_shift_id: undefined });

  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [checkInData, setCheckInData] = useState({ personnel_id: 0, type: 'GUARDIA', observations: '', recorded_by: '', guard_shift_id: undefined as number | undefined });

  const fetchData = async () => {
    try {
      const [resEntries, resAttendance, resPersonnel, resShifts] = await Promise.all([
        fetch('/api/duty-log'),
        fetch('/api/attendance'),
        fetch('/api/personnel'),
        fetch(`/api/guard-shifts?date=${new Date().toISOString().split('T')[0]}`)
      ]);
      setEntries(await resEntries.json());
      setAttendance(await resAttendance.json());
      setPersonnel(await resPersonnel.json());
      setGuardShifts(await resShifts.json());
    } catch (err) {
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateShift = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/guard-shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newShift)
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Guardia programada correctamente');
        setShowShiftModal(false);
        fetchData();
      } else {
        toast.error(data.error || 'Error al programar');
      }
    } catch (err) {
      toast.error('Error de red');
    }
  };

  const handleCreateLibreta = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/duty-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEntry)
      });
      if (res.ok) {
        toast.success('Entrada registrada');
        setShowLibretaModal(false);
        setNewEntry({ officer_in_charge: '', observations: '', shift: 'DIURNA' });
        fetchData();
      }
    } catch (err) {
      toast.error('Error al guardar');
    }
  };

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    try {
      const res = await fetch('/api/attendance/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...checkInData, recorded_by: user.name || 'SISTEMA' })
      });
      if (res.ok) {
        toast.success('Ingreso registrado');
        setShowCheckInModal(false);
        fetchData();
      }
    } catch (err) {
      toast.error('Error al registrar ingreso');
    }
  };

  const handleCheckOut = async (id: number) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const operator = prompt('Operador que registra la salida:', user.name || '');
    if (!operator) return;
    
    try {
      const res = await fetch(`/api/attendance/check-out/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ observations: 'Salida de cuartel', recorded_out_by: operator })
      });
      if (res.ok) {
        toast.success('Egreso registrado');
        fetchData();
      }
    } catch (err) {
      toast.error('Error al registrar egreso');
    }
  };

  const exportAttendance = () => {
    const headers = ['Bombero', 'Jerarquia', 'Ingreso', 'Egreso', 'Tipo', 'Operador Entrada', 'Operador Salida'];
    const rows = attendance.map(a => [
      a.personnel_name,
      a.personnel_rank,
      new Date(a.check_in).toLocaleString(),
      a.check_out ? new Date(a.check_out).toLocaleString() : 'ACTIVO',
      a.type,
      (a as any).recorded_by || 'N/A',
      (a as any).recorded_out_by || 'N/A'
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `asistencia_bomberos_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const activeAttendance = attendance.filter(a => !a.check_out);
  const historyAttendance = attendance.filter(a => a.check_out).slice(0, 10);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-[#1D2124] uppercase italic">Guardia y Asistencia</h2>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Gestión de personal en cuartel y libreta de novedades</p>
        </div>
        <div className="flex gap-2 bg-white p-1 rounded-xl shadow-sm border border-gray-50">
           <button 
             onClick={() => setActiveTab('ASISTENCIA')}
             className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${activeTab === 'ASISTENCIA' ? 'bg-[#FFD43B] text-[#1D2124]' : 'text-gray-400 hover:bg-gray-50'}`}
           >
             Ingresos / Egresos
           </button>
           <button 
             onClick={() => setActiveTab('LIBRETA')}
             className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${activeTab === 'LIBRETA' ? 'bg-[#FFD43B] text-[#1D2124]' : 'text-gray-400 hover:bg-gray-50'}`}
           >
             Libreta de Guardia
           </button>
           <button 
             onClick={() => setActiveTab('PROGRAMACION')}
             className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${activeTab === 'PROGRAMACION' ? 'bg-[#FFD43B] text-[#1D2124]' : 'text-gray-400 hover:bg-gray-50'}`}
           >
             Programación
           </button>
        </div>
      </div>

      {activeTab === 'ASISTENCIA' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 font-black text-gray-50/50 text-6xl italic select-none">ACTIVO</div>
               <div className="flex items-center justify-between mb-8 relative z-10">
                  <div>
                    <h3 className="text-xl font-black text-[#1D2124] uppercase italic">Personal en Cuartel</h3>
                    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Bomberos cumpliendo guardia o tareas</p>
                  </div>
                  <button 
                    onClick={() => setShowCheckInModal(true)}
                    className="p-3 bg-[#FFD43B] text-[#1D2124] rounded-2xl shadow-lg hover:scale-105 transition-all"
                  >
                    <LogIn size={20} />
                  </button>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                  {activeAttendance.map(a => (
                    <div key={a.id} className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex items-center justify-between group">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-green-500 shadow-sm">
                             <User size={24} />
                          </div>
                          <div>
                            <p className="text-sm font-black text-[#1D2124] uppercase leading-none mb-1">{a.personnel_name}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{a.personnel_rank} • {a.type}</p>
                            <p className="text-[8px] font-black text-green-600 uppercase mt-1 italic flex items-center gap-1">
                              <Clock size={10} /> DESDE {new Date(a.check_in).toLocaleTimeString()}
                            </p>
                          </div>
                       </div>
                       <button 
                         onClick={() => handleCheckOut(a.id)}
                         className="p-3 bg-white text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm opacity-0 group-hover:opacity-100"
                         title="Registrar Egreso"
                       >
                         <LogOut size={18} />
                       </button>
                    </div>
                  ))}
                  {activeAttendance.length === 0 && (
                    <div className="md:col-span-2 py-10 text-center border-2 border-dashed border-gray-100 rounded-3xl">
                       <Users className="mx-auto text-gray-200 mb-4" size={40} />
                       <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">No hay personal registrado en este momento</p>
                    </div>
                  )}
               </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
               <div className="flex items-center gap-3 mb-6">
                 <History size={20} className="text-gray-300" />
                 <h3 className="text-lg font-black text-[#1D2124] uppercase italic">Historial Reciente</h3>
               </div>
               <div className="space-y-3">
                  {historyAttendance.map(a => {
                    const checkIn = new Date(a.check_in);
                    const checkOut = a.check_out ? new Date(a.check_out) : null;
                    const duration = checkOut ? Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60)) : 0;
                    
                    return (
                      <div key={a.id} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl border border-gray-50 text-[10px]">
                         <div className="flex items-center gap-3">
                            <span className="font-black text-[#1D2124] uppercase w-32 truncate">{a.personnel_name}</span>
                            <span className="px-2 py-0.5 bg-gray-200 text-gray-500 rounded font-black italic">{a.type}</span>
                         </div>
                         <div className="flex items-center gap-6">
                            <div className="text-right">
                               <p className="text-gray-400 font-bold uppercase tracking-tighter">Entrada</p>
                               <p className="font-black text-[#1D2124]">{checkIn.toLocaleTimeString()} - {checkIn.toLocaleDateString()}</p>
                            </div>
                            <div className="text-right">
                               <p className="text-gray-400 font-bold uppercase tracking-tighter">Salida</p>
                               <p className="font-black text-[#1D2124]">{checkOut ? checkOut.toLocaleTimeString() : 'N/A'}</p>
                            </div>
                            <div className="bg-white px-3 py-1 rounded-lg border border-gray-100 text-[#FAB005] font-black">
                               {duration} MIN
                            </div>
                         </div>
                      </div>
                    );
                  })}
               </div>
            </div>
          </div>

          <div className="space-y-6">
             <div className="bg-[#1D2124] p-8 rounded-[2rem] text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 opacity-10"><Clock size={100} /></div>
                <h4 className="text-2xl font-black italic uppercase mb-2">Estado de Guardia</h4>
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-6">Resumen del servicio actual</p>
                
                <div className="space-y-4">
                   <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">En servicio</span>
                      <span className="text-2xl font-black text-[#FFD43B] italic">{activeAttendance.length}</span>
                   </div>
                   <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Guardia Programada</span>
                      <span className="text-2xl font-black text-white italic">08</span>
                   </div>
                   <button 
                     onClick={exportAttendance}
                     className="w-full h-12 bg-[#FFD43B] text-[#1D2124] font-black uppercase text-[10px] rounded-xl italic tracking-widest shadow-[0_4px_0_0_#FAB005] hover:translate-y-[2px] transition-all">
                      EXPORTAR HISTORIAL CSV
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}

      {activeTab === 'LIBRETA' && (
        <div className="grid grid-cols-1 gap-6">
          <div className="flex justify-end mb-4">
            <button 
              onClick={() => setShowLibretaModal(true)}
              className="px-6 py-3 bg-[#FFD43B] text-[#1D2124] font-black rounded-xl shadow-[0_4px_0_0_#FAB005] hover:translate-y-[2px] transition-all flex items-center gap-2 uppercase text-xs italic"
            >
              <Plus size={18} />
              Registrar Novedad de Guardia
            </button>
          </div>
          {entries.map((entry) => (
            <div key={entry.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-6 flex flex-col md:flex-row gap-6">
              <div className="md:w-48 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-[#FFD43B]">
                    <User size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase">A Cargo</p>
                    <p className="text-sm font-black text-[#1D2124] uppercase">{entry.officer_in_charge}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-[#20C997]">
                    <Clock size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase">Hora Ingreso</p>
                    <p className="text-xs font-bold text-[#1D2124]">{new Date(entry.entry_time).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 bg-gray-50 rounded-2xl p-6 relative">
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 bg-white text-[#1D2124] text-[8px] font-black rounded-full uppercase tracking-widest border border-gray-100 shadow-sm italic">
                    Turno {entry.shift}
                  </span>
                </div>
                <div className="flex gap-3 mb-2">
                  <MessageSquare className="text-gray-300" size={16} />
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Novedades y Observaciones</p>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed font-medium">
                  {entry.observations}
                </p>
              </div>
            </div>
          ))}
          {entries.length === 0 && !loading && (
            <div className="py-20 text-center bg-white rounded-3xl border border-gray-100">
              <ClipboardList size={48} className="mx-auto mb-4 text-gray-100" />
              <p className="font-black uppercase text-xs text-gray-300 tracking-widest">No hay registros de guardia para mostrar</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'PROGRAMACION' && (
        <div className="space-y-6">
          <div className="flex justify-end">
             <button 
              onClick={() => setShowShiftModal(true)}
              className="px-6 py-3 bg-[#FFD43B] text-[#1D2124] font-black rounded-xl shadow-[0_4px_0_0_#FAB005] hover:translate-y-[2px] transition-all flex items-center gap-2 uppercase text-xs italic"
            >
              <Plus size={18} /> Programar Nueva Guardia
            </button>
          </div>
          
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden p-8">
            <h3 className="text-xl font-black text-[#1D2124] uppercase italic mb-6">Guardias Programadas de Hoy ({new Date().toLocaleDateString()})</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {['MAÑANA', 'TARDE', 'NOCHE'].map(type => (
                 <div key={type} className="space-y-4">
                    <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b pb-2">
                       <Clock size={12} /> {type}
                    </div>
                    <div className="space-y-2">
                       {guardShifts.filter(s => s.shift_type === type).map(s => (
                          <div key={s.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                             <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-[#FFD43B] shadow-sm">
                                   <User size={16} />
                                </div>
                                <span className="text-[10px] font-black uppercase">{s.personnel_name}</span>
                             </div>
                             <div className={`w-2 h-2 rounded-full ${s.status === 'PRESENTE' ? 'bg-green-500' : 'bg-gray-300'}`} />
                          </div>
                       ))}
                       {guardShifts.filter(s => s.shift_type === type).length === 0 && (
                          <p className="text-[10px] font-bold text-gray-300 uppercase italic">Sin personal asignado</p>
                       )}
                    </div>
                 </div>
               ))}
            </div>
          </div>
        </div>
      )}

      {/* Modals for Guardia and Attendance */}
      {showLibretaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1D2124]/80 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <form onSubmit={handleCreateLibreta} className="p-8 space-y-6">
              <div className="flex items-center gap-4 mb-4">
                 <div className="w-12 h-12 bg-yellow-50 text-[#FAB005] rounded-2xl flex items-center justify-center italic font-black">LG</div>
                 <div>
                    <h3 className="text-2xl font-black text-[#1D2124] uppercase italic">Nueva Libreta</h3>
                    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Registra el inicio de turno y novedades</p>
                 </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Oficial / Encargado</label>
                  <input 
                    required
                    type="text"
                    className="w-full h-12 bg-gray-50 border-2 border-gray-100 rounded-xl px-4 text-sm font-bold focus:border-[#FFD43B] focus:outline-none transition-all uppercase"
                    value={newEntry.officer_in_charge}
                    onChange={(e) => setNewEntry({...newEntry, officer_in_charge: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Turno</label>
                  <select 
                    className="w-full h-12 bg-gray-50 border-2 border-gray-100 rounded-xl px-4 text-sm font-black focus:border-[#FFD43B] focus:outline-none transition-all"
                    value={newEntry.shift}
                    onChange={(e) => setNewEntry({...newEntry, shift: e.target.value})}
                  >
                    <option value="DIURNA">DIURNA (08:00 - 20:00)</option>
                    <option value="NOCTURNA">NOCTURNA (20:00 - 08:00)</option>
                    <option value="RESERVISTA">RESERVISTA / APOYO</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Resumen Programado (Opcional)</label>
                  <select 
                    className="w-full h-12 bg-gray-50 border-2 border-gray-100 rounded-xl px-4 text-sm font-black focus:border-[#FFD43B] focus:outline-none transition-all"
                    value={newEntry.guard_shift_id || ''}
                    onChange={(e) => setNewEntry({...newEntry, guard_shift_id: e.target.value ? parseInt(e.target.value) : undefined as any})}
                  >
                    <option value="">Independiente / No Programado</option>
                    {guardShifts.map(s => (
                       <option key={s.id} value={s.id}>{s.personnel_name} - {s.shift_type}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Novedades</label>
                  <textarea 
                    required
                    rows={4}
                    placeholder="Escribe aquí todas las novedades del turno..."
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl p-4 text-sm font-bold focus:border-[#FFD43B] focus:outline-none transition-all shadow-inner"
                    value={newEntry.observations}
                    onChange={(e) => setNewEntry({...newEntry, observations: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowLibretaModal(false)}
                  className="flex-1 h-12 text-[#1D2124] font-black rounded-xl border-2 border-gray-100 hover:bg-gray-50 transition-all uppercase text-xs"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 h-12 bg-[#FFD43B] text-[#1D2124] font-black rounded-xl shadow-[0_4px_0_0_#FAB005] hover:translate-y-[2px] transition-all uppercase text-sm italic"
                >
                  Guardar Entrada
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCheckInModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1D2124]/80 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95">
             <form onSubmit={handleCheckIn} className="p-8 space-y-6">
                <div className="flex items-center gap-4 mb-4">
                   <div className="w-12 h-12 bg-green-50 text-[#20C997] rounded-2xl flex items-center justify-center italic font-black">IN</div>
                   <div>
                      <h3 className="text-2xl font-black text-[#1D2124] uppercase italic underline decoration-green-400">Marcar Ingreso</h3>
                      <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Bombero entra en servicio</p>
                   </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Personal</label>
                      <select 
                        required
                        className="w-full h-12 bg-gray-50 border-2 border-gray-100 rounded-xl px-4 text-sm font-black uppercase"
                        value={checkInData.personnel_id}
                        onChange={e => {
                          const pid = parseInt(e.target.value);
                          const shift = guardShifts.find(s => s.personnel_id === pid);
                          setCheckInData({
                            ...checkInData, 
                            personnel_id: pid,
                            guard_shift_id: shift?.id
                          });
                        }}
                      >
                      <option value="">Seleccione Bombero</option>
                      {personnel.map(p => <option key={p.id} value={p.id}>{p.rank} {p.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Motivo / Tipo</label>
                    <select 
                      className="w-full h-12 bg-gray-50 border-2 border-gray-100 rounded-xl px-4 text-sm font-black uppercase"
                      value={checkInData.type}
                      onChange={e => setCheckInData({...checkInData, type: e.target.value})}
                    >
                      <option value="GUARDIA">GUARDIA PROGRAMADA</option>
                      <option value="SINIESTRO">LLAMADO SINIESTRO</option>
                      <option value="MANTENIMIENTO">MANTENIMIENTO</option>
                      <option value="ADMINISTRATIVO">TAREAS ADMIN</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Observaciones</label>
                    <input 
                      type="text"
                      className="w-full h-12 bg-gray-50 border-2 border-gray-100 rounded-xl px-4 text-sm font-bold uppercase"
                      value={checkInData.observations}
                      onChange={e => setCheckInData({...checkInData, observations: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Operador Responsable</label>
                    <input 
                      type="text"
                      required
                      placeholder="Nombre de quien registra..."
                      className="w-full h-12 bg-gray-50 border-2 border-gray-100 rounded-xl px-4 text-sm font-bold uppercase shadow-sm focus:border-[#FFD43B] outline-none"
                      value={checkInData.recorded_by}
                      onChange={e => setCheckInData({...checkInData, recorded_by: e.target.value})}
                    />
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setShowCheckInModal(false)} className="flex-1 h-12 border-2 border-gray-100 rounded-xl font-black uppercase text-xs">Cerrar</button>
                  <button type="submit" className="flex-1 h-12 bg-[#20C997] text-white font-black rounded-xl shadow-[0_4px_0_0_#0CA678] uppercase text-xs italic">Confirmar Ingreso</button>
                </div>
             </form>
          </div>
        </div>
      )}
      {showShiftModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1D2124]/80 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95">
             <form onSubmit={handleCreateShift} className="p-8 space-y-6">
                <h3 className="text-2xl font-black text-[#1D2124] uppercase italic">Programar Guardia</h3>
                <div className="space-y-4">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Personal</label>
                      <select required className="w-full h-12 bg-gray-50 border-2 border-gray-100 rounded-xl px-4 text-sm font-black uppercase" value={newShift.personnel_id} onChange={e => setNewShift({...newShift, personnel_id: parseInt(e.target.value)})}>
                         <option value="">Seleccione Bombero</option>
                         {personnel.filter(p => p.status === 'ACTIVO').map(p => <option key={p.id} value={p.id}>{p.rank} {p.name}</option>)}
                      </select>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Fecha</label>
                      <input type="date" className="w-full h-12 bg-gray-50 border-2 border-gray-100 rounded-xl px-4 text-sm font-black" value={newShift.date} onChange={e => setNewShift({...newShift, date: e.target.value})} />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Turno</label>
                      <select className="w-full h-12 bg-gray-50 border-2 border-gray-100 rounded-xl px-4 text-sm font-black uppercase" value={newShift.shift_type} onChange={e => setNewShift({...newShift, shift_type: e.target.value})}>
                         <option value="MAÑANA">MAÑANA</option>
                         <option value="TARDE">TARDE</option>
                         <option value="NOCHE">NOCHE</option>
                      </select>
                   </div>
                </div>
                <div className="flex gap-4">
                  <button type="button" onClick={() => setShowShiftModal(false)} className="flex-1 h-12 border-2 border-gray-100 rounded-xl font-black uppercase text-xs">Cerrar</button>
                  <button type="submit" className="flex-1 h-12 bg-[#FFD43B] text-[#1D2124] font-black rounded-xl shadow-[0_4px_0_0_#FAB005] uppercase text-xs italic">Agendar</button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}
