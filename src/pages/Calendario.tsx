import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Users, Clock, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Shift {
  id: number;
  personnel_id: number;
  personnel_name: string;
  personnel_rank: string;
  date: string;
  shift_type: string;
  status: string;
}

interface Person {
  id: number;
  name: string;
  rank: string;
}

export default function Calendario() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [personnel, setPersonnel] = useState<Person[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newShift, setNewShift] = useState({ personnel_id: 0, date: '', shift_type: 'MAÑANA' });

  const fetchShifts = async () => {
    const res = await fetch('/api/guard-shifts');
    const data = await res.json();
    setShifts(data);
  };

  const fetchPersonnel = async () => {
    const res = await fetch('/api/personnel');
    const data = await res.json();
    setPersonnel(data);
  };

  useEffect(() => {
    fetchShifts();
    fetchPersonnel();
  }, []);

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const handleCreateShift = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/guard-shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newShift)
      });
      if (res.ok) {
        toast.success('Guardia programada');
        setShowModal(false);
        fetchShifts();
      }
    } catch (err) {
      toast.error('Error al programar');
    }
  };

  const handleDeleteShift = async (id: number) => {
    if (!confirm('¿Eliminar esta guardia?')) return;
    try {
      const res = await fetch(`/api/guard-shifts/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Guardia eliminada');
        fetchShifts();
      }
    } catch (err) {
      toast.error('Error al eliminar');
    }
  };

  const renderCalendar = () => {
    const days = [];
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const numDays = daysInMonth(year, month);
    const firstDay = firstDayOfMonth(year, month);

    // Padding for empty days at start
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-32 bg-gray-50/50 border border-gray-100" />);
    }

    for (let d = 1; d <= numDays; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayShifts = shifts.filter(s => s.date === dateStr);
      const isToday = new Date().toDateString() === new Date(year, month, d).toDateString();

      days.push(
        <div key={d} className={`h-40 bg-white border border-gray-100 p-2 flex flex-col gap-1 overflow-y-auto group ${isToday ? 'ring-2 ring-[#FFD43B] ring-inset' : ''}`}>
          <div className="flex justify-between items-center mb-1">
            <span className={`text-[10px] font-black ${isToday ? 'bg-[#FFD43B] text-[#1D2124] px-2 py-0.5 rounded' : 'text-gray-400'}`}>{d}</span>
            <button 
              onClick={() => { setNewShift({...newShift, date: dateStr}); setShowModal(true); }}
              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded transition-all text-gray-400"
            >
              <Plus size={12} />
            </button>
          </div>
          <div className="space-y-1">
            {dayShifts.map(s => (
              <div key={s.id} className="text-[8px] font-black p-1.5 rounded-lg border border-gray-50 flex flex-col relative group/item bg-white shadow-sm">
                <div className="flex items-center justify-between">
                  <span className={`px-1.5 py-0.5 rounded-md mb-1 italic ${
                    s.shift_type === 'MAÑANA' ? 'bg-blue-50 text-blue-500' : 
                    s.shift_type === 'TARDE' ? 'bg-orange-50 text-orange-500' : 
                    'bg-indigo-50 text-indigo-500'
                  }`}>
                    {s.shift_type}
                  </span>
                  <button 
                    onClick={() => handleDeleteShift(s.id)}
                    className="opacity-0 group-item-hover:opacity-100 text-red-300 hover:text-red-500"
                  >
                    <Trash2 size={10} />
                  </button>
                </div>
                <span className="truncate text-[#1D2124]">{s.personnel_rank} {s.personnel_name}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return days;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-[#1D2124] uppercase italic underline decoration-[#FFD43B]">Cronograma de Guardias</h2>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Planificación mensual de personal operativo</p>
        </div>
        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
          <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-50 rounded-xl transition-all"><ChevronLeft /></button>
          <div className="flex items-center gap-2 px-4 min-w-[200px] justify-center">
            <CalendarIcon size={18} className="text-[#FFD43B]" />
            <span className="text-sm font-black uppercase italic tracking-tight">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
          </div>
          <button onClick={handleNextMonth} className="p-2 hover:bg-gray-50 rounded-xl transition-all"><ChevronRight /></button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden">
        <div className="grid grid-cols-7 bg-gray-50/50 border-b border-gray-100">
          {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map(d => (
            <div key={d} className="p-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {renderCalendar()}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1D2124]/80 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[2rem] overflow-hidden shadow-2xl animate-in zoom-in-95">
            <form onSubmit={handleCreateShift} className="p-10 space-y-6">
              <div className="flex items-center gap-4 mb-4">
                 <div className="w-12 h-12 bg-yellow-50 text-[#FAB005] rounded-2xl flex items-center justify-center italic font-black">GS</div>
                 <h3 className="text-2xl font-black text-[#1D2124] uppercase italic">Programar Guardia</h3>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Personal</label>
                  <select 
                    required 
                    className="w-full h-12 bg-gray-50 border-2 border-gray-100 rounded-xl px-4 text-sm font-black uppercase"
                    value={newShift.personnel_id}
                    onChange={e => setNewShift({...newShift, personnel_id: parseInt(e.target.value)})}
                  >
                    <option value="">Seleccione Bombero</option>
                    {personnel.map(p => <option key={p.id} value={p.id}>{p.rank} {p.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Fecha</label>
                  <input 
                    type="date" 
                    required 
                    className="w-full h-12 bg-gray-50 border-2 border-gray-100 rounded-xl px-4 text-sm font-black"
                    value={newShift.date}
                    onChange={e => setNewShift({...newShift, date: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Turno</label>
                  <select 
                    className="w-full h-12 bg-gray-50 border-2 border-gray-100 rounded-xl px-4 text-sm font-black uppercase"
                    value={newShift.shift_type}
                    onChange={e => setNewShift({...newShift, shift_type: e.target.value})}
                  >
                    <option value="MAÑANA">MAÑANA (08:00 - 16:00)</option>
                    <option value="TARDE">TARDE (16:00 - 00:00)</option>
                    <option value="NOCHE">NOCHE (00:00 - 08:00)</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 h-14 border-2 border-gray-100 rounded-2xl font-black uppercase text-xs italic">Cerrar</button>
                <button type="submit" className="flex-1 h-14 bg-[#1D2124] text-white font-black rounded-2xl shadow-xl uppercase text-xs italic">Agendar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
