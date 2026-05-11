import React, { useState, useEffect } from 'react';
import { ClipboardList, Plus, Search, User, Clock, MessageSquare, Save } from 'lucide-react';
import { toast } from 'sonner';

interface GuardEntry {
  id: number;
  officer_in_charge: string;
  observations: string;
  entry_time: string;
  exit_time: string | null;
  shift: string;
}

export default function Guardia() {
  const [entries, setEntries] = useState<GuardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newEntry, setNewEntry] = useState({
    officer_in_charge: '',
    observations: '',
    shift: 'DIURNA'
  });

  const fetchEntries = async () => {
    try {
      const res = await fetch('/api/duty-log');
      const data = await res.json();
      setEntries(data);
    } catch (err) {
      toast.error('Error al cargar libreta de guardia');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/duty-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEntry)
      });
      if (res.ok) {
        toast.success('Entrada registrada');
        setShowModal(false);
        setNewEntry({ officer_in_charge: '', observations: '', shift: 'DIURNA' });
        fetchEntries();
      }
    } catch (err) {
      toast.error('Error al guardar');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-[#1D2124] uppercase">Libreta de Guardia</h2>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Registro diario de novedades y personal a cargo</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="px-6 py-3 bg-[#FFD43B] text-[#1D2124] font-black rounded-xl shadow-[0_4px_0_0_#FAB005] hover:translate-y-[2px] transition-all flex items-center gap-2 uppercase text-xs"
        >
          <Plus size={18} />
          Nueva Entrada
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
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
                <span className="px-3 py-1 bg-white text-[#1D2124] text-[8px] font-black rounded-full uppercase tracking-widest border border-gray-100">
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

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1D2124]/80 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <form onSubmit={handleCreate} className="p-8 space-y-6">
              <div>
                <h3 className="text-2xl font-black text-[#1D2124] uppercase mb-1">Nueva Entrada de Guardia</h3>
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Registra el inicio de turno y novedades</p>
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
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Novedades</label>
                  <textarea 
                    required
                    rows={4}
                    placeholder="Escribe aquí todas las novedades del turno..."
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl p-4 text-sm font-bold focus:border-[#FFD43B] focus:outline-none transition-all"
                    value={newEntry.observations}
                    onChange={(e) => setNewEntry({...newEntry, observations: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 h-12 text-[#1D2124] font-black rounded-xl border-2 border-gray-100 hover:bg-gray-50 transition-all uppercase text-xs"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 h-12 bg-[#FFD43B] text-[#1D2124] font-black rounded-xl shadow-[0_4px_0_0_#FAB005] hover:translate-y-[2px] transition-all uppercase text-sm flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  Guardar Entrada
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
